import { basename, resolve } from 'node:path';

import { type OutputOptions } from 'rollup';

export function getStartFilePath(
  rollupOptionsList: { input: string; output: OutputOptions[] }[],
) {
  const esmOptions = rollupOptionsList.find(
    (o) => o.output[0].format === 'esm',
  )!;

  const dirName = esmOptions.output[0].dir!;
  const startFileName = basename(esmOptions.input, '.ts');

  return resolve('.', dirName, `${startFileName}.js`);
}
