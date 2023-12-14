import { DynamicModule, Provider } from '@nestjs/common';
import amqp from 'amqp-connection-manager';

import { ModuleOptions } from './interfaces/module-options.interface.js';
import { RabbitMQService } from './rabbitmq.service.js';
import { CompressService } from './services/compress.service.js';
import { MessageService } from './services/message.service.js';
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

    const moduleOptions: ModuleOptions = {
      json: true,
      ...options,
    };

    return {
      module: RabbitMQModule,
      providers: [
        {
          provide: MODULE_OPTIONS,
          useValue: moduleOptions,
        },
        connectionManagerProvider,
        RabbitMQService,
        CompressService,
        MessageService,
      ],
      exports: [RabbitMQService],
      global: true,
    };
  }
}
