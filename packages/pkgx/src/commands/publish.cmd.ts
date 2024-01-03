import { $, cd } from 'zx';

import { build } from './build.cmd.js';

async function publish(pkgRelativePath: string) {
  await build(pkgRelativePath, {
    pack: false,
  });

  cd('./output');

  await $`npm publish --access public --registry=https://registry.npmjs.org`;
}

export async function publishCommand(pkgRelativePath: string) {
  await publish(pkgRelativePath);
}
