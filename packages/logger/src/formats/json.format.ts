import { format, type Logform } from 'winston';

export function createJsonFormat(): Logform.Format {
  return format.json();
}
