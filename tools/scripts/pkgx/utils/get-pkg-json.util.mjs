import { readFileSync } from 'node:fs';

export function getPkgJson(path) {
  const pkgJson = JSON.parse(readFileSync(path).toString());

  return pkgJson;
}
