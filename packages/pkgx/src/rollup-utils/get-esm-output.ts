import commonjs from '@rollup/plugin-commonjs';
import esmShim from '@rollup/plugin-esm-shim';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { type InputPluginOption, type RollupOptions } from 'rollup';
import copy from 'rollup-plugin-copy';

import { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

import { getNodeResolveOptions } from './get-node-resolve-options.js';
import { getTypescriptOptions } from './get-typescript-options.js';

export function getEsmOutput(options: Required<PkgxOptions>) {
  const outputDir = `${options.outputDirName}/esm`;

  const plugins: InputPluginOption = [];

  plugins.push(
    (typescript as unknown as typeof typescript.default)(
      getTypescriptOptions('esm', options),
    ),
  );

  plugins.push(nodeResolve(getNodeResolveOptions()));

  if (options.esmShim) {
    plugins.push((esmShim as unknown as typeof esmShim.default)());
  }

  plugins.push((commonjs as unknown as typeof commonjs.default)());

  plugins.push((json as unknown as typeof json.default)());

  if (options.assets) {
    plugins.push(
      (copy as unknown as typeof copy.default)({
        targets: options.assets.map((o) => ({
          src: o,
          dest: outputDir,
        })),
      }),
    );
  }

  const output: RollupOptions = {
    input: `${options.inputDir}/${options.esmInputFileName}`,
    output: [
      {
        file: `${outputDir}/index.js`,
        format: 'esm',
        sourcemap: options.sourceMap,
      },
    ],
    plugins,
    external: options.external,
    cache: options.cache,
  };

  return output;
}
