import { createWriteStream } from 'node:fs';
import { finished } from 'stream/promises';

import { RedisOptions } from '../interfaces/redis-options.interface.js';
import { getRedisClient } from '../utils/get-redis-client.util.js';
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

        let content: any;

        if (type === 'string') {
          const value = await client.get(element);

          content = {
            key: element,
            value,
            type,
          };
        } else if (type === 'list') {
          const value = await client.lrange(element, 0, -1);

          content = {
            key: element,
            value,
            type,
          };
        } else if (type === 'set') {
          const value = await client.smembers(element);

          content = {
            key: element,
            value,
            type,
          };
        } else if (type === 'zset') {
          const value = await client.zrange(element, 0, -1, 'WITHSCORES');

          content = {
            key: element,
            value,
            type,
          };
        } else if (type === 'hash') {
          const value = await client.hgetall(element);

          content = {
            key: element,
            value,
            type,
          };
        } else if (type === 'stream') {
          const value = await client.xrange(element, '-', '+');

          content = {
            key: element,
            value,
            type,
          };
        } else {
          content = {
            key: element,
            value: null,
            type,
          };
        }

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
