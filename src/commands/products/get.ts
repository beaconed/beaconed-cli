/**
 * beaconed products get <id>
 */

import type { Command } from 'commander';
import { getClient, getFormat } from '../../client-bootstrap.js';
import { printJson, printTable } from '../../format.js';
import { run } from '../../error-handler.js';

export default function register(parent: Command): void {
  parent
    .command('get <id>')
    .description('Get detailed info about a product')
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
        const product = await client.products.get(id);

        const fmt = getFormat(globalOpts);
        if (fmt === 'json') {
          printJson(product);
        } else {
          const rows = [
            { field: 'id', value: product.id },
            { field: 'title', value: product.title },
            { field: 'handle', value: product.handle },
            { field: 'status', value: product.status },
            { field: 'vendor', value: product.vendor ?? '' },
            { field: 'product_type', value: product.product_type ?? '' },
            { field: 'readiness_score', value: String(product.readiness_score) },
            { field: 'readiness_grade', value: product.readiness_grade },
            { field: 'optimization_status', value: product.optimization_status ?? '' },
            {
              field: 'pending_optimizations',
              value: String(product.pending_optimizations_count),
            },
            { field: 'meta_title', value: product.meta_title ?? '' },
            { field: 'meta_description', value: product.meta_description ?? '' },
            { field: 'tags', value: product.tags ?? '' },
            { field: 'created_at', value: product.created_at },
            { field: 'updated_at', value: product.updated_at },
          ];
          printTable(rows, [
            { header: 'Field', key: 'field' },
            { header: 'Value', key: 'value' },
          ]);
        }
      }, globalOpts);
    });
}
