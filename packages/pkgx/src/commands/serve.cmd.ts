import { ChildProcess, fork } from 'node:child_process';
import { resolve } from 'node:path';
import { clearTimeout } from 'node:timers';

import { watch, type RollupOptions } from 'rollup';
import { cd } from 'zx';

import { PkgxOptions } from '../index.js';
import { PkgxCmdOptions } from '../interfaces/pkgx-cmd-options.interface.js';
import { getRollupOptions } from '../rollup-utils/get-rollup-options.js';
import { handleError } from '../rollup-utils/handle-error.js';
import relativeId from '../rollup-utils/relative-id.js';
import { logger } from '../utils/loggin.util.js';
import { getPkgxOptions } from '../utils/pkgx-options/get-pkgx-options.util.js';

function startWatch(
  pkgxOptions: Required<PkgxOptions>,
  rollupOptions: RollupOptions[],
) {
  let child: ChildProcess | null = null;

  const startChild = () => {
    child = fork(`${pkgxOptions.outputDirName}/esm/index.js`, {
      execArgv: ['--enable-source-maps'],
    });
  };

  const watcher = watch(rollupOptions);

  watcher.on('event', (event) => {
    switch (event.code) {
      case 'ERROR': {
        handleError(event.error, true);

        break;
      }

      case 'START': {
        // console.log(chalk.underline(`rollup v${rollup.VERSION}`));

        break;
      }

      case 'BUNDLE_START': {
        let input = event.input;

        if (typeof input !== 'string') {
          input = Array.isArray(input)
            ? input.join(', ')
            : Object.values(input as Record<string, string>).join(', ');
        }

        logger.logBundleInfo(input, event.output.map(relativeId).join(', '));

        break;
      }

      case 'BUNDLE_END': {
        logger.logBundleTime(
          event.output.map(relativeId).join(', '),
          event.duration,
        );

        break;
      }

      case 'END': {
        if (child) {
          let isExited = false;

          child.kill('SIGTERM');

          const timer = setTimeout(() => {
            if (child && !isExited) {
              logger.logForceRestart();

              child.kill('SIGKILL');
            }
          }, 5000);

          child.on('exit', () => {
            isExited = true;
            clearTimeout(timer);

            startChild();
          });

          child.on('error', (err) => {
            logger.error(err.message);
          });
        } else {
          startChild();
        }

        logger.logWaitingForChanges();
      }
    }

    if ('result' in event && event.result) {
      event.result.close().catch((error) => handleError(error, true));
    }
  });
}

async function serve(pkgRelativePath: string, cmdOptions: PkgxCmdOptions) {
  const pkgPath = resolve(process.cwd(), pkgRelativePath);

  cd(pkgPath);

  const pkgxOptions = await getPkgxOptions(cmdOptions, { cmdName: 'serve' });

  const rollupOptions = getRollupOptions(pkgxOptions);

  startWatch(pkgxOptions, rollupOptions);
}

export async function serveCommand(
  pkgRelativePath: string,
  cmdOptions: PkgxCmdOptions,
) {
  logger.logCliVersion();

  await serve(pkgRelativePath, cmdOptions);
}
