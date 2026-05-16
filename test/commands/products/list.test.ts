import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOutput, mockFetchOk, mockFetchError } from '../../helpers.js';
import { makeProgram } from '../../program-factory.js';

const sampleProducts = [
  {
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
  },
];

describe('products list', () => {
  beforeEach(() => {
    process.env['BEACONED_API_KEY'] = 'test-key';
  });

  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
  });

  it('prints table with product rows', async () => {
    mockFetchOk(sampleProducts);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'products', 'list']),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toContain('Cool Shirt');
    expect(result.stdout).toContain('prod_1');
  });

  it('prints JSON when --format json', async () => {
    mockFetchOk(sampleProducts);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', '--format', 'json', 'products', 'list']),
    );

    expect(result.exitCode).toBeNull();
    const parsed = JSON.parse(result.stdout) as { data: typeof sampleProducts };
    expect(parsed.data[0]!.title).toBe('Cool Shirt');
    expect(parsed).toHaveProperty('pageInfo');
  });

  it('prints pagination footer when multiple pages', async () => {
    mockFetchOk(sampleProducts, {
      'X-Page': '1',
      'X-Per-Page': '25',
      'X-Total': '100',
      'X-Total-Pages': '4',
    });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'products', 'list']),
    );

    expect(result.stderr).toContain('Page 1 of 4');
    expect(result.stderr).toContain('100 total');
  });

  it('exits 2 on auth failure', async () => {
    mockFetchError(401, { success: false, error: 'Unauthorized' });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'products', 'list']),
    );

    expect(result.exitCode).toBe(2);
  });
});
