import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOutput, mockFetchOk, mockFetchError } from '../../helpers.js';
import { makeProgram } from '../../program-factory.js';

const sampleWebhookDetail = {
  id: 'wh_1',
  url: 'https://example.com/hook',
  events: ['product.updated'],
  status: 'active',
  failure_count: 0,
  last_triggered_at: '2024-06-01T00:00:00Z',
  last_success_at: '2024-06-01T00:00:00Z',
  last_failure_at: null,
  last_error: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('webhooks get', () => {
  beforeEach(() => {
    process.env['BEACONED_API_KEY'] = 'test-key';
  });

  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
  });

  it('prints webhook detail', async () => {
    mockFetchOk(sampleWebhookDetail);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'webhooks', 'get', 'wh_1']),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toContain('https://example.com/hook');
    expect(result.stdout).toContain('product.updated');
  });

  it('exits 4 on 404', async () => {
    mockFetchError(404, { success: false, error: 'Not found' });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'webhooks', 'get', 'missing']),
    );

    expect(result.exitCode).toBe(4);
  });
});
