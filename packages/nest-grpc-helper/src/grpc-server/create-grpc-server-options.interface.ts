import { GetGrpcOptsOptions } from '../grpc-options/index.js';

export type CreateGrpcServerOptions = GetGrpcOptsOptions & {
  disableTrace?: boolean;
  disablePropagation?: boolean;
};
