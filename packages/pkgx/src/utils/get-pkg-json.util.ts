import { readFileSync } from 'node:fs';

export function getPkgJson(path: string) {
  const pkgJson = JSON.parse(readFileSync(path).toString());

  return pkgJson;
}
