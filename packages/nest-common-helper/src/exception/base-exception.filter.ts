import { ArgumentsHost, Catch } from '@nestjs/common';
import { Response } from 'express';

import { AppException } from './app.exception.js';

const MESSAGES = {
  UNKNOWN_EXCEPTION_MESSAGE: 'Internal server error',
};

export interface Params {
  errorCodePrefix?: string;
}

export interface Payload {
  data?: any;
  error?: {
    code: string;
    message: string;
  };
}

@Catch()
export class BaseExceptionFilter<T = any> {
  private errorCodePrefix?: string;

  constructor(params: Params = {}) {
    this.errorCodePrefix = params.errorCodePrefix;
  }

  public catch(exception: T, host: ArgumentsHost): any {
    const type = host.getType();

    const payload = this.getPayload(exception);

    if (type === 'rpc') {
      return this.handleRpcError(host, payload);
    }

    if (type === 'ws') {
      return this.handleWsError(host, payload);
    }

    return this.handleHttpError(host, payload);
  }

  private getErrorCode(code: string) {
    if (this.errorCodePrefix) {
      return `${this.errorCodePrefix}-${code}`;
    }

    return code;
  }

  private getPayload(exception: T): Payload {
    if (exception instanceof AppException) {
      const response = exception.getResponse() as Payload;

      return {
        data: response.data || {},
        error: {
          code: this.getErrorCode(response?.error?.code || '500'),
          message:
            response?.error?.message || MESSAGES.UNKNOWN_EXCEPTION_MESSAGE,
        },
      };
    }

    return {
      data: {},
      error: {
        code: this.getErrorCode('500'),
        message: MESSAGES.UNKNOWN_EXCEPTION_MESSAGE,
      },
    };
  }

  private handleRpcError(host: ArgumentsHost, payload: Payload) {
    return payload;
  }

  private handleWsError(host: ArgumentsHost, payload: Payload) {
    const client = host.switchToWs().getClient();
    const callback = host.getArgByIndex(2);

    // Return Error Message with Acknowledgements
    if (typeof callback === 'function') {
      callback(payload);
    } else {
      client.emit('EXCEPTION', payload);
    }
  }

  private handleHttpError(host: ArgumentsHost, payload: Payload) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(200).json(payload);
  }
}
