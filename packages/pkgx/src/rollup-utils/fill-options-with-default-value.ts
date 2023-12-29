import { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

import { getExternal } from './get-external.js';

export function fillOptionsWithDefaultValue(options: PkgxOptions) {
  const filledOptions: Required<PkgxOptions> = {
    inputFileName: options.inputFileName || 'index.ts',
    outputDirName: options.outputDirName || 'output',
    external: options.external || getExternal('.'),
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
  };

  return filledOptions;
}
