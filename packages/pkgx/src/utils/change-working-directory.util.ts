import { resolve } from 'node:path';

import { program } from 'commander';
import { cd } from 'zx';

import { isPathAvailable } from './is-path-available.util.js';

export async function changeWorkingDirectory(relativePath: string) {
  const targetPath = resolve(process.cwd(), relativePath);

  if (!(await isPathAvailable(targetPath))) {
    throw program.error(`path "${targetPath}" is not available`);
  }

  cd(targetPath);
}
