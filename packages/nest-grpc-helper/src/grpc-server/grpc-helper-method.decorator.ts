import { Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { ArrayReply } from '../grpc-common/array-reply.js';
import { Reply } from '../grpc-common/reply.js';

import { GRPC_SERVER_OPTIONS } from './grpc-server-options.constant.js';

interface Options {
  service?: string;
  method?: string;
  data?: string;
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

    const defaultDataName =
      originName.slice(0, 1).toUpperCase() + originName.slice(1) + 'ReplyData';

    // console.log({
    //   serviceName,
    //   methodName,
    //   defaultDataName,
    // });

    const origin = descriptor.value;

    descriptor.value = async function (this: any, ...args: any[]) {
      const result = await origin.call(this, ...args);
      const grpcServerOptions = this['grpcServerOptions'];

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
