import { ClientProviderOptions, Transport } from '@nestjs/microservices';

import { KEEPALIVE_CORE_OPTIONS } from './constants/keepalive-options.constant.js';
import { PROTO_LOADER_OPTIONS } from './constants/proto-loader-options.constant.js';
import { GetGrpcOptsOptions } from './interfaces/get-grpc-opts-options.interface.js';
import { getProtoPath } from './utils/get-proto-path.util.js';

export function getGrpcClientOptions(
  opts: GetGrpcOptsOptions,
): ClientProviderOptions {
  const { packageName, url, dependentProtos, loader = {} } = opts;

  return {
    name: Symbol(packageName),
    transport: Transport.GRPC,
    options: {
      url,
      package: packageName,
      protoPath: getProtoPath(packageName, { dependentProtos }),
      keepalive: KEEPALIVE_CORE_OPTIONS,
      loader: { ...PROTO_LOADER_OPTIONS, ...loader },
    },
  };
}
