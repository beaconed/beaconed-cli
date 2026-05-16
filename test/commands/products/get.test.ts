import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOutput, mockFetchOk, mockFetchError } from '../../helpers.js';
import { makeProgram } from '../../program-factory.js';

const sampleProduct = {
  id: 'prod_1',
  shopify_id: 123,
  title: 'Cool Shirt',
  handle: 'cool-shirt',
  status: 'active',
  vendor: 'Acme',
  product_type: 'Shirts',
  readiness_score: 82,
  readiness_grade: 'good',
  optimization_status: null,
  pending_optimizations_count: 2,
  primary_image_url: null,
  last_synced_at: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
  description: 'A very cool shirt',
  meta_title: null,
  meta_description: null,
  og_title: null,
  og_description: null,
  tags: null,
  options: [],
  images: [],
  price_min: 29.99,
  latest_optimization: null,
  score_history: [],
};

describe('products get', () => {
  beforeEach(() => {
    process.env['BEACONED_API_KEY'] = 'test-key';
  });

  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
  });

  it('prints detail table', async () => {
    mockFetchOk(sampleProduct);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'products', 'get', 'prod_1']),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toContain('Cool Shirt');
    expect(result.stdout).toContain('good');
  });

  it('prints JSON', async () => {
    mockFetchOk(sampleProduct);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', '--format', 'json', 'products', 'get', 'prod_1']),
    );

    expect(result.exitCode).toBeNull();
    const parsed = JSON.parse(result.stdout) as { id: string };
    expect(parsed.id).toBe('prod_1');
  });

  it('exits 4 on 404', async () => {
    mockFetchError(404, { success: false, error: 'Not found' });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'products', 'get', 'missing']),
    );

    expect(result.exitCode).toBe(4);
    expect(result.stderr).toContain('Not found');
  });
});
