import { type RollupTypescriptOptions as RollupTypeScriptOptions } from '@rollup/plugin-typescript';

import { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

export function getTypescriptOptions(
  type: 'esm' | 'cjs',
  options: Required<PkgxOptions>,
) {
  const outputDir = `${options.outputDirName}/${type}`;

  const tsOptions: RollupTypeScriptOptions = {
    outDir: outputDir,
    compilerOptions: {
      module: 'NodeNext',
    },
    exclude: options.exclude,
    sourceMap: options.sourceMap,
    incremental: options.incremental,
  };

  if (type === 'esm') {
    tsOptions.declaration = true;
    tsOptions.declarationDir = outputDir + '/.dts';
  } else {
    tsOptions.declaration = false;
  }

  return tsOptions;
}
