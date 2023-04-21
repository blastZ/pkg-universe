import pkgxRollupConfig from '../../tools/scripts/pkgx/pkgx-rollup-config.mjs';

export default pkgxRollupConfig({
  resolve: (external) => {
    return (module) =>
      !external.includes(module) || module.includes('oidc-provider');
  },
});
