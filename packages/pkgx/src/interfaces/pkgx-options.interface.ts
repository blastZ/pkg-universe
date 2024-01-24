export interface PkgxOptions {
  inputFileName?: string;
  cjsInputFileName?: string;
  esmInputFileName?: string;
  inputDir?: string;
  outputDirName?: string;
  external?: (string | RegExp)[];
  assets?: string[];
  exclude?: string[];
  sourceMap?: boolean;
  excludeFromExternal?: (string | RegExp)[];
  disableEsmOutput?: boolean;
  disableCjsOutput?: boolean;
  disableDtsOutput?: boolean;
  incremental?: boolean;
  cache?: boolean;
  addStartScript?: boolean;
  esmShim?: boolean;
  watchExtra?: string[];
}
