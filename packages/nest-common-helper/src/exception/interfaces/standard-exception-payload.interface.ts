export interface StandardExceptionPayload {
  data?: any;
  error?: {
    code: string;
    message: string;
  };
  meta?: any;
}
