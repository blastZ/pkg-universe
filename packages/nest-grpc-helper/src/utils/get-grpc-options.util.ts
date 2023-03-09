import {
  ClientProviderOptions,
  GrpcOptions,
  Transport,
} from '@nestjs/microservices';
import path from 'path';

import { GetGrpcOptsOptions } from '../interfaces/get-grpc-opts-options.interface.js';

const KEEPALIVE_CORE_OPTIONS: GrpcOptions['options']['keepalive'] = {
  keepaliveTimeMs: 10 * 60 * 1000,
  keepaliveTimeoutMs: 30 * 1000,
  keepalivePermitWithoutCalls: 1,
  http2MaxPingsWithoutData: 6 * 24 * 7,
};

const KEEPALIVE_SERVER_OPTIONS: GrpcOptions['options']['keepalive'] = {
  http2MinPingIntervalWithoutDataMs: 5 * 60 * 1000,
  http2MaxPingStrikes: 10,
};

const LOADER_OPTIONS: GrpcOptions['options']['loader'] = {
  longs: Number,
  json: true,
};

function getProtoPath(packageName: string) {
  return [
    path.resolve(
      process.cwd(),
      `./protos/${packageName.replace(
        /[A-Z]/g,
        (letter) => `-${letter.toLowerCase()}`
      )}/main.proto`
    ),
  ];
}

export function getGrpcServerOptions(opts: GetGrpcOptsOptions): GrpcOptions {
  const { packageName, url } = opts;

  return {
    transport: Transport.GRPC,
    options: {
      package: packageName,
      protoPath: getProtoPath(packageName),
      url,
      loader: LOADER_OPTIONS,
      keepalive: {
        ...KEEPALIVE_CORE_OPTIONS,
        ...KEEPALIVE_SERVER_OPTIONS,
      },
    },
  };
}

export function getGrpcClientOptions(
  opts: GetGrpcOptsOptions
): ClientProviderOptions {
  const { packageName, url } = opts;

  return {
    name: packageName,
    transport: Transport.GRPC,
    options: {
      url,
      package: packageName,
      protoPath: getProtoPath(packageName),
      keepalive: KEEPALIVE_CORE_OPTIONS,
      loader: LOADER_OPTIONS,
    },
  };
}
