#! /usr/bin/env node

import { program } from 'commander';
import { memoryUsageCommand } from './commands/memory-usage.cmd.js';

program
  .command('memory-usage')
  .description('Get memory usage by pattern')
  .argument('<pattern>', 'pattern to match')
  .option('-h, --host <host>', 'redis host', 'localhost')
  .option('-p, --port <port>', 'redis port', '6379')
  .option('-a, --password <password>', 'redis password')
  .action(memoryUsageCommand);

program.parse();
