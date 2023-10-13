import axios, { AxiosRequestConfig } from 'axios';
import { StringDecoder } from 'node:string_decoder';

import { InvokeType } from './enums/invoke-type.enum.js';
import { AsyncInvokeResponse } from './interfaces/async-invoke-response.interface.js';
import { InvokeResponse } from './interfaces/invoke-response.interface.js';
import { RequestOptions } from './interfaces/request-options.interface.js';
import { Response } from './interfaces/response.interface.js';
import { SSEResponse } from './interfaces/sse-response.interface.js';
import { ZhipuAIOptions } from './interfaces/zhipu-ai-options.interface.js';
import { ParseEvent, createParser } from './libs/eventsource-parser/index.js';
import { generateToken } from './utils/generate-token.util.js';

export class ZhipuAI {
  private cachedToken:
    | undefined
    | {
        token: string;
        exp: number;
      };

  private options: ZhipuAIOptions = {
    apiKey: '',
    apiPrefix: 'https://open.bigmodel.cn/api/paas/v3/model-api',
    browser: false,
    tokenTTL: 3 * 60 * 1000,
    tokenRefreshTTL: 30 * 1000,
  };

  constructor(opts: Partial<ZhipuAIOptions> = {}) {
    this.options = {
      ...this.options,
      ...opts,
    };

    if (!opts.browser && !opts.apiKey) {
      this.options.apiKey = process.env['ZHIPU_AI_API_KEY'] || '';
    }
  }

  private getToken(options: Pick<RequestOptions, 'token'>) {
    if (this.options.browser) {
      if (!options.token) {
        throw new Error('ERR_INVALID_ZHIPU_AI_REQUEST_TOKEN');
      }

      return options.token;
    }

    if (!this.options.apiKey) {
      throw new Error('ERR_INVALID_ZHIPU_AI_API_KEY');
    }

    if (
      this.cachedToken &&
      this.cachedToken.exp - this.options.tokenRefreshTTL > Date.now()
    ) {
      return this.cachedToken.token;
    }

    this.cachedToken = undefined;

    const now = Date.now();
    const token = generateToken(
      this.options.apiKey,
      now,
      this.options.tokenTTL,
    );

    this.cachedToken = {
      token,
      exp: now + this.options.tokenTTL,
    };

    return token;
  }

  private buildApiUrl(model: string, invokeType: InvokeType) {
    return `${this.options.apiPrefix}/${model}/${invokeType}`;
  }

  private buildRequestBody(options: RequestOptions) {
    return {
      prompt: options.messages,
      temperature: options.temperature || 0.95,
      top_p: options.topP || 0.7,
      request_id: options.requestId,
    };
  }

  private buildAxiosRequestConfig(
    invokeType: InvokeType,
    options: Pick<RequestOptions, 'timeout' | 'token'>,
  ): AxiosRequestConfig {
    const token = this.getToken(options);

    if (invokeType === InvokeType.SSE) {
      return {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        timeout: options.timeout || 30 * 1000,
        responseType: 'stream',
      };
    }

    return {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      timeout: options.timeout || 30 * 1000,
    };
  }

  private handleError(data: Response<any>) {
    if (data.code !== 200) {
      throw new Error(`ERR_REQUEST_FAILED: ${data.msg || 'unknowned error'}`);
    }
  }

  private async request(invokeType: InvokeType, options: RequestOptions) {
    try {
      const { data } = await axios.post(
        this.buildApiUrl(options.model, invokeType),
        this.buildRequestBody(options),
        this.buildAxiosRequestConfig(invokeType, options),
      );

      this.handleError(data);

      return data.data;
    } catch (err) {
      throw err;
    }
  }

  async invoke(options: RequestOptions): Promise<InvokeResponse['data']> {
    return this.request(InvokeType.Sync, options);
  }

  async asyncInvoke(
    options: RequestOptions,
  ): Promise<AsyncInvokeResponse['data']> {
    return this.request(InvokeType.Async, options);
  }

  async queryAsyncInvokeResult(
    taskId: string,
    options: Pick<RequestOptions, 'timeout' | 'token'> = {},
  ): Promise<InvokeResponse['data']> {
    try {
      const { data } = await axios.get(
        `${this.buildApiUrl('-', InvokeType.Async)}/${taskId}`,
        this.buildAxiosRequestConfig(InvokeType.Async, options),
      );

      this.handleError(data);

      return data.data;
    } catch (err) {
      throw err;
    }
  }

  async sseInvoke(options: RequestOptions) {
    try {
      const pendingEvent: ParseEvent = {
        type: 'event',
        id: '',
        event: 'pending',
        data: '',
      };

      let lastEvent: ParseEvent = pendingEvent;

      const { data: stream } = await axios.post(
        this.buildApiUrl(options.model, InvokeType.SSE),
        this.buildRequestBody(options),
        this.buildAxiosRequestConfig(InvokeType.SSE, options),
      );

      const parser = createParser(
        (e) => {
          lastEvent = e;
        },
        {
          customFields: ['meta'],
        },
      );

      const decoder = new StringDecoder();

      async function* events() {
        for await (const chunk of stream) {
          lastEvent = pendingEvent;

          // Ensure the decoded string does not contain any incomplete multibyte characters
          const chunkString = decoder.write(chunk);

          parser.feed(chunkString);

          if (lastEvent.type === 'event') {
            if (lastEvent.event === 'finish') {
              try {
                // @ts-ignore
                lastEvent.meta = JSON.parse(lastEvent.meta);
              } catch {
                throw new Error('ERR_INVALID_FINISH_META');
              }
            }
          }

          yield lastEvent as SSEResponse;
        }
      }

      return events();
    } catch (err) {
      throw err;
    }
  }
}
