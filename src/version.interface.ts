export enum VersionDigit {
  Major,
  Minor,
  Patch,
  None,
}

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

export interface SemanticVersion {
  major: number;
  minor: number;
  patch: number;
  preRelease: string;
  preVersion?: number;
  ver: string;
}

export interface SemanticRelease {
  version: SemanticVersion;
  commit?: string;
}
