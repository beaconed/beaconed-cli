import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cliPath = join(__dirname, '..', 'src', 'cli.ts');
const tsxBin = join(__dirname, '..', 'node_modules', '.bin', 'tsx');

describe('CLI smoke test', () => {
  it('health command exits 0 and prints "ok"', () => {
    const result = spawnSync(tsxBin, [cliPath, 'health'], {
      encoding: 'utf8',
      timeout: 15000,
    });

    expect(result.status, `stderr: ${result.stderr}`).toBe(0);
    expect(result.stdout).toContain('ok');
  });
});
