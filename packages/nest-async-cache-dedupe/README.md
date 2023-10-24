# Nest Async Cache Dedupe

## Getting started

Install @blastz/nest-async-cache-dedupe

```bash
npm install @blastz/nest-async-cache-dedupe
```

## Examples

Register cache module

```ts
import { AsyncCacheDedupeModule } from '@blastz/nest-async-cache-dedupe';

@Module({
  imports: [AsyncCacheDedupeModule.forRoot()],
})
export class AppModule {}
```

Use cache decorator

```ts
class SomeService {
  @AsyncCacheDedupe({
    ttl: 3,
  })
  async someMethod(...args: any[]) {
    // ...
  }
}
```

## License

Licensed under MIT
