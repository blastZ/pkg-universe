import type { CompletionUsage } from '@/resources/completions';

import type { ChatCompletionChoice } from '../chat-completion-choice.js';

export type ChatCompletionTaskRetrieveResponse =
  | {
      id: string;

      request_id?: string;

      task_status: 'PROCESSING';
    }
  | {
      id: string;

      request_id?: string;

      task_status: 'SUCCESS';

      choices: Array<ChatCompletionChoice>;

      created: number;

      model: string;

      usage?: CompletionUsage;
    }
  | {
      id: string;

      request_id?: string;

      task_status: 'FAIL';
    };
