import { logger } from '@blastz/logger';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';

import { getGrpcServerOptions } from '../grpc-options/index.js';
import { GrpcPropagationInterceptor } from '../propagation/index.js';
import { GrpcTraceInterceptor, traceContext } from '../trace/index.js';
import { CreateGrpcServerOptions } from './create-grpc-server-options.interface.js';

logger.context = traceContext;

export async function createGrpcApp(
  moduleCls: any,
  options: CreateGrpcServerOptions,
) {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    moduleCls,
    getGrpcServerOptions(options),
  );

  if (!options.disableTrace) {
    app.useGlobalInterceptors(new GrpcTraceInterceptor());
  }

  if (!options.disablePropagation) {
    app.useGlobalInterceptors(new GrpcPropagationInterceptor());
  }

  return app;
}
