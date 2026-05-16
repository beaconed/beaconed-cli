import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOutput, mockFetchOk, mockFetchError } from '../../helpers.js';
import { makeProgram } from '../../program-factory.js';

describe('webhooks test', () => {
  beforeEach(() => {
    process.env['BEACONED_API_KEY'] = 'test-key';
  });

  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
  });

  it('prints test result in table mode', async () => {
    mockFetchOk({ message: 'Test event sent', webhook_id: 'wh_1' });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'webhooks', 'test', 'wh_1']),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toContain('wh_1');
    expect(result.stdout).toContain('Test event sent');
  });

  it('sends POST to test endpoint', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 202,
      headers: {
        get: (k: string) =>
          ({ 'Content-Type': 'application/json', 'X-Page': '1', 'X-Per-Page': '25', 'X-Total': '1', 'X-Total-Pages': '1' }[k] ?? null),
      },
      text: async () => JSON.stringify({ success: true, data: { message: 'Test event sent', webhook_id: 'wh_1' } }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const program = makeProgram();
    await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'webhooks', 'test', 'wh_1']),
    );

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/webhooks/wh_1/test');
    expect((init as { method: string }).method).toBe('POST');
  });

  it('exits 4 on 404', async () => {
    mockFetchError(404, { success: false, error: 'Not found' });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'webhooks', 'test', 'missing']),
    );

    expect(result.exitCode).toBe(4);
  });
});
