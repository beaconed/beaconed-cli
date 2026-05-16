import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOutput, mockFetchOk, mockFetchError } from '../../helpers.js';
import { makeProgram } from '../../program-factory.js';

const sampleLatestScores = [
  {
    id: 'score_latest',
    overall_score: 90,
    grade: 'excellent',
    score_change: 10,
    scored_at: '2024-08-01T00:00:00Z',
    created_at: '2024-08-01T00:00:00Z',
  },
];

describe('scores latest', () => {
  beforeEach(() => {
    process.env['BEACONED_API_KEY'] = 'test-key';
  });

  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
  });

  it('prints latest score rows', async () => {
    mockFetchOk(sampleLatestScores);

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'scores', 'latest']),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toContain('90');
    expect(result.stdout).toContain('excellent');
  });

  it('exits 2 on auth failure', async () => {
    mockFetchError(401, { success: false, error: 'Unauthorized' });

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'scores', 'latest']),
    );

    expect(result.exitCode).toBe(2);
  });
});
