import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { RollupOptions } from 'rollup';
import copy from 'rollup-plugin-copy';

import { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

import { getNodeResolveOptions } from './get-node-resolve-options.js';

export function getEsmOutput(options: Required<PkgxOptions>) {
  const outputDir = `${options.outputDirName}/esm`;

  const output: RollupOptions = {
    input: `src/${options.inputFileName}`,
    output: [
      {
        dir: outputDir,
        format: 'esm',
        sourcemap: options.sourceMap,
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
        exclude: options.exclude,
        sourceMap: options.sourceMap,
      }),
      nodeResolve(getNodeResolveOptions()),
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
