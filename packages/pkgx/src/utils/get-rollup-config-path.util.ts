import { existsSync, writeFileSync } from 'node:fs';

export function getRollupConfigPath() {
  if (existsSync('./rollup.config.mjs')) {
    return './rollup.config.mjs';
  }

  if (existsSync('./rollup.config.js')) {
    return './rollup.config.js';
  }

  writeFileSync(
    './rollup.config.mjs',
    `import { getRollupConfig } from '@blastz/pkgx';` +
      '\n\n' +
      `export default getRollupConfig();`,
  );

  return './rollup.config.mjs';
}
