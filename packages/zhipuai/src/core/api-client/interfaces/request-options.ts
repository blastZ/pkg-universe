export type RequestOptions<Req = unknown | Record<string, unknown>> = {
  body?: Req | null;
  stream?: boolean;
  timeout?: number; // milliseconds, default is 30 * 1000
};
