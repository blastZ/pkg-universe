import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { GrpcClientsModule } from '../src/index.js';

import { UsersService } from './client.js';
import { config } from './config.js';

const uuid4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

describe('grpc helper', () => {
  let app: INestApplication;

  let usersService: UsersService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GrpcClientsModule.forRoot([config])],
      providers: [UsersService],
      exports: [],
    }).compile();

    app = moduleRef.createNestApplication();

    app.enableShutdownHooks();

    await app.init();

    usersService = moduleRef.get(UsersService);
  });

  it('should work with reply', async () => {
    const result = await usersService.createUser({
      name: 'test',
    });

    expect(result.data.name).toEqual('test');
  });

  it('should work with array reply', async () => {
    const t1 = await usersService.listUsers();

    expect(Array.isArray(t1.data)).toBeTruthy();

    const randomName = uuid4();

    await usersService.createUser({
      name: randomName,
    });

    const t2 = await usersService.listUsers();

    expect(t2.data.find((o) => o.name === randomName)).toBeTruthy();
  });

  describe('with grpc exception', () => {
    it('should work with code', async () => {
      await expect(
        usersService.createUser({
          name: 'grpc-exception-code',
        }),
      ).resolves.toEqual({
        data: {},
        error: {
          code: 'ERR_INVALID_PARAMS',
          message: 'Internal server error',
        },
      });
    });

    it('should work with message', async () => {
      await expect(
        usersService.createUser({
          name: 'grpc-exception-message',
        }),
      ).resolves.toEqual({
        data: {},
        error: {
          code: 'ERR_INVALID_PARAMS',
          message: 'Invalid params',
        },
      });
    });

    it('should work with data', async () => {
      await expect(
        usersService.createUser({
          name: 'grpc-exception-with-data',
        }),
      ).resolves.toEqual({
        data: {
          contact: 'blastz',
        },
        error: { code: 'ERR_XXX', message: 'grpc exception with data' },
      });
    });
  });

  describe('with http exception', () => {
    it('should work with basic', async () => {
      await expect(
        usersService.createUser({
          name: 'http-exception',
        }),
      ).resolves.toEqual({
        data: {},
        error: { code: '410', message: 'http exception' },
      });
    });

    it('should work with specific', async () => {
      await expect(
        usersService.createUser({
          name: 'specific-http-exception',
        }),
      ).resolves.toEqual({
        data: {},
        error: { code: '400', message: 'Bad Request' },
      });
    });

    it('should work with message', async () => {
      await expect(
        usersService.createUser({
          name: 'specific-http-exception-with-message',
        }),
      ).resolves.toEqual({
        data: {},
        error: { code: '400', message: 'specific http exception with message' },
      });
    });

    it('should work with object code', async () => {
      await expect(
        usersService.createUser({
          name: 'specific-http-exception-with-object-code',
        }),
      ).resolves.toEqual({
        data: {},
        error: {
          code: 'ERR_XXX',
          message: 'Bad Request Exception',
        },
      });
    });

    it('should work with object message', async () => {
      await expect(
        usersService.createUser({
          name: 'specific-http-exception-with-object-message',
        }),
      ).resolves.toEqual({
        data: {},
        error: {
          code: '400',
          message: 'object message',
        },
      });
    });

    it('should work with object error', async () => {
      await expect(
        usersService.createUser({
          name: 'specific-http-exception-with-object-error',
        }),
      ).resolves.toEqual({
        data: {},
        error: {
          code: 'ERR_XXX',
          message: 'object error',
        },
      });
    });

    it('should work with data', async () => {
      await expect(
        usersService.createUser({
          name: 'custom-http-exception-with-data',
        }),
      ).resolves.toEqual({
        data: {
          contact: 'blastz',
        },
        error: {
          code: 'ERR_XXX',
          message: 'custom http exception with data',
        },
      });
    });
  });

  describe('with rpc exception', () => {
    it('should work with basic', async () => {
      await expect(
        usersService.createUser({
          name: 'rpc-exception',
        }),
      ).resolves.toEqual({
        data: {},
        error: {
          code: '500',
          message: 'rpc exception',
        },
      });
    });

    it('should work with wrap http exception', async () => {
      await expect(
        usersService.createUser({
          name: 'rpc-exception-wrap-http-exception',
        }),
      ).resolves.toEqual({
        data: {},
        error: { code: '400', message: 'rpc exception wrap http exception' },
      });
    });
  });
});
