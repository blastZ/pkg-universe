import { DynamicModule, Provider } from '@nestjs/common';
import amqp from 'amqp-connection-manager';

import { ModuleOptions } from './interfaces/module-options.interface.js';
import { RabbitMQService } from './rabbitmq.service.js';
import { CONNECTION_MANAGER, MODULE_OPTIONS } from './token.js';

function createConnectionManagerProvider(options: ModuleOptions) {
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
  static forRoot(options: ModuleOptions): DynamicModule {
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
