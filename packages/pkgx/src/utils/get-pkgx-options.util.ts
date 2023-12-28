import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

const DEFAULT_CONFIG_BASE = 'pkgx.config';

export async function getPkgxOptions(): Promise<PkgxOptions> {
  const fileName = `${DEFAULT_CONFIG_BASE}.mjs`;

  const filesInDirectory = new Set(await readdir('.'));

  if (!filesInDirectory.has(fileName)) {
    return {};
  }

  const config = (await import(resolve('.', fileName))).default;

  return config;
}
