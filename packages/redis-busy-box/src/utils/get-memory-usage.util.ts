import { RedisOptions } from '../interfaces/redis-options.interface.js';
import { getRedisClient } from './get-redis-client.util.js';

export async function getMemoryUsage(
  pattern: string,
  options: { redisOptions: RedisOptions },
) {
  const client = await getRedisClient(options.redisOptions);

  let cursor = '0';
  let memory = 0;

  do {
    const [nextCursor, nextElements] = await client.scan(
      cursor,
      'MATCH',
      pattern,
      'COUNT',
      1000,
    );

    await Promise.all(
      nextElements.map(async (element) => {
        const usage = await client.memory('USAGE', element); // bytes

        if (usage) {
          memory += usage;
        }
      }),
    );

    cursor = nextCursor;
  } while (cursor != '0');

  await client.quit();

  return memory;
}
