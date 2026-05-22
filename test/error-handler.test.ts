import { describe, it, expect } from 'vitest';
import { BeaconedNotFoundError } from '@beaconed/api-client';
import { run } from '../src/error-handler.js';
import { captureOutput } from './helpers.js';

// Regression coverage for https://github.com/beaconed/beaconed-cli/issues/1:
// the 404 handler used to print the last URL segment as if it were a resource
// id, producing "Not found: scores?per_page=2" for collection endpoints.
describe('error-handler 404 message', () => {
  it('shows METHOD + full path (query stripped) for a collection 404', async () => {
    const err = new BeaconedNotFoundError(
      'Request failed with status 404',
      'https://beaconed.ai/api/v1/scores?per_page=2',
      'GET',
      undefined,
    );

    const result = await captureOutput(() => run(() => Promise.reject(err)));

    expect(result.exitCode).toBe(4);
    expect(result.stderr).toContain('Not found (404): GET /api/v1/scores');
    expect(result.stderr).not.toContain('per_page'); // query string stripped
    expect(result.stderr).not.toMatch(/Not found: scores\?/); // old buggy fragment
  });

  it('shows METHOD + full path for a by-id 404', async () => {
    const err = new BeaconedNotFoundError(
      'Request failed with status 404',
      'https://beaconed.ai/api/v1/products/deadbeef',
      'GET',
      undefined,
    );

    const result = await captureOutput(() => run(() => Promise.reject(err)));

    expect(result.exitCode).toBe(4);
    expect(result.stderr).toContain('Not found (404): GET /api/v1/products/deadbeef');
  });
});
