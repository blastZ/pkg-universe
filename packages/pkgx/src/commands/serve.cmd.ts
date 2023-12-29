import { ChildProcess, fork } from 'node:child_process';
import { resolve } from 'node:path';

import chalk from 'chalk';
import dayjs from 'dayjs';
import ms from 'pretty-ms';
import { watch, type RollupOptions } from 'rollup';
import { cd } from 'zx';

import { fillOptionsWithDefaultValue } from '../rollup-utils/fill-options-with-default-value.js';
import { getRollupOptions } from '../rollup-utils/get-rollup-options.js';
import { getStartFilePath } from '../rollup-utils/get-start-file-path.util.js';
import { handleError } from '../rollup-utils/handle-error.js';
import relativeId from '../rollup-utils/relative-id.js';
import { getCliVersion } from '../utils/get-cli-version.util.js';
import { getPkgxOptions } from '../utils/get-pkgx-options.util.js';

function startWatch(rollupOptions: RollupOptions[]) {
  const startFilePath = getStartFilePath(rollupOptions as any);

  let child: ChildProcess | null = null;
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

        console.log(
          chalk.cyan(
            `bundles ${chalk.bold(input)} → ${chalk.bold(
              event.output.map(relativeId).join(', '),
            )}...`,
          ),
        );

        break;
      }

      case 'BUNDLE_END': {
        console.log(
          chalk.green(
            `created ${chalk.bold(
              event.output.map(relativeId).join(', '),
            )} in ${chalk.bold(ms(event.duration))}`,
          ),
        );

        if (child) {
          child.kill();

          child = null;
        }

        child = fork(startFilePath);

        break;
      }

      case 'END': {
        console.log(`\n[${dayjs().format()}] waiting for changes...`);
      }
    }
  });
}

async function serve(pkgRelativePath: string) {
  console.log(chalk.underline(`pkgx v${getCliVersion()}`));

  const pkgPath = resolve(process.cwd(), pkgRelativePath);

  cd(pkgPath);

  const pkgxOptions = await getPkgxOptions();

  const filledPkgxOptions = fillOptionsWithDefaultValue(pkgxOptions);

  const rollupOptions = getRollupOptions(filledPkgxOptions);

  startWatch(rollupOptions);
}

export async function serveCommand(pkgRelativePath: string) {
  await serve(pkgRelativePath);
}
