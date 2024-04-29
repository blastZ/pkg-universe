import type { Bytes } from './interfaces/index.js';

function findDoubleNewlineIndex(buffer: Uint8Array): number {
  // Searches the buffer for the end patterns (\r\r, \n\n, \r\n\r\n)
  const lf = 0x0a; // \n
  const cr = 0x0d; // \r

  for (let i = 0; i < buffer.length - 2; i++) {
    if (buffer[i] === lf && buffer[i + 1] === lf) {
      return i + 2;
    }

    if (buffer[i] === cr && buffer[i + 1] === cr) {
      return i + 2;
    }

    if (
      buffer[i] === cr &&
      buffer[i + 1] === lf &&
      i + 3 < buffer.length &&
      buffer[i + 2] === cr &&
      buffer[i + 3] === lf
    ) {
      return i + 4;
    }
  }

  return -1;
}

export async function* iterSSEChunks(
  iterator: AsyncIterableIterator<Bytes>,
): AsyncGenerator<Uint8Array> {
  let data = new Uint8Array();

  for await (const chunk of iterator) {
    if (chunk == null) {
      continue;
    }

    const binaryChunk =
      chunk instanceof ArrayBuffer
        ? new Uint8Array(chunk)
        : typeof chunk === 'string'
          ? new TextEncoder().encode(chunk)
          : chunk;

    const newData = new Uint8Array(data.length + binaryChunk.length);
    newData.set(data);
    newData.set(binaryChunk, data.length);
    data = newData;

    let patternIndex;
    while ((patternIndex = findDoubleNewlineIndex(data)) !== -1) {
      yield data.slice(0, patternIndex);

      data = data.slice(patternIndex);
    }
  }

  if (data.length > 0) {
    yield data;
  }
}
