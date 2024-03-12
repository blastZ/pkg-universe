import { Context } from '../../../src/index.js';
import db from '../models/db/index.js';

export default async function get(ctx: Context) {
  const users = await db.getUsers();

  return ctx.ok(users);
}
