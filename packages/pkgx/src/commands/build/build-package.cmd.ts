import { $ } from 'zx';

import {
  CmdBuildPackageOptions,
  InternalOptions,
  PkgxCmdOptions,
} from '@/pkgx/interfaces';
import { rollupBuild } from '@/pkgx/rollup-utils';
import {
  addCjsPackageJsonFile,
  addPackageJsonFile,
  changeWorkingDirectory,
  getPkgxOptions,
} from '@/pkgx/utils';

export async function build(
  pkgRelativePath: string,
  cmdOptions: CmdBuildPackageOptions & PkgxCmdOptions,
  internalOptions: InternalOptions,
) {
  await changeWorkingDirectory(pkgRelativePath);

  const pkgxOptions = await getPkgxOptions(cmdOptions, internalOptions);

  const outputDirName = pkgxOptions.outputDirName;

  await $`rm -rf ${outputDirName}`.quiet();

  await rollupBuild(pkgxOptions);

  await $`rm -rf ${outputDirName}/esm/.dts`.quiet();

  await addPackageJsonFile(pkgxOptions);
  await addCjsPackageJsonFile(pkgxOptions);

  if (cmdOptions.pack) {
    await $`cd ${outputDirName} && npm pack`.quiet();
  }

  return {
    pkgxOptions,
  };
}

export async function buildPackageCommand(
  pkgRelativePath: string,
  cmdOptions: CmdBuildPackageOptions & PkgxCmdOptions,
) {
  await build(pkgRelativePath, cmdOptions, { cmdName: 'build', cmdOptions });
}
