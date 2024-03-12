import { Context } from '../../../src';
import db from '../models/db';

export default async function get(ctx: Context) {
  const users = await db.getUsers();

  return ctx.ok(users);
}
