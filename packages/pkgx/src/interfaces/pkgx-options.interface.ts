import { ExternalOption } from 'rollup';

export interface PkgxOptions {
  input?: string; // src/index.ts
  esmOutputDir?: string;
  external?: ExternalOption;
  assets?: string[]; // []
  exclude?: string[];
  sourceMap?: boolean; // false
}
