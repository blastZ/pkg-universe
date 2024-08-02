import type { CanvasRenderingContext2D } from 'canvas';

export type ErrorCorrectionLevel = 'L' | 'Q' | 'M' | 'H';

// Increase the fault tolerance for QrCode with less content
export function getErrorCorrectionLevel(content: string): ErrorCorrectionLevel {
  if (content.length > 36) {
    return 'M';
  } else if (content.length > 16) {
    return 'Q';
  } else {
    return 'H';
  }
}

// Draw radius
export const canvasRoundRect =
  (ctx: CanvasRenderingContext2D) =>
  (x: number, y: number, w: number, h: number, r: number) => {
    const minSize = Math.min(w, h);

    if (r > minSize / 2) {
      r = minSize / 2;
    }

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();

    return ctx;
  };
