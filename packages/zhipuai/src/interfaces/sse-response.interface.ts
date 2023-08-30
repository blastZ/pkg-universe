import { TaskStatus } from '../index.js';

export interface ZhipuSSEResponse {
  id: string;
  event: 'add' | 'finish';
  data: string;
  meta: string;
}

export type SSEResponse =
  | {
      id: string;
      event: 'add';
      data: string;
    }
  | {
      id: string;
      event: 'finish';
      data: string;
      meta: {
        task_status: TaskStatus;
        usage: { total_tokens: string };
        task_id: string;
        request_id: string;
      };
    };
