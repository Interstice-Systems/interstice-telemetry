# Evidence Ownership

`EvidenceOwnership` is descriptive metadata for downstream tools:

```ts
type EvidenceOwnership = {
  ownerType:
    | "local"
    | "organization"
    | "competition"
    | "research"
    | "public";
  ownerId?: string;
  visibility:
    | "private"
    | "organization"
    | "competition"
    | "public";
};
```

The default is `{ ownerType: "local", visibility: "private" }`.
`createEvidenceOwnership` validates and freezes the value.

Ownership does not grant, deny, or enforce access. Visibility does not redact
data. The SDK has no accounts, authentication, permissions, or hosted identity
registry. Applications may use these fields for labeling, export policy, or
future hosted workflows, but security decisions require an external
authorization system.

An `ownerId` is an application-defined stable label. It must not be treated as
a verified identity.
