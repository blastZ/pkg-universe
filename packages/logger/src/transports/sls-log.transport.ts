import $SDK from "aliyun-sdk";
import { MESSAGE } from "triple-beam";
import { format } from "winston";
import Transport, { TransportStreamOptions } from "winston-transport";
import { createJsonFormat, createTimestampFormat } from "../formats/index.js";
import { SlsLogTransportOptions } from "../interfaces/index.js";

class SlsLogTransport extends Transport {
  private client: $SDK.SLS;
  private options: SlsLogTransportOptions;

  constructor(opts: SlsLogTransportOptions & TransportStreamOptions) {
    super(opts);

    this.options = opts;
    this.client = new $SDK.SLS(opts);
  }

  log(info: any, next: () => void) {
    this.client.putLogs(
      {
        projectName: info.sls?.projectName || this.options.projectName,
        logStoreName: info.sls?.logStoreName || this.options.logStoreName,
        logGroup: {
          logs: [
            {
              time: new Date(info.timestamp).getTime() / 1000,
              contents: [
                {
                  key: "info",
                  value: info[MESSAGE],
                },
              ],
            },
          ],
          topic: info.sls?.topic || this.options.topic,
          source: info.sls?.source || this.options.source,
        },
      },
      (error) => {
        if (error) {
          if (error instanceof Error) {
            throw error;
          }

          throw new Error(error.error_message);
        }

        return next();
      }
    );
  }
}

export function createSlsLogTransport(opts: SlsLogTransportOptions) {
  const formats = [createTimestampFormat(), createJsonFormat()];

  return new SlsLogTransport({
    format: format.combine(...formats),
    ...opts,
  });
}

/**
 * References
 *
 * https://github.com/aliyun-UED/aliyun-sdk-js/blob/master/samples/sls/Readme.md
 */
