import { exec, execSingleLine } from './exec';
import { VersionDigit } from './version.interface';

export function getLastCommit(branch: string) {
  return execSingleLine(`git rev-parse ${branch}`);
}

function getCommits(from: string | undefined, to: string) {
  const arg = from ? `${from}...${to}` : '';
  const logs = exec(`git log ${arg} --pretty=%h%B__SEMANTIC_LOG_SPLIT__`);
  return logs.split('__SEMANTIC_LOG_SPLIT__').map(log => log.trim()).filter(Boolean);
}

export function getVersionChange(from: string | undefined, to: string) {
  const commits = getCommits(from, to);
  for (let i = 0; i < commits.length; ++i) {
    const commit = commits[i];
    if (commit.includes('BREAKING CHANGE:')) {
      return VersionDigit.Major;
    }
    if (commit.includes('feat:')) {
      return VersionDigit.Minor;
    }
    if (commit.includes('fix:') || commit.includes('perf:')) {
      return VersionDigit.Patch;
    }
  }
  return VersionDigit.None;
}
