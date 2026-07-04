# Release Checklist

## Pre-release

- Confirm version and changelog.
- Review the API freeze and declaration baseline diff.
- Run `npm ci`, `npm run check:release`, every example, and
  `npm pack --dry-run`.
- Verify serialized fixtures and the browser dependency scan.
- Inspect tarball contents, license, README, links, schemas, and fixtures.
- Confirm Node.js 20, 22, and 24 CI passes.
- Confirm only intended release changes remain.

## Publish

- Create a reviewed release commit and tag.
- Use maintainer-controlled npm provenance and two-factor protection.
- Publish the exact verified tarball without rebuilding.
- Never publish from an unreviewed working tree.

## Post-release

- Install from the registry in clean Node and browser consumers.
- Verify package metadata, documentation links, and tag.
- Announce experimental APIs and support channels.
- Monitor compatibility and evidence-integrity reports.

## Rollback

npm releases are immutable. Deprecate a defective version, publish a corrected
patch, and document impact. Unpublishing is reserved for security or legal
emergencies under npm policy.

## Version guidance

Use patches for compatible fixes, minors for additive APIs, and majors for
breaking stable contracts or serialized formats.
