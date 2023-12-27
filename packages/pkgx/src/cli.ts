#!/usr/bin/env node

import { program } from 'commander';

import { buildCommand } from './commands/build.cmd.js';
import { serveCommand } from './commands/serve.cmd.js';
import { getCliVersion } from './utils/get-cli-version.util.js';

program.version(getCliVersion(), '-v --version');

program
  .command('build')
  .description('build package')
  .argument('<pkg-root-path>', 'package root path')
  .option('-w, --watch', 'watch mode')
  .action(buildCommand);

program
  .command('serve')
  .description('serve package')
  .argument('<pkg-root-path>', 'package root path')
  .action(serveCommand);

program.parse();
