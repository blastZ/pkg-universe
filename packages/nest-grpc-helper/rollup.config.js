import pkgxRollupConfig from '../../tools/scripts/pkgx/pkgx-rollup-config.mjs';

export default pkgxRollupConfig({
  external: [
    '@grpc/grpc-js',
    '@grpc/proto-loader',
    '@nestjs/common',
    '@nestjs/core',
    '@nestjs/microservices',
    '@types/express',
    'express',
    'reflect-metadata',
    'rxjs',
    'node:async_hooks',
    'node:path',
    'node:url',
  ],
});
