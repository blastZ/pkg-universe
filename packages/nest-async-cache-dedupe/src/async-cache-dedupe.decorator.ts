import { Inject } from '@nestjs/common';
import { Cache } from 'async-cache-dedupe';

import { CACHE } from './constants/cache.constant.js';
import { CacheDefineOptions } from './interfaces/cache-define-options.interface.js';

export function AsyncCacheDedupe(options: CacheDefineOptions = {}) {
  const injectCache = Inject(CACHE);

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    injectCache(target, 'cache');

    const key = `${target.constructor.name}_${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      const cache = (this as any)['cache'];

      if (!cache[key]) {
        (cache as Cache).define(key, options, (args) => {
          return originalMethod.apply(this, args);
        });
      }

      return cache[key](args);
    };
  };
}
