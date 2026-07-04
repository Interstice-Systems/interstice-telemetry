# v1 Release Plan

v1.5.0 is the release-candidate engineering milestone for public v1.0.0. It
adds gates and hardening, not robotics features.

## Candidate sequence

1. Freeze declarations and serialized fixture baselines.
2. Run the full matrix and packed consumers from a clean checkout.
3. Resolve or explicitly accept every readiness warning.
4. Cut an RC tag from the exact reviewed commit.
5. Hold a design-partner validation period.
6. Promote unchanged candidate content to v1.0.0 after approval.

## Exit criteria

- all CI, API, fixture, packed-consumer, browser, and example checks pass;
- no unexplained declaration or fixture changes;
- experimental APIs are clearly labeled;
- repository ownership, support, security, and npm controls are confirmed;
- no high-severity correctness or evidence-integrity issue remains.

Publication is never automatic. Maintainer approval and repository/registry
authority remain external prerequisites.
