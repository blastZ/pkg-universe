import pkgxRollupConfig from '../../tools/scripts/pkgx/pkgx-rollup-config.mjs';

export default pkgxRollupConfig({
  external: ['msgpackr', 'component-emitter'],
  browser: true,
});
