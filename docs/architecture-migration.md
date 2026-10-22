# Villages architecture and compatibility

The 0.7.0 architecture baseline separated feature ownership, host access and saved-state projection. Its fresh-world scope was a historical release decision; it does not authorize loss or reset of later saved worlds.

## Code ownership

Maintained source is in `packages/villages/src`.

| Owner           | Responsibility                                                                |
| --------------- | ----------------------------------------------------------------------------- |
| Client features | Screens, feature state and commands                                           |
| Client shell    | Navigation, shared snapshots, responsive state, presence and feature assembly |
| Server entry    | Assembly and lifecycle of activation-owned services, adapters and jobs        |
| Server features | Request coordination through explicit contracts                               |
| Domain          | Saved models, decoding, calculations and rules without host I/O               |
| Adapters        | Engine public APIs, storage, generation, accounting and diagnostics           |
| Jobs            | Owned background work and finite preparation                                  |

`scripts/feature-interfaces.mjs` declares cross-feature contracts. Architecture checks enforce private feature boundaries, client/server privacy, dependency direction and absence of cycles. Shared support does not import shell assembly or private feature implementations. Public contracts expose consumed values and commands rather than another feature's private state or hook types.

New layers and interfaces need a concrete purpose. Tests import the actual owner rather than relying on forwarding exports.

## Activation and request lifetimes

Each activation owns its services, caches, queues, operation maps and host connections. Asynchronous work retains its originating owner. A missing or disposed activation cannot borrow another world's services, even when identifiers match. Cleanup from an older owner cannot stop or clear its replacement.

Client commands claim admission before mutation and preserve the originating world, selection and request identity. Results, errors and cleanup belong to that claim. Reset, disposal or replacement retires old work; functional acknowledgments preserve newer edits. These lifetimes do not impose global ordering on independent full-snapshot responses.

Cancellation revokes authority to apply late effects. It does not promise that an upstream provider physically stopped or that an uncertain request was unbilled. Existing operation deadlines, request reservations and recovery records remain authoritative.

See [activation dispatch ownership](activation-dispatch-ownership.md), [activation cleanup](activation-cleanup.md) and [Decisions ownership](decisions-activation-ownership.md).

## Scenes and privacy

A Venue contains Zones; a Scene continues across movement between those Zones. At admission, the server captures attendance, positions, activities, connections, time and source facts for writing. Background changes cannot rewrite an active snapshot. Exact accepted Scene effects extend its presentation context through existing receipts; those projections never become authority for a world write. Unseen attendance, captured facts and private contents stay server-side. Legacy open Scenes capture available source facts once; closed Scenes stay closed.

Source spans, witnesses, authority, revisions and physical receipts bind proposed effects to the saved interaction. Hearing, understanding, disclosure, entry and permission to change a space remain separate. Domain validation determines actual effects after model interpretation.

Ordinary snapshots expose only player-safe projections. Private diagnostics, raw provider output, frozen prompts and undiscovered interiors do not enter ordinary client contracts.

See [Scene privacy](scene-response-privacy.md), [System responsibilities](system-ownership.md) and [generation lifecycle](generation-pipeline.md) for the detailed contracts.

## Saved work and compatibility

Saved generation, validation, committed effects and Scene bookkeeping are distinct stages. Claims precede provider dispatch; completed responses and effect receipts support local replay. Compare-and-swap retries reuse saved output and preserve request accounting.

Jobs and operations bind the village seed, subject, source revision, attempt and admitted contract. Reset, removed residents, changed inputs, supersession and teardown fence late effects. Existing operations retain their original prompts and stage contracts rather than silently adopting new generation behavior.

Reads, polling, notices, diagnostics and storage retries do not authorize paid dispatch. Unknown provider outcomes require deliberate retry. A successful model response does not by itself establish a committed effect.

Engine document writes are buffered, without a package-visible durable flush barrier. A hard crash can lose recently acknowledged claims or responses. Recovery records improve normal-operation replay; they do not provide crash-proof billing deduplication.

Saved-data changes preserve existing worlds or explicitly document the compatibility decision. The 0.7.0 fresh-world baseline and later feature-specific draft resets are not standing permission to discard data.

See [response recovery](scene-response-recovery.md), [Scene continuity recovery](scene-continuity-recovery.md) and the [generation lifecycle](generation-pipeline.md).

## Engine and validation

Villages uses declared permissions and public Engine APIs. Optional Decisions integration feature-detects `api.runtime.decisions.evaluate()`; unsupported capabilities retain System behavior. Private Engine implementations are not bundled.

Locked dependencies and pinned public declarations support builds without an Engine checkout. The repository builder owns generated payloads and deterministic archives; maintained source, tests and documentation are committed.

[DEVELOPMENT.md](../DEVELOPMENT.md) owns commands and release steps; [AGENTS.md](../AGENTS.md) owns development principles. Provider-free tests establish their exercised contracts, not live-provider quality or actual Engine integration.

The former extraction ledger is retained in Git history. This document describes the resulting boundaries rather than intermediate task status.
