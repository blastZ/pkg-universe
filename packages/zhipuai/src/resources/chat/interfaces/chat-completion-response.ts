import type { CompletionUsage } from '@/resources/completions';

import type { ChatCompletionChoice } from './chat-completion-choice.js';

export interface ChatCompletionResponse {
  /**
   * A unique identifier for the chat completion.
   */
  id: string;

  /**
   * A list of chat completion choices. Can be more than one if `n` is greater
   * than 1.
   */
  choices: Array<ChatCompletionChoice>;

  /**
   * The Unix timestamp (in seconds) of when the completion was created.
   */
  created: number;

  /**
   * The model used for the chat completion.
   */
  model: string;

  /**
   * The object type, which is always `chat.completion`.
   */
  object: 'chat.completion';

  /**
   * Usage statistics for the completion request.
   */
  usage?: CompletionUsage;

  /**
   * @zhipuai The request ID for the completion request.
   */
  request_id?: string;
}
