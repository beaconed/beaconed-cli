import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOutput, mockFetchOk, mockFetchError } from '../../helpers.js';
import { makeProgram } from '../../program-factory.js';

const sampleOptimizationDetail = {
  id: 'opt_1',
  product_id: 'prod_1',
  product_title: 'Cool Shirt',
  field: 'title',
  status: 'approved',
  score_before: 60,
  score_after: 85,
  approved_at: '2024-06-01T00:00:00Z',
  applied_at: null,
  reverted_at: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
  original_content: 'Cool Shirt',
  optimized_content: 'Premium Cool Shirt',
  rejection_reason: null,
  shopify_error: null,
  image_shopify_id: null,
  approved_by_name: 'Test User',
};

describe('optimizations approve', () => {
  beforeEach(() => {
    process.env['BEACONED_API_KEY'] = 'test-key';
  });

  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
  });

  it('prints approved optimization in table mode', async () => {
    mockFetchOk(sampleOptimizationDetail);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'optimizations', 'approve', 'opt_1']),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toContain('opt_1');
    expect(result.stdout).toContain('approved');
  });

  it('sends POST to approval endpoint', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (k: string) => ({ 'Content-Type': 'application/json', 'X-Page': '1', 'X-Per-Page': '25', 'X-Total': '1', 'X-Total-Pages': '1' }[k] ?? null),
      },
      text: async () => JSON.stringify({ success: true, data: sampleOptimizationDetail }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const program = makeProgram();
    await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'optimizations', 'approve', 'opt_1']),
    );

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/optimizations/opt_1/approval');
    expect((init as { method: string }).method).toBe('POST');
  });

  it('exits 4 on 404', async () => {
    mockFetchError(404, { success: false, error: 'Not found' });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'optimizations', 'approve', 'missing']),
    );

    expect(result.exitCode).toBe(4);
  });

  it('dry-run prints POST to stderr without fetching', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', '--dry-run', 'optimizations', 'approve', 'opt_1']),
    );

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toContain('[dry-run] POST');
    expect(result.stderr).toContain('/api/v1/optimizations/opt_1/approval');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
