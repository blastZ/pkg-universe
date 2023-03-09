import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';

import { GetGrpcOptsOptions } from '../interfaces/get-grpc-opts-options.interface.js';
import { getGrpcServerOptions } from './get-grpc-options.util.js';

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
