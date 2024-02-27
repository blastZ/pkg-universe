import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { GrpcClientsModule } from '../src/index.js';

import { UsersService } from './client.js';
import { config } from './config.js';

describe('grpc helper', () => {
  let app: INestApplication;

  let usersService: UsersService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        GrpcClientsModule.forRoot([{ ...config, services: ['UsersService'] }]),
      ],
      providers: [UsersService],
      exports: [],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();

    usersService = moduleRef.get(UsersService);
  });

  it('should work', async () => {
    const user = await usersService.createUser({
      name: 'test',
      email: 'test@test.com',
    });

    expect(user.id).toEqual(1);
  });
});
