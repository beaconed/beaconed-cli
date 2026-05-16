import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOutput, mockFetchOk, mockFetchError } from '../../helpers.js';
import { makeProgram } from '../../program-factory.js';

const sampleWebhooks = [
  {
    id: 'wh_1',
    url: 'https://example.com/hook',
    events: ['product.updated', 'optimization.applied'],
    status: 'active',
    failure_count: 0,
    last_triggered_at: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

describe('webhooks list', () => {
  beforeEach(() => {
    process.env['BEACONED_API_KEY'] = 'test-key';
  });

  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
  });

  it('prints webhook rows with events joined', async () => {
    mockFetchOk(sampleWebhooks);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'webhooks', 'list']),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toContain('wh_1');
    expect(result.stdout).toContain('product.updated');
  });

  it('exits 2 on auth failure', async () => {
    mockFetchError(401, { success: false, error: 'Unauthorized' });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'webhooks', 'list']),
    );

    expect(result.exitCode).toBe(2);
  });
});
