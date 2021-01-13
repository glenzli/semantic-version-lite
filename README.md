# semantic-version-lite
Sometimes we just need a tool to compute the next semantic version of packages without further operations. That's what `semantic-version-lite` for.

`semantic-version-lite` use version tag to compute next version, if version tag not found, version in **package.json** and the last commit changes the version is used as computation reference.

## Features
- Support stable version compute.
- Support pre-release version compute.
- Support version compute between pre-release and stable versions.
- Support pre-release version sorting: alpha -> beta -> rc.

## Install
```
npm install semantic-version-lite
```

## Usage
```typescript
import { nextVersion } from 'semantic-version-lite';

export interface VersionOptions {
  /* root dir to locate package.json */
  packageRoot?: string;
  /* pre-release type, like alpha/beta/rc */
  preRelease?: string;
  /* initial version to use if not previous version is find */
  initialVersion?: string;
  /* version bump from stable to pre-release, by default it's a major version bump */
  preReleaseBumpDigit?: VersionDigit.Major | VersionDigit.Minor;
}

nextVersion(branchToCompute, versionOptions);
```
