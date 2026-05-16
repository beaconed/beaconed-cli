import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOutput, mockFetchOk, mockFetchError } from '../../helpers.js';
import { makeProgram } from '../../program-factory.js';

const sampleScores = [
  {
    overall_score: 80,
    grade: 'good',
    scored_at: '2024-06-01T00:00:00Z',
    score_change: 5,
  },
];

describe('products scores', () => {
  beforeEach(() => {
    process.env['BEACONED_API_KEY'] = 'test-key';
  });

  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
  });

  it('prints score history table', async () => {
    mockFetchOk(sampleScores);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'products', 'scores', 'prod_1']),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toContain('80');
    expect(result.stdout).toContain('good');
  });

  it('exits 4 on 404', async () => {
    mockFetchError(404, { success: false, error: 'Not found' });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'products', 'scores', 'missing']),
    );

    expect(result.exitCode).toBe(4);
  });
});
