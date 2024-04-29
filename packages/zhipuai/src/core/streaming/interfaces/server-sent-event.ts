export type ServerSentEvent = {
  event: string | null;
  data: string;
  raw: string[];
};
