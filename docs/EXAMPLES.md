# Examples

Examples use the public package entry point through the local source build.
They are typechecked with the repository and run synchronously.

| Command | File | Demonstrates | Side effects |
|---|---|---|---|
| `npm run example` | `basic-simulation.ts` | Seeded simulator snapshots | stdout |
| `npm run example:stream` | `event-stream.ts` | Stream lifecycle and events | stdout |
| `npm run example:replay` | `replay-log.ts` | Record, validate, serialize, play | stdout |
| `npm run example:scenario` | `scenario-profile.ts` | Built-in scenario execution | stdout |
| `npm run example:console` | `console-dashboard.ts` | Pure text reports | stdout |
| `npm run example:hardware` | `hardware-adapters.ts` | Virtual adapters and collection | stdout |
| `npm run example:fleet` | `fleet-scenario.ts` | Sorted multi-robot run and replay | stdout |
| `npm run example:artifacts` | `experiment-artifacts.ts` | Fleet artifact export/readback | temporary directory, stdout |
| `npm run example:custom-artifacts` | `custom-mission-artifacts.ts` | Custom evidence export and diagnostic text | temporary directory, stdout |
| `npm run example:custom-experiment` | `custom-experiment-bundle.ts` | Generic custom bundle validation, manifest derivation, and export | temporary directory, stdout |
| `npm run example:adapter-stream` | `adapter-event-stream.ts` | Adapter events through replay | stdout |
| `npm run example:clock` | `clock-system.ts` | Four deterministic clock roles | stdout |
| `npm run example:timeline` | `fleet-timeline.ts` | Timeline build, query, report, export | temporary directory, stdout |

## Suggested order

1. `example`
2. `example:stream`
3. `example:replay`
4. `example:scenario`
5. `example:fleet`
6. `example:timeline`
7. `example:artifacts`
8. `example:custom-experiment`
9. adapter, clock, and report examples as needed

## What to verify

Examples should:

- terminate without background processes,
- use deterministic seeds and explicit steps,
- import only from `src/index.ts`,
- keep real device, network, and cloud access out of the core,
- use temporary directories for demonstration artifacts,
- avoid depending on terminal width or colors.

CI currently typechecks examples. Runtime example smoke testing remains a v1
release recommendation.
