import { Inject } from '@nestjs/common';
import { promisify } from 'node:util';
import { deflate, inflate } from 'node:zlib';

import { ModuleOptions } from '../interfaces/module-options.interface.js';
import { MODULE_OPTIONS } from '../token.js';

const deflateAsync = promisify(deflate);
const inflateAsync = promisify(inflate);

export class CompressService {
  constructor(@Inject(MODULE_OPTIONS) private options: ModuleOptions) {}

  isSatisfyMinLength(content: Buffer) {
    const minLength = this.options.compress?.minLength || 1 * 1024;

    const length = Buffer.byteLength(content);

    return length > minLength;
  }

  isCompressEnabled() {
    if (!this.options.compress?.enabled) {
      return false;
    }

    return true;
  }

  async compressMessageContent(originContent: Buffer) {
    const compressedContent = await deflateAsync(originContent);

    return compressedContent;
  }

  async decompressMessageContent(originContent: Buffer) {
    const decompressedContent = await inflateAsync(originContent);

    return decompressedContent;
  }
}
