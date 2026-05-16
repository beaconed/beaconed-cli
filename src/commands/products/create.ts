/**
 * beaconed products create
 */

import type { Command } from 'commander';
import { getClientResult, getFormat } from '../../client-bootstrap.js';
import { printJson, printTable, printDryRun } from '../../format.js';
import { run } from '../../error-handler.js';

export default function register(parent: Command): void {
  parent
    .command('create')
    .description('Create a product from external data')
    .requiredOption('--title <title>', 'Product title')
    .requiredOption('--external-id <id>', 'Your system\'s product ID (idempotency key)')
    .option('--description <text>', 'Product description')
    .option('--tags <tags>', 'Comma-separated tags string')
    .option('--status <status>', 'Status: active, draft, or archived')
    .option('--vendor <vendor>', 'Vendor name')
    .option('--product-type <type>', 'Product type')
    .action(async (cmdOpts: {
      title: string;
      externalId: string;
      description?: string;
      tags?: string;
      status?: string;
      vendor?: string;
      productType?: string;
    }) => {
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

        const body = {
          product: {
            title: cmdOpts.title,
            external_id: cmdOpts.externalId,
            ...(cmdOpts.description !== undefined && { description: cmdOpts.description }),
            ...(cmdOpts.tags !== undefined && { tags: cmdOpts.tags }),
            ...(cmdOpts.status !== undefined && { status: cmdOpts.status }),
            ...(cmdOpts.vendor !== undefined && { vendor: cmdOpts.vendor }),
            ...(cmdOpts.productType !== undefined && { product_type: cmdOpts.productType }),
          },
        };

        if (dryRun) {
          printDryRun('POST', `${baseUrl}/api/v1/products`, body);
          return;
        }

        const product = await client.products.create({
          title: cmdOpts.title,
          external_id: cmdOpts.externalId,
          description: cmdOpts.description,
          tags: cmdOpts.tags,
          status: cmdOpts.status as 'active' | 'draft' | 'archived' | undefined,
          vendor: cmdOpts.vendor,
          product_type: cmdOpts.productType,
        });

        const fmt = getFormat(globalOpts);
        if (fmt === 'json') {
          printJson(product);
        } else {
          printTable(
            [
              { field: 'id', value: product.id },
              { field: 'title', value: product.title },
              { field: 'handle', value: product.handle },
              { field: 'status', value: product.status },
              { field: 'readiness_score', value: String(product.readiness_score) },
              { field: 'created_at', value: product.created_at },
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
