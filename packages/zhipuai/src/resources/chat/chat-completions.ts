import type { RequestOptions } from '@/core/api-client';

import { APIResource } from '../shared.js';

import type {
  ChatCompletionCreateParams,
  ChatCompletionResponse,
} from './interfaces/index.js';

export class ChatCompletions extends APIResource {
  // create(
  //   body: ChatCompletionCreateParamsNonStreaming,
  //   options?: Core.RequestOptions,
  // ): APIPromise<ChatCompletion>;
  // create(
  //   body: ChatCompletionCreateParamsStreaming,
  //   options?: Core.RequestOptions,
  // ): APIPromise<Stream<ChatCompletionChunk>>;
  // create(
  //   body: ChatCompletionCreateParamsBase,
  //   options?: Core.RequestOptions,
  // ): APIPromise<Stream<ChatCompletionChunk> | ChatCompletion>;
  // create(
  //   body: ChatCompletionCreateParams,
  //   options?: Core.RequestOptions,
  // ): APIPromise<ChatCompletion> | APIPromise<Stream<ChatCompletionChunk>> {
  //   return this._client.post('/chat/completions', {
  //     body,
  //     ...options,
  //     stream: body.stream ?? false,
  //   }) as APIPromise<ChatCompletion> | APIPromise<Stream<ChatCompletionChunk>>;
  // }
  create(
    body: ChatCompletionCreateParams,
    options?: Omit<RequestOptions, 'body' | 'stream'>,
  ): Promise<ChatCompletionResponse> {
    return this._client.post('/chat/completions', {
      body,
      ...options,
      stream: body.stream ?? false,
    });
  }
}
