import type { APIPromise, RequestOptions } from '@/core/api-client';

import { APIResource } from '../shared.js';

import type {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionTaskCreateResponse,
  ChatCompletionTaskRetrieveParams,
  ChatCompletionTaskRetrieveResponse,
} from './interfaces/index.js';

export class ChatCompletionTasks extends APIResource {
  create(
    body: ChatCompletionCreateParamsNonStreaming,
    options?: RequestOptions,
  ): APIPromise<ChatCompletionTaskCreateResponse> {
    return this._client.post('/async/chat/completions', {
      body,
      ...options,
    }) as APIPromise<ChatCompletionTaskCreateResponse>;
  }

  retrieve(
    body: ChatCompletionTaskRetrieveParams,
    options?: RequestOptions,
  ): APIPromise<ChatCompletionTaskRetrieveResponse> {
    return this._client.get(`/async-result/${body.id}`, {
      ...options,
    }) as APIPromise<ChatCompletionTaskRetrieveResponse>;
  }
}
