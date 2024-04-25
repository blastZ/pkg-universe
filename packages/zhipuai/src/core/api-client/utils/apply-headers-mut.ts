import type { Headers } from '../interfaces/index.js';

function hasOwn(obj: Object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Copies headers from "newHeaders" onto "targetHeaders",
 * using lower-case for all properties,
 * ignoring any keys with undefined values,
 * and deleting any keys with null values.
 */
export function applyHeadersMut(
  targetHeaders: Headers,
  newHeaders: Headers,
): void {
  for (const k in newHeaders) {
    if (!hasOwn(newHeaders, k)) continue;

    const lowerKey = k.toLowerCase();

    if (!lowerKey) continue;

    const val = newHeaders[k];

    if (val === null) {
      delete targetHeaders[lowerKey];
    } else if (val !== undefined) {
      targetHeaders[lowerKey] = val;
    }
  }
}
