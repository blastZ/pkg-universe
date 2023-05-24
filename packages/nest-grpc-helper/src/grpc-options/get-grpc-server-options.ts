import { GrpcOptions, Transport } from '@nestjs/microservices';

import { HEALTH_PACKAGE_NAME } from '../grpc-health/index.js';
import {
  KEEPALIVE_CORE_OPTIONS,
  KEEPALIVE_SERVER_OPTIONS,
} from './constants/keepalive-options.constant.js';
import { PROTO_LOADER_OPTIONS } from './constants/proto-loader-options.constant.js';
import { GetGrpcOptsOptions } from './interfaces/get-grpc-opts-options.interface.js';
import { getProtoPath } from './utils/get-proto-path.util.js';

export function getGrpcServerOptions(opts: GetGrpcOptsOptions): GrpcOptions {
  const { packageName, url, healthCheck, dependentProtos, loader = {} } = opts;

  const packages: string[] = [packageName];

  if (healthCheck) {
    packages.push(HEALTH_PACKAGE_NAME);
  }

  return {
    transport: Transport.GRPC,
    options: {
      package: packages,
      protoPath: getProtoPath(packageName, {
        dependentProtos,
        healthCheck,
      }),
      url,
      loader: { ...PROTO_LOADER_OPTIONS, ...loader },
      keepalive: {
        ...KEEPALIVE_CORE_OPTIONS,
        ...KEEPALIVE_SERVER_OPTIONS,
      },
    },
  };
}
