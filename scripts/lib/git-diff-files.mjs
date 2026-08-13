import { execFileSync } from 'node:child_process';

const SAFE_GIT_REVISION = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/;

export function isSafeGitRevision(value) {
  return typeof value === 'string'
    && SAFE_GIT_REVISION.test(value)
    && !value.includes('..')
    && !value.includes('@{');
}

export function changedFilesFromGit({ base = 'origin/main', cwd = process.cwd() } = {}) {
  if (!isSafeGitRevision(base)) {
    throw new Error(`unsafe git revision: ${String(base)}`);
  }
  const output = execFileSync(
    'git',
    ['diff', '--name-only', `${base}...HEAD`, '--'],
    { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  return output.split('\n').filter(Boolean);
}
