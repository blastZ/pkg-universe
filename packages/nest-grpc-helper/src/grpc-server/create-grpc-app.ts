import { type DynamicModule } from '@nestjs/common';
import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface.js';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';

import { getGrpcServerOptions } from '../grpc-options/index.js';

import { CreateGrpcServerOptions } from './create-grpc-server-options.interface.js';
import { GRPC_SERVER_OPTIONS } from './grpc-server-options.constant.js';

class AppModule {
  static DecInputAppModule(
    moduleCls: any,
    options: CreateGrpcServerOptions,
  ): DynamicModule {
    const providers = [
      {
        provide: GRPC_SERVER_OPTIONS,
        useValue: options,
      },
    ];

    return {
      module: AppModule,
      imports: [moduleCls],
      providers,
      exports: providers,
      global: true,
    };
  }
}

export async function createGrpcApp(
  moduleCls: any,
  options: CreateGrpcServerOptions,
  nestOptions: NestApplicationContextOptions = {},
) {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule.DecInputAppModule(moduleCls, options),
    {
      ...nestOptions,
      ...getGrpcServerOptions(options),
    },
  );

  return app;
}
