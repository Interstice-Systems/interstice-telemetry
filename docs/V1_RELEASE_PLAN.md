# v1 Release Plan

`1.0.0-rc.1` is the first public v1 release candidate. The repository's
v1.1–v1.5 labels are unpublished internal engineering milestones and do not
represent npm registry releases. The registry contained no
`interstice-telemetry` package when this version was selected.

## Candidate sequence

1. Complete local metadata, security, workflow, package, and documentation
   preparation.
2. Create the authoritative GitHub repository and private reporting channel.
3. Push a reviewed candidate commit and pass hosted Node 20/22/24 CI.
4. Confirm npm ownership, two-factor authentication, and provenance controls.
5. Run the full matrix and packed consumers from a clean checkout.
6. Resolve or explicitly accept every readiness warning.
7. Cut an RC tag from the exact reviewed commit.
8. Hold a design-partner validation period.
9. Promote unchanged candidate content to `1.0.0` after approval, changing
   only version/changelog metadata and rebuilding from the reviewed commit.

## Exit criteria

- all CI, API, fixture, packed-consumer, browser, and example checks pass;
- no unexplained declaration or fixture changes;
- experimental APIs are clearly labeled;
- repository ownership, support, security, and npm controls are confirmed;
- no high-severity correctness or evidence-integrity issue remains.

Publication is never automatic. Maintainer approval and repository/registry
authority remain external prerequisites. Follow
[GitHub Repository Setup](GITHUB_REPO_SETUP.md) and
[npm Release Setup](NPM_RELEASE_SETUP.md).
