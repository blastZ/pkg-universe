#!/usr/bin/env node

import { program } from 'commander';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { $, cd } from 'zx';

const __dirname = dirname(fileURLToPath(import.meta.url));

program
  .command('build')
  .description('build package')
  .argument('<pkg>', 'package name to build')
  .action(async (pkg, options) => {
    const pkgPath = resolve(process.cwd(), `./packages/${pkg}`);

    cd(pkgPath);

    const pkgJson = JSON.parse(readFileSync('./package.json').toString());

    await $`rm -rf ./output`.quiet();
    await $`rollup --config ./rollup.config.js`;
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
        2
      );

      await $`printf ${cjsPkgJson} > ./output/cjs/package.json`.quiet();
    }
  });

program.parse();
