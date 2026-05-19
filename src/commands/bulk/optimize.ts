/**
 * beaconed bulk optimize --product-ids <ids> [--fields <fields>]
 * EXPENSIVE: 10 req/min rate limit.
 */

import type { Command } from 'commander';
import { getClientResult, getFormat } from '../../client-bootstrap.js';
import { printJson, printTable, printDryRun, parseCommaSeparated } from '../../format.js';
import { run } from '../../error-handler.js';

export default function register(parent: Command): void {
  parent
    .command('optimize')
    .description('Queue AI optimization for multiple products in one request [EXPENSIVE: 10 req/min]')
    .requiredOption('--product-ids <ids>', 'Comma-separated product UUIDs to optimize')
    .option('--fields <fields>', 'Comma-separated fields to optimize (title,description,alt_text,...). Omit to optimize all default fields.')
    .action(async (options: { productIds: string; fields?: string }) => {
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

        const product_ids = parseCommaSeparated(options.productIds) ?? [];
        const fields = parseCommaSeparated(options.fields) as Array<
          | 'title'
          | 'description'
          | 'alt_text'
          | 'meta_title'
          | 'meta_description'
          | 'tags'
          | 'product_type'
          | 'og_title'
          | 'og_description'
        > | undefined;

        if (dryRun) {
          const body: Record<string, unknown> = { product_ids };
          if (fields !== undefined) body.fields = fields;
          printDryRun('POST', `${baseUrl}/api/v1/bulk_optimizations`, body);
          return;
        }

        const input = fields !== undefined ? { product_ids, fields } : { product_ids };
        const result = await client.bulkOptimizations.create(input);

        const fmt = getFormat(globalOpts);
        if (fmt === 'json') {
          printJson(result);
        } else {
          printTable(
            [
              { field: 'queued_count', value: String(result.queued_count) },
              { field: 'queued_product_ids', value: result.queued_product_ids.join(', ') },
              { field: 'skipped_product_ids', value: result.skipped_product_ids.join(', ') },
              { field: 'credits_remaining', value: result.credits_remaining !== null ? String(result.credits_remaining) : 'unlimited' },
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
