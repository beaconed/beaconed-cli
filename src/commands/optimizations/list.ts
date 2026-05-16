/**
 * beaconed optimizations list
 */

import type { Command } from 'commander';
import { getClient, getFormat, getPagination } from '../../client-bootstrap.js';
import {
  printJson,
  printTable,
  printPaginationFooter,
  jsonListResponse,
} from '../../format.js';
import { run } from '../../error-handler.js';

export default function register(parent: Command): void {
  parent
    .command('list')
    .description('List optimizations')
    .option(
      '--status <status>',
      'Filter by status: pending, approved, rejected, applied, reverted',
    )
    .option(
      '--field <field>',
      'Filter by field: title, description, alt_text, meta_title, meta_description, tags, product_type, og_title, og_description',
    )
    .option('--product-id <id>', 'Filter by product ID')
    .option('--since <date>', 'ISO8601 start date filter')
    .action(async (cmdOpts: {
      status?: string;
      field?: string;
      productId?: string;
      since?: string;
    }) => {
      let cmd: Command = parent;
      while (cmd.parent) cmd = cmd.parent;
      const globalOpts = cmd.opts<{
        apiKey?: string;
        baseUrl?: string;
        format?: string;
        page?: string;
        perPage?: string;
        verbose?: boolean;
      }>();

      await run(async () => {
        const client = getClient(globalOpts);
        const { page, perPage } = getPagination(globalOpts);
        const result = await client.optimizations.list({
          page,
          per_page: perPage,
          status: cmdOpts.status as
            | 'pending'
            | 'approved'
            | 'rejected'
            | 'applied'
            | 'reverted'
            | undefined,
          field: cmdOpts.field as
            | 'title'
            | 'description'
            | 'alt_text'
            | 'meta_title'
            | 'meta_description'
            | 'tags'
            | 'product_type'
            | 'og_title'
            | 'og_description'
            | undefined,
          product_id: cmdOpts.productId,
          since: cmdOpts.since,
        });

        const fmt = getFormat(globalOpts);
        if (fmt === 'json') {
          printJson(jsonListResponse(result.data, result.pageInfo));
        } else {
          printTable(result.data as unknown as Record<string, unknown>[], [
            { header: 'ID', key: 'id' },
            { header: 'Product', key: 'product_title' },
            { header: 'Field', key: 'field' },
            { header: 'Status', key: 'status' },
            { header: 'Created At', key: 'created_at' },
          ]);
          printPaginationFooter(result.pageInfo);
        }
      }, globalOpts);
    });
}
