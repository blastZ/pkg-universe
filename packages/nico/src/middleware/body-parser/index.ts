import parse from 'co-body';
import formidable, {
  type Fields,
  type Files,
  type Options as FormidableOptions,
} from 'formidable';
import Koa from 'koa';

import { Context, HttpMethod, Next } from '../../interfaces/index.js';

const jsonTypes = [
  'application/json',
  'application/json-patch+json',
  'application/vnd.api+json',
  'application/csp-report',
];
const formTypes = ['application/x-www-form-urlencoded'];
const textTypes = ['text/plain'];
const xmlTypes = ['text/xml', 'application/xml'];
const multipartTypes = ['multipart/form-data'];

export default function getBodyParser(opts: Partial<Options> = {}) {
  // encoding supported by iconv-lite
  const encoding = 'utf-8';
  const parsedMethods: HttpMethod[] = ['post', 'put', 'patch'];

  const options: Options = {
    parsedMethods,
    encoding: opts.encoding ?? encoding,
    includeRawBody: false,
    jsonOpts: {
      enable: true,
      limit: '1mb',
      strict: true,
      ...opts.jsonOpts,
    },
    formOpts: {
      enable: true,
      limit: '56kb',
      qsOpts: {},
      ...opts.formOpts,
    },
    textOpts: {
      enable: false,
      limit: '1mb',
      ...opts.textOpts,
    },
    xmlOpts: {
      enable: false,
      limit: '1mb',
      ...opts.xmlOpts,
    },
    multipartOpts: {
      enable: false,
      multiples: false,
      ...opts.multipartOpts,
    },
  };

  if (opts.parsedMethods) {
    options.parsedMethods = opts.parsedMethods.map(
      (o) => o.toLowerCase() as HttpMethod,
    );
  }

  if (typeof opts.includeRawBody === 'boolean') {
    options.includeRawBody = opts.includeRawBody;
  }

  const { jsonOpts, formOpts, textOpts, xmlOpts, multipartOpts } = options;

  return async function bodyParser(ctx: Context, next: Next) {
    if (ctx.logger) {
      ctx.logger = ctx.logger?.child({
        stage: 'nico.routeMiddleware.bodyParser',
      });
    }

    ctx?.logger?.trace({
      contentType: ctx.get('content-type'),
      message: 'hit body parser',
    });

    if (
      options.parsedMethods.includes(ctx.method.toLowerCase() as HttpMethod)
    ) {
      try {
        if (multipartOpts.enable && ctx.is(multipartTypes)) {
          const result = await parseMultipart(ctx, multipartOpts.formidable);

          ctx.request.body = result.fields;
          ctx.request.files = result.files;
        } else {
          const result = await parseBody(ctx);

          if (options.includeRawBody) {
            ctx.request.body = result?.parsed ?? {};
            ctx.request.rawBody = result?.raw;
          } else {
            ctx.request.body = result ?? {};
          }
        }
      } catch (err) {
        ctx?.logger?.error(err);

        if (ctx.onBodyParserError) {
          return ctx.onBodyParserError(err);
        }

        throw err;
      }
    }

    await next();
  };

  async function parseBody(ctx: Context) {
    if (jsonOpts.enable && ctx.is(jsonTypes)) {
      return parse.json(ctx, {
        encoding: options.encoding,
        limit: jsonOpts.limit,
        strict: jsonOpts.strict,
        returnRawBody: options.includeRawBody,
      });
    }

    if (formOpts.enable && ctx.is(formTypes)) {
      return parse.form(ctx, {
        encoding: options.encoding,
        limit: formOpts.limit,
        queryString: formOpts.qsOpts,
        returnRawBody: options.includeRawBody,
      });
    }

    if (textOpts.enable && ctx.is(textTypes)) {
      return parse.text(ctx, {
        encoding: options.encoding,
        limit: options.textOpts.limit,
        returnRawBody: options.includeRawBody,
      });
    }

    if (xmlOpts.enable && ctx.is(xmlTypes)) {
      return parse.text(ctx, {
        encoding: options.encoding,
        limit: options.xmlOpts.limit,
        returnRawBody: options.includeRawBody,
      });
    }

    return {};
  }

  async function parseMultipart(
    ctx: Context,
    formidableOpts: Partial<FormidableOptions> = {},
  ): Promise<{ fields: Fields; files: Files }> {
    return new Promise((resolve, reject) => {
      const form = formidable(formidableOpts);

      form.parse(ctx.req, (err, fields, files) => {
        if (err) {
          reject(err);

          return;
        }

        resolve({ fields, files });
      });
    });
  }
}

declare module 'koa' {
  interface Request extends Koa.BaseRequest {
    body?: any;
    rawBody?: string;
    files?: Files;
  }
}

export interface Options {
  parsedMethods: HttpMethod[];
  includeRawBody: boolean;
  encoding: string;
  jsonOpts: JsonOpts;
  formOpts: FormOpts;
  textOpts: TextOpts;
  xmlOpts: XmlOpts;
  multipartOpts: MultipartOpts;
}

interface BaseParseOptions {
  enable?: boolean;
  limit?: string; // '1mb' for json, '56kb' for form-urlencoded
}

export interface MultipartOpts {
  enable?: boolean;
  multiples?: boolean;
  formidable?: Partial<FormidableOptions>;
}

export interface JsonOpts extends BaseParseOptions {
  strict?: boolean; // only parse array and object, default is true
}

export interface TextOpts extends BaseParseOptions {}

export interface FormOpts extends BaseParseOptions {
  qsOpts?: qs.IParseOptions; // qs module parse options
}

export interface XmlOpts extends BaseParseOptions {}
