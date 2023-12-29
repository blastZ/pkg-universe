import { ExternalOption } from 'rollup';

export interface PkgxOptions {
  inputFileName?: string;
  outputDirName?: string;
  external?: ExternalOption;
  assets?: string[];
  exclude?: string[];
  sourceMap?: boolean;
}
