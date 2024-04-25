import { HttpException } from '@nestjs/common';

export class GrpcException extends HttpException {
  constructor(code: string, message?: string, data?: any) {
    super(
      {
        code,
        message: message ?? 'Internal server error',
        data: data ?? {},
      },
      500,
    );
  }
}
