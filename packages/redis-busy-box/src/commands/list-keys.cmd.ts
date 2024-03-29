import { confirm } from '@inquirer/prompts';

import { RedisOptions } from '../interfaces/redis-options.interface.js';
import { getRedisClient } from '../utils/get-redis-client.util.js';
import { printElement } from '../utils/print-element.util.js';
import { scanAll } from '../utils/scan-all.util.js';

export async function listKeysCommand(
  pattern: string,
  options: RedisOptions & { count: string; showValues?: boolean },
) {
  const client = await getRedisClient(options);

  const count = Number(options.count);

  await scanAll(client, { pattern, count }, async (elements, nextCursor) => {
    await Promise.all(
      elements.map(async (element) => {
        await printElement(client, element, { showValues: options.showValues });
      }),
    );

    if (elements.length < 1 || nextCursor === '0') {
      return;
    }

    const answer = await confirm({ message: 'Continue?' });

    if (!answer) {
      return false;
    }
  });

  await client.quit();
}
