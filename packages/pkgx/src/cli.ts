#!/usr/bin/env node

import { program } from 'commander';

import {
  buildImageCommand,
  buildNestNextCommand,
  buildPackageCommand,
  generateConfigCommand,
  publishCommand,
  replaceModuleSuffixCommand,
  serveCommand,
  serveStaticCommand,
  testCommand,
} from '@/pkgx/commands';
import { getCliVersion, logger } from '@/pkgx/utils';

program.version(getCliVersion(), '-v --version');

const build = program.command('build').description('build resources');

build
  .command('package', { isDefault: true })
  .description('build package')
  .argument('<pkg-relative-path>', 'relative path to pkg root folder')
  .option('--pack', 'pack package after build')
  .option(
    '--app',
    'change default options for application, like disable cjs and dts outputs',
  )
  .action(buildPackageCommand);

build
  .command('image')
  .description('build image')
  .argument('<pkg-relative-path>', 'relative path to pkg root folder')
  .option('--host <host>', 'host name')
  .option('--namespace <namespace>', 'namespace')
  .option('--repo <repo>', 'repo')
  .action(buildImageCommand);

program
  .command('build-nest-next')
  .description('build next in nest application')
  .argument('<pkg-relative-path>', 'relative path to pkg root folder')
  .action(buildNestNextCommand);

program
  .command('serve')
  .description('serve package')
  .argument('<pkg-relative-path>', 'relative path to pkg root folder')
  .action(serveCommand);

program
  .command('serve-static')
  .description('serve static folder')
  .argument('<relative-path>', 'relative path to root folder')
  .option('-p, --port <port>', 'port to listen')
  .action(serveStaticCommand);

program
  .command('test')
  .description('test package')
  .argument('<pkg-relative-path>', 'relative path to pkg root folder')
  .action(testCommand);

program
  .command('publish')
  .description('publish package')
  .argument('<pkg-relative-path>', 'relative path to pkg root folder')
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

generate
  .command('config')
  .description('generate config file')
  .argument('<pkg-relative-path>', 'relative path to pkg root folder')
  .action(generateConfigCommand);

program.hook('preAction', () => {
  logger.logCliVersion();
});

program.commands.map((command) => {
  const name = command.name();
  if (['build', 'serve', 'test', 'publish'].includes(name)) {
    command
      .option('--input-file-name <inputFileName>', 'input file name')
      .option('--input-dir <inputDir>', 'input dir');
  }
});

program.configureOutput({
  writeErr: (str) => {
    if (str.startsWith('error: ')) {
      str = str.replace('error: ', '');
    }

    logger.error(str);
  },
});

program.parse();
