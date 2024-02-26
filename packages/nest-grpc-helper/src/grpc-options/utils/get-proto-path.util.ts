import path, { resolve } from 'node:path';
import url from 'node:url';

interface Options {
  dependentProtos?: string[];
  healthCheck?: boolean;
  mainProtoDir?: string;
}

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export function getHealthProtoPath() {
  return path.resolve(__dirname, '../protos/health.proto');
}

export function getProtoPath(packageName: string, options: Options = {}) {
  const packageProto = path.resolve(
    typeof options.mainProtoDir === 'string'
      ? resolve(options.mainProtoDir, './main.proto')
      : resolve(process.cwd(), `./protos/main.proto`),
  );

  const libProtos = [path.resolve(__dirname, '../protos/common.proto')];

  if (options.healthCheck) {
    libProtos.push(getHealthProtoPath());
  }

  let protoPath: string[] = libProtos;

  if (options.dependentProtos) {
    protoPath = protoPath.concat(options.dependentProtos);
  }

  protoPath.push(packageProto);

  return protoPath;
}
