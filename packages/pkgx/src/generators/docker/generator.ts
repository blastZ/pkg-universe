import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import chalk from 'chalk';
import { program } from 'commander';
import { $ } from 'zx';

import { __dirname, logger } from '@/pkgx/utils';

export class DockerGenerator {
  async checkDockerFileExists() {
    const filesInDirectory = new Set(await readdir(process.cwd()));

    if (filesInDirectory.has('Dockerfile')) {
      throw program.error('Dockerfile already exists');
    }

    if (filesInDirectory.has('.dockerignore')) {
      throw program.error('.dockerignore already exists');
    }
  }

  async generate() {
    await this.checkDockerFileExists();

    await $`cp ${resolve(
      __dirname,
      '../templates/pkgx.Dockerfile',
    )} ./Dockerfile`.quiet();

    await $`cp ${resolve(
      __dirname,
      '../templates/pkgx.Dockerfile.dockerignore',
    )} ./.dockerignore`.quiet();

    logger.info(
      chalk.green(`create Dockerfile and .dockerignore successfully`),
    );
  }
}
