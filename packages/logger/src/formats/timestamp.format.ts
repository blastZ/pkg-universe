import { format, Logform } from 'winston';

export function createTimestampFormat(): Logform.Format {
  return format.timestamp();
}
