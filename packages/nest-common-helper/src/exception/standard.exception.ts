import { HttpException, HttpStatus } from '@nestjs/common';

export class StandardException extends HttpException {
  constructor(
    stringOrObject:
      | string
      | {
          error?: { code?: string; message?: string };
          data?: any;
          meta?: any;
        } = {},
  ) {
    if (typeof stringOrObject === 'string') {
      super(
        HttpException.createBody({
          error: { code: '400', message: stringOrObject },
        }),
        HttpStatus.BAD_REQUEST,
      );
    } else {
      super(
        HttpException.createBody(stringOrObject),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
