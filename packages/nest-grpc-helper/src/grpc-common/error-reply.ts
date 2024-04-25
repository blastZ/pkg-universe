import type { ReplyMeta } from './interfaces/reply-meta.interface.js';

export class ErrorReply {
  constructor(
    private code: string,
    private message: string,
    private type: string,
    private originData: Record<string, unknown> | Record<string, unknown>[],
    private replyMeta?: ReplyMeta,
  ) {}

  get data() {
    if (Array.isArray(this.originData)) {
      return this.originData.map((o) => ({
        '@type': this.type,
        ...o,
      }));
    }

    return {
      '@type': this.type,
      ...this.originData,
    };
  }

  get meta() {
    return this.replyMeta;
  }

  get error() {
    return {
      code: this.code,
      message: this.message,
    };
  }

  toObject() {
    return {
      data: this.data,
      error: this.error,
      meta: this.meta,
    };
  }
}
