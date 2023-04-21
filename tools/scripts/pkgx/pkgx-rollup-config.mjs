import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

import { getPkgJson } from './utils/get-pkg-json.util.mjs';

function getNodeResolveOptions(pkgxOptions) {
  const options = {
    exportConditions: ['node'],
    preferBuiltins: true,
  };

  if (pkgxOptions.resolve) {
    options.resolveOnly = pkgxOptions.resolve(pkgxOptions.external);
  }

  return options;
}

function getExternal() {
  const pkgJson = getPkgJson(`${process.cwd()}/package.json`);

  const dependencies = Object.keys(pkgJson.dependencies || {});
  const peerDependencies = Object.keys(pkgJson.peerDependencies || {});

  const external = dependencies.concat(peerDependencies);

  external.push(/^node:.+$/);

  return external;
}

function getCjsOutput(pkgxOptions) {
  const output = {
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
      nodeResolve(getNodeResolveOptions(pkgxOptions)),
      commonjs(),
      json(),
    ],
  };

  if (!pkgxOptions.resolve) {
    output.external = pkgxOptions.external;
  }

  return output;
}

function getEsmOutput(pkgxOptions) {
  const { esmOutputDir } = pkgxOptions;

  const output = {
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
        declaration: true,
        declarationDir: esmOutputDir + '/.dts',
      }),
    ],
    external: pkgxOptions.external,
  };

  return output;
}

function getDtsOutput(pkgxOptions) {
  const { esmOutputDir, pkgName } = pkgxOptions;

  const output = {
    input: `${esmOutputDir}/.dts/packages/${pkgName}/src/index.d.ts`,
    output: [
      {
        file: 'output/index.d.ts',
        format: 'esm',
      },
    ],
    plugins: [dts()],
    external: pkgxOptions.external,
  };

  return output;
}

export default function pkgxRollupConfig(opts = {}) {
  const options = {
    resolve: null,
    browser: false,
    external: getExternal(),
    esmOutputDir: opts.browser ? 'output' : 'output/esm',
    pkgName: process.cwd().split('/').at(-1),
    ...opts,
  };

  const cjsOutput = getCjsOutput(options);

  const esmOutput = getEsmOutput(options);

  const dtsOutput = getDtsOutput(options);

  const outputs = [esmOutput, dtsOutput];

  if (!options.browser) {
    outputs.unshift(cjsOutput);
  }

  return outputs;
}
