import type { CanvasRenderingContext2D } from 'canvas';

import type { DotType } from './options.js';
import { canvasRoundRect } from './utils.js';

export type QRDotOptions = {
  context: CanvasRenderingContext2D;
  type: DotType;
  dotSize: number;
};

export type DrawArgs = {
  x: number;
  y: number;
  size: number;
  getNeighbor: GetNeighbor;
};

export type GetNeighbor = (x: number, y: number) => boolean;

export type DrawArgsWithContext = DrawArgs & {
  context: CanvasRenderingContext2D;
};

export type BasicFigureDrawArgs = {
  x: number;
  y: number;
  size: number;
  rotation?: number;
};

export type BasicFigureDrawArgsWithContext = BasicFigureDrawArgs & {
  context: CanvasRenderingContext2D;
};

export type DrawDotArgsWithContext = DrawArgsWithContext & {
  dotRate?: number;
};

export type RotateFigureArgs = {
  x: number;
  y: number;
  size: number;
  rotation?: number;
  draw: () => void;
};

export type RotateFigureArgsWithContext = RotateFigureArgs & {
  context: CanvasRenderingContext2D;
};

export class QRDot {
  _context: CanvasRenderingContext2D;
  _type: DotType;
  dotSize: number;

  constructor(options: QRDotOptions) {
    this._context = options.context;
    this._type = options.type;
    this.dotSize = options.dotSize;
  }

  draw(x: number, y: number, getNeighbor: GetNeighbor): void {
    const context = this._context;
    const type = this._type;

    let drawFunction;

    switch (type) {
      case 'tile':
        drawFunction = this._drawTile;
        break;
      case 'dot':
        drawFunction = this._drawDot;
        break;
      case 'dot-small':
        drawFunction = this._drawDotSmall;
        break;
      case 'rounded':
        drawFunction = this._drawRounded;
        break;
      case 'diamond':
        drawFunction = this._drawDiamond;
        break;
      case 'star':
        drawFunction = this._drawStar;
        break;
      case 'fluid':
        drawFunction = this._drawFluid;
        break;
      case 'fluid-line':
        drawFunction = this._drawFluidLine;
        break;
      case 'stripe':
        drawFunction = this._drawStripe;
        break;
      case 'stripe-column':
        drawFunction = this._drawStripeColumn;
        break;
      case 'square':
      default:
        drawFunction = this._drawSquare;
        break;
    }

    drawFunction.call(this, { x, y, size: this.dotSize, context, getNeighbor });
  }

  _drawSquare({ x, y, size, context }: DrawArgsWithContext) {
    this._basicSquare({ x, y, size, context, rotation: 0 });
  }

  _basicSquare(args: BasicFigureDrawArgsWithContext) {
    const { size, context } = args;

    this._rotateFigure({
      ...args,
      draw: () => {
        context.rect(-size / 2, -size / 2, size, size);
      },
    });
  }

  _drawDot(args: DrawArgsWithContext) {
    this._drawBasicDot(args);
  }

  _drawDotSmall(args: DrawArgsWithContext) {
    this._drawBasicDot({ ...args, dotRate: 0.3 });
  }

  _drawBasicDot(args: DrawDotArgsWithContext) {
    const { x, y, size, context, dotRate = 0.4 } = args;
    const cx = x + size / 2;
    const cy = y + size / 2;
    context.beginPath();
    context.arc(cx, cy, size * dotRate, 0, Math.PI * 2);
    context.closePath();

    context.fill();
  }

  _drawRounded({ x, y, size, context }: DrawArgsWithContext) {
    size = 0.75 * size;
    x += (1 / 8) * size;
    y += (1 / 8) * size;
    const cx = x + size / 2;
    const cy = y + size / 2;
    const originX = -size / 2;
    context.translate(cx, cy);
    canvasRoundRect(context)(originX, originX, size, size, size / 4);
    context.fill();
    context.translate(-cx, -cy);
  }

  _drawTile(args: DrawArgsWithContext) {
    const { size, context } = args;
    this._rotateFigure({
      ...args,
      draw: () => {
        context.rect(-size / 2, -size / 2, size - 1, size - 1);
      },
    });
  }

  _drawDiamond(args: DrawArgsWithContext) {
    let { size } = args;
    const { context } = args;

    this._rotateFigure({
      ...args,
      rotation: Math.PI / 4,
      draw: () => {
        size = (0.5 * size) / Math.sin(Math.PI / 4);
        context.rect(-size / 2, -size / 2, size, size);
      },
    });
  }

  _drawStar(args: DrawArgsWithContext) {
    const { size, context } = args;

    this._rotateFigure({
      ...args,
      rotation: Math.PI / 4,
      draw: () => {
        context.moveTo(-size / 2, -size / 2);
        context.quadraticCurveTo(0, 0, size / 2, -size / 2);
        context.quadraticCurveTo(0, 0, size / 2, size / 2);
        context.quadraticCurveTo(0, 0, -size / 2, size / 2);
        context.quadraticCurveTo(0, 0, -size / 2, -size / 2);
      },
    });
  }

  _drawFluidLine(args: DrawArgsWithContext) {
    this._drawFluid(args, true);
  }

  _drawFluid(
    { x, y, size, context, getNeighbor }: DrawArgsWithContext,
    line = false,
  ) {
    const roundedCorners = [false, false, false, false]; // top-left, top-right, bottom-right, bottom-left

    if (!getNeighbor(0, -1) && !getNeighbor(-1, 0)) roundedCorners[0] = true;
    if (!getNeighbor(1, 0) && !getNeighbor(0, -1)) roundedCorners[1] = true;
    if (!getNeighbor(0, 1) && !getNeighbor(1, 0)) roundedCorners[2] = true;
    if (!getNeighbor(0, 1) && !getNeighbor(-1, 0)) roundedCorners[3] = true;
    const cx = x + size / 2;
    const cy = y + size / 2;
    context.translate(cx, cy);
    context.beginPath();
    context.arc(0, 0, size / 2, 0, 2 * Math.PI, false);
    context.closePath();
    context.fill();
    if (!roundedCorners[0])
      context.fillRect(-size / 2, -size / 2, size / 2, size / 2);
    if (!roundedCorners[1]) context.fillRect(0, -size / 2, size / 2, size / 2);
    if (!roundedCorners[2]) context.fillRect(0, 0, size / 2, size / 2);
    if (!roundedCorners[3]) context.fillRect(-size / 2, 0, size / 2, size / 2);

    if (line) {
      const originLinWidth = context.lineWidth;
      if (getNeighbor(-1, 1)) {
        context.beginPath();
        context.lineWidth = size / 4;
        context.moveTo(0, 0);
        context.lineTo(-size, size);
        context.stroke();
        context.closePath();
      }
      if (getNeighbor(1, 1)) {
        context.beginPath();
        context.lineWidth = size / 4;
        context.moveTo(0, 0);
        context.lineTo(size, size);
        context.stroke();
        context.closePath();
      }
      context.lineWidth = originLinWidth;
    }
    context.translate(-cx, -cy);
  }

  _drawStripeColumn(args: DrawArgsWithContext) {
    this._drawStripe(args, 'column');
  }

  _drawStripe(
    { x, y, size, context, getNeighbor }: DrawArgsWithContext,
    type: 'row' | 'column' = 'row',
  ) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    context.translate(cx, cy);
    context.beginPath();
    context.arc(0, 0, size / 4, 0, 2 * Math.PI, false);
    context.fill();
    context.closePath();
    if (type === 'row') {
      if (getNeighbor(-1, 0)) {
        context.fillRect(-size / 2, -size / 4, size / 2, size / 2);
      }
      if (getNeighbor(1, 0)) {
        context.fillRect(0, -size / 4, size / 2, size / 2);
      }
    } else if (type === 'column') {
      if (getNeighbor(0, -1)) {
        context.fillRect(-size / 4, -size / 2, size / 2, size / 2);
      }
      if (getNeighbor(0, 1)) {
        context.fillRect(-size / 4, 0, size / 2, size / 2);
      }
    }
    context.translate(-cx, -cy);
  }

  _rotateFigure({
    x,
    y,
    size,
    context,
    rotation = 0,
    draw,
  }: RotateFigureArgsWithContext) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    context.translate(cx, cy);
    rotation && context.rotate(rotation);
    draw();
    context.closePath();
    rotation && context.rotate(-rotation);
    context.translate(-cx, -cy);
  }
}
