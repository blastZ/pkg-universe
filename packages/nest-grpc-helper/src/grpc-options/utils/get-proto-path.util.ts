import path from 'node:path';
import url from 'node:url';

interface Options {
  dependentProtos?: string[];
  healthCheck?: boolean;
}

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export function getHealthProtoPath() {
  return path.resolve(__dirname, '../protos/health.proto');
}

export function getProtoPath(packageName: string, options: Options = {}) {
  const domainList = packageName.split('.');

  const folderList = domainList.map((domain) => {
    return domain.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  });

  const packageProto = path.resolve(
    process.cwd(),
    `./protos/${folderList.join('/')}/main.proto`,
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
