import { ModelType } from '../enums/model-type.enum.js';
import { ChatMessage } from './chat-message.interface.js';

export interface CommonRequestOptions {
  requestId?: string;
  incremental?: boolean; // default is true
  token?: string; // only used in browser
  timeout?: number; // milliseconds, default is 30 * 1000
}

export interface ChatModelRequestOptions extends CommonRequestOptions {
  model:
    | ModelType.ChatGLMLite
    | ModelType.ChatGLMStd
    | ModelType.ChatGLMPro
    | ModelType.ChatGLMTurbo;
  messages: ChatMessage[];
  temperature?: number; // default is 0.95, allowed between (0.0, 1.0]
  topP?: number; // default is 0.7, allowed between (0.0, 1.0)
}

export interface CharacterModelRequestOptions extends CommonRequestOptions {
  model: ModelType.CharacterGLM;
  messages: ChatMessage[];
  meta: {
    userInfo: string;
    userName?: string;
    botInfo: string;
    botName: string;
  };
}

export type RequestOptions =
  | ChatModelRequestOptions
  | CharacterModelRequestOptions;
