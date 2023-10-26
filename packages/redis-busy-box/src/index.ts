#! /usr/bin/env node

import { program } from 'commander';

import { countKeysCommand } from './commands/count-keys.cmd.js';
import { exportKeysCommand } from './commands/export-keys.cmd.js';
import { memoryUsageCommand } from './commands/memory-usage.cmd.js';

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
  .command('export-keys')
  .description('Export keys by pattern')
  .argument('<pattern>', 'pattern to match')
  .action(exportKeysCommand);

program.commands.map((command) => {
  command
    .option('-H, --host <host>', 'redis host', 'localhost')
    .option('-p, --port <port>', 'redis port', '6379')
    .option('-a, --password <password>', 'redis password');
});

program.parse();
