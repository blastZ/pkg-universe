import { isAbsolute, resolve } from 'node:path';

const ANY_SLASH_REGEX = /[/\\]/;

function relative(from: string, to: string): string {
  const fromParts = from.split(ANY_SLASH_REGEX).filter(Boolean);
  const toParts = to.split(ANY_SLASH_REGEX).filter(Boolean);

  if (fromParts[0] === '.') fromParts.shift();
  if (toParts[0] === '.') toParts.shift();

  while (fromParts[0] && toParts[0] && fromParts[0] === toParts[0]) {
    fromParts.shift();
    toParts.shift();
  }

  while (toParts[0] === '..' && fromParts.length > 0) {
    toParts.shift();
    fromParts.pop();
  }

  while (fromParts.pop()) {
    toParts.unshift('..');
  }

  return toParts.join('/');
}

export function relativeId(id: string): string {
  if (!isAbsolute(id)) return id;

  return relative(resolve(), id);
}
