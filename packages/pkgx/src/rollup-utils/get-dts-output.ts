import { relative, resolve } from 'node:path';

import { type RollupOptions } from 'rollup';
import dts from 'rollup-plugin-dts';

import { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

export function getDtsOutput(options: Required<PkgxOptions>) {
  const inputFileName = options.esmInputFileName.slice(0, -3) + '.d.ts';
  const outputDir = `${options.outputDirName}`;
  const targetDir = relative(resolve('.', '../../'), resolve('.'));

  const dtsInput = `${outputDir}/esm/.dts/${targetDir}/src/${inputFileName}`;

  const output: RollupOptions = {
    input: dtsInput,
    output: [
      {
        file: `${outputDir}/index.d.ts`,
        format: 'esm',
      },
    ],
    plugins: [dts()],
    external: options.external,
  };

  return output;
}
