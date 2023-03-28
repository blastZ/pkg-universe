import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default function pkgxRollupConfig(opts) {
  const options = {
    external: [],
    esmExternal: [],
    ...opts,
  };

  return [
    {
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
    },
    {
      input: 'src/index.ts',
      output: [
        {
          dir: 'output/esm',
          format: 'esm',
        },
      ],
      plugins: [
        typescript({
          outDir: 'output/esm',
          declaration: false,
        }),
      ],
      external: options.external.concat(options.esmExternal),
    },
    {
      input: 'src/index.ts',
      output: [
        {
          file: 'output/index.d.ts',
          format: 'esm',
        },
      ],
      plugins: [dts()],
      external: options.external,
    },
  ];
}
