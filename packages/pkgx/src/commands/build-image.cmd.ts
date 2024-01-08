import { readdir } from 'node:fs/promises';

import chalk from 'chalk';
import dayjs from 'dayjs';
import { $ } from 'zx';

import { CmdBuildImageOptions } from '../interfaces/cmd-build-image-options.interface.js';
import { getPkgJson } from '../utils/get-pkg-json.util.js';
import { logger } from '../utils/loggin.util.js';

async function getTag() {
  const date = dayjs(new Date()).format('YYYYMMDD');
  const commit = (await $`git log -n 1 --pretty=%h`.quiet()).toString();

  return `${date}-${commit.trim()}`;
}

function getNamespace(
  namespaces: { [namespace: string]: string[] },
  appName: string,
) {
  for (const namespace in namespaces) {
    if (namespaces[namespace].includes(appName)) {
      return namespace;
    }
  }
}

async function build(appName: string, options: CmdBuildImageOptions) {
  const filesInDirectory = new Set(await readdir(process.cwd()));

  if (!filesInDirectory.has('Dockerfile')) {
    logger.error('Dockerfile not found');

    return;
  }

  if (!filesInDirectory.has('package.json')) {
    logger.error('package.json not found');

    return;
  }

  const pkgJson = getPkgJson();
  const targetImage = pkgJson.images?.[options.target];

  if (!targetImage) {
    logger.error('target image not found in package.json');

    return;
  }

  const registry = targetImage.registry;

  const namespace = getNamespace(targetImage.namespaces, appName);

  if (!namespace) {
    logger.error('namespace for app not found in target image');

    return;
  }

  const tag = await getTag();

  const baseImageUrl = `${appName}:${tag}`;
  const imageUrl = `${registry}/${namespace}/${baseImageUrl}`;

  const dockerBuildTarget = 'prod';

  logger.info('docker build target: ' + chalk.cyan(dockerBuildTarget));

  await $`docker build . -t ${baseImageUrl} --target ${dockerBuildTarget} --build-arg APP=${appName}`;

  await $`docker tag ${baseImageUrl} ${imageUrl}`;

  logger.info('image url: ' + chalk.cyan(imageUrl));
}

export async function buildImageCommand(
  appName: string,
  options: CmdBuildImageOptions,
) {
  logger.logCliVersion();

  if (!options.target) {
    logger.error('target is required');

    return;
  }

  await build(appName, options);
}
