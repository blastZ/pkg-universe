import { Redis } from 'ioredis';

import { RedisOptions } from '../interfaces/redis-options.interface.js';

export async function getRedisClient(options: RedisOptions) {
  const client = new Redis({
    host: options.host,
    port: Number(options.port),
    password: options.password,
    db: Number(options.db),
  });

  return client;
}
