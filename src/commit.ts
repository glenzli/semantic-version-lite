import { exec, execForList } from './exec';

function getLastCommit(branch: string) {
  return exec(`git rev-parse ${branch}`);
}

function getCommits(from: string, to: string) {
  return execForList(`git log ${from}...${to} --oneline`);
}
