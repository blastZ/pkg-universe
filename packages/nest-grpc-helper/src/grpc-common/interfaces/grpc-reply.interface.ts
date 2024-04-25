import type { ReplyError } from './reply-error.interface.js';
import type { ReplyMeta } from './reply-meta.interface.js';

export interface GrpcReply<T = any> {
  data: T;
  meta?: ReplyMeta;
  error?: ReplyError;
}
