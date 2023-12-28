import { ExternalOption } from 'rollup';

export interface PkgxOptions {
  input?: string;
  esmOutputDir?: string;
  external?: ExternalOption;
  assets?: string[];
  exclude?: string[];
}
