import { GrpcOptions } from '@nestjs/microservices';

export interface GetGrpcOptsOptions {
  packageName: string;
  url: string;
  dependentProtos?: string[];
  loader?: GrpcOptions['options']['loader'];
}
