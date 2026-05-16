import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOutput, mockFetchOk, mockFetchError } from '../../helpers.js';
import { makeProgram } from '../../program-factory.js';

const sampleWebhookDetail = {
  id: 'wh_1',
  url: 'https://updated.example.com/hook',
  events: ['product.scored'],
  status: 'active',
  failure_count: 0,
  last_triggered_at: null,
  last_success_at: null,
  last_failure_at: null,
  last_error: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
};

describe('webhooks update', () => {
  beforeEach(() => {
    process.env['BEACONED_API_KEY'] = 'test-key';
  });

  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
  });

  it('prints updated webhook in table mode', async () => {
    mockFetchOk(sampleWebhookDetail);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync([
        'node', 'cli', 'webhooks', 'update', 'wh_1',
        '--url', 'https://updated.example.com/hook',
      ]),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toContain('https://updated.example.com/hook');
  });

  it('sends PATCH with correct URL and body', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (k: string) =>
          ({ 'Content-Type': 'application/json', 'X-Page': '1', 'X-Per-Page': '25', 'X-Total': '1', 'X-Total-Pages': '1' }[k] ?? null),
      },
      text: async () => JSON.stringify({ success: true, data: sampleWebhookDetail }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const program = makeProgram();
    await captureOutput(() =>
      program.parseAsync([
        'node', 'cli', 'webhooks', 'update', 'wh_1',
        '--events', 'product.scored,optimization.applied',
      ]),
    );

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/webhooks/wh_1');
    expect((init as { method: string }).method).toBe('PATCH');
    const body = JSON.parse((init as { body: string }).body) as {
      webhook: { events: string[] };
    };
    expect(body.webhook.events).toEqual(['product.scored', 'optimization.applied']);
  });

  it('exits 4 on 404', async () => {
    mockFetchError(404, { success: false, error: 'Not found' });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync([
        'node', 'cli', 'webhooks', 'update', 'missing',
        '--url', 'https://example.com/hook',
      ]),
    );

    expect(result.exitCode).toBe(4);
  });
});
