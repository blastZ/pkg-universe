import type { FunctionDefinition } from '../../shared.js';

export type ChatCompletionTool =
  | {
      type: 'function';
      function: FunctionDefinition;
    }
  // @zhipuai
  | {
      type: 'web_search';
      web_search: {
        enable?: boolean;
        search_query?: string;
      };
    }
  // @zhipuai
  | {
      type: 'retrieval';
      retrieval: {
        knowledge_id: string;
        prompt_template?: string;
      };
    };
