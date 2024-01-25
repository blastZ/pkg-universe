import { resolve } from 'node:path';

import { $, cd } from 'zx';

import { getPkgxOptions } from '../utils/pkgx-options/get-pkgx-options.util.js';

async function build(pkgRelativePath: string) {
  const pkgPath = resolve(process.cwd(), pkgRelativePath);

  cd(pkgPath);

  const pkgxOptions = await getPkgxOptions({}, { cmdName: 'build-nest-next' });

  const outputDirName = pkgxOptions.outputDirName;

  await $`rm -rf src/next/.next`.quiet();

  await $`pnpm next build src/next`;

  await $`rm -rf ${outputDirName}/next`.quiet();

  await $`mkdir -p ${outputDirName}/next`.quiet();

  await $`mv src/next/.next ${outputDirName}/next`.quiet();

  await $`rm -rf ${outputDirName}/next/.next/cache`.quiet();
}

export async function buildNestNextCommand(pkgRelativePath: string) {
  await build(pkgRelativePath);
}
