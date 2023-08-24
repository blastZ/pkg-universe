export interface ZhipuAIOptions {
  apiKey: string;
  apiPrefix: string;
  browser: boolean; // default is false
  tokenTTL: number; // milliseconds, default is 3 * 60 * 1000
  tokenRefreshTTL: number; // milliseconds, default is 30 * 1000
}
