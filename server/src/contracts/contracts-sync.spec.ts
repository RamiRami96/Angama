import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

// Guards the generated copies in server/ and client/ against hand edits or a
// forgotten `node contracts/sync.mjs` after changing /contracts/src.
it('contract copies match /contracts/src', () => {
  const script = join(__dirname, '..', '..', '..', 'contracts', 'sync.mjs');
  expect(() =>
    execFileSync('node', [script, '--check'], { stdio: 'pipe' }),
  ).not.toThrow();
});
