import type { EmbeddingModel } from './embedding-model.js';

export interface EmbeddingCreateParams {
  /**
   * Input text to embed, encoded as a string or array of tokens.
   */
  input: string | Array<string> | Array<number> | Array<Array<number>>;

  /**
   * ID of the model to use.
   */
  model: (string & {}) | EmbeddingModel;

  /**
   * The number of dimensions the resulting output embeddings should have.
   */
  // dimensions?: number;

  /**
   * The format to return the embeddings in.
   */
  // encoding_format?: 'float' | 'base64';
}
