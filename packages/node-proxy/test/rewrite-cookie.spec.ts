import { getRewriteCookieConfig } from '../src/utils/get-rewrite-cookie-config.util.js';
import { getRewroteCookie } from '../src/utils/get-rewrote-cookie.util.js';

function getCookie(path: string = '/test', domain: string = 'test.me') {
  return `session=xxxxxx; path=${path}; domain=${domain}; httponly'`;
}

describe('getRewroteCookie', () => {
  it('should support rewrite domain', () => {
    const newCookie = getRewroteCookie(
      `${getCookie()},${getCookie()}`,
      getRewriteCookieConfig({
        cookieDomainRewrite: 'test.you',
      }),
    );

    expect(newCookie).toEqual(
      `${getCookie(undefined, 'test.you')},${getCookie(undefined, 'test.you')}`,
    );

    const newCookie2 = getRewroteCookie(
      `${getCookie()},${getCookie()}`,
      getRewriteCookieConfig({
        cookieDomainRewrite: {
          '*': 'test.you',
        },
      }),
    );

    expect(newCookie2).toEqual(
      `${getCookie(undefined, 'test.you')},${getCookie(undefined, 'test.you')}`,
    );

    const newCookie3 = getRewroteCookie(
      `${getCookie()},${getCookie(undefined, 'test.our')}`,
      getRewriteCookieConfig({
        cookieDomainRewrite: {
          '*': 'test.you',
          'test.our': 'test.other',
        },
      }),
    );

    expect(newCookie3).toEqual(
      `${getCookie(undefined, 'test.you')},${getCookie(
        undefined,
        'test.other',
      )}`,
    );
  });

  it('should support rewrite path', () => {
    const newCookie = getRewroteCookie(
      `${getCookie()},${getCookie()}`,
      getRewriteCookieConfig({
        cookiePathRewrite: '/',
      }),
    );

    expect(newCookie).toEqual(`${getCookie('/')},${getCookie('/')}`);

    const newCookie2 = getRewroteCookie(
      `${getCookie()},${getCookie()}`,
      getRewriteCookieConfig({
        cookiePathRewrite: {
          '*': '/',
        },
      }),
    );

    expect(newCookie2).toEqual(`${getCookie('/')},${getCookie('/')}`);

    const newCookie3 = getRewroteCookie(
      `${getCookie()},${getCookie('/test2')}`,
      getRewriteCookieConfig({
        cookiePathRewrite: {
          '*': '/',
          '/test2': '/test3',
        },
      }),
    );

    expect(newCookie3).toEqual(`${getCookie('/')},${getCookie('/test3')}`);
  });

  it('should support rewrite domain and path', () => {
    const newCookie = getRewroteCookie(
      `${getCookie()},${getCookie()}`,
      getRewriteCookieConfig({
        cookiePathRewrite: '/',
        cookieDomainRewrite: 'test.you',
      }),
    );

    expect(newCookie).toEqual(
      `${getCookie('/', 'test.you')},${getCookie('/', 'test.you')}`,
    );

    const newCookie2 = getRewroteCookie(
      `${getCookie()},${getCookie('/test2', 'test.our')}`,
      getRewriteCookieConfig({
        cookiePathRewrite: {
          '*': '/',
          '/test2': '/test3',
        },
        cookieDomainRewrite: { '*': 'test.you', 'test.our': 'test.other' },
      }),
    );

    expect(newCookie2).toEqual(
      `${getCookie('/', 'test.you')},${getCookie('/test3', 'test.other')}`,
    );
  });
});
