import { AsyncLocalStorage } from 'node:async_hooks';

export interface TraceOptions {
  context: AsyncLocalStorage<Record<string, unknown>>;
}
