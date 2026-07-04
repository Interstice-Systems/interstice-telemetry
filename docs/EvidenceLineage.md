# Evidence Lineage

Evidence lineage queries inspect relationships within one manifest:

- `traceEvidenceAncestors`
- `traceEvidenceDescendants`
- `findEvidenceByKind`
- `findEvidenceByRobot`
- `findEvidenceByProvenance`

Most relationship edges describe flow from `fromEvidenceId` to
`toEvidenceId`. `derived-from` follows its natural grammar: the `from` entry is
derived from the `to` entry. Ancestor and descendant queries normalize this
one reversed dependency direction. Builders use forward flow for production,
validation, reporting, and containment.

Queries return entries in stable evidence-ID order. A missing starting ID
returns an empty array. Traversal tracks visited IDs, so malformed or
intentionally cyclic graphs terminate safely without returning the starting
entry.

Lineage describes declared dependencies. It does not execute transformations,
load artifact files, verify claims, or infer undeclared relationships.
