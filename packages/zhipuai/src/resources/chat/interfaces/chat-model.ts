export type ChatModel =
  | 'glm-4'
  | 'glm-3-turbo'
  | 'chatglm_turbo'
  | 'characterglm'

  /**
   * @deprecated
   *
   * It will be redirected to GLM4 after 2024-12-31
   */
  | 'chatglm_pro'

  /**
   * @deprecated
   *
   * It will be redirected to GLM3Turbo after 2024-12-31
   */
  | 'chatglm_std'

  /**
   * @deprecated
   *
   * It will be redirected to GLM3Turbo after 2024-12-31
   */
  | 'chatglm_lite';
