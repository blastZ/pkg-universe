import { InternalOptions } from '../interfaces/internal-options.interface.js';
import { getPkgJson } from '../utils/get-pkg-json.util.js';

export function getExternal(internalOptions: InternalOptions) {
  const pkgJson = getPkgJson();

  const dependencies = Object.keys(pkgJson.dependencies || {});
  const peerDependencies = Object.keys(pkgJson.peerDependencies || {});

  const external: (string | RegExp)[] = dependencies.concat(peerDependencies);

  if (internalOptions.cmdName === 'test') {
    const devDependecies = Object.keys(pkgJson.devDependencies || {});

    external.push(...devDependecies);
  }

  external.push(/^node:.+$/);

  return external;
}
