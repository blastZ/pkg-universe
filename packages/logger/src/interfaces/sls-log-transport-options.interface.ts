import { BaseOptions } from "./base-options.interface.js";

export interface SlsLogTransportOptions extends BaseOptions {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  apiVersion: string;
  projectName: string;
  logStoreName: string;
  topic?: string;
  source?: string;
  httpOptions?: {
    timeout: number; // default no timeout (ms)
  };
}
