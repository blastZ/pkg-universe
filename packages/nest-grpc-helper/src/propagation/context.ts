import { AsyncLocalStorage } from 'async_hooks';

interface Store {
  headers: Record<string, string | string[] | undefined>;
}

export const propagationContext = new AsyncLocalStorage<Store>();
