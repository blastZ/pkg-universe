import { HttpException, HttpStatus } from '@nestjs/common';

interface Payload {
  data?: any;
  error?: {
    code?: string;
    message?: string;
  };
  meta?: any;
  [index: string]: unknown;
}

export class StandardException extends HttpException {
  constructor();
  constructor(message: string);
  constructor(payload: Payload);
  constructor(code: string, message: string);
  constructor(
    emptyOrMessageOrPayloadOrCode: string | Payload | undefined = {},
    message?: string,
  ) {
    if (typeof emptyOrMessageOrPayloadOrCode === 'string') {
      if (typeof message === 'string') {
        super(
          HttpException.createBody({
            error: { code: emptyOrMessageOrPayloadOrCode, message },
          }),
          HttpStatus.BAD_REQUEST,
        );
      } else {
        super(
          HttpException.createBody({
            error: { code: '400', message: emptyOrMessageOrPayloadOrCode },
          }),
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      super(
        HttpException.createBody(emptyOrMessageOrPayloadOrCode),
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
