import { ExternalOption } from 'rollup';

import { getPkgJson } from '../utils/get-pkg-json.util.js';

export function getExternal(pkgPath: string): ExternalOption {
  const pkgJson = getPkgJson(`${pkgPath}/package.json`);

  const dependencies = Object.keys(pkgJson.dependencies || {});
  const peerDependencies = Object.keys(pkgJson.peerDependencies || {});

  const external: ExternalOption = dependencies.concat(peerDependencies);

  external.push(/^node:.+$/);

  return external;
}
