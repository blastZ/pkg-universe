import { type RollupNodeResolveOptions } from '@rollup/plugin-node-resolve';
import { type ExternalOption } from 'rollup';

export interface PkgxOptions {
  inputFileName?: string;
  outputDirName?: string;
  external?: ExternalOption;
  assets?: string[];
  exclude?: string[];
  sourceMap?: boolean;
  cjsResolve?:
    | null
    | ((
        external: (string | RegExp)[],
      ) => RollupNodeResolveOptions['resolveOnly']);
}
