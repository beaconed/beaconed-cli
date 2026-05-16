import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOutput, mockFetchOk, mockFetchError } from '../../helpers.js';
import { makeProgram } from '../../program-factory.js';

const sampleOptimizationDetail = {
  id: 'opt_1',
  product_id: 'prod_1',
  product_title: 'Cool Shirt',
  field: 'title',
  status: 'pending',
  score_before: 70,
  score_after: null,
  approved_at: null,
  applied_at: null,
  reverted_at: null,
  created_at: '2024-06-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
  original_content: 'Old title',
  optimized_content: 'Better title',
  rejection_reason: null,
  shopify_error: null,
  image_shopify_id: null,
  approved_by_name: null,
};

describe('optimizations get', () => {
  beforeEach(() => {
    process.env['BEACONED_API_KEY'] = 'test-key';
  });

  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
  });

  it('prints optimization detail table', async () => {
    mockFetchOk(sampleOptimizationDetail);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'optimizations', 'get', 'opt_1']),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toContain('Old title');
    expect(result.stdout).toContain('Better title');
  });

  it('exits 4 on 404', async () => {
    mockFetchError(404, { success: false, error: 'Not found' });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'optimizations', 'get', 'missing']),
    );

    expect(result.exitCode).toBe(4);
    expect(result.stderr).toContain('Not found');
  });
});
