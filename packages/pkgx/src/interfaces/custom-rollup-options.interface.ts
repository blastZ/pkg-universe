import { ExternalOption } from 'rollup';

export interface CustomRollupOptions {
  input?: string;
  esmOutputDir?: string;
  external?: ExternalOption;
  assets?: string[];
  exclude?: string[];
}
