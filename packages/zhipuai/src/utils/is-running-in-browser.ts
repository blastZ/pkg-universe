export const isRunningInBrowser = () => {
  return (
    typeof window !== 'undefined' &&
    typeof window.document !== 'undefined' &&
    typeof navigator !== 'undefined'
  );
};
