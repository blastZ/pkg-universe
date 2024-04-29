import { ZhipuAIError } from '@/errors';

import type { Bytes, ServerSentEvent } from './interfaces/index.js';
import { iterSSEChunks } from './iter-sse-chunks.js';
import { LineDecoder } from './line-decoder.js';
import { readableStreamAsyncIterable } from './readable-stream-async-iterable.js';
import { SSEDecoder } from './sse-decoder.js';

export async function* iterSSEMessages(
  response: Response,
  controller: AbortController,
): AsyncGenerator<ServerSentEvent, void, unknown> {
  if (!response.body) {
    controller.abort();
    throw new ZhipuAIError(`Attempted to iterate over a response with no body`);
  }

  const sseDecoder = new SSEDecoder();
  const lineDecoder = new LineDecoder();

  const iter = readableStreamAsyncIterable<Bytes>(response.body);

  for await (const sseChunk of iterSSEChunks(iter)) {
    const lines = lineDecoder.decode(sseChunk);

    for (const line of lines) {
      const sse = sseDecoder.decode(line);

      if (sse) {
        yield sse;
      }
    }
  }

  for (const line of lineDecoder.flush()) {
    const sse = sseDecoder.decode(line);

    if (sse) {
      yield sse;
    }
  }
}
