import { AsyncLocalStorage } from 'node:async_hooks';

import { GetGrpcOptsOptions } from '../../grpc-options/index.js';
import { GrpcClientRequestOptions } from './grpc-client-request-options.interface.js';

export type PropagationOptions = {
  headers?: string[];
  context: AsyncLocalStorage<{
    headers: Record<string, string | string[] | undefined>;
  }>;
};

export type GrpcClientOptions = GetGrpcOptsOptions &
  GrpcClientRequestOptions & {
    propagation?: PropagationOptions;
    services?: string[];
  };

export type GrpcClientsOptions = GrpcClientOptions[];
