export const castToError = (err: any): Error => {
  if (err instanceof Error) return err;

  return new Error(err);
};
