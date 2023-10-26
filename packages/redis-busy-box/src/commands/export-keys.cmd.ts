import { createWriteStream } from 'node:fs';
import { finished } from 'stream/promises';

import { RedisOptions } from '../interfaces/redis-options.interface.js';
import { getRedisClient } from '../utils/get-redis-client.util.js';
import { getValueByType } from '../utils/get-value-by-type.util.js';
import { scanAll } from '../utils/scan-all.util.js';

export async function exportKeysCommand(
  pattern: string,
  options: RedisOptions,
) {
  const client = await getRedisClient(options);

  const outputDir = process.cwd();
  const dateString = new Date().toISOString();
  const outputFileName = `export_keys_result_${pattern}_${dateString}.json`;

  const stream = createWriteStream(`${outputDir}/${outputFileName}`);

  stream.write('[');

  let isFirstOne = true;

  await scanAll(client, { pattern }, async (elements) => {
    await Promise.all(
      elements.map(async (element, index) => {
        const type = await client.type(element);

        const value = await getValueByType(client, element, type);

        const content = {
          key: element,
          value,
          type,
        };

        if (isFirstOne && index === 0) {
          isFirstOne = false;

          stream.write(`${JSON.stringify(content)}`);
        } else {
          stream.write(`,\n${JSON.stringify(content)}`);
        }
      }),
    );
  });

  stream.end(']');

  await finished(stream);

  await client.quit();
}
