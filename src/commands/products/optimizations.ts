/**
 * beaconed products optimizations <id>
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
    .command('optimizations <id>')
    .description('List optimizations for a product')
    .option(
      '--status <status>',
      'Filter by status: pending, approved, rejected, applied, reverted',
    )
    .option(
      '--field <field>',
      'Filter by field: title, description, alt_text, meta_title, meta_description, tags, product_type, og_title, og_description',
    )
    .action(async (id: string, cmdOpts: { status?: string; field?: string }) => {
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
        const result = await client.products.optimizations(id, {
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
        });

        const fmt = getFormat(globalOpts);
        if (fmt === 'json') {
          printJson(jsonListResponse(result.data, result.pageInfo));
        } else {
          printTable(result.data as unknown as Record<string, unknown>[], [
            { header: 'ID', key: 'id' },
            { header: 'Field', key: 'field' },
            { header: 'Status', key: 'status' },
            { header: 'Created At', key: 'created_at' },
          ]);
          printPaginationFooter(result.pageInfo);
        }
      }, globalOpts);
    });
}
