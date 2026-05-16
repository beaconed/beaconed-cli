import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOutput, mockFetchOk, mockFetchError } from '../../helpers.js';
import { makeProgram } from '../../program-factory.js';

const sampleRejected = {
  id: 'opt_1',
  product_id: 'prod_1',
  product_title: 'Cool Shirt',
  field: 'title',
  status: 'rejected',
  score_before: 60,
  score_after: null,
  approved_at: null,
  applied_at: null,
  reverted_at: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
  original_content: 'Cool Shirt',
  optimized_content: 'Premium Cool Shirt',
  rejection_reason: 'Not suitable',
  shopify_error: null,
  image_shopify_id: null,
  approved_by_name: null,
};

describe('optimizations reject', () => {
  beforeEach(() => {
    process.env['BEACONED_API_KEY'] = 'test-key';
  });

  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
  });

  it('rejects without reason when --reason not provided', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (k: string) => ({ 'Content-Type': 'application/json', 'X-Page': '1', 'X-Per-Page': '25', 'X-Total': '1', 'X-Total-Pages': '1' }[k] ?? null),
      },
      text: async () => JSON.stringify({ success: true, data: { ...sampleRejected, rejection_reason: null } }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'optimizations', 'reject', 'opt_1']),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toContain('rejected');

    // Body should be undefined (no reason), so the request body should be empty/null
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    // When body is undefined, api-client either omits it or sends undefined
    const body = (init as { body?: string }).body;
    // Either no body, or body doesn't contain reason key
    if (body) {
      const parsed = JSON.parse(body) as Record<string, unknown>;
      expect(parsed).not.toHaveProperty('reason');
    }
  });

  it('rejects with reason when --reason provided', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (k: string) => ({ 'Content-Type': 'application/json', 'X-Page': '1', 'X-Per-Page': '25', 'X-Total': '1', 'X-Total-Pages': '1' }[k] ?? null),
      },
      text: async () => JSON.stringify({ success: true, data: sampleRejected }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync([
        'node', 'cli', 'optimizations', 'reject', 'opt_1',
        '--reason', 'Not suitable',
      ]),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toContain('rejected');

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/optimizations/opt_1/rejection');
    const body = JSON.parse((init as { body: string }).body) as { reason: string };
    expect(body.reason).toBe('Not suitable');
  });

  it('omits reason from body when --reason is empty string', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (k: string) => ({ 'Content-Type': 'application/json', 'X-Page': '1', 'X-Per-Page': '25', 'X-Total': '1', 'X-Total-Pages': '1' }[k] ?? null),
      },
      text: async () => JSON.stringify({ success: true, data: sampleRejected }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const program = makeProgram();
    await captureOutput(() =>
      program.parseAsync([
        'node', 'cli', 'optimizations', 'reject', 'opt_1',
        '--reason', '   ',
      ]),
    );

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const bodyStr = (init as { body?: string }).body;
    if (bodyStr) {
      const parsed = JSON.parse(bodyStr) as Record<string, unknown>;
      expect(parsed).not.toHaveProperty('reason');
    }
  });

  it('exits 4 on 404', async () => {
    mockFetchError(404, { success: false, error: 'Not found' });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'optimizations', 'reject', 'missing']),
    );

    expect(result.exitCode).toBe(4);
  });

  it('prints rejection_reason in table output', async () => {
    mockFetchOk(sampleRejected);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync([
        'node', 'cli', 'optimizations', 'reject', 'opt_1',
        '--reason', 'Not suitable',
      ]),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toContain('Not suitable');
  });
});
