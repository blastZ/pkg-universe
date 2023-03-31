import { AsyncLocalStorage } from 'node:async_hooks';

export const traceContext = new AsyncLocalStorage<Record<string, unknown>>();
