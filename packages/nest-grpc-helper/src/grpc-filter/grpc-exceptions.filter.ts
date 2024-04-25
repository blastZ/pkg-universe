import { Catch, Logger } from '@nestjs/common';
import { of } from 'rxjs';

import type { ReplyError } from '../grpc-common/index.js';

interface Payload {
  data: any;
  error: ReplyError;
}

@Catch()
export class GrpcExceptionsFilter {
  private logger = new Logger('GrpcHelperExceptionsHandler');

  protected convertToError(exception: any) {
    if (!(exception instanceof Error)) {
      return new Error(exception);
    }

    return exception;
  }

  protected getCode(err: Error, response?: any) {
    if (typeof response === 'object') {
      if (typeof response.code === 'string') {
        return response.code;
      }

      if (typeof response.code === 'number') {
        return String(response.code);
      }

      if (typeof response.error === 'object') {
        if (typeof response.error.code === 'string') {
          return response.error.code;
        }

        if (typeof response.error.code === 'number') {
          return String(response.error.code);
        }
      }

      if (response.statusCode) {
        return String(response.statusCode);
      }
    }

    return undefined;
  }

  protected getMessage(err: Error, response?: any) {
    if (typeof response === 'string') {
      return response;
    }

    if (typeof response === 'object') {
      if (typeof response.message === 'string') {
        return response.message;
      }

      if (typeof response.error === 'string') {
        return response.error;
      }

      if (typeof response.error === 'object') {
        if (typeof response.error.message === 'string') {
          return response.error.message;
        }
      }
    }

    return err.message;
  }

  protected getData(err: Error, response?: any) {
    if (typeof response === 'object') {
      if (typeof response.error === 'object' && response.data) {
        return response.data;
      }
    }

    return undefined;
  }

  protected getPayload(
    err: Error & {
      getResponse?: () => string | object;
      getStatus?: () => number;
      getError?: () => string | object;
    },
  ): Payload {
    const payload: Payload = {
      data: {},
      error: {
        code: '500',
        message: 'Internal server error',
      },
    };

    if (err.getResponse) {
      const response = err.getResponse();

      // console.log({ response, exception });

      const code =
        this.getCode(err, response) ??
        (err.getStatus ? String(err.getStatus()) : '500');
      const message = this.getMessage(err, response);
      const data = this.getData(err, response);

      // console.log({ code, message, data });

      payload.error.code = code;
      payload.error.message = message;
      payload.data = data || {};

      return payload;
    }

    if (err.getError) {
      const wrapped = err.getError();

      const wrappedError = this.convertToError(wrapped);

      return this.getPayload(wrappedError);
    }

    if (err instanceof Error) {
      payload.error.message = err.message;
    }

    return payload;
  }

  catch(exception: any): any {
    const err = this.convertToError(exception);

    this.logger.error(err.message, err.stack);

    const payload = this.getPayload(err);

    return this.handleError(payload);
  }

  protected handleError(payload: Payload) {
    // console.log({ payload });

    return of(payload);
  }
}
