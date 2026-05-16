/**
 * beaconed auth whoami
 *
 * Calls settings endpoint and prints account info to confirm authentication.
 */

import type { Command } from 'commander';
import { getClient, getFormat } from '../../client-bootstrap.js';
import { printJson, printTable } from '../../format.js';
import { run } from '../../error-handler.js';

export default function register(parent: Command): void {
  parent
    .command('whoami')
    .description('Verify authentication and print account settings')
    .action(async () => {
      // Walk up to root program to get global opts
      let cmd: Command = parent;
      while (cmd.parent) cmd = cmd.parent;
      const opts = cmd.opts<{
        apiKey?: string;
        baseUrl?: string;
        format?: string;
        verbose?: boolean;
      }>();

      await run(async () => {
        const client = getClient(opts);
        const settings = await client.settings.get();

        const fmt = getFormat(opts);
        if (fmt === 'json') {
          printJson(settings);
        } else {
          const rows = [
            { field: 'brand_voice', value: settings.brand_voice ?? '(not set)' },
            { field: 'brand_context', value: settings.brand_context ?? '(not set)' },
            {
              field: 'required_keywords',
              value: settings.required_keywords?.join(', ') ?? '(none)',
            },
            {
              field: 'excluded_keywords',
              value: settings.excluded_keywords?.join(', ') ?? '(none)',
            },
            {
              field: 'default_fields',
              value: settings.default_fields.join(', '),
            },
            {
              field: 'auto_push_on_approve',
              value: String(settings.auto_push_on_approve),
            },
          ];
          printTable(rows, [
            { header: 'Field', key: 'field' },
            { header: 'Value', key: 'value' },
          ]);
        }
      }, opts);
    });
}
