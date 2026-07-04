# API Freeze Review

The baseline contains 85 generated declaration files for the root and browser
subpath dependency surface. Exact comparison catches additions, removals,
renames, and signature text changes.

Stable-by-default, experimental, and internal-compatibility classifications
are defined in `docs/API_FREEZE_V1.md`. Adapter event streams, global fleet
timeline APIs, and future platform interfaces remain experimental. They may
ship in v1 because they are labeled, but consumers should pin versions when
depending on them.

Risk: byte comparison is intentionally stricter than TypeScript assignability
analysis and requires review for compatible additions. It does not prove
runtime behavioral compatibility.
