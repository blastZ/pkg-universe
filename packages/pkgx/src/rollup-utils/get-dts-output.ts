import { type RollupOptions } from 'rollup';
import dts from 'rollup-plugin-dts';

import { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

export function getDtsOutput(options: Required<PkgxOptions>) {
  const inputFileName = options.esmInputFileName.slice(0, -3) + '.d.ts';
  const outputDir = `${options.outputDirName}`;

  const dtsInput = `${outputDir}/esm/.dts/src/${inputFileName}`;

  const output: RollupOptions = {
    input: dtsInput,
    output: [
      {
        file: `${outputDir}/index.d.ts`,
        format: 'esm',
        sourcemap: options.sourceMap,
      },
    ],
    plugins: [dts()],
    external: options.external,
  };

  return output;
}
