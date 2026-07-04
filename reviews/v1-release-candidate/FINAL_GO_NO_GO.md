# v1 RC Final Go/No-Go

Audit date: 2026-07-04

## Decision

**NO_GO_FOR_PUBLICATION**

The code and exact package artifact are technically ready for an RC validation
period. Publication is blocked by repository, security-reporting, release
commit, and npm-account controls that cannot be verified from this checkout.

Local governance preparation now points all package metadata at the intended
`Interstice-Systems/interstice-telemetry` repository and updates the v1 RC
security policy. HTTP 404 responses are expected until that repository is
created; they remain publication blockers, not unresolved local metadata.

## Version strategy

The selected version is `1.0.0-rc.1`.

- The npm registry returned `E404` for `interstice-telemetry`; no public
  package versions or dist-tags exist.
- Repository labels v1.1–v1.5 are treated as unpublished internal engineering
  milestones.
- If the RC is accepted, the public stable version is `1.0.0`.
- Any code or API change after `rc.1` requires `1.0.0-rc.2`; do not silently
  replace the audited artifact.

`package.json` and `package-lock.json` agree on `1.0.0-rc.1`.

## Clean-checkout audit

The complete candidate working tree was copied into an isolated repository,
committed as audit snapshot `2250bef5a5795e6ef830013f33d7902933d028e3`,
then cloned into three clean worktrees. Each worktree remained clean after the
audit.

| Runtime | `npm ci` | `npm run check:release` | Tests | Examples |
|---|---:|---:|---:|---:|
| Node 20.20.2 / npm 11.17.0 | Pass | Pass | 291/291 | 25/25 |
| Node 22.23.1 / npm 11.17.0 | Pass | Pass | 291/291 | 25/25 |
| Node 24.16.0 / npm 11.17.0 | Pass | Pass | 291/291 | 25/25 |

Every matrix run also passed:

- strict TypeScript checking;
- lint;
- build;
- 86-file public declaration compatibility;
- serialized compatibility tests;
- packed Node ESM, TypeScript, and browser-safe consumers;
- dependency audit with zero reported vulnerabilities.

The local matrix matches the versions declared by GitHub Actions, but it is
not a substitute for CI on the final authoritative commit.

## Exact tarball

Audited artifact:

`interstice-telemetry-1.0.0-rc.1.tgz`

- Size: 117,806 bytes
- Files: 261
- npm SHA-1: `1ad698501e8d5c5d5916f84300cf055bff3fe54c`
- SHA-256:
  `d62b47a2bf43ae2457ef274e5c9056e596407053b52802ae846191033972d9d4`
- SHA-512:
  `8c02e42c9c2150a9b78b317a015b3761ea96662b5542fc422b27d203367091e0c5b4f478ca991ac440937c5a6c66f0706794e6f62da038f0667b35cff8f53aef`
- npm integrity:
  `sha512-jALkLJwhUKm3izF6AVs3YeqWZitVQvxCKyfSAzZwkeDFtPR4ypkaxECTfFpsZvBwZ5Tm9i2gOPBmezXP+PU67w==`

Node 20, 22, and 24 produced byte-identical tarballs. Fresh consumers on all
three runtimes installed this single exact tarball, executed the root and
browser-safe exports, exercised custom artifact export and diagnostic
rendering, and compiled TypeScript imports.

Package inspection confirmed:

- package metadata reports `1.0.0-rc.1`;
- license, README, compiled JavaScript, declarations, schemas, fixtures, docs,
  and examples are present;
- source, tests, reviews, local artifacts, coverage, dependencies, Git data,
  and environment files are absent;
- no archive symlinks were present.

## Local governance preparation

Completed after the technical audit:

- standardized the intended GitHub organization in package metadata;
- updated `SECURITY.md` for the latest v1 RC;
- added GitHub repository and npm release setup instructions;
- updated CI to run `npm run check`, `npm pack --dry-run`, and packed consumer
  validation across the supported matrix;
- separated locally completed checks from external governance gates.

The exact tarball hash above predates these governance-only package
documentation and metadata changes. It is retained as technical audit history,
not as the artifact approved for publication. A new exact tarball must be
approved from the final hosted release commit.

## Remaining publication blockers

1. The intended repository does not exist yet, so repository, issue tracker,
   and private advisory URLs return HTTP 404. No Git remote is configured.
2. There is no authoritative release commit containing the candidate changes;
   the clean audit commit is temporary evidence, not a release commit.
3. CI has not run against the final authoritative commit or tag.
4. npm package ownership, required two-factor authentication, and provenance
   publishing authority have not been demonstrated. Registry absence does not
   prove name ownership.
5. GitHub private vulnerability reporting and a monitored fallback security
   contact have not been demonstrated.

## Go criteria

Change the decision to **GO_FOR_RC_PUBLICATION** only after:

1. committing the candidate to the authoritative repository;
2. making package repository/issues/security links publicly valid;
3. verifying the private vulnerability-reporting path and replacing or
   removing the placeholder contact;
4. confirming npm maintainer, 2FA, provenance, and package-name controls;
5. running Node 20/22/24 CI on that exact commit;
6. rebuilding once from that commit and recording the new approved SHA-256;
7. confirming that hash against the approved artifact;
8. creating the reviewed `v1.0.0-rc.1` tag without publishing automatically.

No package was published and no release tag was created during this audit.
