export interface ChatCompletionMessageToolCallFunction {
  name: string;
  arguments: string;
}

export type ChatCompletionMessageToolCall = {
  id: string;
} & (
  | { type: 'function'; function: ChatCompletionMessageToolCallFunction }
  | { type: 'web_search' }
  | { type: 'retrieval' }
);

export interface ChatCompletionAssistantMessageParams {
  role: 'assistant';
  content?: string | null;
  tool_calls?: Array<ChatCompletionMessageToolCall>;
}
