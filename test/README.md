# Test Strategy

## Pattern: programmatic (not spawn)

Tests use the **programmatic pattern**: they import the commander `program` instance
directly, stub `globalThis.fetch`, set `BEACONED_API_KEY` in the environment, and call
`program.parseAsync(['node', 'cli', ...args])` to exercise the command tree in-process.

Stdout and stderr are captured by temporarily replacing `process.stdout.write` and
`process.stderr.write` with spy functions. Exit codes are intercepted by replacing
`process.exit` with a spy that records the requested code and throws a sentinel error.

### Why not spawn?

Spawning `tsx src/cli.ts` per test case adds ~800–1200ms of Node.js startup and TSX
transpilation per test. A 30-test suite would take 40+ seconds. The programmatic approach
keeps each test under 50ms.

### Trade-offs

- Programmatic tests share the same Node.js process, so `process.exit` must be intercepted
  (we throw a sentinel to unwind the call stack, then catch it in the test).
- The original `smoke.test.ts` has been replaced by `test/commands/auth/whoami.test.ts`,
  which exercises the same "does the CLI boot and authenticate" smoke check but faster.

## Helper: test/helpers.ts

`captureOutput(fn)` is the shared capture utility. It wraps a call that may invoke
`process.exit`, records stdout/stderr strings, and returns `{ stdout, stderr, exitCode }`.

Each command group has a corresponding `test/commands/<group>/<verb>.test.ts` with at
least one happy-path test and one error-path test (auth failure or 404).
