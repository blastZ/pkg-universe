import deepmerge from 'deepmerge';

import { getConfigFilePath } from './utils/get-config-file-path.util.js';
import { getDefaultConfig } from './utils/get-default-config.util.js';
import { logger } from './utils/log.util.js';

let globalConfig: Record<string, unknown> = {};

function readConfigFile() {
  const configFilePath = getConfigFilePath();

  if (!configFilePath) {
    return;
  }

  try {
    globalConfig = require(configFilePath);
  } catch (err: any) {
    logger.error(err.message);
  }
}

readConfigFile();

export function inject<T>(
  configName: string,
  config: T,
  options?: deepmerge.Options,
) {
  return deepmerge<T>(
    config,
    (globalConfig[configName] as T) || getDefaultConfig(config),
    options,
  );
}
