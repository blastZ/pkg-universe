import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';

import { GetGrpcOptsOptions, getGrpcServerOptions } from '../grpc-options';

export async function createGrpcApp(
  moduleCls: any,
  options: GetGrpcOptsOptions
) {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    moduleCls,
    getGrpcServerOptions(options)
  );

  return app;
}
