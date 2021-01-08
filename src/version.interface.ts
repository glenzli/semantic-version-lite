export enum VersionDigit {
  Major,
  Minor,
  Patch,
  None,
}

export interface VersionOptions {
  packageRoot?: string;
  preRelease?: string;
  initialVersion?: string;
  releaseBranch?: string;
  preReleaseBumpDigit?: VersionDigit.Major | VersionDigit.Minor;
}
