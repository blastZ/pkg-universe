import pkgxRollupConfig from '../../tools/scripts/pkgx/pkgx-rollup-config.mjs';

export default pkgxRollupConfig({
  external: [
    'os',
    'util',
    'aliyun-sdk',
    'winston-daily-rotate-file',
    'winston-transport',
    'winston',
    'triple-beam',
    'async_hooks',
  ],
  esmExternal: ['chalk'],
});
