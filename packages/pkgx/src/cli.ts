#!/usr/bin/env node

import { program, type Command } from 'commander';

import {
  buildAppCommand,
  buildImageCommand,
  buildNestNextCommand,
  buildPackageCommand,
  generateConfigCommand,
  generateDockerCommand,
  publishCommand,
  replaceModuleSuffixCommand,
  serveAppCommand,
  serveStaticCommand,
  testCommand,
} from '@/pkgx/commands';
import { getCliVersion, logger } from '@/pkgx/utils';

program.version(getCliVersion(), '-v --version');

const build = program.command('build').description('build resources');

const buildPackage = build
  .command('package', { isDefault: true })
  .description('build package')
  .option('--pack', 'pack package after build')
  .action(buildPackageCommand);

const buildImage = build
  .command('image')
  .description('build image')
  .option('--host <host>', 'host name')
  .option('--namespace <namespace>', 'namespace')
  .option('--repo <repo>', 'repo')
  .option(
    '--progress <progress>',
    'type of progress output (auto, plain, tty). Use plain to show container output (default "auto")',
  )
  .option('--no-cache', 'do not use cache when building the image')
  .option('--target <target>', 'set target build stage to build')
  .option('--debug', 'debug mode, set progress to plain and no-cache to true')
  .option('--dry-run', 'dry run')
  .action(buildImageCommand);

const buildApp = build
  .command('application')
  .alias('app')
  .description('build application based package')
  .action(buildAppCommand);

const buildNestNext = build
  .command('nest-next')
  .description('build next in nest application')
  .action(buildNestNextCommand);

const serve = program.command('serve').description('serve resources');

const serveApp = serve
  .command('application', { isDefault: true })
  .alias('app')
  .description('serve application based package')
  .action(serveAppCommand);

const serveStatic = serve
  .command('static')
  .description('serve static based package')
  .option('-p, --port <port>', 'port to listen')
  .option('--cors', 'enable cors')
  .action(serveStaticCommand);

const test = program
  .command('test')
  .description('test package')
  .action(testCommand);

const publish = program
  .command('publish')
  .description('publish package')
  .action(publishCommand);

program
  .command('replace-module-suffix')
  .description('replace module suffix')
  .argument('<relative-path>', 'relative path to file or folder')
  .argument('<old-suffix>', 'old suffix')
  .argument('<new-suffix>', 'new suffix')
  .option('--index-dirs [indexDirs...]', 'replace suffix with index file path')
  .action(replaceModuleSuffixCommand);

const generate = program
  .command('generate')
  .alias('g')
  .description('generate resources');

const generateConfig = generate
  .command('config')
  .description('generate config file')
  .action(generateConfigCommand);

generate
  .command('docker')
  .description('generate docker file')
  .action(generateDockerCommand);

program.hook('preAction', () => {
  logger.logCliVersion();
});

function addPkgxCmdOptions(commands: readonly Command[]) {
  commands.forEach((command) => {
    command.option('--input-file-name <inputFileName>', 'input file name');
    command.option('--input-dir <inputDir>', 'input dir');
  });
}

function addPackageRelativePathOption(commands: readonly Command[]) {
  commands.forEach((command) => {
    command.argument('<pkg-relative-path>', 'relative path to pkg root folder');
  });
}

addPackageRelativePathOption([
  buildPackage,
  buildImage,
  buildApp,
  buildNestNext,
  serveApp,
  serveStatic,
  test,
  publish,
  generateConfig,
]);

addPkgxCmdOptions([
  buildPackage,
  buildApp,
  buildNestNext,
  serveApp,
  test,
  publish,
]);

program.configureOutput({
  writeErr: (str) => {
    if (str.startsWith('error: ')) {
      str = str.replace('error: ', '');
    }

    logger.error(str);
  },
});

program.parse();
