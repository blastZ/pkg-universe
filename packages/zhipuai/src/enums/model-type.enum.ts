export enum ModelType {
  GLM4 = 'glm-4',
  GLM3Turbo = 'glm-3-turbo',
  ChatGLMTurbo = 'chatglm_turbo',
  CharacterGLM = 'characterglm',
  TextEmbedding = 'text_embedding',

  /**
   * @deprecated
   *
   * It will be redirected to GLM4 after 2024-12-31
   */
  ChatGLMPro = 'chatglm_pro',

  /**
   * @deprecated
   *
   * It will be redirected to GLM3Turbo after 2024-12-31
   */
  ChatGLMStd = 'chatglm_std',

  /**
   * @deprecated
   *
   * It will be redirected to GLM3Turbo after 2024-12-31
   */
  ChatGLMLite = 'chatglm_lite',
}
