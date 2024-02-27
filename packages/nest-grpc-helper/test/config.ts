import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const config = {
  url: '0.0.0.0:3200',
  packageName: 'accountManager',
  mainProtoDir: resolve(__dirname, './protos'),
  customCommonProtoPath: resolve(__dirname, '../protos/common.proto'),
};
