import type { APIPromise, RequestOptions } from '@/core/api-client';
import type { Stream } from '@/core/streaming';

import { APIResource } from '../shared.js';

import { ChatCompletionTasks } from './chat-completion-tasks.js';
import type {
  ChatCompletionChunk,
  ChatCompletionCreateParams,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionCreateParamsStreaming,
  ChatCompletionResponse,
} from './interfaces/index.js';

export class ChatCompletions extends APIResource {
  tasks = new ChatCompletionTasks(this._client);

  create(
    body: ChatCompletionCreateParamsNonStreaming,
    options?: RequestOptions,
  ): APIPromise<ChatCompletionResponse>;
  create(
    body: ChatCompletionCreateParamsStreaming,
    options?: RequestOptions,
  ): APIPromise<Stream<ChatCompletionChunk>>;
  create(
    body: ChatCompletionCreateParams,
    options?: RequestOptions,
  ):
    | APIPromise<ChatCompletionResponse>
    | APIPromise<Stream<ChatCompletionChunk>> {
    return this._client.post('/chat/completions', {
      body,
      ...options,
      stream: body.stream ?? false,
    }) as APIPromise<ChatCompletionResponse>;
  }
}
