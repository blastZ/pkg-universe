import { Redis } from 'ioredis';

export async function scanAll(
  client: Redis,
  options: { pattern: string; count?: number },
  callback: (elements: string[]) => Promise<void> | void,
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

    await callback(nextElements);

    cursor = nextCursor;
  } while (cursor != '0');
}
