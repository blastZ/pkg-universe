import { resolve } from 'node:path';

import { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

import { getFileNameByExtensions } from './get-file-name-by-extensions.util.js';

const DEFAULT_CONFIG_BASE = 'pkgx.config';

export async function getPkgxOptions(): Promise<PkgxOptions> {
  const fileName = await getFileNameByExtensions('.', DEFAULT_CONFIG_BASE);

  if (!fileName) {
    return {};
  }

  const config = (await import(resolve('.', fileName))).default;

  return config;
}
