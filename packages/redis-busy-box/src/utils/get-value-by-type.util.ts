import { Redis } from 'ioredis';

export async function getValueByType(client: Redis, key: string, type: string) {
  if (type === 'string') {
    return client.get(key);
  }

  if (type === 'list') {
    return client.lrange(key, 0, -1);
  }

  if (type === 'set') {
    return client.smembers(key);
  }

  if (type === 'zset') {
    return client.zrange(key, 0, -1, 'WITHSCORES');
  }

  if (type === 'hash') {
    return client.hgetall(key);
  }

  if (type === 'stream') {
    return client.xrange(key, '-', '+');
  }

  return null;
}
