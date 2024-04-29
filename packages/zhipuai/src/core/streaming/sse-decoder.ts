import type { ServerSentEvent } from './interfaces/index.js';

function partition(str: string, delimiter: string): [string, string, string] {
  const index = str.indexOf(delimiter);

  if (index !== -1) {
    return [
      str.substring(0, index),
      delimiter,
      str.substring(index + delimiter.length),
    ];
  }

  return [str, '', ''];
}

export class SSEDecoder {
  private data: string[];
  private event: string | null;
  private chunks: string[];

  constructor() {
    this.event = null;
    this.data = [];
    this.chunks = [];
  }

  decode(line: string) {
    if (line.endsWith('\r')) {
      line = line.substring(0, line.length - 1);
    }

    if (!line) {
      // empty line and we didn't previously encounter any messages
      if (!this.event && !this.data.length) {
        return null;
      }

      const sse: ServerSentEvent = {
        event: this.event,
        data: this.data.join('\n'),
        raw: this.chunks,
      };

      this.event = null;
      this.data = [];
      this.chunks = [];

      return sse;
    }

    this.chunks.push(line);

    if (line.startsWith(':')) {
      return null;
    }

    const partitionResult = partition(line, ':');
    const fieldName = partitionResult[0];
    let value = partitionResult[2];

    if (value.startsWith(' ')) {
      value = value.substring(1);
    }

    if (fieldName === 'event') {
      this.event = value;
    } else if (fieldName === 'data') {
      this.data.push(value);
    }

    return null;
  }
}
