/**
 * beaconed products list
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
    .description('List products')
    .option('--status <status>', 'Filter by status: active, draft, archived')
    .option('--min-score <n>', 'Minimum readiness score')
    .option('--max-score <n>', 'Maximum readiness score')
    .option('--grade <grade>', 'Filter by grade: excellent, good, fair, poor, critical')
    .option('--needs-optimization', 'Only show products needing optimization')
    .option('-q, --q <query>', 'Search by title')
    .action(async (cmdOpts: {
      status?: string;
      minScore?: string;
      maxScore?: string;
      grade?: string;
      needsOptimization?: boolean;
      q?: string;
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
        const result = await client.products.list({
          page,
          per_page: perPage,
          status: cmdOpts.status as 'active' | 'draft' | 'archived' | undefined,
          min_score: cmdOpts.minScore !== undefined ? parseFloat(cmdOpts.minScore) : undefined,
          max_score: cmdOpts.maxScore !== undefined ? parseFloat(cmdOpts.maxScore) : undefined,
          grade: cmdOpts.grade as
            | 'excellent'
            | 'good'
            | 'fair'
            | 'poor'
            | 'critical'
            | undefined,
          needs_optimization: cmdOpts.needsOptimization,
          q: cmdOpts.q,
        });

        const fmt = getFormat(globalOpts);
        if (fmt === 'json') {
          printJson(jsonListResponse(result.data, result.pageInfo));
        } else {
          printTable(result.data as unknown as Record<string, unknown>[], [
            { header: 'ID', key: 'id' },
            { header: 'Title', key: 'title' },
            { header: 'Status', key: 'status' },
            { header: 'Grade', key: 'readiness_grade' },
            { header: 'Score', key: 'readiness_score' },
            { header: 'Pending', key: 'pending_optimizations_count' },
          ]);
          printPaginationFooter(result.pageInfo);
        }
      }, globalOpts);
    });
}
