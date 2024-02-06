#!/usr/bin/env node

import { program } from 'commander';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { $, cd } from 'zx';

import { getPkgJson } from './utils/get-pkg-json.util.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function build(pkg, options) {
  const pkgPath = resolve(process.cwd(), `./packages/${pkg}`);

  cd(pkgPath);

  const pkgJson = getPkgJson(`${pkgPath}/package.json`);

  await $`rm -rf ./output`.quiet();
  await $`rollup --config ./rollup.config.js`;

  await $`rm -rf ./output/esm/.dts`.quiet();
  await $`rm -rf ./output/.dts`.quiet();

  await $`cp ./package.json README.md ./output`.quiet();

  if (existsSync('./protos')) {
    await $`cp -r ./protos ./output`.quiet();
  }

  if (existsSync('./output/cjs')) {
    const cjsPkgJson = JSON.stringify(
      {
        name: `${pkgJson.name}-cjs`,
        type: 'commonjs',
      },
      null,
      2,
    );

    await $`printf ${cjsPkgJson} > ./output/cjs/package.json`.quiet();
  }
}

program
  .command('build')
  .description('build package')
  .argument('<pkg>', 'package name to build')
  .action(async (pkg, options) => {
    await build(pkg, options);
  });

program.parse();
