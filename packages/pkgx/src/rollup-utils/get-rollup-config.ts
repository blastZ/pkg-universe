import { CustomRollupOptions } from '../interfaces/custom-rollup-options.interface.js';

import { getEsmOutput } from './get-esm-output.js';
import { getExternal } from './get-external.js';

export function getRollupConfig(options: CustomRollupOptions = {}) {
  const pkgPath = process.cwd();

  // const cjsOutput = getCjsOutput(options);

  if (!options.external) {
    options.external = getExternal(pkgPath);
  }

  const esmOutput = getEsmOutput(pkgPath, options);

  // const dtsOutput = getDtsOutput(options);

  const outputs = [esmOutput];

  return outputs;
}
