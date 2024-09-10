import chalk from 'chalk';
import { format, type Logform } from 'winston';

export function createLevelFormat(): Logform.Format {
  const colorize = (inputLevel: string) => {
    const level = inputLevel.toUpperCase();
    let paint = chalk.white.cyan;

    switch (level) {
      case 'FATAL':
        paint = chalk.white.bgRgb(255, 0, 185).bold;
        break;
      case 'ERROR':
        paint = chalk.white.bgRed.bold;
        break;
      case 'WARN':
        paint = chalk.white.bgRgb(200, 128, 0).bold;
        break;
      case 'INFO':
        paint = chalk.white.bgBlue.bold;
        break;
      case 'DEBUG':
        paint = chalk.white.bgRgb(0, 157, 37).bold;
        break;
      case 'TRACE':
        paint = chalk.white.bgRgb(91, 0, 171).bold;
        break;
      default:
        paint = chalk.white.cyan;
    }

    return paint(` ${level} `);
  };

  const levelFormat = format((info: Logform.TransformableInfo) => {
    info.level = colorize(info.level);
    return info;
  });

  return levelFormat();
}
