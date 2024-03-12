import { Context } from '../../../src';

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
