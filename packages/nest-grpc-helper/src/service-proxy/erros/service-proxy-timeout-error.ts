export class ServiceProxyTimeoutError extends Error {
  constructor(method: string, timeout: number) {
    super(`Send request "${method}" timeout after ${timeout}ms`);
  }
}
