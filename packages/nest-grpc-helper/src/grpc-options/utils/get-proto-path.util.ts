import path from 'path';

export function getProtoPath(packageName: string) {
  return [
    path.resolve(
      process.cwd(),
      `./protos/${packageName.replace(
        /[A-Z]/g,
        (letter) => `-${letter.toLowerCase()}`
      )}/main.proto`
    ),
  ];
}
