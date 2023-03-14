import { AsyncLocalStorage } from 'node:async_hooks';

interface Store {
  headers: Record<string, string | string[] | undefined>;
}

export const propagationContext = new AsyncLocalStorage<Store>();
