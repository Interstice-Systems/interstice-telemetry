# GitHub Repository Setup

The intended authoritative repository is:

```text
https://github.com/Interstice-Systems/interstice-telemetry
```

Do not create a release tag or publish to npm during repository setup.

## Create the repository

1. Sign in with an account authorized to create repositories in
   `Interstice-Systems`.
2. Create `Interstice-Systems/interstice-telemetry`.
3. Keep the repository private until release governance and documentation have
   been reviewed.
4. Do not initialize it with another README, license, or `.gitignore`; those
   files already exist locally.
5. Confirm the repository owner and maintainer team.

## Add the remote and push

Review and commit the local candidate before pushing. Then use SSH:

```bash
git remote add origin git@github.com:Interstice-Systems/interstice-telemetry.git
git branch -M main
git push -u origin main
```

HTTPS alternative:

```bash
git remote add origin https://github.com/Interstice-Systems/interstice-telemetry.git
git branch -M main
git push -u origin main
```

If `origin` already exists, inspect it before changing anything:

```bash
git remote -v
```

Use `git remote set-url origin <url>` only after confirming that the existing
remote is obsolete.

## Configure repository governance

1. Confirm these package metadata URLs resolve:
   - `https://github.com/Interstice-Systems/interstice-telemetry`
   - `https://github.com/Interstice-Systems/interstice-telemetry/issues`
   - `https://github.com/Interstice-Systems/interstice-telemetry#readme`
2. Enable private vulnerability reporting under repository security settings.
3. Verify the private advisory URL:
   `https://github.com/Interstice-Systems/interstice-telemetry/security/advisories/new`.
4. Replace the placeholder in `SECURITY.md` with a monitored private contact,
   or remove the fallback after GitHub private reporting is confirmed.
5. Configure branch protection or repository rules for `main`:
   - require pull requests for changes;
   - require the Node 20, 22, and 24 CI checks;
   - prevent force pushes and branch deletion;
   - require review for workflow and release-governance changes;
   - limit bypass authority to designated maintainers.
6. Review Actions permissions. CI needs read-only repository contents and does
   not need package publication credentials.
7. Push a release-candidate branch or reviewed candidate commit.
8. Confirm every GitHub Actions matrix job passes.
9. Inspect the hosted commit and package dry-run before any tag is created.

Only after these checks pass should maintainers consider the RC tag and npm
publication decision.
