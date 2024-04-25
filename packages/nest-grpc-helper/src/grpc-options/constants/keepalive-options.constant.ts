import type { GrpcOptions } from '@nestjs/microservices';

export const KEEPALIVE_CORE_OPTIONS: GrpcOptions['options']['keepalive'] = {
  keepaliveTimeMs: 10 * 60 * 1000,
  keepaliveTimeoutMs: 30 * 1000,
  keepalivePermitWithoutCalls: 1,
  http2MaxPingsWithoutData: 6 * 24 * 7,
};

export const KEEPALIVE_SERVER_OPTIONS: GrpcOptions['options']['keepalive'] = {
  http2MinPingIntervalWithoutDataMs: 5 * 60 * 1000,
  http2MaxPingStrikes: 10,
};
