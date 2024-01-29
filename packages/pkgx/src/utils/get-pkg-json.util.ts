import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import chalk from 'chalk';

import { PkgJson } from '../interfaces/pkg-json.interface.js';

import { logger } from './loggin.util.js';

let parsedPkgJson: PkgJson | undefined;

export function getPkgJson(dir?: string) {
  const pkgJsonPath = dir ? resolve(dir, './package.json') : './package.json';

  if (parsedPkgJson) {
    return parsedPkgJson;
  }

  let pkgJsonStr: string;

  try {
    pkgJsonStr = readFileSync(pkgJsonPath).toString();
  } catch (err) {
    logger.warn(
      chalk.yellow(chalk.bold('package.json not found, using default values.')),
    );

    pkgJsonStr = '{}';
  }

  const pkgJson = JSON.parse(pkgJsonStr);

  parsedPkgJson = pkgJson as PkgJson;

  if (typeof parsedPkgJson.name !== 'string') {
    parsedPkgJson.name = 'anonymous';
  }

  return parsedPkgJson;
}
