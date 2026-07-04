# Pre-v1 Dogfood Release-Candidate Assessment

## Fixed

- Added high-level custom mission evidence export using the existing local,
  indexed artifact writer.
- Added deterministic plain-text twin diagnostic rendering.
- Clarified canonical state versus operating-mode terminology.
- Documented same-timestamp replay folding and provenance seeding.
- Recorded command/custom events, runtime adapter state transitions, and
  richer bridge helpers as post-v1 work.

## Remaining

- Complete the external release controls in `docs/RELEASE_CHECKLIST.md`,
  including supported-Node CI, repository ownership, npm two-factor and
  provenance controls, and an RC period against the exact tarball.
- Preserve the resolved public version sequence: `1.0.0-rc.1` is the first
  registry candidate because the historical v1.1–v1.5 milestones were never
  published.
- Consider command/custom adapter events and mutable stream operating state
  only through a separately reviewed post-v1 design.

## Risk and blocker assessment

Public API and serialized-compatibility risk from this patch is low. The new
exports and artifact discriminants are additive; existing scenario/fleet
layouts and document versions are unchanged.

Rover-0 revealed one release-blocking developer-experience gap: custom
applications lacked a supported evidence exporter. That gap is fixed. It
revealed no correctness or evidence-integrity blocker.

The remaining release risk is operational/versioning rather than a Rover-0
SDK defect.

## Verification

- `npm test`: 77 files and 291 tests passed.
- `npm run typecheck`, `npm run lint`, and `npm run build`: passed.
- `npm run check`: passed, including the 86-file declaration baseline.
- All 25 TypeScript examples: passed.
- Packed Node ESM, TypeScript, and browser-safe consumers: passed.
- `npm pack --dry-run`: passed; 261 files were inspected.
- `git diff --check`: passed.

## Recommendation

`READY_WITH_WARNINGS`

The release-number decision is resolved. Proceed only after external release
controls are explicitly reviewed.
