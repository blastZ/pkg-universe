import { DynamicModule, Provider } from '@nestjs/common';
import amqp, { AmqpConnectionManagerOptions } from 'amqp-connection-manager';
import { AsyncLocalStorage } from 'node:async_hooks';

import { RabbitMQService } from './rabbitmq.service.js';
import { CONNECTION_MANAGER, MODULE_OPTIONS } from './token.js';

export type PropagationOptions = {
  headers?: string[];
  context: AsyncLocalStorage<{
    headers: Record<string, string | string[] | undefined>;
  }>;
};

export interface Options {
  urls: string[];
  connectionManagerOptions?: AmqpConnectionManagerOptions;
  propagation?: PropagationOptions;
  isCanary?: boolean | (() => Promise<boolean> | boolean);
  isCanaryMessage?: (
    headers: Record<string, string>,
  ) => Promise<boolean> | boolean;
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
      providers: [
        {
          provide: MODULE_OPTIONS,
          useValue: options,
        },
        connectionManagerProvider,
        RabbitMQService,
      ],
      exports: [RabbitMQService],
      global: true,
    };
  }
}
