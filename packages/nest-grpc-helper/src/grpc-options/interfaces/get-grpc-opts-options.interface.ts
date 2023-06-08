import { GrpcOptions } from '@nestjs/microservices';

export interface GetGrpcOptsOptions {
  packageName: string;
  url: string;
  name?: string; // custom token name
  healthCheck?: boolean; // inject health proto
  dependentProtos?: string[];
  loader?: GrpcOptions['options']['loader'];
}
