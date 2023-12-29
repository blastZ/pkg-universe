import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';

import { PkgJson } from '../interfaces/pkg-json.interface.js';
import { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

import { getPkgJson } from './get-pkg-json.util.js';

const templatePkgJson: PkgJson = {
  name: 'REPLACE_WITH_PACKAGE_NAME',
  type: 'commonjs',
};

export async function addCjsPackageJsonFile(options: Required<PkgxOptions>) {
  const pkgJson = getPkgJson();

  let str = JSON.stringify(templatePkgJson, null, 2);

  str = str.replace('REPLACE_WITH_PACKAGE_NAME', pkgJson.name);

  if (existsSync(`./${options.outputDirName}/cjs`)) {
    await writeFile(`./${options.outputDirName}/cjs/package.json`, str);
  }
}
