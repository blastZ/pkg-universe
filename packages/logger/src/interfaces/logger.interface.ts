import { LeveledLogMethod, Logger as WinstonLogger } from 'winston';
import Transport from 'winston-transport';

export interface Logger extends WinstonLogger {
  fatal: LeveledLogMethod;
  trace: LeveledLogMethod;
  child(options: Object): Logger;
  add(transport: Transport): Logger;
  remove(transport: Transport): Logger;
  clear(): Logger;
}
