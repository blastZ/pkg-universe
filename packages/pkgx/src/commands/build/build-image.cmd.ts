import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { program } from 'commander';
import dayjs from 'dayjs';
import { $, chalk } from 'zx';

import { CmdBuildImageOptions } from '@/pkgx/interfaces';
import { getPkgJson, logger } from '@/pkgx/utils';

async function getTag() {
  const date = dayjs(new Date()).format('YYYYMMDD');
  const commit = (await $`git log -n 1 --pretty=%h`.quiet()).toString();

  return `${date}-${commit.trim()}`;
}

async function build(pkgRelativePath: string, options: CmdBuildImageOptions) {
  const rootDir = process.cwd();
  const pkgDir = resolve(rootDir, pkgRelativePath);

  const filesInDirectory = new Set(await readdir(process.cwd()));

  if (!filesInDirectory.has('Dockerfile')) {
    throw program.error('Dockerfile not found');
  }

  const pkgJson = getPkgJson(pkgDir);

  const host = options.host || 'docker.io';
  const namespace = options.namespace || 'library';
  const repo = options.repo || pkgJson.name;
  const tag = await getTag();

  const imageName = `${repo}:${tag}`;
  const fullImageName = `${host}/${namespace}/${imageName}`;

  const dockerBuildTarget = 'prod';

  await $`docker build . -t ${imageName} --target ${dockerBuildTarget} --build-arg APP=${pkgJson.name}`;

  await $`docker tag ${imageName} ${fullImageName}`.quiet();

  logger.info(
    `build image success, try below commands` +
      '\n\n' +
      chalk.cyan(`docker push ${fullImageName}`) +
      '\n',
  );
}

export async function buildImageCommand(
  pkgRelativePath: string,
  options: CmdBuildImageOptions,
) {
  await build(pkgRelativePath, options);
}
