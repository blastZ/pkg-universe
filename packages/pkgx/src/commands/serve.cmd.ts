import { resolve } from 'node:path';

import chalk from 'chalk';
import { $, cd } from 'zx';

import { getCliVersion } from '../utils/get-cli-version.util.js';
import { getRollupConfigPath } from '../utils/get-rollup-config-path.util.js';
import { getStartFilePath } from '../utils/get-start-file-path.util.js';

async function serve(pkgRootPath: string) {
  console.log(chalk.underline(`pkgx v${getCliVersion()}`));

  const pkgPath = resolve(process.cwd(), pkgRootPath);

  cd(pkgPath);

  await $`rm -rf ./dist`.quiet();

  const rollupConfigPath = getRollupConfigPath();
  const startFilePath = await getStartFilePath(pkgPath);

  await $`rollup --config ${rollupConfigPath}`;

  await $`concurrently "rollup --config ${rollupConfigPath} -w" "nodemon ${startFilePath}"`;
}

export async function serveCommand(pkg: string) {
  await serve(pkg);
}
