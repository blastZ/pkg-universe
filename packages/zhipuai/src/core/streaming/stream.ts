import { APIError } from '../api-client/errors/api-error.js';

import { iterSSEMessages } from './iter-sse-messages.js';

export class Stream<Item> implements AsyncIterable<Item> {
  controller: AbortController;

  constructor(
    private iterator: () => AsyncIterator<Item>,
    controller: AbortController,
  ) {
    this.controller = controller;
  }

  static fromSSEResponse<Item>(
    response: Response,
    controller: AbortController,
  ) {
    let consumed = false;

    async function* iterator(): AsyncIterator<Item, any, undefined> {
      if (consumed) {
        throw new Error(
          'Cannot iterate over a consumed stream, use `.tee()` to split the stream.',
        );
      }

      consumed = true;

      let done = false;

      try {
        for await (const sse of iterSSEMessages(response, controller)) {
          if (done) {
            continue;
          }

          if (sse.data.startsWith('[DONE]')) {
            done = true;
            continue;
          }

          let data;
          try {
            data = JSON.parse(sse.data);
          } catch (err) {
            console.error(`Could not parse message into JSON:`, sse.data);
            console.error(`From chunk:`, sse.raw);

            throw err;
          }

          if (sse.event === null) {
            if (data && data.error) {
              throw new APIError(undefined, data.error, undefined, undefined);
            }

            yield data;
          } else {
            if (sse.event === 'error') {
              throw new APIError(
                undefined,
                data.error,
                data.message,
                undefined,
              );
            }

            yield { event: sse.event, data } as any;
          }
        }

        done = true;
      } catch (e) {
        // call `stream.controller.abort()`
        if (e instanceof Error && e.name === 'AbortError') {
          return;
        }

        throw e;
      } finally {
        if (!done) {
          controller.abort();
        }
      }
    }

    return new Stream(iterator, controller);
  }

  [Symbol.asyncIterator](): AsyncIterator<Item> {
    return this.iterator();
  }
}
