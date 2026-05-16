/**
 * beaconed webhooks update <id>
 */

import type { Command } from 'commander';
import { getClientResult, getFormat } from '../../client-bootstrap.js';
import { printJson, printTable, printDryRun, parseCommaSeparated } from '../../format.js';
import { run } from '../../error-handler.js';

export default function register(parent: Command): void {
  parent
    .command('update <id>')
    .description('Update a webhook subscription (partial update)')
    .option('--url <url>', 'New HTTPS URL')
    .option('--events <events>', 'Comma-separated event names (replaces existing list)')
    .option('--status <status>', 'Status: active or paused')
    .action(async (id: string, cmdOpts: { url?: string; events?: string; status?: string }) => {
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

        const events = parseCommaSeparated(cmdOpts.events);
        const input = {
          ...(cmdOpts.url !== undefined && { url: cmdOpts.url }),
          ...(events !== undefined && { events }),
          ...(cmdOpts.status !== undefined && { status: cmdOpts.status }),
        };

        if (dryRun) {
          printDryRun('PATCH', `${baseUrl}/api/v1/webhooks/${encodeURIComponent(id)}`, { webhook: input });
          return;
        }

        const wh = await client.webhooks.update(id, {
          url: cmdOpts.url,
          events,
          status: cmdOpts.status as 'active' | 'paused' | undefined,
        });

        const fmt = getFormat(globalOpts);
        if (fmt === 'json') {
          printJson(wh);
        } else {
          printTable(
            [
              { field: 'id', value: wh.id },
              { field: 'url', value: wh.url },
              { field: 'status', value: wh.status },
              { field: 'events', value: wh.events.join(', ') },
              { field: 'updated_at', value: wh.updated_at },
            ],
            [
              { header: 'Field', key: 'field' },
              { header: 'Value', key: 'value' },
            ],
          );
        }
      }, globalOpts);
    });
}
