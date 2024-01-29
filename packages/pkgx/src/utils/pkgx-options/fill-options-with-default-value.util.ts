import { getPkgJson } from '../get-pkg-json.util.js';

import {
  InternalOptions,
  PkgxCmdOptions,
  PkgxOptions,
} from '@/pkgx/interfaces';

function getPackageBasedExternal(internalOptions: InternalOptions) {
  const pkgJson = getPkgJson();

  const dependencies = Object.keys(pkgJson.dependencies || {});
  const peerDependencies = Object.keys(pkgJson.peerDependencies || {});

  const external: (string | RegExp)[] = dependencies.concat(peerDependencies);

  if (internalOptions.isTest) {
    const devDependecies = Object.keys(pkgJson.devDependencies || {});

    external.push(...devDependecies);
  }

  external.push(/^node:.+$/);

  return external;
}

function getExternal(
  options: PkgxOptions,
  cmdOptions: PkgxCmdOptions,
  internalOptions: InternalOptions,
) {
  const packageBasedExternal = options.packageBasedExternal ?? true;
  const excludeFromExternal = options.excludeFromExternal || [];

  let external = packageBasedExternal
    ? getPackageBasedExternal(internalOptions)
    : [];

  external = external.concat(options.external || []);

  external = external.filter((o) => !excludeFromExternal.includes(o));

  return external;
}

function getExclude(
  options: PkgxOptions,
  cmdOptions: PkgxCmdOptions,
  internalOptions: InternalOptions,
) {
  const exclude = ['node_modules', 'dist', 'output'];

  if (!internalOptions.isTest) {
    exclude.push('test', '**/*.spec.ts', '**/*.test.ts');
  }

  return exclude.concat(options.exclude || []);
}

export function fillOptionsWithDefaultValue(
  options: PkgxOptions,
  cmdOptions: PkgxCmdOptions,
  internalOptions: InternalOptions = {},
) {
  const inputFileName =
    cmdOptions.inputFileName || options.inputFileName || 'index.ts';

  const filledOptions: Required<PkgxOptions> = {
    inputFileName,
    cjsInputFileName: options.cjsInputFileName || inputFileName,
    esmInputFileName: options.esmInputFileName || inputFileName,
    inputDir: cmdOptions.inputDir || options.inputDir || 'src',
    outputDirName: options.outputDirName || 'output',
    external: getExternal(options, cmdOptions, internalOptions),
    packageBasedExternal: options.packageBasedExternal ?? true,
    excludeFromExternal: options.excludeFromExternal || [],
    assets: options.assets || [],
    exclude: getExclude(options, cmdOptions, internalOptions),
    sourceMap: options.sourceMap ?? false,
    disableEsmOutput: options.disableEsmOutput ?? false,
    disableCjsOutput: options.disableCjsOutput ?? false,
    disableDtsOutput: options.disableDtsOutput ?? false,
    incremental: options.incremental ?? false,
    cache: false,
    addStartScript: false,
    esmShim: options.esmShim ?? false,
    watchExtra: options.watchExtra ?? [],
  };

  if (
    internalOptions.isApp ||
    internalOptions.isServe ||
    internalOptions.isTest
  ) {
    filledOptions.disableCjsOutput = true;
    filledOptions.disableDtsOutput = true;
  }

  if (internalOptions.isApp) {
    filledOptions.addStartScript = true;
  }

  if (internalOptions.isServe || internalOptions.isTest) {
    filledOptions.sourceMap = true;

    filledOptions.cache = true;
  }

  return filledOptions;
}
