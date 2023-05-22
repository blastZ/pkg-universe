import { PassOptions } from '../interfaces/pass-options.interface.js';
import { RewriteCookieConfig } from '../interfaces/rewrite-cookie-config.interface.js';

export function getRewriteCookieConfig(
  passOptions: PassOptions,
): RewriteCookieConfig {
  let rewriteCookieDomainConfig = passOptions.cookieDomainRewrite;
  let rewriteCookiePathConfig = passOptions.cookiePathRewrite;

  if (typeof rewriteCookieDomainConfig === 'string') {
    rewriteCookieDomainConfig = {
      '*': rewriteCookieDomainConfig,
    };
  }

  if (typeof rewriteCookiePathConfig === 'string') {
    rewriteCookiePathConfig = {
      '*': rewriteCookiePathConfig,
    };
  }

  return {
    rewriteCookieDomainConfig,
    rewriteCookiePathConfig,
  };
}
