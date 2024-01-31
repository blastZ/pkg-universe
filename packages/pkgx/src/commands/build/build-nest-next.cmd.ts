import { resolve } from 'node:path';

import { $ } from 'zx';

import { changeWorkingDirectory, getPkgxOptions } from '@/pkgx/utils';

async function build(pkgRelativePath: string) {
  await changeWorkingDirectory(pkgRelativePath);

  const pkgxOptions = await getPkgxOptions();

  const nextDirPath = resolve(pkgxOptions.inputDir, 'next');
  const dotNextDirPath = resolve(nextDirPath, '.next');

  const outputNextDirPath = resolve(pkgxOptions.outputDirName, 'next');
  const outputDotNextDirPath = resolve(outputNextDirPath, '.next');

  await $`rm -rf ${dotNextDirPath}`.quiet();

  await $`pnpm next build ${nextDirPath}`;

  await $`rm -rf ${outputNextDirPath}`.quiet();

  await $`mkdir -p ${outputNextDirPath}`.quiet();

  await $`mv ${dotNextDirPath} ${outputNextDirPath}`.quiet();

  await $`rm -rf ${outputDotNextDirPath}/cache`.quiet();
}

export async function buildNestNextCommand(pkgRelativePath: string) {
  await build(pkgRelativePath);
}
