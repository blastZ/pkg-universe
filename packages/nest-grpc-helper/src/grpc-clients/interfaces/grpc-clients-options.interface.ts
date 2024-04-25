import type { AsyncLocalStorage } from 'node:async_hooks';

import type { GetGrpcOptsOptions } from '../../grpc-options/index.js';

import type { GrpcClientRequestOptions } from './grpc-client-request-options.interface.js';

export type PropagationOptions = {
  headers?: string[];
  context: AsyncLocalStorage<{
    headers: Record<string, string | string[] | undefined>;
  }>;
};

export type GrpcClientOptions = GetGrpcOptsOptions &
  GrpcClientRequestOptions & {
    propagation?: PropagationOptions;
  };

export type GrpcClientsOptions = GrpcClientOptions[];
