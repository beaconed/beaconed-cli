/**
 * Shared test helpers for CLI programmatic tests.
 */

import { vi } from 'vitest';

export class ExitError extends Error {
  constructor(public code: number) {
    super(`process.exit(${code})`);
    this.name = 'ExitError';
  }
}

export interface CaptureResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

/**
 * Runs an async CLI action while capturing stdout, stderr, and exit code.
 *
 * Intercepts process.exit() calls: instead of terminating the process, throws
 * ExitError so we can catch it and record the code.
 */
export async function captureOutput(fn: () => Promise<void>): Promise<CaptureResult> {
  let stdout = '';
  let stderr = '';
  let exitCode: number | null = null;

  const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
    stdout += typeof chunk === 'string' ? chunk : chunk.toString();
    return true;
  });

  const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation((chunk) => {
    stderr += typeof chunk === 'string' ? chunk : chunk.toString();
    return true;
  });

  const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: number | string | null) => {
    exitCode = typeof code === 'number' ? code : 0;
    throw new ExitError(exitCode);
  });

  try {
    await fn();
  } catch (err) {
    if (!(err instanceof ExitError)) {
      // Unexpected error — restore and rethrow
      stdoutSpy.mockRestore();
      stderrSpy.mockRestore();
      exitSpy.mockRestore();
      throw err;
    }
  } finally {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
    exitSpy.mockRestore();
  }

  return { stdout, stderr, exitCode };
}

/**
 * Builds a mock fetch response that uses response.text() (as the api-client does).
 */
function makeMockResponse(status: number, body: unknown, headers: Record<string, string> = {}) {
  const bodyText = JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (key: string) => headers[key] ?? null,
    },
    text: async () => bodyText,
    // json() fallback kept for completeness but http.ts only uses text()
    json: async () => body,
  };
}

/**
 * Builds a mock fetch that returns a successful JSON response.
 */
export function mockFetchOk(body: unknown, extraHeaders: Record<string, string> = {}): void {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Page': '1',
    'X-Per-Page': '25',
    'X-Total': '1',
    'X-Total-Pages': '1',
    ...extraHeaders,
  };

  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      makeMockResponse(200, { success: true, data: body }, headers),
    ),
  );
}

/**
 * Builds a mock fetch that returns an error response.
 */
export function mockFetchError(status: number, body: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(makeMockResponse(status, body)),
  );
}

/**
 * Builds a mock fetch that throws a network error.
 */
export function mockFetchNetworkError(): void {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
}
