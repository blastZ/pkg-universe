import { Redis } from 'ioredis';
import { inspect } from 'node:util';

import { getValueByType } from './get-value-by-type.util.js';

export async function printElement(
  client: Redis,
  element: string,
  options: { showValues?: boolean },
) {
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
}
