import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOutput, mockFetchOk, mockFetchError } from '../../helpers.js';
import { makeProgram } from '../../program-factory.js';

const sampleScores = [
  {
    id: 'score_1',
    overall_score: 75,
    grade: 'fair',
    score_change: -3,
    scored_at: '2024-07-01T00:00:00Z',
    created_at: '2024-07-01T00:00:00Z',
  },
];

describe('scores list', () => {
  beforeEach(() => {
    process.env['BEACONED_API_KEY'] = 'test-key';
  });

  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
  });

  it('prints score rows', async () => {
    mockFetchOk(sampleScores);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'scores', 'list']),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toContain('score_1');
    expect(result.stdout).toContain('75');
  });

  it('prints JSON with pageInfo', async () => {
    mockFetchOk(sampleScores);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', '--format', 'json', 'scores', 'list']),
    );

    expect(result.exitCode).toBeNull();
    const parsed = JSON.parse(result.stdout) as { data: unknown[]; pageInfo: unknown };
    expect(parsed).toHaveProperty('pageInfo');
    expect(parsed.data).toHaveLength(1);
  });

  it('exits 2 on auth failure', async () => {
    mockFetchError(401, { success: false, error: 'Unauthorized' });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'scores', 'list']),
    );

    expect(result.exitCode).toBe(2);
  });
});
