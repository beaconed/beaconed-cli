/**
 * beaconed optimizations get <id>
 */

import type { Command } from 'commander';
import { getClient, getFormat } from '../../client-bootstrap.js';
import { printJson, printTable } from '../../format.js';
import { run } from '../../error-handler.js';

export default function register(parent: Command): void {
  parent
    .command('get <id>')
    .description('Get detailed info about an optimization')
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
        const opt = await client.optimizations.get(id);

        const fmt = getFormat(globalOpts);
        if (fmt === 'json') {
          printJson(opt);
        } else {
          const rows = [
            { field: 'id', value: opt.id },
            { field: 'product_id', value: opt.product_id },
            { field: 'product_title', value: opt.product_title },
            { field: 'field', value: opt.field },
            { field: 'status', value: opt.status },
            { field: 'score_before', value: opt.score_before !== null ? String(opt.score_before) : '' },
            { field: 'score_after', value: opt.score_after !== null ? String(opt.score_after) : '' },
            { field: 'original_content', value: opt.original_content },
            { field: 'optimized_content', value: opt.optimized_content },
            { field: 'rejection_reason', value: opt.rejection_reason ?? '' },
            { field: 'approved_by', value: opt.approved_by_name ?? '' },
            { field: 'created_at', value: opt.created_at },
            { field: 'updated_at', value: opt.updated_at },
          ];
          printTable(rows, [
            { header: 'Field', key: 'field' },
            { header: 'Value', key: 'value' },
          ]);
        }
      }, globalOpts);
    });
}
