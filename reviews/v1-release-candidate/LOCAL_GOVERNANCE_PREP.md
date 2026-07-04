# Local Release Governance Preparation

Date: 2026-07-04

## Completed locally

- Standardized package metadata on
  `Interstice-Systems/interstice-telemetry`.
- Confirmed package and lockfile version `1.0.0-rc.1`.
- Reviewed package keywords, included files, root exports, and browser-safe
  exports.
- Updated `SECURITY.md` for the active v1 RC and documented the intentionally
  non-deliverable contact placeholder.
- Confirmed the GitHub Actions matrix covers Node 20, 22, and 24.
- Configured CI to run install, SDK checks, package dry-run, and packed
  consumer validation.
- Split the release checklist into local, GitHub, npm, and publication gates.
- Added exact GitHub repository and npm release setup instructions.
- Preserved the publication verdict as `NO_GO_FOR_PUBLICATION` until external
  controls are verified.

## External work after repository creation

- Create the private GitHub repository and establish the authoritative remote.
- Push the reviewed candidate commit and pass hosted CI.
- Verify repository, issue, homepage, and private advisory URLs.
- Enable private vulnerability reporting and establish a monitored fallback
  contact.
- Configure branch rules and maintainer ownership.
- Confirm npm name control, maintainer identity, two-factor authentication,
  trusted publishing/provenance, and recovery ownership.
- Approve the final commit, tag, tarball, and publication in separate,
  explicit steps.

No repository, tag, or npm package was created by this preparation.

## Local verification

- `npm test`: passed, 77 files and 291 tests.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run check`: passed, including the 86-file declaration baseline.
- `npm pack --dry-run`: passed; 263 files, approximately 120.7 kB packed.
- `npm run test:packed`: passed for Node ESM, TypeScript, and 24 browser-safe
  dependency modules.
- `git diff --check`: passed.

The package dry run includes the new GitHub and npm setup guides and excludes
source tests, reviews, local artifacts, dependencies, and credentials.
