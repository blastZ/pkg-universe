import { readFileSync } from 'node:fs';

import { PkgJson } from '../interfaces/pkg-json.interface.js';

export function getPkgJson() {
  const pkgJson = JSON.parse(readFileSync('./package.json').toString());

  return pkgJson as PkgJson;
}
