/**
 * Creates a fresh Commander program with all commands registered.
 * Used by tests to get a clean program instance per test.
 */

import { Command } from 'commander';
import { registerAll } from '../src/commands/index.js';

export function makeProgram(): Command {
  const program = new Command();
  program
    .name('beaconed')
    .exitOverride() // prevents Commander from calling process.exit on --help
    .option('--api-key <key>', 'API key')
    .option('--base-url <url>', 'API base URL', 'https://beaconed.ai')
    .option('--format <fmt>', 'Output format: table or json', 'table')
    .option('--no-color', 'Disable color')
    .option('--page <n>', 'Page number')
    .option('--per-page <n>', 'Items per page')
    .option('--verbose', 'Verbose errors');
  registerAll(program);
  return program;
}
