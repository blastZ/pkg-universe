import { $, cd } from 'zx';

import { PkgxCmdOptions } from '../interfaces/pkgx-cmd-options.interface.js';

import { build } from './build/build-package.cmd.js';

async function publish(pkgRelativePath: string, cmdOptions: PkgxCmdOptions) {
  const { pkgxOptions } = await build(pkgRelativePath, cmdOptions, {
    cmdName: 'publish',
  });

  cd(pkgxOptions.outputDirName);

  await $`npm publish --access public --registry=https://registry.npmjs.org`;
}

export async function publishCommand(
  pkgRelativePath: string,
  cmdOptions: PkgxCmdOptions,
) {
  await publish(pkgRelativePath, cmdOptions);
}
