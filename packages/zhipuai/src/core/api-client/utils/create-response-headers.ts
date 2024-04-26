import type { Fetch } from '../interfaces/index.js';

export const createResponseHeaders = (
  headers: Awaited<ReturnType<Fetch>>['headers'],
): Record<string, string> => {
  return new Proxy(Object.fromEntries(headers.entries()), {
    get(target, name) {
      const key = name.toString();
      return target[key.toLowerCase()] || target[key];
    },
  });
};
