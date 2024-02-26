import { ReplyError } from './reply-error.interface.js';
import { ReplyMeta } from './reply-meta.interface.js';

export interface GrpcReply<T = any> {
  data: T & { '@type'?: string };
  meta?: ReplyMeta;
  error?: ReplyError;
}
