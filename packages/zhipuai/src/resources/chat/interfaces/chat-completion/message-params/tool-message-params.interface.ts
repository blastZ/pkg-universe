export interface ChatCompletionToolMessageParams {
  role: 'tool';
  content: string;
  tool_call_id: string;
}
