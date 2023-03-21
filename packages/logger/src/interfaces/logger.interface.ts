import { LeveledLogMethod, Logger as WinstonLogger } from "winston";

export interface Logger extends WinstonLogger {
  fatal: LeveledLogMethod;
  trace: LeveledLogMethod;
  child(options: Object): Logger;
}
