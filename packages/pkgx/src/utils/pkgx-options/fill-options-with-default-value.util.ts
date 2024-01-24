import { InternalOptions } from '../../interfaces/internal-options.interface.js';
import { PkgxCmdOptions } from '../../interfaces/pkgx-cmd-options.interface.js';
import { PkgxOptions } from '../../interfaces/pkgx-options.interface.js';
import { getExternal as getDefaultExternal } from '../../rollup-utils/get-external.js';

function getExternal(
  options: PkgxOptions,
  cmdOptions: PkgxCmdOptions,
  internalOptions: InternalOptions,
) {
  let external = options.external || getDefaultExternal(internalOptions);

  const excludeFromExternal = options.excludeFromExternal || [];

  external = external.filter((o) => !excludeFromExternal.includes(o));

  return external;
}

function getExclude(
  options: PkgxOptions,
  cmdOptions: PkgxCmdOptions,
  internalOptions: InternalOptions,
) {
  const exclude = ['node_modules', 'dist', 'output'];

  if (internalOptions.cmdName !== 'test') {
    exclude.push('test', '**/*.spec.ts', '**/*.test.ts');
  }

  return exclude.concat(options.exclude || []);
}

export function fillOptionsWithDefaultValue(
  options: PkgxOptions,
  cmdOptions: PkgxCmdOptions,
  internalOptions: InternalOptions,
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
    assets: options.assets || [],
    exclude: getExclude(options, cmdOptions, internalOptions),
    sourceMap: options.sourceMap ?? false,
    excludeFromExternal: options.excludeFromExternal || [],
    disableEsmOutput: options.disableEsmOutput ?? false,
    disableCjsOutput: options.disableCjsOutput ?? false,
    disableDtsOutput: options.disableDtsOutput ?? false,
    incremental: options.incremental ?? false,
    cache: false,
    addStartScript: false,
    esmShim: options.esmShim ?? false,
  };

  if (
    internalOptions.cmdName === 'test' ||
    internalOptions.cmdName === 'serve'
  ) {
    filledOptions.disableCjsOutput = true;
    filledOptions.disableDtsOutput = true;

    filledOptions.sourceMap = true;

    filledOptions.cache = true;
  }

  return filledOptions;
}
