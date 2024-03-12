import { Context } from '../../../src';
import db from '../models/db';

export default async function create(ctx: Context) {
  const { name } = ctx.state.body;

  const user = await db.saveUser(name);

  return ctx.ok(user);
}
