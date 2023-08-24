import { TaskStatus } from '../enums/task-status.enum.js';
import { ChatMessage } from './chat-message.interface.js';
import { Response } from './response.interface.js';

export type InvokeResponse = Response<{
  request_id: string;
  task_id: string;
  task_status: TaskStatus;
  choices: ChatMessage[];
  usage: {
    total_tokens: number;
  };
}>;
