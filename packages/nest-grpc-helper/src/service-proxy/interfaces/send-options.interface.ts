import type { GrpcClientRequestOptions } from '../../grpc-clients/index.js';

export type SendOptions = {
  meta?: Record<string, string | Buffer>;
} & GrpcClientRequestOptions;
