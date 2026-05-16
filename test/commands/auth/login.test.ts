import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOutput } from '../../helpers.js';
import { makeProgram } from '../../program-factory.js';

describe('auth login', () => {
  afterEach(() => {
    delete process.env['BEACONED_API_KEY'];
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('saves API key from env and prints path', async () => {
    process.env['BEACONED_API_KEY'] = 'env-test-key';

    // Mock writeConfigFile so we don't write to disk
    const configMod = await import('../../../src/config.js');
    const writeSpy = vi.spyOn(configMod, 'writeConfigFile').mockReturnValue('/tmp/test/config.json');

    const program = makeProgram();
    const result = await captureOutput(() =>
      program.parseAsync(['node', 'cli', 'auth', 'login']),
    );

    expect(result.exitCode).toBeNull();
    expect(result.stdout).toContain('Saved to');
    expect(writeSpy).toHaveBeenCalledWith('env-test-key');
  });
});
