import { ReplyMeta } from './interfaces/reply-meta.interface.js';

export class ArrayReply {
  constructor(
    private type: string,
    private originData: any[],
    private replyMeta?: ReplyMeta,
  ) {}

  get data() {
    return this.originData.map((o) => ({
      '@type': this.type,
      ...o,
    }));
  }

  get meta() {
    return this.replyMeta;
  }
}
