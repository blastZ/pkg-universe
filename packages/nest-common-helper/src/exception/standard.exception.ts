import { HttpException, HttpStatus } from '@nestjs/common';

export class StandardException extends HttpException {
  constructor(
    object: {
      error?: { code?: string; message?: string };
      data?: any;
      meta?: any;
    } = {},
  ) {
    super(HttpException.createBody(object), HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
