export interface Embedding {
  /**
   * The embedding vector, which is a list of floats. The length of vector depends on the model.
   */
  embedding: Array<number>;

  /**
   * The index of the embedding in the list of embeddings.
   */
  index: number;

  /**
   * The object type, which is always "embedding".
   */
  object: 'embedding';
}

export interface EmbeddingUsage {
  /**
   * The number of tokens used by the prompt.
   */
  prompt_tokens: number;

  /**
   * The total number of tokens used by the request.
   */
  total_tokens: number;
}

export interface CreateEmbeddingResponse {
  /**
   * The list of embeddings generated by the model.
   */
  data: Array<Embedding>;

  /**
   * The name of the model used to generate the embedding.
   */
  model: string;

  /**
   * The object type, which is always "list".
   */
  object: 'list';

  /**
   * The usage information for the request.
   */
  usage: EmbeddingUsage;
}