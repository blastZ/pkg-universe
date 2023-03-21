import { format, transports } from "winston";
import { LoggerLevel } from "../enums/index.js";

import {
  createLevelFormat,
  createMessageFormat,
  createTimestampFormat,
} from "../formats/index.js";
import { ConsoleTransportOptions } from "../interfaces/index.js";

export function createConsoleTransport(options: ConsoleTransportOptions = {}) {
  const formats = [
    createLevelFormat(),
    createTimestampFormat(),
    createMessageFormat(),
  ];

  return new transports.Console({
    level: options.level || LoggerLevel.Info,
    format: format.combine(...formats),
  });
}
