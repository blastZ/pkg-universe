import { GrpcOptions, Transport } from '@nestjs/microservices';

import {
  KEEPALIVE_CORE_OPTIONS,
  KEEPALIVE_SERVER_OPTIONS,
} from './constants/keepalive-options.constant.js';
import { PROTO_LOADER_OPTIONS } from './constants/proto-loader-options.constant.js';
import { GetGrpcOptsOptions } from './interfaces/get-grpc-opts-options.interface.js';
import { getProtoPath } from './utils/get-proto-path.util.js';

export function getGrpcServerOptions(opts: GetGrpcOptsOptions): GrpcOptions {
  const { packageName, url, dependentProtos } = opts;

  return {
    transport: Transport.GRPC,
    options: {
      package: packageName,
      protoPath: getProtoPath(packageName, dependentProtos),
      url,
      loader: PROTO_LOADER_OPTIONS,
      keepalive: {
        ...KEEPALIVE_CORE_OPTIONS,
        ...KEEPALIVE_SERVER_OPTIONS,
      },
    },
  };
}
