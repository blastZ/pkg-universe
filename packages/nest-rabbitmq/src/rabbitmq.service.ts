import { Inject, Injectable } from '@nestjs/common';
import {
  AmqpConnectionManager,
  type ChannelWrapper,
  type CreateChannelOpts,
} from 'amqp-connection-manager';
import { type ConsumeMessage } from 'amqplib';

import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

import { ConnectionManager } from './connection-manager.decorator.js';
import { COMMON_PROPAGATION_HEADERS } from './constants/common-propagation-headers.constant.js';
import { ConnectionEvent } from './enums/connection-event.enum.js';
import { ModuleOptions } from './interfaces/module-options.interface.js';
import { MODULE_OPTIONS } from './token.js';

@Injectable()
export class RabbitMQService {
  constructor(
    @Inject(MODULE_OPTIONS) private options: ModuleOptions,
    @ConnectionManager() private manager: AmqpConnectionManager,
  ) {}

  addListener(event: ConnectionEvent, listener: (...args: any[]) => void) {
    this.manager.addListener(event, listener);
  }

  private getPublishOptions(originOptions: any) {
    const headers: Record<string, string> = {};

    const store = this.options.propagation?.context.getStore();

    if (store) {
      const propagationHeaders = COMMON_PROPAGATION_HEADERS.concat(
        this.options.propagation?.headers || [],
      );

      propagationHeaders.map((key) => {
        const value = store.headers[key];

        if (value) {
          headers[key] = String(value);
        }
      });
    }

    return {
      ...originOptions,
      headers: {
        ...headers,
        ...originOptions.headers,
      },
    };
  }

  private packSendToQueue(origin: any) {
    return new Proxy(origin.sendToQueue, {
      apply: (target, thisArg, argumentsList) => {
        const originOptions = argumentsList[2] || {};

        argumentsList[2] = this.getPublishOptions(originOptions);

        return Reflect.apply(target, thisArg, argumentsList);
      },
    });
  }

  private packPublish(origin: any) {
    return new Proxy(origin.publish, {
      apply: (target, thisArg, argumentsList) => {
        const originOptions = argumentsList[3] || {};

        argumentsList[3] = this.getPublishOptions(originOptions);

        return Reflect.apply(target, thisArg, argumentsList);
      },
    });
  }

  private packConsume(origin: any) {
    return new Proxy(origin.consume, {
      apply: (target, thisArg, argumentsList) => {
        const originCb = argumentsList[1];

        const newCb = async (msg: ConsumeMessage) => {
          const headers = msg.properties.headers;

          if (this.options.canary?.enabled) {
            const { isCanary, canaryHeaders } = this.options.canary;

            const isCanaryMessage = canaryHeaders.find((o) =>
              Object.keys(headers).includes(o),
            );

            if (
              (!isCanary && isCanaryMessage) ||
              (isCanary && !isCanaryMessage)
            ) {
              return thisArg.nack(msg, false, true);
            }
          }

          const context =
            this.options.trace?.context ||
            new AsyncLocalStorage<Record<string, unknown>>();

          return context.run(
            { requestId: headers['x-request-id'] || randomUUID() },
            () => {
              if (this.options.propagation?.context) {
                return this.options.propagation.context.run({ headers }, () =>
                  originCb(msg),
                );
              }

              return originCb(msg);
            },
          );
        };

        argumentsList[1] = newCb;

        return Reflect.apply(target, thisArg, argumentsList);
      },
    });
  }

  private packAddSetup(origin: any) {
    return new Proxy(origin.addSetup, {
      apply: (target, thisArg, argumentsList) => {
        const originSetup = argumentsList[0];

        const newSetup = new Proxy(originSetup, {
          apply: (target, thisArg, argumentsList) => {
            const originChannel = argumentsList[0];

            originChannel.consume = this.packConsume(originChannel);

            return Reflect.apply(target, thisArg, argumentsList);
          },
        });

        argumentsList[0] = newSetup;

        return Reflect.apply(target, thisArg, argumentsList);
      },
    });
  }

  createChannel(opts?: Omit<CreateChannelOpts, 'setup'>): ChannelWrapper {
    const channelWrapper = this.manager.createChannel({
      json: true,
      ...opts,
    });

    channelWrapper.sendToQueue = this.packSendToQueue(channelWrapper);

    channelWrapper.publish = this.packPublish(channelWrapper);

    channelWrapper.consume = this.packConsume(channelWrapper);

    channelWrapper.addSetup = this.packAddSetup(channelWrapper);

    return channelWrapper;
  }

  async close() {
    await this.manager.close();
  }
}
