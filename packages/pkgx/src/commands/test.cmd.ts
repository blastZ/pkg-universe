import { $ } from 'zx';

import { PkgxCmdOptions } from '../interfaces/pkgx-cmd-options.interface.js';

import { build } from './build.cmd.js';

async function test(pkgRelativePath: string, cmdOptions: PkgxCmdOptions) {
  const { pkgxOptions } = await build(pkgRelativePath, cmdOptions, {
    cmdName: 'test',
  });

  $`node --enable-source-maps ${pkgxOptions.outputDirName}/esm/index.js`;
}

export async function testCommand(
  pkgRelativePath: string,
  cmdOptions: PkgxCmdOptions,
) {
  await test(pkgRelativePath, cmdOptions);
}
