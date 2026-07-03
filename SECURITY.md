# Security Policy

## Supported versions

Before v1.0, security fixes are applied to the latest released 0.x version.
Older prerelease lines are not maintained.

After v1.0, this table will list supported release lines explicitly.

| Version | Supported |
|---|---|
| Latest 0.x | Yes |
| Older 0.x | No |

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability.

Use GitHub private vulnerability reporting for the repository when available.
If it is not enabled, contact the maintainers through a private channel listed
on the repository profile and include:

- affected version and component,
- reproduction steps or proof of concept,
- expected impact,
- known mitigations,
- whether the issue has been disclosed elsewhere.

Maintainers should acknowledge a complete report within seven days and provide
a status update within fourteen days. Timelines may change with severity and
maintainer availability.

## Scope

Relevant reports include unsafe artifact path handling, untrusted replay or
artifact parsing, dependency vulnerabilities affecting package consumers, and
unexpected execution of loaded data.

Simulation accuracy, physical robot safety certification, unsupported runtime
versions, and behavior of third-party adapters are outside this package's
security guarantee unless they expose a concrete software vulnerability.
