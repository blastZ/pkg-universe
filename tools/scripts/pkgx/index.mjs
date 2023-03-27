#!/usr/bin/env node

import { program } from 'commander';
import { existsSync } from 'node:fs';
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

    console.log(pkgPath);

    cd(pkgPath);
    await $`rm -rf ./output`.quiet();
    await $`rollup --config ./rollup.config.js`;
    await $`cp ./package.json README.md ./output`.quiet();

    if (existsSync(resolve(pkgPath, './protos'))) {
      await $`cp -r ./protos ./output`.quiet();
    }

    await $`printf \"{\n  \\\"type\\\": \\\"commonjs\\\"\n}\n\" > ./output/cjs/package.json`.quiet();
  });

program.parse();
