export interface RequestInit {
  signal: AbortSignal | null;
  agent?: any;
  headers?: Record<string, string>;
  body?: string | undefined;
  method: HTTPMethod;
}

export type HTTPMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type PromiseOrValue<T> = Promise<T> | T;

export type Fetch = (url: RequestInfo, init?: RequestInit) => Promise<Response>;

export type Headers = Record<string, string | null | undefined>;

// FIXME
export type Readable = unknown;

// FIXME
export type Agent = unknown;

export type DefaultQuery = Record<string, string | undefined>;
