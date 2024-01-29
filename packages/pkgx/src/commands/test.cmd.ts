import { $ } from 'zx';

import { PkgxCmdOptions } from '@/pkgx/interfaces';
import { rollupBuild } from '@/pkgx/rollup-utils';
import { changeWorkingDirectory, getPkgxOptions } from '@/pkgx/utils';

async function test(pkgRelativePath: string, cmdOptions: PkgxCmdOptions) {
  await changeWorkingDirectory(pkgRelativePath);

  const pkgxOptions = await getPkgxOptions(cmdOptions, { isTest: true });

  const outputDirName = pkgxOptions.outputDirName;

  await $`rm -rf ${outputDirName}`.quiet();

  await rollupBuild(pkgxOptions);

  await $`rm -rf ${outputDirName}/esm/.dts`.quiet();

  $`node --enable-source-maps ${pkgxOptions.outputDirName}/esm/index.js`;
}

export async function testCommand(
  pkgRelativePath: string,
  cmdOptions: PkgxCmdOptions,
) {
  await test(pkgRelativePath, cmdOptions);
}
