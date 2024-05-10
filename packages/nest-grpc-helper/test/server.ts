import {
  BadRequestException,
  Catch,
  Controller,
  HttpException,
  HttpStatus,
  Module,
  type ArgumentsHost,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import {
  GrpcException,
  GrpcExceptionsFilter,
} from '../src/grpc-filter/index.js';
import { ErrorReply, GrpcHelperMethod, createGrpcApp } from '../src/index.js';

import { config } from './config.js';

const users: { id: number; name: string }[] = [];

class StandardException extends HttpException {
  constructor(payload: any) {
    super(HttpException.createBody({ ...payload }), HttpStatus.BAD_REQUEST);
  }
}

@Controller()
class UsersController {
  @GrpcHelperMethod({ data: 'User' })
  createUser(params: { name: string }) {
    if (params.name === 'grpc-exception-code') {
      throw new GrpcException('ERR_INVALID_PARAMS');
    }

    if (params.name === 'grpc-exception-message') {
      throw new GrpcException('ERR_INVALID_PARAMS', 'Invalid params');
    }

    if (params.name === 'grpc-exception-with-data') {
      throw new GrpcException('ERR_XXX', 'grpc exception with data', {
        contact: 'blastz',
      });
    }

    if (params.name === 'http-exception') {
      throw new HttpException('http exception', 410);
    }

    if (params.name === 'specific-http-exception') {
      throw new BadRequestException();
    }

    if (params.name === 'specific-http-exception-with-message') {
      throw new BadRequestException('specific http exception with message');
    }

    if (params.name === 'specific-http-exception-with-object-code') {
      throw new BadRequestException({
        code: 'ERR_XXX',
      });
    }

    if (params.name === 'specific-http-exception-with-object-message') {
      throw new BadRequestException({
        message: 'object message',
      });
    }

    if (params.name === 'specific-http-exception-with-object-error') {
      throw new BadRequestException({
        error: {
          code: 'ERR_XXX',
          message: 'object error',
        },
      });
    }

    if (params.name === 'custom-http-exception-with-data') {
      throw new StandardException(
        new ErrorReply(
          'ERR_XXX',
          'custom http exception with data',
          'accountManager.CreateUserReplyErrorData',
          { contact: 'blastz' },
        ).toObject(),
      );
    }

    if (params.name === 'grpc-exception-with-data') {
      throw new GrpcException('ERR_XXX', 'grpc exception with data', {
        contact: 'blastz',
      });
    }

    if (params.name === 'rpc-exception') {
      throw new RpcException('rpc exception');
    }

    if (params.name === 'rpc-exception-wrap-http-exception') {
      throw new RpcException(
        new BadRequestException('rpc exception wrap http exception'),
      );
    }

    const user = {
      id: users.length + 1,
      ...params,
    };

    users.push(user);

    return user;
  }

  @GrpcHelperMethod({ data: 'User' })
  listUsers(params: { ids: number[] }) {
    if (params.ids.length < 1) {
      throw new BadRequestException('ids is required');
    }

    return users;
  }
}

@Catch()
class CustomFilter extends GrpcExceptionsFilter {
  override catch(exception: any, host: ArgumentsHost): any {
    return super.catch(exception, host);
  }
}

@Module({
  controllers: [UsersController],
})
class AppModule {}

const app = await createGrpcApp(AppModule, config);

app.useGlobalFilters(new CustomFilter());

await app.listen();
