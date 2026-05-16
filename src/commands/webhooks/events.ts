/**
 * beaconed webhooks events
 *
 * Returns the global webhook event catalog (GET /api/v1/webhooks/events).
 */

import type { Command } from 'commander';
import { getClient, getFormat } from '../../client-bootstrap.js';
import { printJson, printTable } from '../../format.js';
import { run } from '../../error-handler.js';

export default function register(parent: Command): void {
  parent
    .command('events')
    .description('List all available webhook event types')
    .action(async () => {
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
        const result = await client.webhooks.events();

        const fmt = getFormat(globalOpts);
        if (fmt === 'json') {
          printJson(result.data);
        } else {
          printTable(result.data as unknown as Record<string, unknown>[], [
            { header: 'Event', key: 'name' },
            { header: 'Description', key: 'description' },
          ]);
        }
      }, globalOpts);
    });
}
