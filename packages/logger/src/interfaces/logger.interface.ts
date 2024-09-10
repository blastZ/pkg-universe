import type { LeveledLogMethod, Logger as WinstonLogger } from 'winston';
import type Transport from 'winston-transport';

export interface Logger extends WinstonLogger {
  fatal: LeveledLogMethod;
  trace: LeveledLogMethod;
  child(options: Object): this;
  add(transport: Transport): this;
  remove(transport: Transport): this;
  clear(): this;
}
