import {
  Canvas,
  Image,
  createCanvas,
  type CanvasRenderingContext2D,
} from 'canvas';
import QRCode from 'qrcode';

import { QRCorner } from './QRCorner.js';
import { QRDot } from './QRDot.js';
import { type RequiredOptions } from './options.js';
import { canvasRoundRect } from './utils.js';

const squareMask = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1],
];

const dotMask = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
];

const ErrorCorrectionPercents: { [key: string]: number } = {
  L: 0.07,
  M: 0.15,
  Q: 0.25,
  H: 0.3,
};

export class QRCanvas {
  /**row size */
  private size!: number;
  /**qrcode version, from 1 - 40 */
  private version!: number;
  private qrcodeArray: Uint8Array = new Uint8Array();
  /**dotSize: Integer */
  private dotSize: number = 0;
  /**offset: Integer */
  private offset: number = 0;

  /**Don't draw dot in logo range */
  private inLogoRange?: (i: number, j: number) => boolean;

  clear() {
    const canvasContext = this.context;

    if (canvasContext) {
      canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  get context(): CanvasRenderingContext2D {
    return this.canvas.getContext('2d')!;
  }

  constructor(
    private canvas: Canvas,
    private content: string,
    private options: RequiredOptions,
  ) {
    const qrcodeData = QRCode.create(content, this.options.qrcode);

    this.saveQRCodeData(qrcodeData);
  }

  private saveQRCodeData(data: QRCode.QRCode) {
    this.size = data.modules.size;
    this.version = data.version;
    this.qrcodeArray = data.modules.data;

    const count = this.size;

    // actual width without margin
    const withoutMarginSize =
      this.options.width - this.options.qrcode.margin * 2;

    // pixel width
    this.dotSize = Math.floor(withoutMarginSize / count);
    this.offset = Math.floor((this.options.width - count * this.dotSize) / 2);
  }

  async init() {
    this.clear();

    this.drawBackground();

    const drawFunction = await this.drawLogo();

    this.drawDots();

    this.drawCorners();

    drawFunction && drawFunction.call(this);
  }

  async drawLogo(): Promise<Function | null> {
    if (this.options.logo.src) {
      return this._drawLogo(this.options.logo);
    }

    return null;
  }

  async _drawLogo(logo: RequiredOptions['logo']) {
    const context = this.context;
    const canvas = this.canvas;

    const coverLevel =
      ErrorCorrectionPercents[this.options.qrcode.errorCorrectionLevel];

    const maxHiddenDots = Math.floor(
      coverLevel * coverLevel * this.size * this.size,
    );
    const { bgColor, borderWidth, borderRadius, logoRadius } = logo;

    const image = new Image();
    image.src = logo.src;
    const rate = image.width / image.height;

    let logoWidth: number;
    let logoHeight: number;
    let logoInnerWidth: number;
    let logoInnerHeight: number;

    const maxHeight = Math.floor(
      Math.sqrt((this.dotSize * this.dotSize * maxHiddenDots) / rate),
    );

    if (rate > 1) {
      logoHeight = maxHeight;
      logoInnerHeight = maxHeight - 2 * borderWidth;
      logoInnerWidth = Math.floor(logoInnerHeight * rate);
      logoWidth = logoInnerWidth + borderWidth * 2;
    } else {
      logoWidth = Math.floor(maxHeight * rate);
      logoInnerWidth = logoWidth - borderWidth * 2;
      logoInnerHeight = Math.floor(logoInnerWidth / rate);
      logoHeight = logoInnerHeight + 2 * borderWidth;
    }

    const xStart = (this.size - Math.ceil(logoWidth / this.dotSize)) / 2;
    const xEnd = this.size - xStart - 1;
    const yStart = (this.size - Math.ceil(logoHeight / this.dotSize)) / 2;
    const yEnd = this.size - yStart - 1;
    this.inLogoRange = (i, j) => {
      return i >= xStart && i <= xEnd && j >= yStart && j <= yEnd;
    };

    return function (this: QRCanvas) {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      context.translate(cx, cy);

      canvasRoundRect(context)(
        -logoWidth / 2,
        -logoHeight / 2,
        logoWidth,
        logoHeight,
        borderRadius,
      );

      this.context.fillStyle = bgColor;
      this.context.fill();

      const drawLogoWithImage = () => {
        context.drawImage(
          image,
          -logoInnerWidth / 2,
          -logoInnerHeight / 2,
          logoInnerWidth,
          logoInnerHeight,
        );
      };

      // Use canvas to draw more features, such as borderRadius
      const drawLogoWithCanvas = () => {
        const canvasImage = createCanvas(logoInnerWidth, logoInnerHeight);

        canvasImage
          .getContext('2d')!
          .drawImage(image, 0, 0, logoInnerWidth, logoInnerHeight);

        canvasRoundRect(context)(
          0,
          0,
          logoInnerWidth,
          logoInnerHeight,
          logoRadius,
        );

        context.fillStyle = context.createPattern(canvasImage, 'no-repeat');

        context.fill();
      };

      if (logoRadius) {
        context.translate(-logoInnerWidth / 2, -logoInnerHeight / 2);
        drawLogoWithCanvas();
        context.translate(-cx + logoInnerWidth / 2, -cy + logoInnerHeight / 2);
      } else {
        drawLogoWithImage();
        context.translate(-cx, -cy);
      }
    };
  }

  /**
   * Coordinate is dark dot ? 0 or 1
   */
  isDark(x: number, y: number) {
    return this.qrcodeArray[x + y * this.size] === 1;
  }

  drawBackground() {
    const canvasContext = this.context;
    const { qrcode } = this.options;

    const light = qrcode.color.light;

    if (canvasContext) {
      canvasContext.fillStyle = light;
      canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  drawDots() {
    const canvasContext = this.context;

    if (canvasContext) {
      const count = this.size;
      // dot width, integer
      const dotSize = this.dotSize;
      // qrcode start position x
      const xBeginning = this.offset;
      // qrcode start position y
      const yBeginning = this.offset;

      // filter location points
      const filterDots = (i: number, j: number) => {
        // filter location points border
        if (
          squareMask[i]?.[j] ||
          squareMask[i - count + 7]?.[j] ||
          squareMask[i]?.[j - count + 7]
        ) {
          return false;
        }
        // filter location points
        if (
          dotMask[i]?.[j] ||
          dotMask[i - count + 7]?.[j] ||
          dotMask[i]?.[j - count + 7]
        ) {
          return false;
        }
        if (this.inLogoRange && this.inLogoRange(i, j)) return false;
        return true;
      };

      const dot = new QRDot({
        context: this.context!,
        type: this.options.dots.type,
        dotSize,
      });

      canvasContext.fillStyle = canvasContext.strokeStyle =
        this.options.dots.color;

      for (let i = 0; i < count; i++) {
        for (let j = 0; j < count; j++) {
          if (!filterDots(i, j)) {
            continue;
          }
          if (!this.isDark(i, j)) {
            continue;
          }
          dot.draw(
            xBeginning + i * dotSize,
            yBeginning + j * dotSize,
            (xOffset: number, yOffset: number): boolean => {
              if (
                i + xOffset < 0 ||
                j + yOffset < 0 ||
                i + xOffset >= count ||
                j + yOffset >= count
              )
                return false;
              if (!filterDots(i + xOffset, j + yOffset)) return false;
              return this.isDark(i + xOffset, j + yOffset);
            },
          );
        }
      }
      canvasContext.fill();
    }
  }

  drawCorners() {
    const canvasContext = this.context;
    if (canvasContext) {
      const margin = this.options.qrcode.margin;
      const count = this.size;
      const width = this.options.width;

      // actual qrcode width without margin
      const minSize = width - margin * 2;

      // dot width
      const dotSize = Math.floor(minSize / count);

      // qrcode start position x
      const xBeginning = Math.floor((width - count * dotSize) / 2);

      // qrcode start position y
      const yBeginning = Math.floor((width - count * dotSize) / 2);

      [
        [0, 0],
        [1, 0],
        [0, 1],
      ].forEach(([column, row]) => {
        const x = xBeginning + column * dotSize * (count - 7);
        const y = yBeginning + row * dotSize * (count - 7);

        const corner = new QRCorner(
          this.context,
          this.options.corners.type,
          this.options.corners.color,
        );

        corner.draw({
          x,
          y,
          dotSize: this.dotSize,
          radius: this.options.corners?.radius,
        });
      });
    }
  }
}
