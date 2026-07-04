# Release Checklist

## Local governance preparation

- [x] Set `package.json` and `package-lock.json` to `1.0.0-rc.1`.
- [x] Point package repository, issue, and homepage metadata at the intended
  `Interstice-Systems/interstice-telemetry` repository.
- [x] Review the API freeze and declaration baseline.
- [x] Keep Node.js 20, 22, and 24 in the GitHub Actions matrix.
- [x] Include `npm ci`, `npm run check`, `npm pack --dry-run`, and packed
  consumer validation in CI.
- [x] Update the v1 RC security policy and document the missing private
  contact as an external blocker.
- [x] Validate package contents, browser-safe exports, schemas, fixtures,
  documentation, and packed consumers locally.

## Required after GitHub repository creation

- [ ] Create `Interstice-Systems/interstice-telemetry`.
- [ ] Add and verify the authoritative Git remote.
- [ ] Push the reviewed release-candidate branch.
- [ ] Confirm repository, issue, and homepage URLs resolve.
- [ ] Enable GitHub private vulnerability reporting.
- [ ] Replace `SECURITY_CONTACT_PENDING@example.invalid` with a monitored
  private contact or remove the fallback after GitHub reporting is verified.
- [ ] Configure branch protection or repository rules for the release branch.
- [ ] Run and pass hosted CI on Node.js 20, 22, and 24.

## Required before npm publication

- [ ] Confirm the npm package name is available and controlled by the intended
  maintainer account or organization.
- [ ] Confirm `npm whoami` returns the authorized publisher.
- [ ] Require two-factor authentication for publication.
- [ ] Configure and test npm trusted publishing/provenance or the approved
  provenance-capable release credential.
- [ ] Start from a clean checkout of the exact hosted CI commit.
- [ ] Run `npm ci`, `npm run check:release`, every example,
  `npm pack --dry-run`, and `git diff --check`.
- [ ] Inspect and approve the exact tarball contents and hashes.
- [ ] Confirm only intended release changes remain.

## Publish

- [ ] Create the reviewed release commit.
- [ ] Create the final reviewed tag only after the go decision.
- [ ] Publish with maintainer-controlled npm provenance and two-factor
  protection.
- [ ] Publish the exact verified tarball without rebuilding.
- [ ] Never publish from a dirty or unreviewed working tree.

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
