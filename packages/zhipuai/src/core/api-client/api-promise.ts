import type { FinalRequestOptions } from './interfaces/index.js';

type APIResponseProps = {
  response: Response;
  options: FinalRequestOptions;
  controller: AbortController;
};

export class APIPromise<T> extends Promise<T> {
  private parsedPromise: Promise<T> | undefined;

  constructor(
    private responsePromise: Promise<APIResponseProps>,
    private parseResponse: (
      props: APIResponseProps,
    ) => PromiseOrValue<T> = defaultParseResponse,
  ) {
    super((resolve) => {
      resolve(null as any);
    });
  }

  _thenUnwrap<U>(transform: (data: T) => U): APIPromise<U> {
    return new APIPromise(this.responsePromise, async (props) =>
      transform(await this.parseResponse(props)),
    );
  }

  /**
   * Gets the raw `Response` instance instead of parsing the response
   * data.
   *
   * If you want to parse the response body but still get the `Response`
   * instance, you can use {@link withResponse()}.
   *
   * 👋 Getting the wrong TypeScript type for `Response`?
   * Try setting `"moduleResolution": "NodeNext"` if you can,
   * or add one of these imports before your first `import … from 'openai'`:
   * - `import 'openai/shims/node'` (if you're running on Node)
   * - `import 'openai/shims/web'` (otherwise)
   */
  asResponse(): Promise<Response> {
    return this.responsePromise.then((p) => p.response);
  }
  /**
   * Gets the parsed response data and the raw `Response` instance.
   *
   * If you just want to get the raw `Response` instance without parsing it,
   * you can use {@link asResponse()}.
   *
   *
   * 👋 Getting the wrong TypeScript type for `Response`?
   * Try setting `"moduleResolution": "NodeNext"` if you can,
   * or add one of these imports before your first `import … from 'openai'`:
   * - `import 'openai/shims/node'` (if you're running on Node)
   * - `import 'openai/shims/web'` (otherwise)
   */
  async withResponse(): Promise<{ data: T; response: Response }> {
    const [data, response] = await Promise.all([
      this.parse(),
      this.asResponse(),
    ]);
    return { data, response };
  }

  private parse(): Promise<T> {
    if (!this.parsedPromise) {
      this.parsedPromise = this.responsePromise.then(this.parseResponse);
    }

    return this.parsedPromise;
  }

  override then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null,
  ): Promise<TResult1 | TResult2> {
    return this.parse().then(onfulfilled, onrejected);
  }

  override catch<TResult = never>(
    onrejected?:
      | ((reason: any) => TResult | PromiseLike<TResult>)
      | undefined
      | null,
  ): Promise<T | TResult> {
    return this.parse().catch(onrejected);
  }

  override finally(onfinally?: (() => void) | undefined | null): Promise<T> {
    return this.parse().finally(onfinally);
  }
}
