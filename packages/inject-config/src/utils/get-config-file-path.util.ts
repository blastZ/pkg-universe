import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { logger } from './log.util.js';

const EXTENSIONS = ['js'];

function getFileName(files: Set<string>, baseName: string) {
  for (const extension of EXTENSIONS) {
    const fileName = `${baseName}.${extension}`;

    if (files.has(fileName)) {
      return fileName;
    }
  }
}

function getRelativeConfigFilePath() {
  const filesInWorkingDir = new Set(readdirSync(process.cwd()));

  const configFileName = getFileName(filesInWorkingDir, 'config');

  if (configFileName) {
    return `./${configFileName}`;
  }

  if (!filesInWorkingDir.has('config')) {
    return undefined;
  }

  const filesInConfigDir = new Set(
    readdirSync(resolve(process.cwd(), './config')),
  );

  const configFileNameInDir = getFileName(filesInConfigDir, 'index');

  if (!configFileNameInDir) {
    return undefined;
  }

  return `./config/${configFileNameInDir}`;
}

export function getConfigFilePath() {
  if (process.env.INJECT_CONFIG_PATH) {
    return process.env.INJECT_CONFIG_PATH;
  }

  const relativeConfigFilePath = getRelativeConfigFilePath();

  if (!relativeConfigFilePath) {
    logger.warn('no config file found');

    return undefined;
  }

  logger.info(`load config from "${relativeConfigFilePath}"`);

  const configFilePath = resolve(process.cwd(), relativeConfigFilePath);

  return configFilePath;
}
