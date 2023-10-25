import { getMemoryUsage } from '../src/utils/get-memory-usage.util';

describe('redis-busy-box', () => {
  it('should get memory usage by pattern', async () => {
    const result = await getMemoryUsage('*', {
      redisOptions: { host: 'localhost', port: '6379' },
    });

    console.log(result);
  });
});
