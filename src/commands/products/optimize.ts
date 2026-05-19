/**
 * beaconed products optimize <id>
 * EXPENSIVE: 10 req/min rate limit.
 */

import type { Command } from 'commander';
import { getClientResult, getFormat } from '../../client-bootstrap.js';
import { printJson, printTable, printDryRun, parseCommaSeparated } from '../../format.js';
import { run } from '../../error-handler.js';
import type { ProductOptimizeInput } from '@beaconed/api-client';

export default function register(parent: Command): void {
  parent
    .command('optimize <id>')
    .description('Queue AI optimization for a product [EXPENSIVE: 10 req/min]')
    .option('--fields <fields>', 'Comma-separated fields to optimize (e.g. title,description)')
    .action(async (id: string, cmdOpts: { fields?: string }) => {
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

        const fields = parseCommaSeparated(cmdOpts.fields) as ProductOptimizeInput['fields'];
        const body = fields && fields.length > 0 ? { fields } : undefined;

        if (dryRun) {
          printDryRun(
            'POST',
            `${baseUrl}/api/v1/products/${encodeURIComponent(id)}/optimization`,
            body ?? null,
          );
          return;
        }

        const result = await client.products.optimize(id, body ? { fields } : undefined);

        const fmt = getFormat(globalOpts);
        if (fmt === 'json') {
          printJson(result);
        } else {
          printTable(
            [
              { field: 'product_id', value: result.product_id },
              { field: 'product_title', value: result.product_title },
              { field: 'status', value: result.status },
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
