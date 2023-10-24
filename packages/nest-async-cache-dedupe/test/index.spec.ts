import { Test } from '@nestjs/testing';
import { AsyncCacheDedupeModule } from '../src/index.js';
import { TestService } from './test.service.js';

describe('AsyncCacheDedupeModule', () => {
  let testService: TestService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AsyncCacheDedupeModule.forRoot()],
      providers: [TestService],
    }).compile();

    testService = moduleRef.get(TestService);
  });

  it('should work with cache', async () => {
    await testService.run('aaaa', 12);
    await testService.run('aaaa', 12);

    await testService.runWithObj({ name: 'aaaa', age: 12 });
    await testService.runWithObj({ name: 'aaaa', age: 12 });
    await testService.runWithObj({ name: 'aaaa', age: 12 });
  });
});
