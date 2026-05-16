import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOutput, mockFetchError } from '../../helpers.js';
import { makeProgram } from '../../program-factory.js';

describe('webhooks delete', () => {
  beforeEach(() => {
    process.env['BEACONED_API_KEY'] = 'test-key';
  });

  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
  });

  it('prints "Deleted webhook <id>" on success', async () => {
    // 204 No Content — respond with empty body
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        headers: { get: () => null },
        text: async () => '',
      }),
    );

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'webhooks', 'delete', 'wh_1']),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toBe('Deleted webhook wh_1\n');
    expect(result.stderr).toBe('');
  });

  it('sends DELETE to correct endpoint', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: { get: () => null },
      text: async () => '',
    });
    vi.stubGlobal('fetch', fetchSpy);

    const program = makeProgram();
    await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'webhooks', 'delete', 'wh_1']),
    );

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/webhooks/wh_1');
    expect((init as { method: string }).method).toBe('DELETE');
  });

  it('exits 4 on 404', async () => {
    mockFetchError(404, { success: false, error: 'Not found' });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'webhooks', 'delete', 'missing']),
    );

    expect(result.exitCode).toBe(4);
  });

  it('dry-run prints DELETE to stderr without fetching', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', '--dry-run', 'webhooks', 'delete', 'wh_1']),
    );

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toContain('[dry-run] DELETE');
    expect(result.stderr).toContain('/api/v1/webhooks/wh_1');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
