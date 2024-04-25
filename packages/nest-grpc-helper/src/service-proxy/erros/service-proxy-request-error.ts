export class ServiceProxyRequestError extends Error {
  constructor(method: string, originError: any) {
    if (!(originError instanceof Error)) {
      originError = new Error(originError);
    }

    super(`Send request "${method}" failed`, {
      cause: originError,
    });
  }
}
