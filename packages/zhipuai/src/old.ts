// import axios from 'axios';

// import { type RequestOptions } from '@/core/api-client';
// import { Chat } from '@/resources/chat';
// import { generateToken, printDiagnostics } from '@/utils';

// import type { ZhipuAIOptions } from './interfaces/zhipu-ai-options.interface.js';

// export class ZhipuAI {
//   chat = new Chat(this);

//   private cachedToken:
//     | undefined
//     | {
//         token: string;
//         exp: number;
//       };

//   private options: ZhipuAIOptions = {
//     apiKey: '',
//     apiPrefix: 'https://open.bigmodel.cn/api/paas/v4',
//     browser: false,
//     tokenTTL: 3 * 60 * 1000,
//     tokenRefreshTTL: 30 * 1000,
//   };

//   constructor(opts: Partial<ZhipuAIOptions> = {}) {
//     this.options = {
//       ...this.options,
//       ...opts,
//     };

//     if (!opts.browser && !opts.apiKey) {
//       this.options.apiKey = process.env['ZHIPU_AI_API_KEY'] || '';
//     }

//     if (!this.options.apiKey) {
//       throw new Error('ERR_INVALID_ZHIPU_AI_API_KEY');
//     }
//   }

//   private getToken() {
//     if (
//       this.cachedToken &&
//       this.cachedToken.exp - this.options.tokenRefreshTTL > Date.now()
//     ) {
//       return this.cachedToken.token;
//     }

//     this.cachedToken = undefined;

//     const now = Date.now();
//     const token = generateToken(
//       this.options.apiKey,
//       now,
//       this.options.tokenTTL,
//     );

//     this.cachedToken = {
//       token,
//       exp: now + this.options.tokenTTL,
//     };

//     return token;
//   }

//   private buildApiUrl(path: string) {
//     return this.options.apiPrefix + path;
//   }

//   // private buildAxiosRequestConfig(
//   //   invokeType: InvokeType,
//   //   options: Pick<RequestOptions, 'timeout' | 'token'>,
//   // ): AxiosRequestConfig {
//   //   const token = this.getToken(options);

//   //   if (invokeType === InvokeType.SSE) {
//   //     return {
//   //       headers: {
//   //         Authorization: token,
//   //         'Content-Type': 'application/json',
//   //         Accept: 'text/event-stream',
//   //       },
//   //       timeout: options.timeout || 30 * 1000,
//   //       responseType: 'stream',
//   //     };
//   //   }

//   //   return {
//   //     headers: {
//   //       Authorization: token,
//   //       'Content-Type': 'application/json',
//   //     },
//   //     timeout: options.timeout || 30 * 1000,
//   //   };
//   // }

//   // async asyncInvoke(
//   //   options: ChatModelRequestOptions | CharacterModelRequestOptions,
//   // ): Promise<AsyncInvokeResponse['data']> {
//   //   return this.request(InvokeType.Async, options);
//   // }

//   // async queryAsyncInvokeResult(
//   //   taskId: string,
//   //   options: Pick<RequestOptions, 'timeout' | 'token'> = {},
//   // ): Promise<InvokeResponse['data']> {
//   //   try {
//   //     const { data } = await axios.get(
//   //       `${this.buildApiUrl('-', InvokeType.Async)}/${taskId}`,
//   //       this.buildAxiosRequestConfig(InvokeType.Async, options),
//   //     );

//   //     this.handleError(data);

//   //     return data.data;
//   //   } catch (err) {
//   //     throw err;
//   //   }
//   // }

//   // async sseInvoke(
//   //   options: ChatModelRequestOptions | CharacterModelRequestOptions,
//   // ) {
//   //   try {
//   //     const pendingEvent: ParseEvent = {
//   //       type: 'event',
//   //       id: '',
//   //       event: 'pending',
//   //       data: '',
//   //     };

//   //     let lastEvent: ParseEvent = pendingEvent;

//   //     const { data: stream } = await axios.post(
//   //       this.buildApiUrl(options.model, InvokeType.SSE),
//   //       this.buildRequestBody(options),
//   //       this.buildAxiosRequestConfig(InvokeType.SSE, options),
//   //     );

//   //     const parser = createParser(
//   //       (e) => {
//   //         lastEvent = e;
//   //       },
//   //       {
//   //         customFields: ['meta'],
//   //       },
//   //     );

//   //     const decoder = new StringDecoder();

//   //     async function* events() {
//   //       for await (const chunk of stream) {
//   //         lastEvent = pendingEvent;

//   //         // Ensure the decoded string does not contain any incomplete multibyte characters
//   //         const chunkString = decoder.write(chunk);

//   //         parser.feed(chunkString);

//   //         if (lastEvent.type === 'event') {
//   //           if (lastEvent.event === 'finish') {
//   //             try {
//   //               // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   //               // @ts-ignore
//   //               lastEvent.meta = JSON.parse(lastEvent.meta);
//   //             } catch {
//   //               throw new Error('ERR_INVALID_FINISH_META');
//   //             }
//   //           }
//   //         }

//   //         yield lastEvent as SSEResponse;
//   //       }
//   //     }

//   //     return events();
//   //   } catch (err) {
//   //     throw err;
//   //   }
//   // }

//   async post(path: string, options: RequestOptions) {
//     try {
//       printDiagnostics({ path, options });

//       const { data } = await axios.post(this.buildApiUrl(path), options.body, {
//         headers: {
//           Authorization: this.getToken(),
//           'Content-Type': 'application/json',
//         },
//         timeout: options.timeout || 30 * 1000,
//       });

//       return data;
//     } catch (err) {
//       printDiagnostics(err);

//       throw err;
//     }
//   }
// }
