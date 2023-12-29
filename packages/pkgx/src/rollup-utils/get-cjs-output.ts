import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import {
  nodeResolve,
  type RollupNodeResolveOptions,
} from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { RollupOptions } from 'rollup';

import { PkgxOptions } from '../index.js';

function getNodeResolveOptions(options: Required<PkgxOptions>) {
  const resolveOptions: RollupNodeResolveOptions = {
    exportConditions: ['node'],
    preferBuiltins: true,
  };

  if (options.cjsResolve) {
    resolveOptions.resolveOnly = options.cjsResolve(
      options.external as string[],
    );
  }

  return resolveOptions;
}

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
      nodeResolve(getNodeResolveOptions(options)),
      (commonjs as unknown as typeof commonjs.default)(),
      (json as unknown as typeof json.default)(),
    ],
  };

  output.external = options.cjsResolve ? [] : options.external;

  return output;
}
