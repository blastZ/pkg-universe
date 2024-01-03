import chalk from 'chalk';

const BASE_TAG = chalk.bold('[inject-config]');

const WARNING_TAG = chalk.yellow(BASE_TAG);
const INFO_TAG = chalk.cyan(BASE_TAG);
const ERROR_TAG = chalk.red(BASE_TAG);

class Logger {
  info(msg: string) {
    console.log(`${INFO_TAG} ${msg}`);
  }

  warn(msg: string) {
    console.log(`${WARNING_TAG} ${msg}`);
  }

  error(msg: string) {
    console.log(`${ERROR_TAG} ${msg}`);
  }
}

export const logger = new Logger();
