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

import { ExceptionMeta, StandardExceptionPayload } from './interfaces/index.js';
import { StandardException } from './standard.exception.js';

const MESSAGES = {
  UNKNOWN_EXCEPTION_MESSAGE: 'Internal server error',
  BAD_REQUEST_MESSAGE: 'Bad request',
};

export interface StandardExceptionFilterOptions {
  returnBadRequestDetails?: boolean;
}

@Catch()
export class StandardExceptionFilter<T = any> {
  logger = logger.child({
    stage: 'nestCommonHelper.standardExceptionFilter',
  });

  constructor(private options: StandardExceptionFilterOptions = {}) {}

  private getPayloadFromStandardException(exception: StandardException) {
    const response = exception.getResponse() as StandardExceptionPayload;

    return {
      data: response.data || {},
      error: {
        code: response?.error?.code || '500',
        message: response?.error?.message || MESSAGES.UNKNOWN_EXCEPTION_MESSAGE,
      },
      meta: response.meta || {},
    };
  }

  private getPayloadFromHttpException(exception: HttpException) {
    const response: any = exception.getResponse();
    const code = String(exception.getStatus());

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
        code: '400',
        message: MESSAGES.BAD_REQUEST_MESSAGE,
      },
      meta: {},
    };
  }

  private getDefaultPayload() {
    return {
      data: {},
      error: {
        code: '500',
        message: MESSAGES.UNKNOWN_EXCEPTION_MESSAGE,
      },
      meta: {},
    };
  }

  getPayload(exception: T): StandardExceptionPayload {
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
    const meta = exception.meta;

    const logger = this.logger.child(meta || {});

    delete exception.meta;

    if (
      !(exception instanceof HttpException) ||
      exception instanceof InternalServerErrorException
    ) {
      logger.fatal(exception);
    } else {
      logger.error(exception);
    }

    const payload = this.getPayload(exception);

    if (meta) {
      payload.meta.requestId = meta.requestId;
    }

    return this.handleError(host, payload);
  }

  handleError(host: ArgumentsHost, payload: StandardExceptionPayload) {
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
    payload: StandardExceptionPayload,
  ) {
    return of(payload);
  }

  private handleWsError(
    host: ArgumentsHost,
    payload: StandardExceptionPayload,
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
    payload: StandardExceptionPayload,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(200).json(payload);
  }
}
