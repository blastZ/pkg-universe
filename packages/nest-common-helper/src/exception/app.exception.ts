import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    object: { error?: { code?: string; message?: string }; data?: any } = {}
  ) {
    super(HttpException.createBody(object), HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
