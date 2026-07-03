# Release Process

Only maintainers should publish a release.

## Prepare

1. Start from a clean checkout of the intended release commit.
2. Confirm the package version and lockfile version match.
3. Move relevant changelog entries from `Unreleased` to the release version
   and date.
4. Review public API declaration changes and serialized format versions.
5. Confirm documentation describes the actual behavior.

## Verify

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm pack --dry-run
git diff --check
```

Inspect the package file list. It should contain the license, README, package
metadata, compiled JavaScript, and declarations—never source tests, local
artifacts, coverage, credentials, or review notes.

For v1 release candidates, install the generated tarball in a clean temporary
Node.js ESM project and run a basic scenario through the package root.

## Release

1. Commit with the reviewed release message.
2. Create a signed or annotated `v<version>` tag according to maintainer
   policy.
3. Push the commit and tag.
4. Wait for CI to pass on the exact tag.
5. Publish the exact verified tarball; do not rebuild from a different
   checkout.
6. Create release notes from the changelog.
7. Verify registry metadata and a clean installation.

This repository does not include automatic publication. Publishing requires an
explicit maintainer action.

## Failed release

Do not replace an already published npm version. Fix the issue, add a
changelog entry, increment the version, and publish a new release. Deprecate a
bad package version through the registry only when necessary and document the
replacement.
