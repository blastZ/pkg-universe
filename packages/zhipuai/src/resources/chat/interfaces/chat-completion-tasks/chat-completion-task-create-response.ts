import type { ChatCompletionTaskStatus } from './chat-completion-task-status.js';

export interface ChatCompletionTaskCreateResponse {
  /**
   * @zhipuai The created task id.
   */
  id: string;

  /**
   * @zhipuai The model used for the chat completion.
   */
  model: string;

  /**
   * @zhipuai The request ID for the completion request.
   */
  request_id: string;

  /**
   * @zhipuai The status of the task
   */
  task_status: ChatCompletionTaskStatus;
}
