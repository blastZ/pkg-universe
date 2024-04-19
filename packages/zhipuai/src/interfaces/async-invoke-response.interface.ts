import { TaskStatus } from '../enums/task-status.enum.js';

import type { Response } from './response.interface.js';

export type AsyncInvokeResponse = Response<{
  request_id: string;
  task_id: string;
  task_status: TaskStatus;
}>;
