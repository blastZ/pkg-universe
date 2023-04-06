import { logger } from '@blastz/logger';
import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { of } from 'rxjs';

import { StandardException } from './standard.exception.js';

const MESSAGES = {
  UNKNOWN_EXCEPTION_MESSAGE: 'Internal server error',
};

export interface StandardExceptionFilterOptions {
  errorCodePrefix?: string;
  logError?: boolean;
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

  private getStandardPayload(exception: StandardException) {
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

  private getHttpPayload(exception: HttpException) {
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
      return this.getStandardPayload(exception);
    }

    if (exception instanceof HttpException) {
      return this.getHttpPayload(exception);
    }

    return this.getDefaultPayload();
  }

  catch(exception: T, host: ArgumentsHost): any {
    if (this.options.logError) {
      this.logger.error(exception);
    }

    const payload = this.getPayload(exception);

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
