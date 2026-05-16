/**
 * Smoke test — replaces the original spawn-based health check.
 * Uses the programmatic pattern for speed (see test/README.md).
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { captureOutput, mockFetchOk } from './helpers.js';
import { makeProgram } from './program-factory.js';

describe('CLI smoke test', () => {
  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('auth whoami exits cleanly and prints account info', async () => {
    process.env['BEACONED_API_KEY'] = 'smoke-test-key';
    mockFetchOk({
      brand_voice: null,
      brand_context: null,
      required_keywords: null,
      excluded_keywords: null,
      default_fields: ['title'],
      auto_push_on_approve: false,
    });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'auth', 'whoami']),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout.length).toBeGreaterThan(0);
  });

  it('exits 2 when no API key is provided', async () => {
    delete process.env['BEACONED_API_KEY'];

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'products', 'list']),
    );

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('No API key');
  });
});
