import path from 'node:path';
import url from 'node:url';

interface Options {
  dependentProtos?: string[];
  healthCheck?: boolean;
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

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  const libProtos = [path.resolve(__dirname, '../protos/common.proto')];

  if (options.healthCheck) {
    libProtos.push(path.resolve(__dirname, '../protos/health.proto'));
  }

  let protoPath: string[] = libProtos;

  if (options.dependentProtos) {
    protoPath = protoPath.concat(options.dependentProtos);
  }

  protoPath.push(packageProto);

  return protoPath;
}
