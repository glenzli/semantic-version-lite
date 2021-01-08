import { getLastTag } from './tag';
import fs from 'fs';
import path from 'path';
import { VersionDigit, VersionOptions } from './version.interface';
import { exec } from './exec';
import { getLastCommit, getVersionChange } from './commit';

function isVersionStr(str: string) {
  return /^v?\d+\.\d+.\d+(-[^\s.]+(\.\d+)?)?$/.test(str);
}

function parseVersion(ver: string) {
  const parsed = /^v?(\d+)\.(\d+).(\d+)(-([^\s.]+)(\.(\d+))?)?$/.exec(ver);
  if (parsed) {
    const major = parseInt(parsed[1], 10);
    const minor = parseInt(parsed[2], 10);
    const patch = parseInt(parsed[3], 10);
    const preRelease = parsed[5];
    let preVersion = preRelease ? parseInt(parsed[7], 10) : undefined;
    if (preVersion !== undefined && isNaN(preVersion)) {
      preVersion = 1;
    }
    return { major, minor, patch, preRelease, preVersion, ver };
  }
  return undefined;
}

function getLastRelease(branch: string, preRelease?: string) {
  const lastTag = getLastTag(branch, isVersionStr);
  if (lastTag) {
    const version = parseVersion(lastTag.tag);
    if (version) {
      if (version.preRelease === preRelease) {
        return { version, commit: lastTag.commit };
      }
    }
  }
  return undefined;
}

function getVersionCommit(pkgFile: string, pkgContent: string) {
  const pkgLines = pkgContent.split('\n');
  let versionLine = -1;
  for (let i = 0; i < pkgLines.length; ++i) {
    if (/\"version\"/.test(pkgLines[i])) {
      versionLine = i + 1;
      break;
    }
  }

  const output = exec(`git blame -l -L ${versionLine},${versionLine} -- ${pkgFile}`);
  const match = /^([a-zA-Z0-9]+)\s/.exec(output);
  if (match && !match[1].startsWith('0000')) {
    const commitId = match[1];
    return commitId;
  }
  return undefined;
}

function getPackageRelease(packageRoot?: string) {
  const pkgFile = path.join(packageRoot || process.cwd(), './package.json');
  if (fs.existsSync(pkgFile)) {
    try {
      const pkgContent = fs.readFileSync(pkgFile, { encoding: 'utf-8' });
      const pkg = JSON.parse(pkgContent);
      if (pkg.version) {
        const version = parseVersion(pkg.version);
        if (version) {
          return { version, commit: getVersionCommit(pkgFile, pkgContent) };
        }
      }
    } catch (e) {
      // do nothing
    }
  }
  return undefined;
}

type Version = NonNullable<ReturnType<typeof parseVersion>>;

function nextPreReleaseVersion(version: Version) {
  return `${version.major}.${version.minor}.${version.patch}-${version.preRelease}.${(version.preVersion ?? 0) + 1}`;
}

function nextReleaseVersion(change: VersionDigit, version: Version) {
  if (version.preRelease) {
    return `${version.major}.${version.minor}.${version.patch}`;
  }
  switch (change) {
    case VersionDigit.Major: return `${version.major + 1}.0.0`;
    case VersionDigit.Minor: return `${version.major}.${version.minor + 1}.0`;
    case VersionDigit.Patch: return `${version.major}.${version.minor}.${version.patch + 1}`;
  }
  return undefined;
}

function isLargerPreRelease(preRelease: string, ref: string) {
  switch (ref) {
    case 'alpha': return ['beta', 'rc'].includes(preRelease);
    case 'beta': return ['rc'].includes(preRelease);
    default: return false;
  }
}

function nextVersionFrom(options: VersionOptions, lastCommit: string, version: Version, versionCommit: string | undefined) {
  const change = getVersionChange(versionCommit, lastCommit);
  if (change !== VersionDigit.None) {
    if (options.preRelease) {
      if (!version.preRelease) {
        if (change === VersionDigit.Major || options.preReleaseBumpDigit !== VersionDigit.Minor) {
          return `${version.major + 1}.0.0-${options.preRelease}.1`;
        }
        return `${version.major}.${version.minor + 1}.0-${options.preRelease}.1`;
      } else if (version.preRelease === options.preRelease) {
        return nextPreReleaseVersion(version);
      } else if (isLargerPreRelease(options.preRelease, version.preRelease)) {
        return `${version.major}.${version.minor}.${version.patch}-${options.preRelease}.1`;
      } else {
        throw new Error(`cannot determine next ${options.preRelease} version after ${version.ver}`);
      }
    }
    return nextReleaseVersion(change, version);
  }
  return undefined;
}

export function nextVersion(branch: string, options: VersionOptions = {}) {
  // sync
  exec('git fetch');
  // figure out version
  const lastCommit = getLastCommit(branch);
  const lastRelease = getLastRelease(branch, options.preRelease);
  // last release exists
  if (lastRelease) {
    return nextVersionFrom(options, lastCommit, lastRelease.version, lastRelease.commit);
  }
  // last release do not exists
  const pkgRelease = getPackageRelease(options.packageRoot);
  if (pkgRelease) {
    return nextVersionFrom(options, lastCommit, pkgRelease.version, pkgRelease.commit);
  }
  // first release
  const initialVersion = options.initialVersion && isVersionStr(options.initialVersion) ? options.initialVersion : '1.0.0';
  return options.preRelease ? nextPreReleaseVersion(parseVersion(initialVersion)!) : initialVersion;
}

