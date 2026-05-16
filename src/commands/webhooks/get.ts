/**
 * beaconed webhooks get <id>
 */

import type { Command } from 'commander';
import { getClient, getFormat } from '../../client-bootstrap.js';
import { printJson, printTable } from '../../format.js';
import { run } from '../../error-handler.js';

export default function register(parent: Command): void {
  parent
    .command('get <id>')
    .description('Get detailed info about a webhook')
    .action(async (id: string) => {
      let cmd: Command = parent;
      while (cmd.parent) cmd = cmd.parent;
      const globalOpts = cmd.opts<{
        apiKey?: string;
        baseUrl?: string;
        format?: string;
        verbose?: boolean;
      }>();

      await run(async () => {
        const client = getClient(globalOpts);
        const wh = await client.webhooks.get(id);

        const fmt = getFormat(globalOpts);
        if (fmt === 'json') {
          printJson(wh);
        } else {
          const rows = [
            { field: 'id', value: wh.id },
            { field: 'url', value: wh.url },
            { field: 'status', value: wh.status },
            { field: 'events', value: wh.events.join(', ') },
            { field: 'failure_count', value: String(wh.failure_count) },
            { field: 'last_triggered_at', value: wh.last_triggered_at ?? '' },
            { field: 'last_success_at', value: wh.last_success_at ?? '' },
            { field: 'last_failure_at', value: wh.last_failure_at ?? '' },
            { field: 'last_error', value: wh.last_error ?? '' },
            { field: 'created_at', value: wh.created_at },
            { field: 'updated_at', value: wh.updated_at },
          ];
          printTable(rows, [
            { header: 'Field', key: 'field' },
            { header: 'Value', key: 'value' },
          ]);
        }
      }, globalOpts);
    });
}
