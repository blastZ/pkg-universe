import { resolve } from 'node:path';

import { $, cd } from 'zx';

import { fillOptionsWithDefaultValue } from '../rollup-utils/fill-options-with-default-value.js';
import { getPkgxOptions } from '../utils/get-pkgx-options.util.js';
import { logger } from '../utils/loggin.util.js';

async function build(pkgRelativePath: string) {
  logger.cliVersion();

  const pkgPath = resolve(process.cwd(), pkgRelativePath);

  cd(pkgPath);

  const pkgxOptions = await getPkgxOptions();

  const filledPkgxOptions = fillOptionsWithDefaultValue(pkgxOptions);

  const outputDirName = filledPkgxOptions.outputDirName;

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
