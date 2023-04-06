import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';

import { getGrpcServerOptions } from '../grpc-options/index.js';
import { CreateGrpcServerOptions } from './create-grpc-server-options.interface.js';

export async function createGrpcApp(
  moduleCls: any,
  options: CreateGrpcServerOptions,
) {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    moduleCls,
    getGrpcServerOptions(options),
  );

  return app;
}
