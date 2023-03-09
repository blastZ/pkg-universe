import { GetGrpcOptsOptions } from './get-grpc-opts-options.interface.js';

export type GrpcClientsOptions = (GetGrpcOptsOptions & {
  propagationHeaders?: string[];
})[];
