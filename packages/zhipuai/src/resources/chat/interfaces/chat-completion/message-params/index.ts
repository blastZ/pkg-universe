import { ChatCompletionAssistantMessageParams } from './assistant-message-params.interface.js';
import { ChatCompletionSystemMessageParams } from './system-message-params.interface.js';
import { ChatCompletionToolMessageParams } from './tool-message-params.interface.js';
import { ChatCompletionUserMessageParams } from './user-message-params.interface.js';

export * from './assistant-message-params.interface.js';
export * from './system-message-params.interface.js';
export * from './tool-message-params.interface.js';
export * from './user-message-params.interface.js';

export type ChatCompletionMessageParams =
  | ChatCompletionSystemMessageParams
  | ChatCompletionUserMessageParams
  | ChatCompletionAssistantMessageParams
  | ChatCompletionToolMessageParams;
