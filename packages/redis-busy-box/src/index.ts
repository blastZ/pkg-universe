#! /usr/bin/env node

import { program } from 'commander';

import { countKeysCommand } from './commands/count-keys.cmd.js';
import { deleteKeysCommand } from './commands/delete-keys.cmd.js';
import { exportKeysCommand } from './commands/export-keys.cmd.js';
import { listKeysCommand } from './commands/list-keys.cmd.js';
import { memoryUsageCommand } from './commands/memory-usage.cmd.js';
import { getCliVersion } from './utils/get-sdk-version.util.js';

program
  .command('memory-usage')
  .description('Get memory usage by pattern')
  .argument('<pattern>', 'pattern to match')
  .action(memoryUsageCommand);

program
  .command('count-keys')
  .description('Get count of keys by pattern')
  .argument('<pattern>', 'pattern to match')
  .action(countKeysCommand);

program
  .command('list-keys')
  .description('List keys by pattern')
  .argument('<pattern>', 'pattern to match')
  .option('--count <count>', 'scan count for each iteration', '1000')
  .option('--show-values', 'show values')
  .action(listKeysCommand);

program
  .command('export-keys')
  .description('Export keys by pattern')
  .argument('<pattern>', 'pattern to match')
  .action(exportKeysCommand);

program
  .command('delete-keys')
  .description('Delete keys by pattern')
  .argument('<pattern>', 'pattern to match')
  .option('--count <count>', 'scan count for each iteration', '1000')
  .option('--show-values', 'show values')
  .action(deleteKeysCommand);

program.commands.map((command) => {
  command
    .option('-H, --host <host>', 'redis host', 'localhost')
    .option('-p, --port <port>', 'redis port', '6379')
    .option('-a, --password <password>', 'redis password')
    .option('-n --db <db>', 'redis db', '0');
});

program.version(getCliVersion(), '-v --version');

program.parse();
