import { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

import { getEsmOutput } from './get-esm-output.js';
import { getExternal } from './get-external.js';

export function getRollupOptions(options: PkgxOptions = {}) {
  // const cjsOutput = getCjsOutput(options);

  if (!options.external) {
    options.external = getExternal('.');
  }

  const esmOutput = getEsmOutput(options);

  // const dtsOutput = getDtsOutput(options);

  const outputs = [esmOutput];

  return outputs;
}
