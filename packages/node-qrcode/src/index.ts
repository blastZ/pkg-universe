import { writeFile } from 'node:fs/promises';

import { Canvas, createCanvas } from 'canvas';
import merge from 'deepmerge';

import { QRCanvas } from './core/QRCanvas.js';
import { isMergeableObject } from './core/is-mergeable-object.js';
import {
  defaultOptions,
  type Options,
  type RequiredOptions,
} from './core/options.js';
import { getErrorCorrectionLevel } from './core/utils.js';

export * from './core/options.js';

export class QRCode {
  constructor(private options: Options = {}) {}

  private parseOptions(content: string, options: Options = {}) {
    const result = merge.all([defaultOptions, this.options, options], {
      isMergeableObject,
    }) as RequiredOptions;

    if (!result.qrcode.errorCorrectionLevel) {
      result.qrcode.errorCorrectionLevel = getErrorCorrectionLevel(content);
    }

    return result;
  }

  async toCanvas(content: string, options?: Options): Promise<Canvas> {
    const parsedOptions = this.parseOptions(content, options);

    const canvas = createCanvas(parsedOptions.width, parsedOptions.width);

    const qrCanvas = new QRCanvas(canvas, content, parsedOptions);

    await qrCanvas.init();

    return canvas;
  }

  async toFile(path: string, content: string, options?: Options) {
    const canvas = await this.toCanvas(content, options);

    await writeFile(path, canvas.toBuffer());
  }
}

export * as canvas from 'canvas';
