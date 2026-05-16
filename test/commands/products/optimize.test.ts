import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOutput, mockFetchOk, mockFetchError } from '../../helpers.js';
import { makeProgram } from '../../program-factory.js';

const sampleOptimizeResult = {
  message: 'Optimization queued',
  product_id: 'prod_1',
  product_title: 'Cool Shirt',
  status: 'queued',
};

describe('products optimize', () => {
  beforeEach(() => {
    process.env['BEACONED_API_KEY'] = 'test-key';
  });

  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
  });

  it('prints optimize result in table mode', async () => {
    mockFetchOk(sampleOptimizeResult);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'products', 'optimize', 'prod_1']),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toContain('Cool Shirt');
    expect(result.stdout).toContain('queued');
  });

  it('sends POST with fields when --fields provided', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 202,
      headers: {
        get: (k: string) => ({ 'Content-Type': 'application/json', 'X-Page': '1', 'X-Per-Page': '25', 'X-Total': '1', 'X-Total-Pages': '1' }[k] ?? null),
      },
      text: async () => JSON.stringify({ success: true, data: sampleOptimizeResult }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const program = makeProgram();
    await captureOutput(() =>
      program.parseAsync([
        'node', 'cli', 'products', 'optimize', 'prod_1',
        '--fields', 'title,description',
      ]),
    );

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/products/prod_1/optimization');
    expect((init as { method: string }).method).toBe('POST');
    const body = JSON.parse((init as { body: string }).body) as { fields: string[] };
    expect(body.fields).toEqual(['title', 'description']);
  });

  it('exits 5 on rate limit', async () => {
    mockFetchError(429, { success: false, error: 'Rate limited' });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'products', 'optimize', 'prod_1']),
    );

    expect(result.exitCode).toBe(5);
  });
});
