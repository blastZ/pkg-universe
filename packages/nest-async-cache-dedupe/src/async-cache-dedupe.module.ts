import { createCache } from 'async-cache-dedupe';

import { CACHE_MODULE_OPTIONS } from './constants/cache-module-options.constant.js';
import { CACHE } from './constants/cache.constant.js';
import { ModuleOptions } from './interfaces/module-options.interface.js';

export class AsyncCacheDedupeModule {
  static forRoot(options: ModuleOptions = {}) {
    const cacheProvider = {
      provide: CACHE,
      useValue: createCache(options.cacheOptions),
    };

    return {
      module: AsyncCacheDedupeModule,
      providers: [
        {
          provide: CACHE_MODULE_OPTIONS,
          useValue: options,
        },
        cacheProvider,
      ],
      exports: [cacheProvider],
      global: true,
    };
  }
}
