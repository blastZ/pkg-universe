const startsWithSchemeRegexp = new RegExp('^(?:[a-z]+:)?//', 'i');

export const isAbsoluteURL = (url: string): boolean => {
  return startsWithSchemeRegexp.test(url);
};
