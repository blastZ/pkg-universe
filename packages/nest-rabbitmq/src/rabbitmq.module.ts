import { DynamicModule, Provider } from '@nestjs/common';
import amqp, { AmqpConnectionManagerOptions } from 'amqp-connection-manager';

import { RabbitMQService } from './rabbitmq.service.js';
import { CONNECTION_MANAGER } from './token.js';

export interface Options {
  urls: string[];
  connectionManagerOptions?: AmqpConnectionManagerOptions;
}

function createConnectionManagerProvider(options: Options) {
  const connectionManagerProvider: Provider = {
    provide: CONNECTION_MANAGER,
    useFactory: () => {
      const connectionManager = amqp.connect(
        options.urls,
        options.connectionManagerOptions,
      );

      return connectionManager;
    },
  };

  return connectionManagerProvider;
}

export class RabbitMQModule {
  static forRoot(options: Options): DynamicModule {
    const connectionManagerProvider = createConnectionManagerProvider(options);

    return {
      module: RabbitMQModule,
      providers: [connectionManagerProvider, RabbitMQService],
      exports: [RabbitMQService],
      global: true,
    };
  }
}
