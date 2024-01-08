import chalk from 'chalk';
import dayjs from 'dayjs';
import ms from 'pretty-ms';

import { getCliVersion } from './get-cli-version.util.js';

const BASE_TAG = '[pkgx]';

const INFO_TAG = chalk.cyan(BASE_TAG);
const WARNING_TAG = chalk.yellow(BASE_TAG);
const ERROR_TAG = chalk.red(BASE_TAG);

const cyanBold = (msg: string) => chalk.cyan(chalk.bold(msg));
const greenBold = (msg: string) => chalk.green(chalk.bold(msg));

class Logger {
  info(msg: string) {
    console.log(`${INFO_TAG} ${msg}`);
  }

  warn(msg: string) {
    console.log(`${WARNING_TAG} ${msg}`);
  }

  error(msg: string) {
    console.log(`${ERROR_TAG} ${chalk.red(msg)}`);
  }

  logCliVersion() {
    this.info(chalk.underline(`v${getCliVersion()}`));
  }

  logBundleInfo(origin: string, target: string) {
    this.info(`${cyanBold(origin)} → ${cyanBold(target)}...`);
  }

  logBundleTime(id: string, time: number) {
    this.info(`created ${greenBold(id)} in ${greenBold(ms(time))}`);
  }

  logWaitingForChanges() {
    this.info(`(${dayjs().format()}) waiting for changes...`);
  }

  logForceRestart() {
    this.error('app did not exit in time, forcing restart...');
  }

  logServeStaticRequest(method: string = 'GET', url: string = '/') {
    this.info(chalk.cyan(`${method} ${url}`));
  }

  logServeStaticTime(statusCode: number, time: number) {
    const str = `returned ${statusCode} in ${ms(time)}`;

    if (statusCode < 400) {
      return this.info(chalk.green(str));
    }

    return this.error(str);
  }
}

export const logger = new Logger();
