export interface SSEResponse {
  type: 'event';
  id: string;
  event: 'add' | 'finish';
  data: string;
}
