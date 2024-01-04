#!/usr/bin/env node

import { program } from 'commander';

import { buildCommand } from './commands/build.cmd.js';
import { publishCommand } from './commands/publish.cmd.js';
import { serveCommand } from './commands/serve.cmd.js';
import { getCliVersion } from './utils/get-cli-version.util.js';

program.version(getCliVersion(), '-v --version');

program
  .command('build')
  .description('build package')
  .argument('<pkg-relative-path>', 'relative path to pkg root folder')
  .option('--pack', 'pack package after build')
  .option(
    '--app',
    'change default options for application, like disable cjs and dts outputs',
  )
  .action(buildCommand);

program
  .command('serve')
  .description('serve package')
  .argument('<pkg-relative-path>', 'relative path to pkg root folder')
  .action(serveCommand);

program
  .command('publish')
  .description('publish package')
  .argument('<pkg-relative-path>', 'relative path to pkg root folder')
  .action(publishCommand);

program.parse();
