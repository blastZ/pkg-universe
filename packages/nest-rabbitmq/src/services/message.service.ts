import { Inject, Injectable } from '@nestjs/common';
import { type ConsumeMessage } from 'amqplib';

import { COMMON_PROPAGATION_HEADERS } from '../constants/common-propagation-headers.constant.js';
import { ModuleOptions } from '../interfaces/module-options.interface.js';
import { MODULE_OPTIONS } from '../token.js';
import { CompressService } from './compress.service.js';

@Injectable()
export class MessageService {
  constructor(
    @Inject(MODULE_OPTIONS) private options: ModuleOptions,
    private compressService: CompressService,
  ) {}

  private async encodeMessageContent(originContent: any) {
    let content = originContent;

    if (this.options.json) {
      content = JSON.stringify(content);
    }

    content = Buffer.from(content);

    let isCompressed = false;

    if (
      this.compressService.isCompressEnabled() &&
      this.compressService.isSatisfyMinLength(content)
    ) {
      isCompressed = true;

      content = await this.compressService.compressMessageContent(content);
    }

    const contentLength = Buffer.byteLength(content);

    if (this.options.messageContentLengthLimit) {
      if (contentLength > this.options.messageContentLengthLimit) {
        throw new Error(
          `Message content length is too long (${
            isCompressed ? 'compressed' : 'uncompressed'
          }), limit: ${
            this.options.messageContentLengthLimit
          }, current: ${contentLength}`,
        );
      }
    }

    return {
      isCompressed,
      content: content as Buffer,
    };
  }

  private async decodeMessageContent(
    originContent: Buffer,
    headers: Record<string, string>,
  ) {
    let content = originContent;

    if (headers['Content-Encoding'] === 'deflate') {
      content = await this.compressService.decompressMessageContent(content);
    }

    return {
      content,
    };
  }

  private packOptions(originOptions: any, input: { isCompressed: boolean }) {
    const headers: Record<string, string> = {};

    const store = this.options.propagation?.context.getStore();

    if (store) {
      const propagationHeaders = COMMON_PROPAGATION_HEADERS.concat(
        this.options.propagation?.headers || [],
      );

      propagationHeaders.map((key) => {
        const value = store.headers[key];

        if (value) {
          headers[key] = String(value);
        }
      });
    }

    if (input.isCompressed) {
      headers['Content-Encoding'] = 'deflate';
    }

    return {
      options: {
        ...originOptions,
        headers: {
          ...headers,
          ...originOptions.headers,
        },
      },
    };
  }

  async packMessage(originContent: any, originOptions: any) {
    const { content, isCompressed } = await this.encodeMessageContent(
      originContent,
    );

    const { options } = this.packOptions(originOptions, { isCompressed });

    return {
      content,
      options,
    };
  }

  async unpackMessage(msg: ConsumeMessage) {
    const { content } = await this.decodeMessageContent(
      msg.content,
      msg.properties.headers || {},
    );

    msg.content = content;

    return { msg };
  }
}
