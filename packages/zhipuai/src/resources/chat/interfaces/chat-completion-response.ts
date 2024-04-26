import type { CompletionUsage } from '@/resources/completions';

import type { ChatCompletionChoice } from './chat-completion-choice.js';

export interface ChatCompletionResponse {
  id: string;
  /**
   * The Unix timestamp (in seconds) of when the completion was created.
   */
  created: number;
  model: string;
  choices: Array<ChatCompletionChoice>;
  usage?: CompletionUsage;

  // @zhipuai
  request_id?: string;
}
