import { generateToken } from './generate-token.js';

interface ZhipuAIAuthManagerOptions {
  tokenTTL: number; // milliseconds
  tokenRefreshTTL: number; // milliseconds
}

export class ZhipuAIAuthManger {
  private cachedToken:
    | undefined
    | {
        token: string;
        exp: number;
      };

  private options: ZhipuAIAuthManagerOptions = {
    tokenTTL: 3 * 60 * 1000,
    tokenRefreshTTL: 30 * 1000,
  };

  getToken(apiKey: string) {
    if (
      this.cachedToken &&
      this.cachedToken.exp - this.options.tokenRefreshTTL > Date.now()
    ) {
      return this.cachedToken.token;
    }

    this.cachedToken = undefined;

    const now = Date.now();
    const token = generateToken(apiKey, now, this.options.tokenTTL);

    this.cachedToken = {
      token,
      exp: now + this.options.tokenTTL,
    };

    return token;
  }
}
