import type { GeneralDailyRotateFileTransportOptions } from 'winston-daily-rotate-file';

import { LoggerLevel } from '../enums/index.js';

import type { BaseOptions } from './base-options.interface.js';

export interface FileTransportOptions
  extends BaseOptions,
    GeneralDailyRotateFileTransportOptions {
  level?: LoggerLevel; // trace
  jsonOutput?: boolean; // true
}
