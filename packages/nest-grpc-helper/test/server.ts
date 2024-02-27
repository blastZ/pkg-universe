import { Controller, Module } from '@nestjs/common';

import { GrpcHelperMethod, createGrpcApp } from '../src/index.js';

import { config } from './config.js';

@Controller()
class UsersController {
  @GrpcHelperMethod()
  createUser(params: { name: string; email: string }) {
    return {
      id: 1,
      ...params,
    };
  }
}

@Module({
  controllers: [UsersController],
})
class AppModule {}

const app = await createGrpcApp(AppModule, config);

await app.listen();
