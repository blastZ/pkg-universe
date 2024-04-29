import type { ChatCompletionMessageToolCall } from './chat-completion-assistant-message-params.js';

export interface ChatCompletionMessage {
  role: 'assistant';

  content: string | null;

  tool_calls?: Array<ChatCompletionMessageToolCall>;
}
