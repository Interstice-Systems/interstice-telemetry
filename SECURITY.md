# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| Latest `1.0.0-rc.x` candidate | Yes, during the active RC period |
| `1.0.x` after public release | Yes |
| Unpublished internal milestones | No |
| Superseded release candidates | No |

Only versions actually published through the authoritative npm package are
release artifacts. Repository milestone labels do not create a supported
release.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability.

Once the public repository exists, use GitHub private vulnerability reporting:

```text
https://github.com/Interstice-Systems/interstice-telemetry/security/advisories/new
```

Private vulnerability reporting must be enabled before the first public npm
release. Until then, the temporary contact placeholder is:

```text
SECURITY_CONTACT_PENDING@example.invalid
```

This address is intentionally non-deliverable. Replace it with a monitored
security address or another documented private channel before making the
repository or package public. Do not send vulnerability details to the
placeholder.

A report should include:

- affected version and component,
- reproduction steps or proof of concept,
- expected impact,
- known mitigations,
- whether the issue has been disclosed elsewhere.

Before public release there is no guaranteed response SLA. After public
release, maintainers intend to acknowledge complete reports within seven days
and provide a status update within fourteen days, subject to severity and
maintainer availability.

## Vulnerability scope

Relevant reports include unsafe artifact path handling, untrusted replay or
artifact parsing, dependency vulnerabilities affecting package consumers, and
unexpected execution of loaded data. Security boundary bypasses, integrity
failures, and unintended exposure of sensitive evidence are also in scope.

Simulation accuracy, physical robot safety certification, unsupported runtime
versions, and behavior of third-party adapters are outside this package's
security guarantee unless they expose a concrete software vulnerability.
Feature requests, general defects without security impact, and reports about
unsupported versions should use the normal issue tracker after it exists.
