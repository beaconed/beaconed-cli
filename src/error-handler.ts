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
      // Try to extract an ID from the request URL
      const urlParts = err.requestUrl.split('/');
      const id = urlParts[urlParts.length - 1] ?? 'unknown';
      process.stderr.write(`Not found: ${id}\n`);
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
