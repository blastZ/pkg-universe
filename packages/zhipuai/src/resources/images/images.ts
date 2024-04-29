import type { APIPromise, RequestOptions } from '@/core/api-client';

import { APIResource } from '../shared.js';

import type {
  ImageGenerateParams,
  ImagesResponse,
} from './interfaces/index.js';

export class Images extends APIResource {
  generate(
    body: ImageGenerateParams,
    options?: RequestOptions,
  ): APIPromise<ImagesResponse> {
    return this._client.post('/images/generations', {
      body,
      ...options,
    }) as APIPromise<ImagesResponse>;
  }
}
