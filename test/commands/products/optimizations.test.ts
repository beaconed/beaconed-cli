import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOutput, mockFetchOk, mockFetchError } from '../../helpers.js';
import { makeProgram } from '../../program-factory.js';

const sampleOptimizations = [
  {
    id: 'opt_1',
    field: 'title',
    status: 'pending',
    created_at: '2024-06-01T00:00:00Z',
  },
];

describe('products optimizations', () => {
  beforeEach(() => {
    process.env['BEACONED_API_KEY'] = 'test-key';
  });

  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
  });

  it('prints optimizations table', async () => {
    mockFetchOk(sampleOptimizations);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'products', 'optimizations', 'prod_1']),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toContain('opt_1');
    expect(result.stdout).toContain('pending');
  });

  it('exits 2 on auth error', async () => {
    mockFetchError(401, { success: false, error: 'Unauthorized' });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'products', 'optimizations', 'prod_1']),
    );

    expect(result.exitCode).toBe(2);
  });
});
