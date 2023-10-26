import { RedisOptions } from '../interfaces/redis-options.interface.js';
import { getRedisClient } from './get-redis-client.util.js';
import { scanAll } from './scan-all.util.js';

export async function getCountOfKeys(
  pattern: string,
  options: { redisOptions: RedisOptions },
) {
  const client = await getRedisClient(options.redisOptions);

  let count = 0;

  await scanAll(client, { pattern }, async (elements) => {
    count += elements.length;
  });

  await client.quit();

  return count;
}
