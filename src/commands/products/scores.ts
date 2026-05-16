/**
 * beaconed products scores <id>
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
    .command('scores <id>')
    .description('Show score history for a product')
    .option('--since <date>', 'ISO8601 start date filter')
    .option('--until <date>', 'ISO8601 end date filter')
    .option('--grade <grade>', 'Filter by grade')
    .action(async (id: string, cmdOpts: { since?: string; until?: string; grade?: string }) => {
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
        const result = await client.products.scores(id, {
          page,
          per_page: perPage,
          since: cmdOpts.since,
          until: cmdOpts.until,
          grade: cmdOpts.grade,
        });

        const fmt = getFormat(globalOpts);
        if (fmt === 'json') {
          printJson(jsonListResponse(result.data, result.pageInfo));
        } else {
          printTable(result.data as unknown as Record<string, unknown>[], [
            { header: 'Score', key: 'overall_score' },
            { header: 'Grade', key: 'grade' },
            { header: 'Change', key: 'score_change' },
            { header: 'Scored At', key: 'scored_at' },
          ]);
          printPaginationFooter(result.pageInfo);
        }
      }, globalOpts);
    });
}
