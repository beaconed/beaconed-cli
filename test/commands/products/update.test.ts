import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOutput, mockFetchOk, mockFetchError } from '../../helpers.js';
import { makeProgram } from '../../program-factory.js';

const sampleProduct = {
  id: 'prod_1',
  shopify_id: null,
  title: 'Updated Widget',
  handle: 'updated-widget',
  status: 'active',
  vendor: null,
  product_type: null,
  readiness_score: 70,
  readiness_grade: 'good',
  optimization_status: null,
  pending_optimizations_count: 0,
  primary_image_url: null,
  last_synced_at: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
  description: null,
  meta_title: null,
  meta_description: null,
  og_title: null,
  og_description: null,
  tags: null,
  options: [],
  images: [],
  price_min: null,
  latest_optimization: null,
  score_history: [],
};

describe('products update', () => {
  beforeEach(() => {
    process.env['BEACONED_API_KEY'] = 'test-key';
  });

  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
  });

  it('prints updated product in table mode', async () => {
    mockFetchOk(sampleProduct);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync([
        'node', 'cli', 'products', 'update', 'prod_1',
        '--title', 'Updated Widget',
      ]),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toContain('Updated Widget');
  });

  it('sends PATCH with correct URL', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (k: string) => ({ 'Content-Type': 'application/json', 'X-Page': '1', 'X-Per-Page': '25', 'X-Total': '1', 'X-Total-Pages': '1' }[k] ?? null),
      },
      text: async () => JSON.stringify({ success: true, data: sampleProduct }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const program = makeProgram();
    await captureOutput(() =>
      program.parseAsync([
        'node', 'cli', 'products', 'update', 'prod_1',
        '--title', 'Updated Widget',
      ]),
    );

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/products/prod_1');
    expect((init as { method: string }).method).toBe('PATCH');
  });

  it('exits 4 on 404', async () => {
    mockFetchError(404, { success: false, error: 'Not found' });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync([
        'node', 'cli', 'products', 'update', 'missing',
        '--title', 'X',
      ]),
    );

    expect(result.exitCode).toBe(4);
  });
});
