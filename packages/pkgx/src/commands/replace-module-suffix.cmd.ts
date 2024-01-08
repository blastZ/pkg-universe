import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

import chalk from 'chalk';

import { logger } from '../utils/loggin.util.js';

function getRegExp() {
  return new RegExp(
    `(import\\s+.+from\\s+['"]|export\\s+.+from\\s+['"])` +
      `(\\.\\/|..\\/)` +
      `(.+)` +
      `(['"])`,
    'g',
  );
}

async function replaceSuffixByFile(
  path: string,
  oldSuffix: string,
  newSuffix: string,
  regExp: RegExp,
) {
  if (!['.ts'].includes(extname(path))) {
    return;
  }

  let content = await readFile(path, 'utf-8');

  content = content.replace(regExp, (match, $1, $2, $3, $4) => {
    if (oldSuffix === '') {
      if ($3.slice(-newSuffix.length) === newSuffix) {
        return match;
      }

      return `${$1}${$2}${$3}${newSuffix}${$4}`;
    }

    if ($3.slice(-oldSuffix.length) === oldSuffix) {
      return `${$1}${$2}${$3.slice(0, -oldSuffix.length)}${newSuffix}${$4}`;
    }

    return match;
  });

  await writeFile(path, content);
}

async function replaceSuffixByDir(
  path: string,
  oldSuffix: string,
  newSuffix: string,
  regExp: RegExp,
) {
  const exclude = [
    'dist',
    'output',
    'node_modules',
    '.next',
    '.git',
    '.vscode',
  ];

  const files = await readdir(path);

  for (const file of files) {
    const filePath = join(path, file);

    const stats = await stat(filePath);

    if (stats.isDirectory()) {
      if (exclude.includes(file)) {
        continue;
      }

      await replaceSuffixByDir(filePath, oldSuffix, newSuffix, regExp);
    }

    if (stats.isFile()) {
      await replaceSuffixByFile(filePath, oldSuffix, newSuffix, regExp);
    }
  }
}

async function replaceSuffix(
  path: string,
  oldSuffix: string,
  newSuffix: string,
  regExp: RegExp,
) {
  const stats = await stat(path);

  if (stats.isDirectory()) {
    await replaceSuffixByDir(path, oldSuffix, newSuffix, regExp);
  }

  if (stats.isFile()) {
    await replaceSuffixByFile(path, oldSuffix, newSuffix, regExp);
  }
}

export async function replaceModuleSuffixCommand(
  path: string,
  oldSuffix: string,
  newSuffix: string,
) {
  logger.cliVersion();

  const regExp = getRegExp();

  logger.info(
    'Replace module suffix with regex: ' + chalk.cyan(regExp.toString()),
  );

  await replaceSuffix(path, oldSuffix, newSuffix, regExp);

  logger.info('Replacement completed.');
}
