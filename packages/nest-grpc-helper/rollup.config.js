import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

const external = [
  '@grpc/grpc-js',
  '@grpc/proto-loader',
  '@nestjs/common',
  '@nestjs/core',
  '@nestjs/microservices',
  '@types/express',
  'express',
  'reflect-metadata',
  'rxjs',
  'node:async_hooks',
  'node:path',
  'node:url',
];

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'output/cjs',
        format: 'cjs',
      },
    ],
    plugins: [
      nodeResolve({
        modulesOnly: true,
        exportConditions: ['node'],
      }),
      typescript({
        outDir: 'output/cjs',
        declaration: false,
      }),
      commonjs(),
    ],
    external,
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
    external: external,
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
    external: external,
  },
];
