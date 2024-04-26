import { ZhipuAIError } from '@/errors';

export const validatePositiveInteger = (name: string, n: unknown): number => {
  if (typeof n !== 'number' || !Number.isInteger(n)) {
    throw new ZhipuAIError(`${name} must be an integer`);
  }

  if (n < 0) {
    throw new ZhipuAIError(`${name} must be a positive integer`);
  }

  return n;
};
