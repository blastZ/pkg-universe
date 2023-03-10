import path from 'path';

export function getProtoPath(packageName: string) {
  const domainList = packageName.split('.');

  const folderList = domainList.map((domain) => {
    return domain.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  });

  return path.resolve(
    process.cwd(),
    `./protos/${folderList.join('/')}/main.proto`
  );
}
