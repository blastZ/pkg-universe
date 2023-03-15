export interface GrpcReply<T = any> {
  data: T & { '@type'?: string };
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
  error?: {
    message: string;
    code: string;
  };
}
