import path, { resolve } from 'node:path';
import url from 'node:url';

import { GetGrpcOptsOptions } from '../../grpc-options/index.js';

type Options = Pick<
  GetGrpcOptsOptions,
  | 'dependentProtos'
  | 'healthCheck'
  | 'mainProtoDir'
  | 'customHealthProtoPath'
  | 'customCommonProtoPath'
>;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export function getHealthProtoPath(options: Options = {}) {
  if (options.customHealthProtoPath) {
    return options.customHealthProtoPath;
  }

  return path.resolve(__dirname, '../protos/health.proto');
}

export function getCommonProtoPath(options: Options = {}) {
  if (options.customCommonProtoPath) {
    return options.customCommonProtoPath;
  }

  return path.resolve(__dirname, '../protos/common.proto');
}

export function getMainProtoPath(options: Options = {}) {
  if (typeof options.mainProtoDir === 'string') {
    return resolve(options.mainProtoDir, './main.proto');
  }

  return resolve(process.cwd(), `./protos/main.proto`);
}

export function getProtoPath(packageName: string, options: Options = {}) {
  const protoPath: string[] = [];

  protoPath.push(getCommonProtoPath(options));

  if (options.healthCheck) {
    protoPath.push(getHealthProtoPath(options));
  }

  if (options.dependentProtos) {
    protoPath.push(...options.dependentProtos);
  }

  protoPath.push(getMainProtoPath(options));

  return protoPath;
}
