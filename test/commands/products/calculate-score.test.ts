import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOutput, mockFetchOk, mockFetchError } from '../../helpers.js';
import { makeProgram } from '../../program-factory.js';

const sampleScoreResult = {
  product_id: 'prod_1',
  overall_score: 85,
  grade: 'good',
  category_scores: {},
  recommendations: [],
  calculated_at: '2024-06-01T00:00:00Z',
};

describe('products calculate-score', () => {
  beforeEach(() => {
    process.env['BEACONED_API_KEY'] = 'test-key';
  });

  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
  });

  it('prints score result in table mode', async () => {
    mockFetchOk(sampleScoreResult);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'products', 'calculate-score', 'prod_1']),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toContain('85');
    expect(result.stdout).toContain('good');
  });

  it('prints JSON when --format json', async () => {
    mockFetchOk(sampleScoreResult);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync([
        'node', 'cli', '--format', 'json',
        'products', 'calculate-score', 'prod_1',
      ]),
    );

    expect(result.exitCode).toBeNull();
    const parsed = JSON.parse(result.stdout) as { overall_score: number };
    expect(parsed.overall_score).toBe(85);
  });

  it('sends POST to correct endpoint', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: {
        get: (k: string) => ({ 'Content-Type': 'application/json', 'X-Page': '1', 'X-Per-Page': '25', 'X-Total': '1', 'X-Total-Pages': '1' }[k] ?? null),
      },
      text: async () => JSON.stringify({ success: true, data: sampleScoreResult }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const program = makeProgram();
    await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'products', 'calculate-score', 'prod_1']),
    );

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/products/prod_1/scores/calculation');
    expect((init as { method: string }).method).toBe('POST');
  });

  it('exits 5 on rate limit', async () => {
    mockFetchError(429, { success: false, error: 'Rate limited' });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'products', 'calculate-score', 'prod_1']),
    );

    expect(result.exitCode).toBe(5);
  });
});
