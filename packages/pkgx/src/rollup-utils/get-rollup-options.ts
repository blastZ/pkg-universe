import { type RollupOptions } from 'rollup';

import { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

import { getCjsOutput } from './get-cjs-output.js';
import { getDtsOutput } from './get-dts-output.js';
import { getEsmOutput } from './get-esm-output.js';

export function getRollupOptions(options: Required<PkgxOptions>) {
  const esmOutput = getEsmOutput(options);

  const cjsOutput = getCjsOutput(options);

  const dtsOutput = getDtsOutput(options);

  const outputs: RollupOptions[] = [esmOutput, cjsOutput, dtsOutput];

  return outputs;
}
