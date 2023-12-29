import { writeFile } from 'node:fs/promises';
import { basename } from 'node:path';

import { PkgJson } from '../interfaces/pkg-json.interface.js';
import { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

import { getPkgJson } from './get-pkg-json.util.js';

const templatePkgJson: PkgJson = {
  name: 'REPLACE_WITH_PACKAGE_NAME',
  version: 'REPLACE_WITH_PACKAGE_VERSION',
  description: 'REPLACE_WITH_PACKAGE_DESCRIPTION',
  type: 'module',
  main: './cjs/REPLACE_WITH_INPUT_FILE_BASE_NAME.js',
  exports: {
    types: './index.d.ts',
    require: './cjs/REPLACE_WITH_INPUT_FILE_BASE_NAME.js',
    import: './esm/REPLACE_WITH_INPUT_FILE_BASE_NAME.js',
  },
  types: './index.d.ts',
  homepage: 'REPLACE_WITH_PACKAGE_HOMEPAGE',
  repository: {
    type: 'REPLACE_WITH_PACKAGE_REPOSITORY_TYPE',
    url: 'REPLACE_WITH_PACKAGE_REPOSITORY_URL',
  },
  author: 'REPLACE_WITH_PACKAGE_AUTHOR',
  license: 'REPLACE_WITH_PACKAGE_LICENSE',
  dependencies: {},
  peerDependencies: {},
};

function getDependencies(
  originDependencies: Record<string, string>,
  options: Required<PkgxOptions>,
) {
  const targetDependencies: Record<string, string> = {};

  Object.keys(originDependencies).map((key) => {
    if (options.excludeFromExternal.includes(key)) {
      // do noting
    } else {
      targetDependencies[key] = originDependencies[key];
    }
  });

  return targetDependencies;
}

export async function addPackageJsonFile(options: Required<PkgxOptions>) {
  const pkgJson = getPkgJson();

  if (
    !pkgJson.repository ||
    !pkgJson.repository.type ||
    !pkgJson.repository.url
  ) {
    templatePkgJson.repository = undefined;
  }

  templatePkgJson.dependencies = getDependencies(
    pkgJson.dependencies || {},
    options,
  );
  templatePkgJson.peerDependencies = getDependencies(
    pkgJson.peerDependencies || {},
    options,
  );

  let str = JSON.stringify(templatePkgJson, null, 2);

  str = str
    .replace('REPLACE_WITH_PACKAGE_NAME', pkgJson.name)
    .replace('REPLACE_WITH_PACKAGE_VERSION', pkgJson.version || '1.0.0')
    .replace('REPLACE_WITH_PACKAGE_DESCRIPTION', pkgJson.description || '')
    .replaceAll(
      'REPLACE_WITH_INPUT_FILE_BASE_NAME',
      basename(options.inputFileName, '.ts'),
    )
    .replace('REPLACE_WITH_PACKAGE_HOMEPAGE', pkgJson.homepage || '')
    .replace(
      'REPLACE_WITH_PACKAGE_REPOSITORY_TYPE',
      pkgJson.repository?.type || '',
    )
    .replace(
      'REPLACE_WITH_PACKAGE_REPOSITORY_URL',
      pkgJson.repository?.url || '',
    )
    .replace('REPLACE_WITH_PACKAGE_AUTHOR', pkgJson.author || '')
    .replace('REPLACE_WITH_PACKAGE_LICENSE', pkgJson.license || 'ISC');

  await writeFile(`./${options.outputDirName}/package.json`, str);
}
