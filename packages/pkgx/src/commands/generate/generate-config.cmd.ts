import { resolve } from 'node:path';

import { cd } from 'zx';

import { ConfigGenerator } from '../../generators/config/generator.js';

export async function generateConfigCommand(pkgRelativePath: string) {
  const pkgPath = resolve(process.cwd(), pkgRelativePath);

  cd(pkgPath);

  const generator = new ConfigGenerator();

  await generator.generate();
}
