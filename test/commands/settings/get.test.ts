import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOutput, mockFetchOk, mockFetchError } from '../../helpers.js';
import { makeProgram } from '../../program-factory.js';

const sampleSettings = {
  brand_voice: 'professional',
  brand_context: 'eco-friendly products',
  required_keywords: ['sustainable', 'organic'],
  excluded_keywords: ['cheap'],
  default_fields: ['title', 'description', 'alt_text'],
  auto_push_on_approve: true,
};

describe('settings get', () => {
  beforeEach(() => {
    process.env['BEACONED_API_KEY'] = 'test-key';
  });

  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
  });

  it('prints settings in table mode', async () => {
    mockFetchOk(sampleSettings);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'settings', 'get']),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toContain('professional');
    expect(result.stdout).toContain('sustainable');
  });

  it('prints JSON', async () => {
    mockFetchOk(sampleSettings);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', '--format', 'json', 'settings', 'get']),
    );

    expect(result.exitCode).toBeNull();
    const parsed = JSON.parse(result.stdout) as { brand_voice: string; auto_push_on_approve: boolean };
    expect(parsed.brand_voice).toBe('professional');
    expect(parsed.auto_push_on_approve).toBe(true);
  });

  it('exits 2 on auth failure', async () => {
    mockFetchError(401, { success: false, error: 'Unauthorized' });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'settings', 'get']),
    );

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('Authentication failed');
  });
});
