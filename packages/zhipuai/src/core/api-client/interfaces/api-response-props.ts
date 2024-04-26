import type { FinalRequestOptions } from './request-options.js';

export interface APIResponseProps {
  response: Response;
  options: FinalRequestOptions;
  controller: AbortController;
}
