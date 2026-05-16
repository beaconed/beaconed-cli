import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOutput, mockFetchOk, mockFetchError } from '../../helpers.js';
import { makeProgram } from '../../program-factory.js';

const sampleProduct = {
  id: 'prod_new',
  shopify_id: null,
  title: 'New Widget',
  handle: 'new-widget',
  status: 'active',
  vendor: null,
  product_type: null,
  readiness_score: 50,
  readiness_grade: 'fair',
  optimization_status: null,
  pending_optimizations_count: 0,
  primary_image_url: null,
  last_synced_at: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
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

describe('products create', () => {
  beforeEach(() => {
    process.env['BEACONED_API_KEY'] = 'test-key';
  });

  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
  });

  it('prints created product in table mode', async () => {
    mockFetchOk(sampleProduct);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync([
        'node', 'cli', 'products', 'create',
        '--title', 'New Widget',
        '--external-id', 'ext-123',
      ]),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toContain('prod_new');
    expect(result.stdout).toContain('New Widget');
  });

  it('prints JSON when --format json', async () => {
    mockFetchOk(sampleProduct);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync([
        'node', 'cli', '--format', 'json',
        'products', 'create',
        '--title', 'New Widget',
        '--external-id', 'ext-123',
      ]),
    );

    expect(result.exitCode).toBeNull();
    const parsed = JSON.parse(result.stdout) as { id: string };
    expect(parsed.id).toBe('prod_new');
  });

  it('sends POST with correct body', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: {
        get: (k: string) => ({ 'Content-Type': 'application/json', 'X-Page': '1', 'X-Per-Page': '25', 'X-Total': '1', 'X-Total-Pages': '1' }[k] ?? null),
      },
      text: async () => JSON.stringify({ success: true, data: sampleProduct }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const program = makeProgram();
    await captureOutput(() =>
      program.parseAsync([
        'node', 'cli', 'products', 'create',
        '--title', 'New Widget',
        '--external-id', 'ext-123',
        '--description', 'A widget',
        '--tags', 'cool,new',
      ]),
    );

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/products');
    expect((init as { method: string }).method).toBe('POST');
    const body = JSON.parse((init as { body: string }).body) as {
      product: { title: string; external_id: string; description: string; tags: string };
    };
    expect(body.product.title).toBe('New Widget');
    expect(body.product.external_id).toBe('ext-123');
    expect(body.product.description).toBe('A widget');
    expect(body.product.tags).toBe('cool,new');
  });

  it('exits 22 on validation error', async () => {
    mockFetchError(422, {
      success: false,
      error: 'Unprocessable',
      errors: ['title is too long'],
    });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync([
        'node', 'cli', 'products', 'create',
        '--title', 'X'.repeat(300),
        '--external-id', 'ext-456',
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
        'products', 'create',
        '--title', 'Dry Widget',
        '--external-id', 'dry-001',
      ]),
    );

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toContain('[dry-run] POST');
    expect(result.stderr).toContain('/api/v1/products');
    expect(result.stderr).toContain('Dry Widget');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
