import { exec } from './exec';
import { VersionChange } from './version.interface';

export function getLastCommit(branch: string) {
  return exec(`git rev-parse ${branch}`);
}

function getCommits(from: string, to: string) {
  const logs = exec(`git log ${from}...${to} --pretty=%h%B__SEMANTIC_LOG_SPLIT__`);
  return logs.split('__SEMANTIC_LOG_SPLIT__').map(log => log.trim()).filter(Boolean);
}

export function analyzeVersionChange(from: string, to: string) {
  const commits = getCommits(from, to);
  for (let i = 0; i < commits.length; ++i) {
    const commit = commits[i];
    if (commit.includes('BREAKING CHANGE:')) {
      return VersionChange.Major;
    }
    if (commit.includes('feat:')) {
      return VersionChange.Minor;
    }
    if (commit.includes('fix:') || commit.includes('perf:')) {
      return VersionChange.Patch;
    }
  }
}
