import { TaskStatus } from '../enums/task-status.enum.js';
import { RequestMessage } from './request.interface.js';

export interface InvokeResponse {
  code: number;
  msg: string;
  success: boolean;
  data: {
    request_id: string;
    task_id: string;
    task_status: TaskStatus;
    choices: RequestMessage[];
    usage: {
      total_tokens: number;
    };
  };
}

export interface AsyncInvokeResponse {
  code: number;
  msg: string;
  success: boolean;
  data: {
    request_id: string;
    task_id: string;
    task_status: TaskStatus;
  };
}
