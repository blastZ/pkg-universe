import type { Agent, Fetch } from './shared-types.js';

export interface APIClientOptions {
  baseURL: string;
  maxRetries?: number;
  timeout?: number;
  httpAgent?: Agent;
  fetch?: Fetch;
}
