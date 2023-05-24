import { GrpcOptions } from '@nestjs/microservices';

export interface GetGrpcOptsOptions {
  packageName: string;
  url: string;
  healthCheck?: boolean;
  dependentProtos?: string[];
  loader?: GrpcOptions['options']['loader'];
}
