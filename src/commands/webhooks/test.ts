/**
 * beaconed webhooks test <id>
 */

import type { Command } from 'commander';
import { getClientResult, getFormat } from '../../client-bootstrap.js';
import { printJson, printTable, printDryRun } from '../../format.js';
import { run } from '../../error-handler.js';

export default function register(parent: Command): void {
  parent
    .command('test <id>')
    .description('Send a test event to a webhook')
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
          printDryRun('POST', `${baseUrl}/api/v1/webhooks/${encodeURIComponent(id)}/test`, null);
          return;
        }

        const result = await client.webhooks.test(id);

        const fmt = getFormat(globalOpts);
        if (fmt === 'json') {
          printJson(result);
        } else {
          printTable(
            [
              { field: 'webhook_id', value: result.webhook_id },
              { field: 'message', value: result.message },
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
