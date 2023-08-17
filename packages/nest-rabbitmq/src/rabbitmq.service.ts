import { Injectable } from '@nestjs/common';
import {
  AmqpConnectionManager,
  CreateChannelOpts as AmqpCreateChannelOpts,
} from 'amqp-connection-manager';
import { Channel } from 'amqplib';

import { ConnectionManager } from './connection-manager.decorator.js';

export interface CreateChannelOpts
  extends Omit<AmqpCreateChannelOpts, 'setup'> {
  setup: (channel: Channel) => Promise<any>;
}

@Injectable()
export class RabbitMQService {
  constructor(@ConnectionManager() private manager: AmqpConnectionManager) {}

  createChannel(opts?: CreateChannelOpts) {
    const channelWrapper = this.manager.createChannel({
      json: true,
      ...opts,
    });

    return channelWrapper;
  }

  async close() {
    await this.manager.close();
  }
}
