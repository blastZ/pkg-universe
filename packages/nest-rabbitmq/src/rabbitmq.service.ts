import { Inject, Injectable } from '@nestjs/common';
import {
  AmqpConnectionManager,
  type ChannelWrapper,
  type CreateChannelOpts,
} from 'amqp-connection-manager';
import { type ConsumeMessage } from 'amqplib';

import { ConnectionManager } from './connection-manager.decorator.js';
import { COMMON_PROPAGATION_HEADERS } from './constants/common-propagation-headers.constant.js';
import { ConnectionEvent } from './enums/connection-event.enum.js';
import { Options } from './rabbitmq.module.js';
import { MODULE_OPTIONS } from './token.js';

@Injectable()
export class RabbitMQService {
  constructor(
    @Inject(MODULE_OPTIONS) private options: Options,
    @ConnectionManager() private manager: AmqpConnectionManager,
  ) {}

  addListener(event: ConnectionEvent, listener: (...args: any[]) => void) {
    this.manager.addListener(event, listener);
  }

  private packPublish(origin: any) {
    return new Proxy(origin.publish, {
      apply: (target, thisArg, argumentsList) => {
        const originOptions = argumentsList[3] || {};

        let headers: Record<string, string> = {};

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

        argumentsList[3] = {
          ...originOptions,
          headers: {
            ...headers,
            ...originOptions.headers,
          },
        };

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

          if (this.options.isCanary && this.options.isCanaryMessage) {
            const isCanary =
              typeof this.options.isCanary === 'boolean'
                ? this.options.isCanary
                : await this.options.isCanary();

            const isCanaryMessage = await this.options.isCanaryMessage(headers);

            if (
              (!isCanary && isCanaryMessage) ||
              (isCanary && !isCanaryMessage)
            ) {
              return thisArg.nack(msg, false, true);
            }
          }

          if (this.options.propagation?.context) {
            return this.options.propagation?.context.run({ headers }, () =>
              originCb(msg),
            );
          }

          return originCb(msg);
        };

        argumentsList[1] = newCb;

        return Reflect.apply(target, thisArg, argumentsList);
      },
    });
  }

  createChannel(opts?: CreateChannelOpts): ChannelWrapper {
    const channelWrapper = this.manager.createChannel({
      json: true,
      ...opts,
    });

    channelWrapper.publish = this.packPublish(channelWrapper);

    channelWrapper.consume = this.packConsume(channelWrapper);

    return channelWrapper;
  }

  async close() {
    await this.manager.close();
  }
}
