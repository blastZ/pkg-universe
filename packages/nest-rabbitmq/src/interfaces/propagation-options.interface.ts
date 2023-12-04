import { AsyncLocalStorage } from 'node:async_hooks';

export interface PropagationOptions {
  headers?: string[];
  context: AsyncLocalStorage<{
    headers: Record<string, string | string[] | undefined>;
  }>;
}
