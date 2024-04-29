import type { APIPromise, RequestOptions } from '@/core/api-client';

import { APIResource } from '../shared.js';

import type {
  CreateEmbeddingResponse,
  EmbeddingCreateParams,
} from './interfaces/index.js';

export class Embeddings extends APIResource {
  create(
    body: EmbeddingCreateParams,
    options?: RequestOptions,
  ): APIPromise<CreateEmbeddingResponse> {
    return this._client.post('/embeddings', {
      body,
      ...options,
    }) as APIPromise<CreateEmbeddingResponse>;
  }
}
