import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { RollupOptions } from 'rollup';

import { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

import { getNodeResolveOptions } from './get-node-resolve-options.js';

export function getCjsOutput(options: Required<PkgxOptions>) {
  const outputDir = `${options.outputDirName}/cjs`;

  const output: RollupOptions = {
    input: `src/${options.inputFileName}`,
    output: [
      {
        dir: outputDir,
        format: 'cjs',
      },
    ],
    plugins: [
      (typescript as unknown as typeof typescript.default)({
        outDir: outputDir,
        declaration: false,
        compilerOptions: {
          module: 'NodeNext',
        },
      }),
      nodeResolve(getNodeResolveOptions()),
      (commonjs as unknown as typeof commonjs.default)(),
      (json as unknown as typeof json.default)(),
    ],
    external: options.external,
  };

  return output;
}
