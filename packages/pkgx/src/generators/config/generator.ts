import { writeFile } from 'node:fs/promises';

import chalk from 'chalk';

import { getFileNameByExtensions } from '../../utils/get-file-name-by-extensions.util.js';
import { logger } from '../../utils/loggin.util.js';
import { DEFAULT_CONFIG_BASE } from '../../utils/pkgx-options/get-pkgx-config-file-options.util.js';

const CONFIG_TEMPLATE = `
/**
 * @type {import('@blastz/pkgx').PkgxOptions}
 */
export default {};
`;

export class ConfigGenerator {
  async isConfigFileExists() {
    const fileName = await getFileNameByExtensions('.', DEFAULT_CONFIG_BASE);

    if (!fileName) {
      return false;
    }

    return true;
  }

  async generate() {
    const isConfigFileExists = await this.isConfigFileExists();

    if (isConfigFileExists) {
      logger.error('config file already exists');

      return;
    }

    await writeFile('pkgx.config.js', CONFIG_TEMPLATE.slice(1));

    logger.info(chalk.green(`create pkgx.config.js successfully`));
  }
}
