import { type RollupOptions } from 'rollup';

import { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

import { getCjsOutput } from './get-cjs-output.js';
import { getDtsOutput } from './get-dts-output.js';
import { getEsmOutput } from './get-esm-output.js';

export function getRollupOptions(options: Required<PkgxOptions>) {
  const outputs: RollupOptions[] = [];

  if (!options.disableEsmOutput) {
    const esmOutput = getEsmOutput(options);

    outputs.push(esmOutput);
  }

  if (!options.disableCjsOutput) {
    const cjsOutput = getCjsOutput(options);

    outputs.push(cjsOutput);
  }

  if (!options.disableDtsOutput) {
    const dtsOutput = getDtsOutput(options);

    outputs.push(dtsOutput);
  }

  return outputs;
}
