import { fetch, getDefaultAgent } from '@/_shims';
import { ZhipuAIError } from '@/errors';
import { printDiagnostics } from '@/utils';

import {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIUserAbortError,
} from './errors/index.js';
import type {
  APIClientOptions,
  Agent,
  DefaultQuery,
  Fetch,
  FinalRequestOptions,
  HTTPMethod,
  Headers,
  PromiseOrValue,
  RequestClient,
  RequestInit,
  RequestOptions,
} from './interfaces/index.js';
import {
  applyHeadersMut,
  castToError,
  getPlatformHeaders,
  isAbsoluteURL,
  sleep,
  uuid4,
  validatePositiveInteger,
} from './utils/index.js';
import { VERSION } from './version.js';

export abstract class APIClient {
  baseURL: string;
  maxRetries: number;
  timeout: number;
  httpAgent: Agent;

  private fetch: Fetch;

  protected idempotencyHeader?: string;

  constructor({
    baseURL,
    maxRetries = 2,
    timeout = 10 * 60 * 1000,
    httpAgent,
    fetch: overridenFetch,
  }: APIClientOptions) {
    this.baseURL = baseURL;
    this.maxRetries = validatePositiveInteger('maxRetries', maxRetries);
    this.timeout = validatePositiveInteger('timeout', timeout);
    this.httpAgent = httpAgent;

    this.fetch = overridenFetch ?? fetch;
  }

  protected async prepareOptions(options: FinalRequestOptions): Promise<void> {}

  protected async prepareRequest(
    request: RequestInit,
    { url, options }: { url: string; options: FinalRequestOptions },
  ): Promise<void> {}

  protected getRequestClient(): RequestClient {
    return { fetch: this.fetch };
  }

  protected authHeaders(options: FinalRequestOptions): Headers {
    return {};
  }

  protected defaultQuery(): DefaultQuery | undefined {
    return undefined;
  }

  protected defaultHeaders(options: FinalRequestOptions) {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': this.getUserAgent(),
      ...getPlatformHeaders(),
      ...this.authHeaders(options),
    };
  }

  protected defaultIdempotencyKey() {
    return `stainless-node-retry-${uuid4()}`;
  }

  protected validateHeaders(headers: Headers, customHeaders: Headers) {}

  private getUserAgent(): string {
    return `${this.constructor.name}/JS ${VERSION}`;
  }

  private calculateContentLength(body: unknown) {
    if (typeof body === 'string') {
      if (typeof Buffer !== 'undefined') {
        return Buffer.byteLength(body, 'utf8').toString();
      }

      if (typeof TextEncoder !== 'undefined') {
        const encoder = new TextEncoder();

        const encoded = encoder.encode(body);

        return encoded.length.toString();
      }
    }

    return null;
  }

  protected stringifyQuery(query: Record<string, unknown>) {
    return Object.entries(query)
      .filter(([_, value]) => typeof value !== 'undefined')
      .map(([key, value]) => {
        if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean'
        ) {
          return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        }

        if (value == null) {
          return `${encodeURIComponent(key)}=`;
        }

        throw new ZhipuAIError(
          `Cannot stringify type ${typeof value}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`,
        );
      })
      .join('&');
  }

  buildURL<Req>(path: string, query: Req | null | undefined) {
    const url = isAbsoluteURL(path)
      ? new URL(path)
      : new URL(
          this.baseURL +
            (this.baseURL.endsWith('/') && path.startsWith('/')
              ? path.slice(1)
              : path),
        );

    const defaultQuery = this.defaultQuery();

    query = {
      ...defaultQuery,
      ...query,
    } as Req;

    url.search = this.stringifyQuery(query as Record<string, unknown>);

    return url.toString();
  }

  private buildHeaders({
    options,
    headers,
    contentLength,
  }: {
    options: FinalRequestOptions;
    headers: Record<string, string | null | undefined>;
    contentLength: string | null | undefined;
  }) {
    const reqHeaders: Record<string, string> = {};

    if (contentLength) {
      reqHeaders['content-length'] = contentLength;
    }

    const defaultHeaders = this.defaultHeaders(options);
    applyHeadersMut(reqHeaders, defaultHeaders);
    applyHeadersMut(reqHeaders, headers);

    // TODO
    // if (isMultipartBody(options.body) && shimsKind !== 'node') {
    //   delete reqHeaders['content-type'];
    // }

    this.validateHeaders(reqHeaders, headers);

    return reqHeaders;
  }

  buildRequest(options: FinalRequestOptions) {
    const method = options.method;

    /* TODO
    const body = isMultipartBody(options.body)
      ? options.body.body
      : options.body
        ? JSON.stringify(options.body, null, 2)
        : null;
    */
    const body = JSON.stringify(options.body, null, 2);

    const contentLength = this.calculateContentLength(body);

    const url = this.buildURL(options.path, options.query);

    if ('timeout' in options) {
      validatePositiveInteger('timeout', options.timeout);
    }

    const timeout = options.timeout ?? this.timeout;

    const httpAgent =
      options.httpAgent ?? this.httpAgent ?? getDefaultAgent?.(url);
    const minAgentTimeout = timeout + 1000;
    if (
      typeof httpAgent?.options?.timeout === 'number' &&
      minAgentTimeout > (httpAgent.options.timeout ?? 0)
    ) {
      httpAgent.options.timeout = minAgentTimeout;
    }

    const headers = options.headers || {};

    if (this.idempotencyHeader && method !== 'get') {
      if (!options.idempotencyKey) {
        options.idempotencyKey = this.defaultIdempotencyKey();
      }

      headers[this.idempotencyHeader] = options.idempotencyKey;
    }

    const reqHeaders = this.buildHeaders({
      options,
      headers,
      contentLength,
    });

    const req: RequestInit = {
      method,
      ...(body ? { body } : {}),
      headers: reqHeaders,
      ...(httpAgent ? { agent: httpAgent } : {}),
      signal: options.signal ?? null,
    };

    return {
      url,
      req,
      timeout,
    };
  }

  async fetchWithTimeout(
    url: RequestInfo,
    reqInit: RequestInit | undefined,
    timeoutNumber: number,
    controller: AbortController,
  ) {
    const { signal, ...options } = reqInit || {};

    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }

    const timeout = setTimeout(() => controller.abort(), timeoutNumber);

    return this.getRequestClient()
      .fetch.call(undefined, url, {
        signal: controller.signal as any,
        method: 'get',
        ...options,
      })
      .finally(() => {
        clearTimeout(timeout);
      });
  }

  private calculateDefaultRetryTimeoutMillis(
    retriesRemaining: number,
    maxRetries: number,
  ): number {
    const initialRetryDelay = 0.5;
    const maxRetryDelay = 8.0;

    const numRetries = maxRetries - retriesRemaining;

    const sleepSeconds = Math.min(
      initialRetryDelay * Math.pow(2, numRetries),
      maxRetryDelay,
    );

    const jitter = 1 - Math.random() * 0.25;

    return sleepSeconds * jitter * 1000;
  }

  private async retryRequest(
    options: FinalRequestOptions,
    retriesRemaining: number,
    responseHeaders?: Headers | undefined,
  ) {
    let timeoutMillis: number | undefined;

    const retryAfterMillisHeader = responseHeaders?.['retry-after-ms'];
    if (retryAfterMillisHeader) {
      const timeoutMs = parseFloat(retryAfterMillisHeader);
      if (!Number.isNaN(timeoutMs)) {
        timeoutMillis = timeoutMs;
      }
    }

    const retryAfterHeader = responseHeaders?.['retry-after'];
    if (retryAfterHeader && !timeoutMillis) {
      const timeoutSeconds = parseFloat(retryAfterHeader);
      if (!Number.isNaN(timeoutSeconds)) {
        timeoutMillis = timeoutSeconds * 1000;
      } else {
        timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
      }
    }

    // calculate default timeout if not provided or invalid
    if (!(timeoutMillis && 0 <= timeoutMillis && timeoutMillis < 60 * 1000)) {
      const maxRetries = options.maxRetries ?? this.maxRetries;
      timeoutMillis = this.calculateDefaultRetryTimeoutMillis(
        retriesRemaining,
        maxRetries,
      );
    }

    await sleep(timeoutMillis);

    return this.makeRequest(options, retriesRemaining - 1);
  }

  private async makeRequest(
    optionsInput: PromiseOrValue<FinalRequestOptions>,
    retriesRemaining: number | null,
  ): Promise<any> {
    const options = await optionsInput;

    if (retriesRemaining == null) {
      retriesRemaining = options.maxRetries ?? this.maxRetries;
    }

    await this.prepareOptions(options);

    const { req, timeout, url } = this.buildRequest(options);

    await this.prepareRequest(req, { url, options });

    printDiagnostics('@zhipuai::core::api_client::make_request', {
      req,
      url,
      options,
    });

    if (options.signal?.aborted) {
      throw new APIUserAbortError();
    }

    const controller = new AbortController();
    const response = await this.fetchWithTimeout(
      url,
      req,
      timeout,
      controller,
    ).catch(castToError);

    if (response instanceof Error) {
      if (options.signal?.aborted) {
        throw new APIUserAbortError();
      }

      if (retriesRemaining > 0) {
        return this.retryRequest(options, retriesRemaining);
      }

      if (response.name === 'AbortError') {
        throw new APIConnectionTimeoutError();
      }

      throw new APIConnectionError({ cause: response });
    }
  }

  request(
    options: FinalRequestOptions,
    remainingRetries: number | null = null,
  ) {
    // return new APIPromise(this.makeRequest(options, remainingRetries));

    return this.makeRequest(options, remainingRetries);
  }

  private methodRequest(
    method: HTTPMethod,
    path: string,
    options: RequestOptions,
  ) {
    return this.request({
      method,
      path,
      ...options,
    });
  }

  post(path: string, options: RequestOptions) {
    return this.methodRequest('post', path, options);
  }
}
