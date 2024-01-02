import { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

import { getExternal } from './get-external.js';

export function fillOptionsWithDefaultValue(options: PkgxOptions) {
  let external = options.external || getExternal();
  const excludeFromExternal = options.excludeFromExternal || [];

  external = external.filter((o) => !excludeFromExternal.includes(o));

  const inputFileName = options.inputFileName || 'index.ts';

  const filledOptions: Required<PkgxOptions> = {
    inputFileName,
    cjsInputFileName: options.cjsInputFileName || inputFileName,
    esmInputFileName: options.esmInputFileName || inputFileName,
    outputDirName: options.outputDirName || 'output',
    external,
    assets: options.assets || [],
    exclude: [
      'node_modules',
      'test',
      'dist',
      '**/*.spec.ts',
      '**/*.test.ts',
      'output',
    ].concat(options.exclude || []),
    sourceMap:
      typeof options.sourceMap === 'boolean' ? options.sourceMap : false,
    excludeFromExternal,
    disableEsmOutput: false,
    disableCjsOutput: false,
    disableDtsOutput: false,
  };

  return filledOptions;
}
