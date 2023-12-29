import { type RollupOptions } from 'rollup';

import { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

import { getDtsOutput } from './get-dts-output.js';
import { getEsmOutput } from './get-esm-output.js';

export function getRollupOptions(options: Required<PkgxOptions>) {
  // const cjsOutput = getCjsOutput(options);

  const esmOutput = getEsmOutput(options);

  const dtsOutput = getDtsOutput(options);

  const outputs: RollupOptions[] = [esmOutput, dtsOutput];

  return outputs;
}
