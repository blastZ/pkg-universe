import type { ChatCompletionMessageParams } from './chat-completion-message-params.js';
import type { ChatCompletionToolChoiceOption } from './chat-completion-tool-choice-option.js';
import type { ChatCompletionTool } from './chat-completion-tool.js';
import type { ChatModel } from './chat-model.js';

export interface ChatCompletionCreateParamsBase {
  messages: Array<ChatCompletionMessageParams>;
  model: (string & {}) | ChatModel;
  max_tokens?: number | null;
  stop?: string | null | Array<string>;
  stream?: boolean | null;
  temperature?: number | null;
  tool_choice?: ChatCompletionToolChoiceOption;
  tools?: Array<ChatCompletionTool>;
  top_p?: number | null;
  // @zhipuai
  request_id?: string;
  do_sample?: boolean;
  user_id?: string;
}

export interface ChatCompletionCreateParamsNonStreaming
  extends ChatCompletionCreateParamsBase {
  stream?: false | null;
}

export interface ChatCompletionCreateParamsStreaming
  extends ChatCompletionCreateParamsBase {
  stream: true;
}

export type ChatCompletionCreateParams =
  | ChatCompletionCreateParamsNonStreaming
  | ChatCompletionCreateParamsStreaming;
