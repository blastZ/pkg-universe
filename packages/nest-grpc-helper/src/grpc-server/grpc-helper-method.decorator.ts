import { Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { ArrayReply, ErrorReply, Reply } from '../grpc-common/index.js';
import { GrpcException } from '../grpc-filter/index.js';

import { GRPC_SERVER_OPTIONS } from './grpc-server-options.constant.js';

interface Options {
  service?: string;
  method?: string;
  data?: string;
  errorData?: string;
}

export function GrpcHelperMethod(options: Options = {}) {
  const injectGrpcServerOptions = Inject(GRPC_SERVER_OPTIONS);

  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    injectGrpcServerOptions(target, 'grpcServerOptions');

    const serviceName =
      options.service ??
      target.constructor.name.replace('Controller', 'Service');

    const methodName = options.method;

    const originName = descriptor.value.name;

    const defaultBaseName =
      originName.slice(0, 1).toUpperCase() + originName.slice(1);
    const defaultDataName = defaultBaseName + 'ReplyData';
    const defaultErrorDataName = defaultBaseName + 'ReplyErrorData';

    // console.log({
    //   serviceName,
    //   methodName,
    //   defaultBaseName,
    // });

    const origin = descriptor.value;

    descriptor.value = async function (this: any, ...args: any[]) {
      const grpcServerOptions = this['grpcServerOptions'];

      let result: any;
      try {
        result = await origin.call(this, ...args);
      } catch (err) {
        if (err instanceof GrpcException) {
          const res = err.getResponse() as any;

          const dataName = options.errorData ?? defaultErrorDataName;
          const dataType = [grpcServerOptions.packageName, dataName].join('.');

          return new ErrorReply(res.code, res.message, dataType, res.data);
        }

        throw err;
      }

      // console.log({ result, grpcServerOptions });

      const dataName = options.data ?? defaultDataName;
      const dataType = [grpcServerOptions.packageName, dataName].join('.');

      // console.log({
      //   dataType,
      // });

      if (Array.isArray(result)) {
        return new ArrayReply(dataType, result);
      }

      if (result.meta && typeof result.data !== 'undefined') {
        const { meta, data } = result;

        if (Array.isArray(data)) {
          return new ArrayReply(dataType, data, meta);
        }

        return new Reply(dataType, data, meta);
      }

      return new Reply(dataType, result);
    };

    GrpcMethod(serviceName, methodName)(target, key, descriptor);
  };
}
