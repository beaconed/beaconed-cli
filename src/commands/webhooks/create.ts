/**
 * beaconed webhooks create
 */

import type { Command } from 'commander';
import { getClientResult, getFormat } from '../../client-bootstrap.js';
import { printJson, printDryRun, parseCommaSeparated } from '../../format.js';
import { run } from '../../error-handler.js';
import chalk from 'chalk';

export default function register(parent: Command): void {
  parent
    .command('create')
    .description('Create a new webhook subscription')
    .requiredOption('--url <url>', 'HTTPS URL to receive webhook deliveries')
    .requiredOption('--events <events>', 'Comma-separated event names to subscribe to')
    .option('--description <desc>', 'Optional description (stored client-side; not sent to API)')
    .action(async (cmdOpts: { url: string; events: string; description?: string }) => {
      let cmd: Command = parent;
      while (cmd.parent) cmd = cmd.parent;
      const globalOpts = cmd.opts<{
        apiKey?: string;
        baseUrl?: string;
        format?: string;
        verbose?: boolean;
        dryRun?: boolean;
      }>();

      await run(async () => {
        const { client, dryRun, baseUrl } = getClientResult(globalOpts);

        const events = parseCommaSeparated(cmdOpts.events) ?? [];
        const body = { webhook: { url: cmdOpts.url, events } };

        if (dryRun) {
          printDryRun('POST', `${baseUrl}/api/v1/webhooks`, body);
          return;
        }

        const wh = await client.webhooks.create({
          url: cmdOpts.url,
          events: events as Parameters<typeof client.webhooks.create>[0]['events'],
        });

        const fmt = getFormat(globalOpts);
        if (fmt === 'json') {
          printJson(wh);
        } else {
          const isTTY = process.stdout.isTTY === true;
          process.stdout.write(`Webhook created: ${wh.id}\n`);
          process.stdout.write(`URL: ${wh.url}\n`);
          process.stdout.write(`Events: ${wh.events.join(', ')}\n`);
          process.stdout.write('\n');
          const secretLabel = 'SECRET (shown once — store it now):';
          process.stdout.write(
            isTTY
              ? `${chalk.bold(secretLabel)} ${chalk.bold(wh.secret)}\n`
              : `${secretLabel} ${wh.secret}\n`,
          );
        }
      }, globalOpts);
    });
}
