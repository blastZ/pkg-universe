import typescript from '@rollup/plugin-typescript';
import { RollupOptions } from 'rollup';
import copy from 'rollup-plugin-copy';

import { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

export function getEsmOutput(options: PkgxOptions) {
  const outputDir = options.esmOutputDir || 'output/esm';

  const output: RollupOptions = {
    input: options.input || 'src/index.ts',
    output: [
      {
        dir: outputDir,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      (typescript as unknown as typeof typescript.default)({
        outDir: outputDir,
        declaration: true,
        declarationDir: outputDir + '/.dts',
        compilerOptions: {
          module: 'NodeNext',
        },
        exclude: [
          'node_modules',
          'test',
          'dist',
          '**/*.spec.ts',
          '**/*.test.ts',
        ].concat(options.exclude || []),
      }),
      (copy as unknown as typeof copy.default)({
        targets: options.assets?.map((o) => ({
          src: o,
          dest: outputDir,
        })),
      }),
    ],
    external: options.external,
  };

  return output;
}
