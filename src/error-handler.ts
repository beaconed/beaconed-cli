/**
 * Centralized error handler for CLI commands.
 *
 * Maps BeaconedError subclasses to stable exit codes:
 *   1  — generic / unknown error
 *   2  — authentication failed (BeaconedAuthError or no API key)
 *   4  — not found (BeaconedNotFoundError)
 *   5  — rate limited (BeaconedRateLimitError)
 *   22 — validation error (BeaconedValidationError)
 */

import {
  BeaconedError,
  BeaconedAuthError,
  BeaconedNotFoundError,
  BeaconedRateLimitError,
  BeaconedValidationError,
} from '@beaconed/api-client';

/**
 * Sentinel thrown by process.exit() intercepts in tests.
 * run() must re-throw it so captureOutput() can catch it cleanly.
 * We detect it by name to avoid importing from test helpers in production code.
 */
function isExitSentinel(err: unknown): boolean {
  return err instanceof Error && err.name === 'ExitError';
}

export class NoApiKeyError extends Error {
  constructor() {
    super('No API key found. Run `beaconed auth login` or set BEACONED_API_KEY.');
    this.name = 'NoApiKeyError';
  }
}

/**
 * Formats the request target for an error message as "METHOD /path".
 * Strips the origin and query string so the message is readable and stable
 * (e.g. "GET /api/v1/scores" rather than the full URL or a trailing fragment).
 */
function formatRequestTarget(err: BeaconedError): string {
  let path = err.requestUrl;
  try {
    path = new URL(err.requestUrl).pathname;
  } catch {
    // Not an absolute URL — strip any query string manually.
    path = err.requestUrl.split('?')[0] ?? err.requestUrl;
  }
  return err.requestMethod ? `${err.requestMethod} ${path}` : path;
}

/**
 * Wraps an async command body with structured error handling.
 * Each command should call: await run(() => { ... body ... }, program.opts())
 */
export async function run(
  fn: () => Promise<void>,
  opts: { verbose?: boolean } = {},
): Promise<void> {
  try {
    await fn();
  } catch (err) {
    // Re-throw test sentinel errors (ExitError from mocked process.exit) so
    // captureOutput() can record the exit code cleanly.
    if (isExitSentinel(err)) throw err;

    if (err instanceof NoApiKeyError) {
      process.stderr.write(`error: ${err.message}\n`);
      process.exit(2);
    }

    if (err instanceof BeaconedAuthError) {
      process.stderr.write(
        'Authentication failed. Run `beaconed auth login`.\n',
      );
      process.exit(2);
    }

    if (err instanceof BeaconedNotFoundError) {
      // Show the method + path of the request that 404'd. We can't assume the
      // URL ends in a resource id — collection endpoints (e.g. /api/v1/scores)
      // don't — so print the full path with the query string stripped, rather
      // than a trailing fragment like "scores?per_page=2".
      process.stderr.write(`Not found (404): ${formatRequestTarget(err)}\n`);
      process.exit(4);
    }

    if (err instanceof BeaconedRateLimitError) {
      const seconds = err.retryAfterSeconds;
      const retryMsg = seconds !== undefined ? ` Retry after ${seconds}s.` : '';
      process.stderr.write(`Rate limited.${retryMsg}\n`);
      process.exit(5);
    }

    if (err instanceof BeaconedValidationError) {
      process.stderr.write('Validation errors:\n');
      for (const e of err.validationErrors) {
        process.stderr.write(`  - ${e}\n`);
      }
      process.exit(22);
    }

    if (err instanceof BeaconedError) {
      process.stderr.write(`error: ${err.message}\n`);
      process.exit(1);
    }

    // Unknown error
    if (opts.verbose && err instanceof Error) {
      process.stderr.write(`${err.stack ?? err.message}\n`);
    } else if (err instanceof Error) {
      process.stderr.write(`error: ${err.message}\n`);
    } else {
      process.stderr.write(`error: ${String(err)}\n`);
    }
    process.exit(1);
  }
}
