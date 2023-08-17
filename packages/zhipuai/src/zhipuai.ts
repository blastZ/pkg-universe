import axios from 'axios';

import { InvokeType } from './enums/invoke-type.enum.js';
import { generateToken } from './generate-token.util.js';
import { RequestOptions } from './interfaces/request.interface.js';
import {
  AsyncInvokeResponse,
  InvokeResponse,
} from './interfaces/response.interface.js';

interface ZhipuAIOptions {
  apiKey: string;
  apiPrefix: string;
  browser: boolean; // default is false
  tokenTTL: number; // milliseconds, default is 3 * 60 * 1000
  tokenRefreshTTL: number; // milliseconds, default is 30 * 1000
}

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

  private getRequestBody(options: RequestOptions) {
    return {
      prompt: options.messages,
      temperature: options.temperature || 0.95,
      top_p: options.topP || 0.7,
      request_id: options.requestId,
    };
  }

  private async request(invokeType: InvokeType, options: RequestOptions) {
    const token = this.getToken(options);

    try {
      const { data } = await axios.post(
        `${this.options.apiPrefix}/${options.model}/${invokeType}`,
        this.getRequestBody(options),
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
          timeout: options.timeout || 30 * 1000,
        },
      );

      if (data.code !== 200) {
        throw new Error(`ERR_REQUEST_FAILED: ${data.msg || 'unknowned error'}`);
      }

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
  ) {
    const token = this.getToken(options);

    try {
      const { data } = await axios.get(
        `${this.options.apiPrefix}/-/async-invoke/${taskId}`,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
          timeout: options.timeout || 30 * 1000,
        },
      );

      if (data.code !== 200) {
        throw new Error(`ERR_REQUEST_FAILED: ${data.msg || 'unknowned error'}`);
      }

      return data.data;
    } catch (err) {
      throw err;
    }
  }

  sseInvoke() {}
}
