import type { JSONSchema } from '@/libs/jsonschema';

import type { ZhipuAI } from '../zhipuai.js';

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters?: FunctionParameters;
}

export type FunctionParameters = JSONSchema;

export class APIResource {
  protected _client: ZhipuAI;

  constructor(client: ZhipuAI) {
    this._client = client;
  }
}
