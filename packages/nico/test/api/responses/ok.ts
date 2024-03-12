import { Context } from '../../../src/index.js';

export default function ok(
  this: Context,
  data: any = undefined,
  message = 'execute success',
  success = true,
) {
  this.body = {
    success,
    data,
    message,
  };
}
