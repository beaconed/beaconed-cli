/**
 * beaconed webhooks delete <id>
 */

import type { Command } from 'commander';
import { getClientResult } from '../../client-bootstrap.js';
import { printDryRun } from '../../format.js';
import { run } from '../../error-handler.js';

export default function register(parent: Command): void {
  parent
    .command('delete <id>')
    .description('Delete a webhook subscription')
    .action(async (id: string) => {
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

        if (dryRun) {
          printDryRun('DELETE', `${baseUrl}/api/v1/webhooks/${encodeURIComponent(id)}`, null);
          return;
        }

        await client.webhooks.delete(id);
        process.stdout.write(`Deleted webhook ${id}\n`);
      }, globalOpts);
    });
}
