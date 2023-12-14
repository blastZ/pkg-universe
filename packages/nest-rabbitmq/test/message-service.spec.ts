import { ModuleOptions } from '../src/index.js';
import { CompressService } from '../src/services/compress.service.js';
import { MessageService } from '../src/services/message.service.js';

describe('MessageService', () => {
  it('should work with json', async () => {
    const moduleOptions: ModuleOptions = {
      urls: [],
      json: true,
    };

    const compressService = new CompressService(moduleOptions);
    const messageService = new MessageService(moduleOptions, compressService);

    const data = { name: 'test' };

    const { content } = await messageService.packMessage(data, {});

    expect(content.toString()).toEqual(JSON.stringify(data));
  });

  it('should work with compress', async () => {
    const moduleOptions: ModuleOptions = {
      urls: [],
      json: true,
      compress: {
        enabled: true,
      },
    };

    const compressService = new CompressService(moduleOptions);
    const messageService = new MessageService(moduleOptions, compressService);

    const data = { test: new Array(1 * 1024 + 1).fill('a') };

    const { content: packed, options } = await messageService.packMessage(
      data,
      {},
    );

    expect(packed.toString()).not.toEqual(JSON.stringify(data));
    expect(options.headers['Content-Encoding']).toEqual('deflate');

    const { msg } = await messageService.unpackMessage({
      content: packed,
      properties: { headers: options.headers } as any,
      fields: {} as any,
    });

    expect(msg.content.toString()).toEqual(JSON.stringify(data));
  });
});
