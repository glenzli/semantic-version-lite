import { exec, execForList } from './exec';
import fs from 'fs';
import path from 'path';

function getTags() {
  return execForList('git tag --sort=-v:refname');
}

function getTagCommit(tag: string) {
  return exec(`git rev-list -n 1 ${tag}`).trim();
}

function contains(branch: string, commit: string) {
  const branches = execForList(`git branch --contains ${commit}`);
  return branches.includes(branch);
}

function getLastTag(branch: string, predicate: (tag: string, commit: string) => boolean) {
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

function isVersionTag(tag: string) {
  return /^v\d+\.\d+.\d+(-[^\s.]+\.\d+)?$/.test(tag);
}

function parseVersion(ver: string) {
  const parsed = /^v(\d+)\.(\d+).(\d+)(-([^\s.]+)\.(\d+))?$/.exec(ver);
  if (parsed) {
    const major = parseInt(parsed[1], 10);
    const minor = parseInt(parsed[2], 10);
    const patch = parseInt(parsed[3], 10);
    const preRelease = parsed[5];
    const preVersion = preRelease ? parseInt(parsed[6], 10) : undefined;
    return { major, minor, patch, preRelease, preVersion };
  }
  return undefined;
}

export function getLastVersion(branch: string, preRelease?: string) {
  const lastTag = getLastTag(branch, isVersionTag);
  if (lastTag) {
    const version = parseVersion(lastTag.tag);
    if (version.preRelease === preRelease) {
      return version;
    }
  }

  const pkgFile = path.join(__dirname, './package.json');
  if (fs.existsSync(pkgFile)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgFile, { encoding: 'utf-8' }));
      if (pkg.version) {
        return parseVersion(pkg.version);
      }
    } catch (e) {
      // do nothing
    }
  }
  return undefined;
}
