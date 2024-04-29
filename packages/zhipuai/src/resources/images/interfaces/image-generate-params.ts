import type { ImageModel } from './image-model.js';

export interface ImageGenerateParams {
  /**
   * A text description of the desired image(s).
   */
  prompt: string;

  /**
   * The model to use for image generation.
   */
  model?: (string & {}) | ImageModel;

  /**
   * The number of images to generate.
   */
  // n?: number | null;

  /**
   * The quality of the image that will be generated.
   */
  // quality?: 'standard' | 'hd';

  /**
   * The format in which the generated images are returned.
   */
  // response_format?: 'url' | 'b64_json' | null;

  /**
   * The size of the generated images.
   */
  // size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792' | null;

  /**
   * The style of the generated images.
   */
  // style?: 'vivid' | 'natural' | null;

  /**
   * A unique identifier representing your end-user, which can help to monitor and detect abuse.
   */
  // user?: string;
  user_id?: string;
}
