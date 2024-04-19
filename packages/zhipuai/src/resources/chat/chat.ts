import { APIResource } from '../shared.js';

import { ChatCompletions } from './chat-completions.js';

export class Chat extends APIResource {
  completions = new ChatCompletions(this._client);
}
