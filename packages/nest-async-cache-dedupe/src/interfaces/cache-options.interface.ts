import { StorageMemoryOptions } from 'async-cache-dedupe';

type StorageInputMemory = {
  type: 'memory';
  options?: StorageMemoryOptions;
};

export interface CacheOptions {
  ttl?: number; // seconds
  stale?: number; // seconds
  storage?: StorageInputMemory;
}
