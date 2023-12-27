import { basename, resolve } from 'node:path';

import { OutputOptions } from 'rollup';

import { getRollupConfigPath } from './get-rollup-config-path.util.js';

export async function getStartFilePath(pkgPath: string) {
  const rollupConfigPath = getRollupConfigPath();

  const rollupOptionsList: {
    input: string;
    output: OutputOptions[];
  }[] = (await import(resolve(pkgPath, rollupConfigPath))).default;

  const esmOptions = rollupOptionsList.find(
    (o) => o.output[0].format === 'esm',
  )!;

  const dirName = esmOptions.output[0].dir!;
  const startFileName = basename(esmOptions.input, '.ts');

  return `${pkgPath}/${dirName}/${startFileName}.js`;
}
