import { RedisOptions } from '../interfaces/redis-options.interface.js';
import { getRedisClient } from './get-redis-client.util.js';
import { scanAll } from './scan-all.util.js';

export async function getMemoryUsage(
  pattern: string,
  options: { redisOptions: RedisOptions },
) {
  const client = await getRedisClient(options.redisOptions);

  let memory = 0;

  await scanAll(client, { pattern }, async (elements) => {
    await Promise.all(
      elements.map(async (element) => {
        const usage = await client.memory('USAGE', element); // bytes

        if (usage) {
          memory += usage;
        }
      }),
    );
  });

  await client.quit();

  return memory;
}
