import { $, cd } from 'zx';

import { logger } from '../utils/loggin.util.js';

import { build } from './build.cmd.js';

async function publish(pkgRelativePath: string) {
  await build(pkgRelativePath, {
    pack: false,
  });

  cd('./output');

  await $`npm publish --access public --registry=https://registry.npmjs.org`;
}

export async function publishCommand(pkgRelativePath: string) {
  logger.logCliVersion();

  await publish(pkgRelativePath);
}
