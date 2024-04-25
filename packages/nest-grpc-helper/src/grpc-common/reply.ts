import type { ReplyMeta } from './interfaces/reply-meta.interface.js';

export class Reply {
  constructor(
    private type: string,
    private originData: Record<string, unknown>,
    private replyMeta?: ReplyMeta,
  ) {}

  get data() {
    return {
      '@type': this.type,
      ...this.originData,
    };
  }

  get meta() {
    return this.replyMeta;
  }
}
