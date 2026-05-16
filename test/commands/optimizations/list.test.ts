import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOutput, mockFetchOk, mockFetchError } from '../../helpers.js';
import { makeProgram } from '../../program-factory.js';

const sampleOptimizations = [
  {
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
  },
];

function makeUrlCaptureMock(responseBody: unknown, headers: Record<string, string> = {}) {
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Page': '1',
    'X-Per-Page': '25',
    'X-Total': '0',
    'X-Total-Pages': '1',
    ...headers,
  };
  const bodyText = JSON.stringify(responseBody);
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: { get: (k: string) => defaultHeaders[k] ?? null },
    text: async () => bodyText,
    json: async () => responseBody,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('optimizations list', () => {
  beforeEach(() => {
    process.env['BEACONED_API_KEY'] = 'test-key';
  });

  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
  });

  it('prints optimization rows', async () => {
    mockFetchOk(sampleOptimizations);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'optimizations', 'list']),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toContain('opt_1');
    expect(result.stdout).toContain('Cool Shirt');
  });

  it('passes --status filter in the request URL', async () => {
    const fetchMock = makeUrlCaptureMock({ success: true, data: [] });

    const program = makeProgram();
    await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'optimizations', 'list', '--status', 'pending']),
    );

    const url = (fetchMock.mock.calls[0] as [string, unknown])[0];
    expect(url).toContain('status=pending');
  });

  it('exits 2 on auth failure', async () => {
    mockFetchError(401, { success: false, error: 'Unauthorized' });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'optimizations', 'list']),
    );

    expect(result.exitCode).toBe(2);
  });
});
