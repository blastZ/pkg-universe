import axios from 'axios';
import jwt from 'jsonwebtoken';

import { RequestOptions } from './interfaces/request.interface.js';

interface ZhipuAIOptions {
  apiKey?: string;
  apiPrefix?: string;
}

export class ZhipuAI {
  constructor(private options: ZhipuAIOptions = {}) {
    if (!options.apiKey) {
      this.options.apiKey = process.env['ZHIPU_AI_API_KEY'];
    }

    if (!options.apiPrefix) {
      this.options.apiPrefix = 'https://open.bigmodel.cn/api/paas/v3/model-api';
    }
  }

  getToken() {
    if (!this.options.apiKey) {
      throw new Error('ERR_INVALID_ZHIPU_AI_API_KEY');
    }

    const [id, secret] = this.options.apiKey.split('.');

    const now = Date.now();

    // @ts-ignore
    const token = jwt.sign(
      {
        api_key: id,
        exp: now + 1 * 60 * 60 * 1000,
        timestamp: now,
      },
      secret,
      {
        header: {
          alg: 'HS256',
          sign_type: 'SIGN',
        },
      },
    );

    return token;
  }

  async invoke(options: RequestOptions) {
    const token = this.getToken();

    try {
      const { data } = await axios.post(
        `${this.options.apiPrefix}/${options.model}/invoke`,
        {
          prompt: options.messages,
          temperature: options.temperature || 0.95,
          top_p: options.topP || 0.7,
          request_id: options.requestId,
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        },
      );

      if (data.code !== '200') {
        throw new Error(`ERR_REQUEST_FAILED: ${data.msg || 'unknowned error'}`);
      }

      return data.data;
    } catch (err) {
      throw err;
    }
  }

  asyncInvoke() {}

  queryAsyncInvokeResult() {}

  sseInvoke() {}
}
