import { basename } from 'node:path';

import { type RollupOptions } from 'rollup';
import dts from 'rollup-plugin-dts';

import { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

export function getDtsOutput(options: PkgxOptions) {
  const outputDir = options.esmOutputDir || 'output/esm';
  const inputFile = (options.input || 'src/index.ts').slice(0, -3) + '.d.ts';

  const pkgName = basename(process.cwd());

  const dtsInput = `${outputDir}/.dts/packages/${pkgName}/${inputFile}`;

  const output: RollupOptions = {
    input: dtsInput,
    output: [
      {
        file: 'output/index.d.ts',
        format: 'esm',
        sourcemap: options.sourceMap,
      },
    ],
    plugins: [dts()],
    external: options.external,
  };

  return output;
}
