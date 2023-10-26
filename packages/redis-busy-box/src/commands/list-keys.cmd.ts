import { confirm } from '@inquirer/prompts';
import { inspect } from 'node:util';

import { RedisOptions } from '../interfaces/redis-options.interface.js';
import { getRedisClient } from '../utils/get-redis-client.util.js';
import { getValueByType } from '../utils/get-value-by-type.util.js';
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
        const type = await client.type(element);

        let value = options.showValues
          ? await getValueByType(client, element, type)
          : undefined;

        const content = inspect(
          {
            key: element,
            type,
            ...(value ? { value } : {}),
          },
          { colors: true, depth: 5 },
        );

        console.log(content);
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
