import { type RollupOptions } from 'rollup';

import { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

import { fillOptionsWithDefaultValue } from './fill-options-with-default-value.js';
import { getDtsOutput } from './get-dts-output.js';
import { getEsmOutput } from './get-esm-output.js';

export function getRollupOptions(options: PkgxOptions = {}) {
  // const cjsOutput = getCjsOutput(options);

  const filledOptions = fillOptionsWithDefaultValue(options);

  const esmOutput = getEsmOutput(filledOptions);

  const dtsOutput = getDtsOutput(filledOptions);

  const outputs: RollupOptions[] = [esmOutput, dtsOutput];

  return outputs;
}
