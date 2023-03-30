import deepmerge from 'deepmerge';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

let globalConfig: Record<string, unknown> = {};

const globalConfigPath =
  process.env.INJECT_CONFIG_PATH || resolve(process.cwd(), './config');

try {
  const require = createRequire(import.meta.url);
  globalConfig = require(globalConfigPath);
} catch (err) {
  console.error(
    `ERR_INJECT_CONFIG: global config '${globalConfigPath}' not found`
  );
}

function getDefault(config: unknown) {
  if (Array.isArray(config)) {
    return [];
  }

  return {};
}

export function inject<T>(
  configName: string,
  config: T,
  options?: deepmerge.Options
) {
  return deepmerge<T>(
    config,
    (globalConfig[configName] as T) || getDefault(config),
    options
  );
}
