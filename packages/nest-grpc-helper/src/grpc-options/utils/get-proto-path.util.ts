import path from 'node:path';
import url from 'node:url';

export function getProtoPath(packageName: string, dependentProtos?: string[]) {
  const domainList = packageName.split('.');

  const folderList = domainList.map((domain) => {
    return domain.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  });

  const packageProto = path.resolve(
    process.cwd(),
    `./protos/${folderList.join('/')}/main.proto`
  );

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  const libProtos = [path.resolve(__dirname, '../protos/common.proto')];

  let protoPath: string[] = libProtos;

  if (dependentProtos) {
    protoPath = protoPath.concat(dependentProtos);
  }

  protoPath.push(packageProto);

  return protoPath;
}
