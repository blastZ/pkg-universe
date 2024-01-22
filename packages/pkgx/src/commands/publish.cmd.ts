import { $, cd } from 'zx';

import { PkgxCmdOptions } from '../interfaces/pkgx-cmd-options.interface.js';
import { logger } from '../utils/loggin.util.js';

import { build } from './build.cmd.js';

async function publish(pkgRelativePath: string, cmdOptions: PkgxCmdOptions) {
  await build(pkgRelativePath, cmdOptions, {
    cmdName: 'publish',
  });

  cd('./output');

  await $`npm publish --access public --registry=https://registry.npmjs.org`;
}

export async function publishCommand(
  pkgRelativePath: string,
  cmdOptions: PkgxCmdOptions,
) {
  logger.logCliVersion();

  await publish(pkgRelativePath, cmdOptions);
}
