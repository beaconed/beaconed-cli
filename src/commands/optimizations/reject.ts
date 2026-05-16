/**
 * beaconed optimizations reject <id>
 */

import type { Command } from 'commander';
import { getClientResult, getFormat } from '../../client-bootstrap.js';
import { printJson, printTable, printDryRun } from '../../format.js';
import { run } from '../../error-handler.js';

export default function register(parent: Command): void {
  parent
    .command('reject <id>')
    .description('Reject a pending optimization')
    .option('--reason <reason>', 'Optional rejection reason')
    .action(async (id: string, cmdOpts: { reason?: string }) => {
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

        // Only include reason in body when non-empty
        const reason = cmdOpts.reason && cmdOpts.reason.trim().length > 0
          ? cmdOpts.reason.trim()
          : undefined;
        const body = reason !== undefined ? { reason } : undefined;

        if (dryRun) {
          printDryRun(
            'POST',
            `${baseUrl}/api/v1/optimizations/${encodeURIComponent(id)}/rejection`,
            body ?? null,
          );
          return;
        }

        const result = await client.optimizations.reject(id, body);

        const fmt = getFormat(globalOpts);
        if (fmt === 'json') {
          printJson(result);
        } else {
          printTable(
            [
              { field: 'id', value: result.id },
              { field: 'product_id', value: result.product_id },
              { field: 'field', value: result.field },
              { field: 'status', value: result.status },
              { field: 'rejection_reason', value: result.rejection_reason ?? '' },
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
