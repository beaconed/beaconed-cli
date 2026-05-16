#!/usr/bin/env node
import { Command } from 'commander';
import { resolveConfig } from './config.js';
import { registerAll } from './commands/index.js';

const program = new Command();

program
  .name('beaconed')
  .description('Command-line interface for the Beaconed v1 API')
  .version('0.0.1')
  .option('--api-key <key>', 'API key (overrides BEACONED_API_KEY env and config file)')
  .option('--base-url <url>', 'API base URL (overrides BEACONED_BASE_URL env)', 'https://beaconed.ai')
  .option('--format <fmt>', 'Output format: table or json (overrides BEACONED_FORMAT env)', 'table')
  .option('--no-color', 'Disable ANSI color output')
  .option('--page <n>', 'Page number for list commands')
  .option('--per-page <n>', 'Items per page for list commands')
  .option('--verbose', 'Show full error stack traces');

// health — smoke-test placeholder
program
  .command('health')
  .description('Check CLI wiring (placeholder)')
  .action(() => {
    // Resolve config so wiring is exercised; ignore errors for this smoke command
    try {
      const opts = program.opts();
      resolveConfig({
        apiKey: opts['apiKey'] as string | undefined,
        baseUrl: opts['baseUrl'] as string | undefined,
        format: opts['format'] as string | undefined,
      });
    } catch {
      // health command intentionally succeeds even without a key
    }
    process.stdout.write('ok\n');
    process.exit(0);
  });

// Register all command groups
registerAll(program);

program.parseAsync(process.argv).catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`error: ${message}\n`);
  process.exit(3);
});
