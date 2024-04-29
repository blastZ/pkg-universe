import type { ChatCompletionMessageParams } from './chat-completion-message-params.js';
import type { ChatCompletionToolChoiceOption } from './chat-completion-tool-choice-option.js';
import type { ChatCompletionTool } from './chat-completion-tool.js';
import type { ChatModel } from './chat-model.js';

export interface ChatCompletionCreateParamsBase {
  /**
   * A list of messages comprising the conversation so far.
   */
  messages: Array<ChatCompletionMessageParams>;

  /**
   * ID of the model to use.
   */
  model: (string & {}) | ChatModel;

  // frequency_penalty?: number | null;

  // logit_bias?: Record<string, number> | null;

  // logprobs?: boolean | null;

  /**
   * The maximum number of [tokens](/tokenizer) that can be generated in the chat
   * completion.
   */
  max_tokens?: number | null;

  // n?: number | null;

  // presence_penalty?: number | null;

  // response_format?: ChatCompletionResponseFormat;

  // seed?: number | null;

  /**
   * Up to 4 sequences where the API will stop generating further tokens.
   */
  stop?: string | null | Array<string>;

  /**
   * If set, partial message deltas will be sent.
   */
  stream?: boolean | null;

  /**
   * What sampling temperature to use, between 0 and 1. Higher values like 0.8 will
   * make the output more random, while lower values like 0.2 will make it more
   * focused and deterministic.
   *
   * We generally recommend altering this or `top_p` but not both.
   */
  temperature?: number | null;

  /**
   * Controls which (if any) function is called by the model.
   */
  tool_choice?: ChatCompletionToolChoiceOption;

  /**
   * A list of tools the model may call.
   */
  tools?: Array<ChatCompletionTool>;

  // top_logprobs?: number | null;

  /**
   * An alternative to sampling with temperature, called nucleus sampling, where the
   * model considers the results of the tokens with top_p probability mass. So 0.1
   * means only the tokens comprising the top 10% probability mass are considered.
   *
   * We generally recommend altering this or `temperature` but not both.
   */
  top_p?: number | null;

  /**
   * @zhipuai A unique identifier for the request.
   */
  request_id?: string;

  /**
   * @zhipuai Whether to sample from the model or not, default is true.
   * If set to false, temperature and top_p will be ignored.
   */
  do_sample?: boolean;

  /**
   * @zhipuai A unique identifier representing your end-user, which can help to monitor
   * and detect abuse.
   */
  user_id?: string;
  // user?: string;
}

export interface ChatCompletionCreateParamsNonStreaming
  extends ChatCompletionCreateParamsBase {
  stream?: false | null;
}

export interface ChatCompletionCreateParamsStreaming
  extends ChatCompletionCreateParamsBase {
  stream: true;
}

export type ChatCompletionCreateParams =
  | ChatCompletionCreateParamsNonStreaming
  | ChatCompletionCreateParamsStreaming;
