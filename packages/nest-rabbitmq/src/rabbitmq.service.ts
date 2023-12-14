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
import { CanaryStrategy } from './enums/canary-strategy.enum.js';
import { ConnectionEvent } from './enums/connection-event.enum.js';
import { ModuleOptions } from './interfaces/module-options.interface.js';
import { MessageService } from './services/message.service.js';
import { MODULE_OPTIONS } from './token.js';

@Injectable()
export class RabbitMQService {
  constructor(
    @Inject(MODULE_OPTIONS) private options: ModuleOptions,
    @ConnectionManager() private manager: AmqpConnectionManager,
    private messageService: MessageService,
  ) {}

  addListener(event: ConnectionEvent, listener: (...args: any[]) => void) {
    this.manager.addListener(event, listener);
  }

  private packSendToQueue(origin: any) {
    return new Proxy(origin.sendToQueue, {
      apply: async (target, thisArg, argumentsList) => {
        const originQueueName = argumentsList[0];
        const originContent = argumentsList[1];
        const originOptions = argumentsList[2] || {};

        const queueName = this.getQueueName(originQueueName);

        const { content, options } = await this.messageService.packMessage(
          originContent,
          originOptions,
        );

        argumentsList[0] = queueName;
        argumentsList[1] = content;
        argumentsList[2] = options;

        return Reflect.apply(target, thisArg, argumentsList);
      },
    });
  }

  private packPublish(origin: any) {
    return new Proxy(origin.publish, {
      apply: async (target, thisArg, argumentsList) => {
        const originExchangeName = argumentsList[0];
        const originContent = argumentsList[2];
        const originOptions = argumentsList[3] || {};

        const exchangeName = this.getExchangeName(originExchangeName);

        const { content, options } = await this.messageService.packMessage(
          originContent,
          originOptions,
        );

        argumentsList[0] = exchangeName;
        argumentsList[2] = content;
        argumentsList[3] = options;

        return Reflect.apply(target, thisArg, argumentsList);
      },
    });
  }

  private packConsume(origin: any) {
    return new Proxy(origin.consume, {
      apply: (target, thisArg, argumentsList) => {
        const originQueueName = argumentsList[0];
        const originCb = argumentsList[1];

        const queueName = this.getQueueName(originQueueName);

        const newCb = async (originMsg: ConsumeMessage) => {
          const headers = originMsg.properties.headers;

          if (
            this.options.canary?.enabled &&
            this.options.canary.strategy === CanaryStrategy.Requeue
          ) {
            const { isCanary, canaryHeaders } = this.options.canary;

            const isCanaryMessage = canaryHeaders.find((o) =>
              Object.keys(headers).includes(o),
            );

            if (
              (!isCanary && isCanaryMessage) ||
              (isCanary && !isCanaryMessage)
            ) {
              return thisArg.nack(originMsg, false, true);
            }
          }

          const context =
            this.options.trace?.context ||
            new AsyncLocalStorage<Record<string, unknown>>();

          const { msg } = await this.messageService.unpackMessage(originMsg);

          return context.run(
            { requestId: headers['x-request-id'] || randomUUID() },
            () => {
              if (this.options.propagation?.context) {
                return this.options.propagation.context.run(
                  { headers },
                  async () => {
                    try {
                      return await originCb(msg);
                    } catch (err) {
                      if (this.options.onError) {
                        this.options.onError(err);

                        return;
                      }

                      throw err;
                    }
                  },
                );
              }

              return originCb(msg);
            },
          );
        };

        argumentsList[0] = queueName;
        argumentsList[1] = newCb;

        return Reflect.apply(target, thisArg, argumentsList);
      },
    });
  }

  private isCanaryQueue() {
    if (
      this.options.canary?.enabled &&
      this.options.canary.strategy === CanaryStrategy.CanaryQueue &&
      this.options.canary.isCanary
    ) {
      return true;
    }

    return false;
  }

  getQueueName(originName: string) {
    if (!this.isCanaryQueue()) {
      return originName;
    }

    return `canary-${originName}`;
  }

  getExchangeName(originName: string) {
    if (!this.isCanaryQueue()) {
      return originName;
    }

    return `canary.${originName}`;
  }

  private packAssertQueue(origin: any) {
    return new Proxy(origin.assertQueue, {
      apply: (target, thisArg, argumentsList) => {
        const originQueueName = argumentsList[0];

        const queueName = this.getQueueName(originQueueName);

        argumentsList[0] = queueName;

        return Reflect.apply(target, thisArg, argumentsList);
      },
    });
  }

  private packAssertExchange(origin: any) {
    return new Proxy(origin.assertExchange, {
      apply: (target, thisArg, argumentsList) => {
        const originExchangeName = argumentsList[0];

        const exchangeName = this.getExchangeName(originExchangeName);

        argumentsList[0] = exchangeName;

        return Reflect.apply(target, thisArg, argumentsList);
      },
    });
  }

  private packBindQueue(origin: any) {
    return new Proxy(origin.bindQueue, {
      apply: (target, thisArg, argumentsList) => {
        const originQueueName = argumentsList[0];
        const originExchangeName = argumentsList[1];

        const queueName = this.getQueueName(originQueueName);
        const exchangeName = this.getExchangeName(originExchangeName);

        argumentsList[0] = queueName;
        argumentsList[1] = exchangeName;

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

            originChannel.assertQueue = this.packAssertQueue(originChannel);
            originChannel.assertExchange =
              this.packAssertExchange(originChannel);
            originChannel.bindQueue = this.packBindQueue(originChannel);
            originChannel.consume = this.packConsume(originChannel);

            return Reflect.apply(target, thisArg, argumentsList);
          },
        });

        argumentsList[0] = newSetup;

        return Reflect.apply(target, thisArg, argumentsList);
      },
    });
  }

  createChannel(
    opts?: Omit<CreateChannelOpts, 'setup' | 'json'>,
  ): ChannelWrapper {
    const channelWrapper = this.manager.createChannel({
      ...opts,
    });

    channelWrapper.addSetup = this.packAddSetup(channelWrapper);

    channelWrapper.assertQueue = this.packAssertQueue(channelWrapper);
    channelWrapper.assertExchange = this.packAssertExchange(channelWrapper);
    channelWrapper.bindQueue = this.packBindQueue(channelWrapper);
    channelWrapper.consume = this.packConsume(channelWrapper);

    channelWrapper.sendToQueue = this.packSendToQueue(channelWrapper);
    channelWrapper.publish = this.packPublish(channelWrapper);

    return channelWrapper;
  }

  async close() {
    await this.manager.close();
  }
}
