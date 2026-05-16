/**
 * beaconed products sync <id>
 * EXPENSIVE: 10 req/min rate limit.
 */

import type { Command } from 'commander';
import { getClientResult, getFormat } from '../../client-bootstrap.js';
import { printJson, printTable, printDryRun } from '../../format.js';
import { run } from '../../error-handler.js';

export default function register(parent: Command): void {
  parent
    .command('sync <id>')
    .description('Trigger a Shopify sync for a product [EXPENSIVE: 10 req/min]')
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
          printDryRun('POST', `${baseUrl}/api/v1/products/${encodeURIComponent(id)}/sync`, null);
          return;
        }

        const result = await client.products.sync(id);

        const fmt = getFormat(globalOpts);
        if (fmt === 'json') {
          printJson(result);
        } else {
          printTable(
            [
              { field: 'product_id', value: result.product_id },
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
