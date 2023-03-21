declare module "aliyun-sdk" {
  export interface Options {
    accessKeyId: string;
    secretAccessKey: string;
    endpoint: string;
    apiVersion: string;
    httpOptions?: {
      timeout: number; // default no timeout (ms)
    };
  }

  export type Progress = "Incomplete" | "Complete";

  export interface Error {
    request_id: string;
    headers: Record<string, string>;
    code: number;
    message: number;
    error_code: string;
    error_message: string;
  }

  export type Callback<T> = (error: Error | null, data: T) => void;

  export class SLS {
    constructor(opts: Options) {}

    listLogStores(
      opts: { projectName: string },
      cb: Callback<{
        request_id: string;
        count: number;
        logstores: string[];
        headers: Record<string, string>;
      }>
    ): void;

    putLogs(
      opts: {
        projectName: string;
        logStoreName: string;
        logGroup: {
          logs: {
            time: number; // s
            contents: { key: string; value: string }[];
          }[];
          topic?: string;
          source?: string;
        };
      },
      cb?: Callback<{
        request_id: string;
        headers: Record<string, string>;
      }>
    ): void;

    getHistograms(
      opts: {
        progress: string;
        logStoreName: string;
        from: number;
        to: number;
        topic?: string;
        query?: string;
      },
      cb: Callback<{
        request_id: string;
        headers: Record<string, string>;
        progress: Progress;
        count: number;
        histograms: {
          from: number;
          to: number;
          count: number;
          progress: Progress;
        }[];
      }>
    ): void;

    getLogs(
      opts: {
        progress: string;
        logStoreName: string;
        from: number;
        to: number;
        topic?: string;
        query?: string;
        line?: number;
        offset?: number;
      },
      cb: Callback<{
        request_id: string;
        headers: Record<string, string>;
        progress: Progress;
        count: number;
        logs: Record<string, string>[];
      }>
    ): void;
  }
}
