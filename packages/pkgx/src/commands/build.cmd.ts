import { resolve } from 'node:path';

import chalk from 'chalk';
import { $, cd } from 'zx';

import { getCliVersion } from '../utils/get-cli-version.util.js';
import { getRollupConfigPath } from '../utils/get-rollup-config-path.util.js';

async function build(pkgRootPath: string) {
  console.log(chalk.underline(`pkgx v${getCliVersion()}`));

  const pkgPath = resolve(process.cwd(), pkgRootPath);

  cd(pkgPath);

  await $`rm -rf ./dist`.quiet();

  await $`rollup --config ${getRollupConfigPath()}`;
}

export async function buildCommand(pkg: string) {
  await build(pkg);
}
