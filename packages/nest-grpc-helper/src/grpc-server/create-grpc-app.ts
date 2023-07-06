import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface.js';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';

import { getGrpcServerOptions } from '../grpc-options/index.js';
import { CreateGrpcServerOptions } from './create-grpc-server-options.interface.js';

export async function createGrpcApp(
  moduleCls: any,
  options: CreateGrpcServerOptions,
  nestOptions: NestApplicationContextOptions = {},
) {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    moduleCls,
    {
      ...nestOptions,
      ...getGrpcServerOptions(options),
    },
  );

  return app;
}
