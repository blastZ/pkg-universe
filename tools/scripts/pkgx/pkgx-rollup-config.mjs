import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default function pkgxRollupConfig(opts) {
  const options = {
    external: [],
    esmExternal: [],
    browser: false,
    ...opts,
  };

  const cjsOutput = {
    input: 'src/index.ts',
    output: [
      {
        dir: 'output/cjs',
        format: 'cjs',
      },
    ],
    plugins: [
      typescript({
        outDir: 'output/cjs',
        declaration: false,
      }),
      nodeResolve({
        modulesOnly: true,
        exportConditions: ['node'],
      }),
      commonjs(),
    ],
    external: options.external,
  };

  const esmOutputDir = options.browser ? 'output' : 'output/esm';

  const esmOutput = {
    input: 'src/index.ts',
    output: [
      {
        dir: esmOutputDir,
        format: 'esm',
      },
    ],
    plugins: [
      typescript({
        outDir: esmOutputDir,
        declaration: false,
      }),
    ],
    external: options.external.concat(options.esmExternal),
  };

  const typeOutput = {
    input: 'src/index.ts',
    output: [
      {
        file: 'output/index.d.ts',
        format: 'esm',
      },
    ],
    plugins: [dts()],
    external: options.external,
  };

  const outputs = [esmOutput, typeOutput];

  if (!options.browser) {
    outputs.unshift(cjsOutput);
  }

  return outputs;
}
