import { ModelType } from '../enums/model-type.enum.js';
import { RequestMessageRole } from '../enums/request-message-role.enum.js';

export interface RequestMessage {
  role: RequestMessageRole;
  content: string;
}

export interface RequestOptions {
  model: ModelType;
  messages: RequestMessage[];
  temperature?: number;
  topP?: number;
  requestId?: string;
  incremental?: boolean;
}
