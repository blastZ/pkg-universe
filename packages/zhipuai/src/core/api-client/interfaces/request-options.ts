import { Stream } from '@/core/streaming';

import type { Agent, HTTPMethod, Headers, Readable } from './shared-types.js';

export type RequestOptions<Req = unknown | Record<string, unknown> | Readable> =
  {
    method?: HTTPMethod;
    path?: string;
    query?: Req;
    body?: Req | null;
    headers?: Headers;

    stream?: boolean;
    maxRetries?: number;
    timeout?: number;
    httpAgent?: Agent;
    signal?: AbortSignal | null;
    idempotencyKey?: string;

    __streamClass?: typeof Stream;
  };

export type FinalRequestOptions<
  Req = unknown | Record<string, unknown> | Readable,
> = RequestOptions<Req> & {
  method: HTTPMethod;
  path: string;
};
