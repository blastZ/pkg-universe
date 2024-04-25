import { APIClient } from '@/core/api-client';
import { ZhipuAIError } from '@/errors';
import type { ZhipuAIClientOptions } from '@/interfaces';
import { Chat } from '@/resources/chat';
import { isRunningInBrowser, readEnv } from '@/utils';

export class ZhipuAI extends APIClient {
  apiKey: string;
  organization: string | null;
  project: string | null;

  private options: ZhipuAIClientOptions;

  constructor({
    baseURL = readEnv('ZHIPUAI_BASE_URL'),
    apiKey = readEnv('ZHIPUAI_API_KEY'),
    organization = readEnv('ZHIPUAI_ORG_ID') ?? null,
    project = readEnv('ZHIPUAI_PROJECT_ID') ?? null,
    ...opts
  }: ZhipuAIClientOptions = {}) {
    if (apiKey === undefined) {
      throw new ZhipuAIError(
        'The ZHIPUAI_API_KEY environment variable is missing or empty; ' +
          'either provide it, or instantiate the ZhipuAI client with an apiKey option, ' +
          "like new ZhipuAI({ apiKey: 'My API Key' }).",
      );
    }

    const options: ZhipuAIClientOptions = {
      apiKey,
      organization,
      project,
      ...opts,
      baseURL: baseURL || `https://open.bigmodel.cn/api/paas/v4`,
    };

    if (!options.dangerouslyAllowBrowser && isRunningInBrowser()) {
      throw new ZhipuAIError(
        "It looks like you're running in a browser-like environment.\n\n" +
          'This is disabled by default, as it risks exposing your secret API credentials to attackers.\n' +
          'If you understand the risks and have appropriate mitigations in place,\n' +
          'you can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\n' +
          'new ZhipuAI({ apiKey, dangerouslyAllowBrowser: true });\n',
      );
    }

    super({
      baseURL: options.baseURL!,
      timeout: options.timeout ?? 10 * 60 * 1000,
      httpAgent: options.httpAgent,
      maxRetries: options.maxRetries,
      fetch: options.fetch,
    });

    this.options = options;

    this.apiKey = apiKey;
    this.organization = organization;
    this.project = project;
  }

  chat = new Chat(this);

  protected override defaultQuery() {
    return this.options.defaultQuery;
  }
}
