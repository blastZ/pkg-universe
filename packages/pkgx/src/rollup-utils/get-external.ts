import { getPkgJson } from '../utils/get-pkg-json.util.js';

export function getExternal() {
  const pkgJson = getPkgJson();

  const dependencies = Object.keys(pkgJson.dependencies || {});
  const peerDependencies = Object.keys(pkgJson.peerDependencies || {});

  const external: (string | RegExp)[] = dependencies.concat(peerDependencies);

  external.push(/^node:.+$/);

  return external;
}
