import { Context } from '../../../src/index.js';
import db from '../models/db/index.js';

export default async function create(ctx: Context) {
  const { name } = ctx.state.body;

  const user = await db.saveUser(name);

  return ctx.ok(user);
}
