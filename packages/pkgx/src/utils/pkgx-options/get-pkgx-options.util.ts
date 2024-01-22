import { InternalOptions } from '../../interfaces/internal-options.interface.js';
import { PkgxCmdOptions } from '../../interfaces/pkgx-cmd-options.interface.js';

import { fillOptionsWithDefaultValue } from './fill-options-with-default-value.util.js';
import { getPkgxConfigFileOptions } from './get-pkgx-config-file-options.util.js';

export async function getPkgxOptions(
  cmdOptions: PkgxCmdOptions,
  internalOptions: InternalOptions,
) {
  const configFileOptions = await getPkgxConfigFileOptions();

  const filledOptions = fillOptionsWithDefaultValue(
    configFileOptions,
    cmdOptions,
    internalOptions,
  );

  return filledOptions;
}
