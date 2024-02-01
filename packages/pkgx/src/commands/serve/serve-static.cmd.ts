import { createServer } from 'node:http';

import handler from 'serve-handler';

import { CmdServeStaticOptions } from '../../interfaces/cmd-serve-static-options.interface.js';
import { logger } from '../../utils/loggin.util.js';

async function serve(relativePath: string, options: CmdServeStaticOptions) {
  const server = createServer(async (request, response) => {
    const start = Date.now();

    logger.logServeStaticRequest(request.method, request.url);

    if (options.cors) {
      response.setHeader('Access-Control-Allow-Origin', '*');
      response.setHeader('Access-Control-Allow-Headers', '*');
      response.setHeader('Access-Control-Allow-Credentials', 'true');
      response.setHeader('Access-Control-Allow-Private-Network', 'true');
    }

    await handler(request, response, {
      public: relativePath,
    });

    logger.logServeStaticTime(response.statusCode, Date.now() - start);
  });

  const port = Number(options.port || 80);

  server.listen(port, () => {
    logger.info(`running at port ${port}`);
  });
}

export async function serveStaticCommand(
  relativePath: string,
  options: CmdServeStaticOptions,
) {
  await serve(relativePath, options);
}
