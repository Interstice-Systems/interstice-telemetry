# npm Release Setup

The configured package name is:

```text
interstice-telemetry
```

An npm registry `404` indicates that no public package currently resolves at
that name. It does not reserve the name or prove publication authority.

## Account and name checks

Run these as the intended maintainer:

```bash
npm whoami
npm view interstice-telemetry
```

Confirm in the npm web interface that:

- the signed-in account or organization controls the package name;
- designated maintainers have the minimum necessary access;
- publication requires two-factor authentication;
- recovery methods and organization ownership are current.

Do not put npm tokens in the repository, shell history, documentation, or CI
logs.

## Provenance and credentials

After the GitHub repository exists:

1. Prefer npm trusted publishing with GitHub Actions and short-lived OIDC
   credentials.
2. Bind the trusted publisher to the exact
   `Interstice-Systems/interstice-telemetry` repository and approved release
   workflow/environment.
3. Keep ordinary CI read-only; add publication permissions only to a separate,
   approval-gated release workflow.
4. If a token is temporarily required, use a granular publication token,
   require two-factor protection where supported, scope it to this package,
   and rotate or revoke it after use.
5. Require npm provenance for the release artifact and verify the resulting
   registry attestation after publication.

## Final local checks

Never publish from a dirty working tree. From a clean checkout of the exact
hosted CI commit, run:

```bash
npm ci
npm run check:release
npm pack --dry-run
git diff --check
git status --short
```

Run every example and inspect the tarball contents. Confirm `package.json` and
`package-lock.json` use the approved version, package metadata URLs resolve,
and GitHub CI passed on the same commit.

## Publication command

**DO NOT RUN UNTIL THE FINAL v1 GO DECISION.**

The intended command is:

```bash
npm publish --provenance --access public
```

Run it only through the approved provenance-capable release environment.
Publishing is irreversible for that version. Do not rebuild between final
artifact approval and publication.
