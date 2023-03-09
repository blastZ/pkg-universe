import { GetGrpcOptsOptions } from '../../grpc-options/index.js';
import { GrpcClientRequestOptions } from './grpc-client-request-options.interface.js';

export type GrpcClientOptions = GetGrpcOptsOptions &
  GrpcClientRequestOptions & {
    propagationHeaders?: string[];
  };

export type GrpcClientsOptions = GrpcClientOptions[];
