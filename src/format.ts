import Table from 'cli-table3';
import chalk from 'chalk';
import type { PageInfo } from '@beaconed/api-client';

/**
 * Print a value as pretty-printed JSON to stdout.
 * Suitable for piping to jq.
 */
export function printJson(value: unknown): void {
  process.stdout.write(JSON.stringify(value, null, 2) + '\n');
}

export interface ColumnDef {
  /** Header label */
  header: string;
  /** Key to read from each row object */
  key: string;
  /** Optional transform applied to the cell value before display */
  transform?: (value: unknown) => string;
}

/**
 * Print an array of objects as a human-readable table using cli-table3.
 * Color is applied only when stdout is a TTY (auto-disabled for pipes).
 */
export function printTable(rows: Record<string, unknown>[], columns: ColumnDef[]): void {
  const isTTY = process.stdout.isTTY === true;

  const head = columns.map((col) =>
    isTTY ? chalk.bold(col.header) : col.header,
  );

  const table = new Table({ head });

  for (const row of rows) {
    const cells = columns.map((col) => {
      const raw = row[col.key];
      if (col.transform) {
        return col.transform(raw);
      }
      if (raw === null || raw === undefined) return '';
      return String(raw);
    });
    table.push(cells);
  }

  process.stdout.write(table.toString() + '\n');
}

/**
 * Print pagination footer to stderr (table mode only).
 * e.g. "Page 1 of 5 (123 total) — use --page N for more"
 */
export function printPaginationFooter(pageInfo: PageInfo): void {
  if (pageInfo.totalPages <= 1) return;
  process.stderr.write(
    `Page ${pageInfo.page} of ${pageInfo.totalPages} (${pageInfo.total} total) — use --page N for more\n`,
  );
}

/**
 * Wrap a list response for JSON output, including pageInfo as a sibling of data.
 */
export function jsonListResponse<T>(data: T[], pageInfo: PageInfo): { data: T[]; pageInfo: PageInfo } {
  return { data, pageInfo };
}

/**
 * Split a comma-separated flag value into a trimmed string array.
 * Returns undefined when the input is falsy (flag not provided).
 */
export function parseCommaSeparated(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Print a dry-run summary to stderr and exit 0.
 * Called from mutation commands when --dry-run is set.
 */
export function printDryRun(method: string, url: string, body: unknown): void {
  const bodyText =
    body !== undefined && body !== null
      ? JSON.stringify(body, null, 2)
      : '(none)';
  process.stderr.write(`[dry-run] ${method} ${url}\n`);
  process.stderr.write(`[dry-run] body: ${bodyText}\n`);
  process.exit(0);
}
