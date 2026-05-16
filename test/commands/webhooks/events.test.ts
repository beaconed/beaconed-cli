import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOutput, mockFetchError } from '../../helpers.js';
import { makeProgram } from '../../program-factory.js';

describe('webhooks events', () => {
  beforeEach(() => {
    process.env['BEACONED_API_KEY'] = 'test-key';
  });

  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
  });

  it('prints event catalog', async () => {
    // The webhooks.events() response wraps the array in { events: [...] }
    const responseBody = {
      success: true,
      data: {
        events: [
          { name: 'product.updated', description: 'Fired when a product is updated' },
          { name: 'optimization.applied', description: 'Fired when an optimization is applied' },
        ],
      },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (k: string) =>
          ({
            'Content-Type': 'application/json',
            'X-Page': '1',
            'X-Per-Page': '25',
            'X-Total': '2',
            'X-Total-Pages': '1',
          }[k] ?? null),
      },
      text: async () => JSON.stringify(responseBody),
      json: async () => responseBody,
    }));

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'webhooks', 'events']),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toContain('product.updated');
    expect(result.stdout).toContain('optimization.applied');
  });

  it('exits 2 on auth failure', async () => {
    mockFetchError(401, { success: false, error: 'Unauthorized' });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'webhooks', 'events']),
    );

    expect(result.exitCode).toBe(2);
  });
});
