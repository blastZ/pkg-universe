import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';

import {
  GetGrpcOptsOptions,
  getGrpcServerOptions,
} from '../grpc-options/index.js';
import { PropagationInterceptor } from '../propagation/index.js';

export async function createGrpcApp(
  moduleCls: any,
  options: GetGrpcOptsOptions
) {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    moduleCls,
    getGrpcServerOptions(options)
  );

  app.useGlobalInterceptors(new PropagationInterceptor());

  return app;
}
