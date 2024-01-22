import { resolve } from 'node:path';

import {
  rollup,
  type InputOptions,
  type OutputOptions,
  type RollupBuild,
  type RollupOptions,
} from 'rollup';
import { $, cd } from 'zx';

import { CmdBuildOptions } from '../interfaces/cmd-build-options.interface.js';
import { InternalOptions } from '../interfaces/internal-options.interface.js';
import { PkgxCmdOptions } from '../interfaces/pkgx-cmd-options.interface.js';
import { getRollupOptions } from '../rollup-utils/get-rollup-options.js';
import { handleError } from '../rollup-utils/handle-error.js';
import relativeId from '../rollup-utils/relative-id.js';
import { addCjsPackageJsonFile } from '../utils/add-cjs-package-json-file.util.js';
import { addPackageJsonFile } from '../utils/add-package-json-file.util.js';
import { logger } from '../utils/loggin.util.js';
import { getPkgxOptions } from '../utils/pkgx-options/get-pkgx-options.util.js';

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

  logger.logBundleInfo(String(inputFiles!), outputFiles.join(', '));

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

  logger.logBundleTime(outputFiles.join(', '), Date.now() - start);
}

export async function build(
  pkgRelativePath: string,
  cmdOptions: CmdBuildOptions & PkgxCmdOptions,
  internalOptions: InternalOptions,
) {
  const pkgPath = resolve(process.cwd(), pkgRelativePath);

  cd(pkgPath);

  const pkgxOptions = await getPkgxOptions(cmdOptions, internalOptions);

  if (cmdOptions.app) {
    pkgxOptions.disableCjsOutput = true;
    pkgxOptions.disableDtsOutput = true;
    pkgxOptions.addStartScript = true;
  }

  const rollupOptions = getRollupOptions(pkgxOptions);

  const outputDirName = pkgxOptions.outputDirName;

  await $`rm -rf ${outputDirName}`.quiet();

  for (const options of rollupOptions) {
    await startBundle(options);
  }

  await $`rm -rf ${outputDirName}/esm/.dts`.quiet();

  await addPackageJsonFile(pkgxOptions);
  await addCjsPackageJsonFile(pkgxOptions);

  if (cmdOptions.pack) {
    await $`cd ${outputDirName} && npm pack`.quiet();
  }

  return {
    pkgxOptions,
  };
}

export async function buildCommand(
  pkgRelativePath: string,
  cmdOptions: CmdBuildOptions & PkgxCmdOptions,
) {
  logger.logCliVersion();

  await build(pkgRelativePath, cmdOptions, { cmdName: 'build' });
}
