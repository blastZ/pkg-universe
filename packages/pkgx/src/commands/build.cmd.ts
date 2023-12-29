import { resolve } from 'node:path';

import chalk from 'chalk';
import ms from 'pretty-ms';
import {
  rollup,
  type InputOptions,
  type OutputOptions,
  type RollupBuild,
  type RollupOptions,
} from 'rollup';
import { $, cd } from 'zx';

import { CmdBuildOptions } from '../interfaces/cmd-build-options.interface.js';
import { fillOptionsWithDefaultValue } from '../rollup-utils/fill-options-with-default-value.js';
import { getRollupOptions } from '../rollup-utils/get-rollup-options.js';
import { handleError } from '../rollup-utils/handle-error.js';
import relativeId from '../rollup-utils/relative-id.js';
import { addCjsPackageJsonFile } from '../utils/add-cjs-package-json-file.util.js';
import { addPackageJsonFile } from '../utils/add-package-json-file.util.js';
import { getCliVersion } from '../utils/get-cli-version.util.js';
import { getPkgxOptions } from '../utils/get-pkgx-options.util.js';

async function generateOutputs(
  bundle: RollupBuild,
  outputOptionsList: OutputOptions[],
) {
  for (const outputOptions of outputOptionsList) {
    await bundle.write(outputOptions);
    // const { output } = await bundle.write(outputOptions);

    // for (const chunkOrAsset of output) {
    //   if (chunkOrAsset.type === 'asset') {
    //     console.log('Asset', chunkOrAsset);
    //   } else {
    //     console.log('Chunk', chunkOrAsset.modules);
    //   }
    // }
  }
}

async function startBundle(options: RollupOptions) {
  const start = Date.now();

  const inputOptions = options as InputOptions;
  const outputOptionsList = options.output as OutputOptions[];

  const inputFiles = inputOptions.input;
  const outputFiles = outputOptionsList.map((o) =>
    relativeId(o.file || o.dir!),
  );

  console.log(
    chalk.cyan(
      `\n${chalk.bold(inputFiles!)} → ${chalk.bold(outputFiles.join(', '))}...`,
    ),
  );

  let bundle: RollupBuild | undefined;
  try {
    bundle = await rollup(options);

    await generateOutputs(bundle, outputOptionsList);
  } catch (err: any) {
    handleError(err);
  } finally {
    if (bundle) {
      await bundle.close();
    }
  }

  console.log(
    chalk.green(
      `created ${chalk.bold(outputFiles.join(', '))} in ${chalk.bold(
        ms(Date.now() - start),
      )}`,
    ),
  );
}

async function build(pkgRelativePath: string, cmdOptions: CmdBuildOptions) {
  console.log(chalk.underline(`pkgx v${getCliVersion()}`));

  const pkgPath = resolve(process.cwd(), pkgRelativePath);

  cd(pkgPath);

  const pkgxOptions = await getPkgxOptions();

  const filledPkgxOptions = fillOptionsWithDefaultValue(pkgxOptions);

  const rollupOptions = getRollupOptions(filledPkgxOptions);

  const outputDirName = filledPkgxOptions.outputDirName;

  await $`rm -rf ${outputDirName}`.quiet();

  for (const options of rollupOptions) {
    await startBundle(options);
  }

  await $`rm -rf ${outputDirName}/esm/.dts`.quiet();

  await addPackageJsonFile(filledPkgxOptions);
  await addCjsPackageJsonFile(filledPkgxOptions);

  if (cmdOptions.pack) {
    await $`cd ${outputDirName} && npm pack`.quiet();
  }
}

export async function buildCommand(
  pkgRelativePath: string,
  options: CmdBuildOptions,
) {
  await build(pkgRelativePath, options);
}
