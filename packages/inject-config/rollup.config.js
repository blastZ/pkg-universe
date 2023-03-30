import pkgxRollupConfig from '../../tools/scripts/pkgx/pkgx-rollup-config.mjs';

export default pkgxRollupConfig({
  external: ['deepmerge', 'node:module', 'node:path'],
});
