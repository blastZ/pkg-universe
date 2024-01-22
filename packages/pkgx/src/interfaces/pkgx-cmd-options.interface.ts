import { PkgxOptions } from './pkgx-options.interface.js';

export type PkgxCmdOptions = Pick<PkgxOptions, 'inputFileName' | 'inputDir'>;
