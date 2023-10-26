import { Redis } from 'ioredis';

export async function scanAll(
  client: Redis,
  options: { pattern: string; count?: number },
  callback: (
    elements: string[],
    nextCursor: string,
  ) => Promise<void | boolean> | void | boolean,
) {
  let cursor = '0';

  const scanOptions = {
    count: 1000,
    ...options,
  };

  do {
    const [nextCursor, nextElements] = await client.scan(
      cursor,
      'MATCH',
      scanOptions.pattern,
      'COUNT',
      scanOptions.count,
    );

    const isContinue = await callback(nextElements, nextCursor);

    if (isContinue === false) {
      cursor = '0';
    } else {
      cursor = nextCursor;
    }
  } while (cursor != '0');
}
