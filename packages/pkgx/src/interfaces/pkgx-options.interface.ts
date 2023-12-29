export interface PkgxOptions {
  inputFileName?: string;
  outputDirName?: string;
  external?: (string | RegExp)[];
  assets?: string[];
  exclude?: string[];
  sourceMap?: boolean;
  excludeFromExternal?: (string | RegExp)[];
}
