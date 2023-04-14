import { logger } from '@blastz/logger';
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { of } from 'rxjs';

import { ExceptionMeta } from './exception-meta.interface.js';
import { StandardException } from './standard.exception.js';

const MESSAGES = {
  UNKNOWN_EXCEPTION_MESSAGE: 'Internal server error',
  BAD_REQUEST_MESSAGE: 'Bad request',
};

export interface StandardExceptionFilterOptions {
  errorCodePrefix?: string;
  returnBadRequestDetails?: boolean;
}

export interface StandardExceptionFilterPayload {
  data?: any;
  error?: {
    code: string;
    message: string;
  };
  meta?: any;
}

@Catch()
export class StandardExceptionFilter<T = any> {
  logger = logger.child({
    stage: 'nestCommonHelper.standardExceptionFilter',
  });

  constructor(private options: StandardExceptionFilterOptions = {}) {}

  getErrorCode(code: string) {
    const { errorCodePrefix } = this.options;

    if (errorCodePrefix) {
      return `${errorCodePrefix}-${code}`;
    }

    return code;
  }

  private getPayloadFromStandardException(exception: StandardException) {
    const response = exception.getResponse() as StandardExceptionFilterPayload;

    return {
      data: response.data || {},
      error: {
        code: this.getErrorCode(response?.error?.code || '500'),
        message: response?.error?.message || MESSAGES.UNKNOWN_EXCEPTION_MESSAGE,
      },
      meta: response.meta || {},
    };
  }

  private getPayloadFromHttpException(exception: HttpException) {
    const response: any = exception.getResponse();
    const code = this.getErrorCode(String(exception.getStatus()));

    const data = {};
    const meta = {};

    // throw new HttpException('error', 500)
    if (typeof response === 'string') {
      return {
        data,
        error: {
          code,
          message: response,
        },
        meta,
      };
    }

    // throw new HttpException({ msg: 'error' }, 500);
    return {
      data: response.data ?? data,
      error: {
        code: response.code ?? code,
        message: response.message ?? MESSAGES.UNKNOWN_EXCEPTION_MESSAGE,
      },
      meta: response.meta ?? meta,
    };
  }

  private getPayloadFromBadRequestException(exception: BadRequestException) {
    if (this.options.returnBadRequestDetails) {
      return this.getPayloadFromHttpException(exception);
    }

    return {
      data: {},
      error: {
        code: this.getErrorCode('400'),
        message: MESSAGES.BAD_REQUEST_MESSAGE,
      },
      meta: {},
    };
  }

  private getDefaultPayload() {
    return {
      data: {},
      error: {
        code: this.getErrorCode('500'),
        message: MESSAGES.UNKNOWN_EXCEPTION_MESSAGE,
      },
      meta: {},
    };
  }

  getPayload(exception: T): StandardExceptionFilterPayload {
    if (exception instanceof StandardException) {
      return this.getPayloadFromStandardException(exception);
    }

    if (exception instanceof BadRequestException) {
      return this.getPayloadFromBadRequestException(exception);
    }

    if (exception instanceof HttpException) {
      return this.getPayloadFromHttpException(exception);
    }

    return this.getDefaultPayload();
  }

  catch(exception: T & { meta?: ExceptionMeta }, host: ArgumentsHost): any {
    const { meta = {}, ...originException } = exception;

    const logger = this.logger.child(meta);

    if (
      !(exception instanceof HttpException) ||
      exception instanceof InternalServerErrorException
    ) {
      logger.fatal(originException);
    } else {
      logger.error(originException);
    }

    const payload = this.getPayload(exception);

    if (exception.meta) {
      payload.meta.requestId = exception.meta.requestId;
    }

    return this.handleError(host, payload);
  }

  handleError(host: ArgumentsHost, payload: StandardExceptionFilterPayload) {
    const type = host.getType();

    if (type === 'rpc') {
      return this.handleRpcError(host, payload);
    }

    if (type === 'ws') {
      return this.handleWsError(host, payload);
    }

    return this.handleHttpError(host, payload);
  }

  private handleRpcError(
    host: ArgumentsHost,
    payload: StandardExceptionFilterPayload,
  ) {
    return of(payload);
  }

  private handleWsError(
    host: ArgumentsHost,
    payload: StandardExceptionFilterPayload,
  ) {
    const client = host.switchToWs().getClient();
    const callback = host.getArgByIndex(2);

    // Return Error Message with Acknowledgements
    if (typeof callback === 'function') {
      callback(payload);
    } else {
      client.emit('EXCEPTION', payload);
    }
  }

  private handleHttpError(
    host: ArgumentsHost,
    payload: StandardExceptionFilterPayload,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(200).json(payload);
  }
}
