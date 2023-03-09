import { GrpcOptions } from '@nestjs/microservices';

export const PROTO_LOADER_OPTIONS: GrpcOptions['options']['loader'] = {
  longs: Number,
  json: true,
};
