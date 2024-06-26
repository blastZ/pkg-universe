import type { ChatCompletionMessage } from './chat-completion-message.js';

export type ZhipuAIFinishReason = 'sensitive' | 'network_error';

export interface ChatCompletionChoice {
  /**
   * - stop: if the model hit a natural stop point or a provided stop sequence
   * - length: if the maximum number of tokens specified in the request was reached
   * - content_filter: if content was omitted due to a flag from our content filters
   * - tool_calls: if the model called a tool
   * - @zhipuai sensitive: if the model detected sensitive content
   * - @zhipuai network_error: if the model encountered a network error
   */
  finish_reason: ('stop' | 'length' | 'tool_calls' | 'content_filter') &
    ZhipuAIFinishReason;

  index: number;

  /**
   * Log probability information for the choice.
   */
  // logprobs: Logprobs | null;

  message: ChatCompletionMessage;
}
