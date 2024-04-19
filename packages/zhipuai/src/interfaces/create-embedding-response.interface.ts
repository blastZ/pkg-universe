import { TaskStatus } from '../enums/task-status.enum.js';

import type { Response } from './response.interface.js';
import type { Usage } from './usage.interface.js';

export type CreateEmbeddingResponse = Response<{
  request_id: string;
  task_id: string;
  task_status: TaskStatus;
  embedding: number[];
  usage: Usage;
}>;
