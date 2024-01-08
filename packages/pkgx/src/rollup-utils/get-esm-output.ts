import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { RollupOptions } from 'rollup';
import copy from 'rollup-plugin-copy';

import { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

import { getNodeResolveOptions } from './get-node-resolve-options.js';
import { getTypescriptOptions } from './get-typescript-options.js';

export function getEsmOutput(options: Required<PkgxOptions>) {
  const outputDir = `${options.outputDirName}/esm`;

  const output: RollupOptions = {
    input: `${options.inputDir}/${options.esmInputFileName}`,
    output: [
      {
        file: `${outputDir}/index.js`,
        format: 'esm',
        sourcemap: options.sourceMap,
      },
    ],
    plugins: [
      (typescript as unknown as typeof typescript.default)(
        getTypescriptOptions('esm', options),
      ),
      nodeResolve(getNodeResolveOptions()),
      (commonjs as unknown as typeof commonjs.default)(),
      (json as unknown as typeof json.default)(),
      (copy as unknown as typeof copy.default)({
        targets: options.assets?.map((o) => ({
          src: o,
          dest: outputDir,
        })),
      }),
    ],
    external: options.external,
    cache: options.cache,
  };

  return output;
}
