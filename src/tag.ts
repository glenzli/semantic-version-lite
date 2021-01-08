import { exec, execForList, execSingleLine } from './exec';

function getTags() {
  return execForList('git tag --sort=-v:refname');
}

function getTagCommit(tag: string) {
  return execSingleLine(`git rev-list -n 1 ${tag}`);
}

function contains(branch: string, commit: string) {
  const branches = execForList(`git branch --contains ${commit}`).map(branch => branch.replace(/\*/g, '').trim());
  return branches.includes(branch);
}

export function getLastTag(branch: string, predicate: (tag: string, commit: string) => boolean) {
  const tags = getTags();
  for (let i = 0; i < tags.length; ++i) {
    const tag = tags[i];
    const commit = getTagCommit(tag);
    if (contains(branch, commit) && predicate(tag, commit)) {
      return { tag, commit };
    }
  }
  return undefined;
}
