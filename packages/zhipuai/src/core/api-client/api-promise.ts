import { printDiagnostics } from '@/utils';

import type {
  FinalRequestOptions,
  PromiseOrValue,
} from './interfaces/index.js';

type APIResponseProps = {
  response: Response;
  options: FinalRequestOptions;
  controller: AbortController;
};

async function defaultParseResponse<T>(props: APIResponseProps): Promise<T> {
  const { response } = props;

  if (props.options.stream) {
    // TODO stream handler
  }

  if (response.status === 204) {
    return null as T;
  }

  const contentType = response.headers.get('content-type');

  const isJson =
    contentType?.includes('application/json') ||
    contentType?.includes('application/vnd.api+json');

  if (isJson) {
    const json = await response.json();

    printDiagnostics(
      'defaultParseResponse::json',
      response.status,
      response.url,
      response.headers,
      json,
    );

    return json as T;
  }

  const text = await response.text();

  printDiagnostics(
    'defaultParseResponse::text',
    response.status,
    response.url,
    response.headers,
    text,
  );

  return text as T;
}

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

  // _thenUnwrap<U>(transform: (data: T) => U): APIPromise<U> {
  //   return new APIPromise(this.responsePromise, async (props) =>
  //     transform(await this.parseResponse(props)),
  //   );
  // }

  /**
   * Gets the raw `Response` instance instead of parsing the response data.
   */
  asResponse(): Promise<Response> {
    return this.responsePromise.then((p) => p.response);
  }

  /**
   * Gets the parsed response data and the raw `Response` instance.
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
