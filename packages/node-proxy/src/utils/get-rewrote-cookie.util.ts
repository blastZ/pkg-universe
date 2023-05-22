import { RewriteCookieConfig } from '../interfaces/rewrite-cookie-config.interface.js';

function getRegExp(prop: 'path' | 'domain') {
  return new RegExp(`(;\\s*${prop}=)([^;]+)`, 'ig');
}

function parseCookie(
  regExp: RegExp,
  value: string,
  config: Record<string, string>,
) {
  return value.replace(regExp, (match, prefix, oldValue) => {
    if (config.hasOwnProperty(oldValue)) {
      return prefix + config[oldValue];
    }

    if (config.hasOwnProperty('*')) {
      return prefix + config['*'];
    }

    return match;
  });
}

export function getRewroteCookie(value: string, config: RewriteCookieConfig) {
  let newValue = value;

  if (config.rewriteCookieDomainConfig) {
    newValue = parseCookie(
      getRegExp('domain'),
      newValue,
      config.rewriteCookieDomainConfig,
    );
  }

  if (config.rewriteCookiePathConfig) {
    newValue = parseCookie(
      getRegExp('path'),
      newValue,
      config.rewriteCookiePathConfig,
    );
  }

  return newValue;
}
