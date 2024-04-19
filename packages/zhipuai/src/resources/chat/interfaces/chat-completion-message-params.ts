import type { ChatCompletionAssistantMessageParams } from './chat-completion-assistant-message-params.js';
import type { ChatCompletionSystemMessageParams } from './chat-completion-system-message-params.js';
import type { ChatCompletionToolMessageParams } from './chat-completion-tool-message-params.js';
import type { ChatCompletionUserMessageParams } from './chat-completion-user-message-params.js';

export type ChatCompletionMessageParams =
  | ChatCompletionSystemMessageParams
  | ChatCompletionUserMessageParams
  | ChatCompletionAssistantMessageParams
  | ChatCompletionToolMessageParams;
