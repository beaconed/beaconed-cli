import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOutput, mockFetchOk, mockFetchError } from '../../helpers.js';
import { makeProgram } from '../../program-factory.js';

describe('auth whoami', () => {
  beforeEach(() => {
    process.env['BEACONED_API_KEY'] = 'test-key';
  });

  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
  });

  it('prints settings in table mode on success', async () => {
    mockFetchOk({
      brand_voice: 'friendly',
      brand_context: null,
      required_keywords: ['eco'],
      excluded_keywords: null,
      default_fields: ['title', 'description'],
      auto_push_on_approve: false,
    });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'auth', 'whoami']),
    );

    expect(result.exitCode).toBeNull(); // no explicit exit = success
    expect(result.stdout).toContain('brand_voice');
    expect(result.stdout).toContain('friendly');
  });

  it('prints JSON when --format json', async () => {
    mockFetchOk({
      brand_voice: null,
      brand_context: null,
      required_keywords: null,
      excluded_keywords: null,
      default_fields: [],
      auto_push_on_approve: true,
    });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', '--format', 'json', 'auth', 'whoami']),
    );

    expect(result.exitCode).toBeNull();
    const parsed = JSON.parse(result.stdout) as { auto_push_on_approve: boolean };
    expect(parsed.auto_push_on_approve).toBe(true);
  });

  it('exits 2 on auth failure', async () => {
    mockFetchError(401, { success: false, error: 'Unauthorized' });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'auth', 'whoami']),
    );

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('Authentication failed');
  });

  it('exits 2 when no API key', async () => {
    delete process.env['BEACONED_API_KEY'];

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'auth', 'whoami']),
    );

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('No API key');
  });
});
