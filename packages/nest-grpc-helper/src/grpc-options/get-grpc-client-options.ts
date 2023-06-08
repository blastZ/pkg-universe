import { ClientProviderOptions, Transport } from '@nestjs/microservices';

import { HEALTH_PACKAGE_NAME } from '../index.js';
import { KEEPALIVE_CORE_OPTIONS } from './constants/keepalive-options.constant.js';
import { PROTO_LOADER_OPTIONS } from './constants/proto-loader-options.constant.js';
import { GetGrpcOptsOptions } from './interfaces/get-grpc-opts-options.interface.js';
import {
  getHealthProtoPath,
  getProtoPath,
} from './utils/get-proto-path.util.js';

export function getGrpcClientOptions(
  opts: GetGrpcOptsOptions,
): ClientProviderOptions {
  const { packageName, url, dependentProtos, loader = {} } = opts;

  const name = opts.name ? opts.name : Symbol(packageName);

  const protoPath =
    packageName === HEALTH_PACKAGE_NAME
      ? getHealthProtoPath()
      : getProtoPath(packageName, { dependentProtos });

  return {
    name,
    transport: Transport.GRPC,
    options: {
      url,
      package: packageName,
      protoPath,
      keepalive: KEEPALIVE_CORE_OPTIONS,
      loader: { ...PROTO_LOADER_OPTIONS, ...loader },
    },
  };
}
