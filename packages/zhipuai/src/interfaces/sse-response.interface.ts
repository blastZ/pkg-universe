import { TaskStatus } from '../index.js';

import type { Usage } from './usage.interface.js';

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
        usage: Usage;
        task_id: string;
        request_id: string;
      };
    };
