import { RedisOptions } from '../interfaces/redis-options.interface.js';
import { getCountOfKeys } from '../utils/get-count-of-keys.util.js';

export async function countKeysCommand(pattern: string, options: RedisOptions) {
  const count = await getCountOfKeys(pattern, { redisOptions: options });

  console.log(`Count of keys: ${count}`);
}
