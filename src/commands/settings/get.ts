/**
 * beaconed settings get
 */

import type { Command } from 'commander';
import { getClient, getFormat } from '../../client-bootstrap.js';
import { printJson, printTable } from '../../format.js';
import { run } from '../../error-handler.js';

export default function register(parent: Command): void {
  parent
    .command('get')
    .description('Get account optimization settings')
    .action(async () => {
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
        const settings = await client.settings.get();

        const fmt = getFormat(globalOpts);
        if (fmt === 'json') {
          printJson(settings);
        } else {
          const rows = [
            { field: 'brand_voice', value: settings.brand_voice ?? '' },
            { field: 'brand_context', value: settings.brand_context ?? '' },
            {
              field: 'required_keywords',
              value: settings.required_keywords?.join(', ') ?? '',
            },
            {
              field: 'excluded_keywords',
              value: settings.excluded_keywords?.join(', ') ?? '',
            },
            { field: 'default_fields', value: settings.default_fields.join(', ') },
            { field: 'auto_push_on_approve', value: String(settings.auto_push_on_approve) },
          ];
          printTable(rows, [
            { header: 'Setting', key: 'field' },
            { header: 'Value', key: 'value' },
          ]);
        }
      }, globalOpts);
    });
}
