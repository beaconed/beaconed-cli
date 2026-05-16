import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOutput, mockFetchError } from '../../helpers.js';
import { makeProgram } from '../../program-factory.js';

const sampleWebhookWithSecret = {
  id: 'wh_new',
  url: 'https://example.com/hook',
  events: ['product.scored', 'optimization.created'],
  status: 'active',
  failure_count: 0,
  last_triggered_at: null,
  last_success_at: null,
  last_failure_at: null,
  last_error: null,
  created_at: '2024-06-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
  secret: 'whsec_super_secret_abc123',
};

function mockFetchCreate(body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: {
        get: (k: string) =>
          ({
            'Content-Type': 'application/json',
            'X-Page': '1',
            'X-Per-Page': '25',
            'X-Total': '1',
            'X-Total-Pages': '1',
          }[k] ?? null),
      },
      text: async () => JSON.stringify({ success: true, data: body }),
    }),
  );
}

describe('webhooks create', () => {
  beforeEach(() => {
    process.env['BEACONED_API_KEY'] = 'test-key';
  });

  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
  });

  it('prints secret prominently in table mode', async () => {
    mockFetchCreate(sampleWebhookWithSecret);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync([
        'node', 'cli', 'webhooks', 'create',
        '--url', 'https://example.com/hook',
        '--events', 'product.scored,optimization.created',
      ]),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toContain('wh_new');
    expect(result.stdout).toContain('https://example.com/hook');
    expect(result.stdout).toContain('product.scored');
    expect(result.stdout).toContain('whsec_super_secret_abc123');
    expect(result.stdout).toContain('SECRET');
    expect(result.stdout).toContain('shown once');
  });

  it('prints secret in JSON mode', async () => {
    mockFetchCreate(sampleWebhookWithSecret);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync([
        'node', 'cli', '--format', 'json',
        'webhooks', 'create',
        '--url', 'https://example.com/hook',
        '--events', 'product.scored',
      ]),
    );

    expect(result.exitCode).toBeNull();
    const parsed = JSON.parse(result.stdout) as { id: string; secret: string };
    expect(parsed.id).toBe('wh_new');
    expect(parsed.secret).toBe('whsec_super_secret_abc123');
  });

  it('sends POST with correct body', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: {
        get: (k: string) =>
          ({ 'Content-Type': 'application/json', 'X-Page': '1', 'X-Per-Page': '25', 'X-Total': '1', 'X-Total-Pages': '1' }[k] ?? null),
      },
      text: async () => JSON.stringify({ success: true, data: sampleWebhookWithSecret }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const program = makeProgram();
    await captureOutput(() =>
      program.parseAsync([
        'node', 'cli', 'webhooks', 'create',
        '--url', 'https://example.com/hook',
        '--events', 'product.scored,optimization.created',
      ]),
    );

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/webhooks');
    expect((init as { method: string }).method).toBe('POST');
    const body = JSON.parse((init as { body: string }).body) as {
      webhook: { url: string; events: string[] };
    };
    expect(body.webhook.url).toBe('https://example.com/hook');
    expect(body.webhook.events).toEqual(['product.scored', 'optimization.created']);
  });

  it('exits 22 on validation error', async () => {
    mockFetchError(422, {
      success: false,
      error: 'Unprocessable',
      errors: ['url must be HTTPS'],
    });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync([
        'node', 'cli', 'webhooks', 'create',
        '--url', 'http://insecure.com/hook',
        '--events', 'product.scored',
      ]),
    );

    expect(result.exitCode).toBe(22);
  });

  it('dry-run prints POST to stderr without fetching', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync([
        'node', 'cli', '--dry-run',
        'webhooks', 'create',
        '--url', 'https://example.com/hook',
        '--events', 'product.scored',
      ]),
    );

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toContain('[dry-run] POST');
    expect(result.stderr).toContain('/api/v1/webhooks');
    expect(result.stderr).toContain('product.scored');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
