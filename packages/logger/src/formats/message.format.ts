import { inspect } from 'node:util';

import { format, type Logform } from 'winston';

export function createMessageFormat(): Logform.Format {
  const messageFormat = format.printf((info: Logform.TransformableInfo) => {
    const message = Object.keys(info).reduce((result, key) => {
      result[key] = info[key];
      return result;
    }, {} as any);

    delete message.level;
    delete message.timestamp;

    return `${info.timestamp} ${info.level}\n${inspect(message, {
      colors: true,
      depth: 8,
      breakLength: 1,
    })}`;
  });

  return messageFormat;
}
