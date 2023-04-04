export interface GrpcClientRequestOptions {
  timeout?: number; // 3000ms
  retryCount?: number; // 3
  retryDelay?: number; // 600ms
}
