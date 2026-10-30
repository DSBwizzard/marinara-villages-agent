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

A Venue contains Zones; a Scene continues across movement between those Zones. At admission, the server captures attendance, positions, activities, connections, time and source facts for writing. Background changes cannot rewrite an active snapshot. Exact accepted Scene effects extend its presentation context through existing receipts; those projections never become authority for a world write. Unseen attendance, captured facts and private contents stay server-side. Current-format Scenes reserve sparse memory continuity before attaching their captured facts; recovery reuses that reservation. Closed Scenes stay closed.

Source spans, witnesses, authority, revisions and physical receipts bind proposed effects to the saved interaction. Hearing, understanding, disclosure, entry and permission to change a space remain separate. Domain validation determines actual effects after model interpretation.

Ordinary snapshots expose only player-safe projections. Private diagnostics, raw provider output, frozen prompts and undiscovered interiors do not enter ordinary client contracts.

See [Scene privacy](scene-response-privacy.md), [System responsibilities](system-ownership.md) and [generation lifecycle](generation-pipeline.md) for the detailed contracts.

## Saved work and compatibility

The current runtime uses Village format 7, Scene/continuity format 3 and relationship format 2. Compact Zone continuity is a fresh-world change: older played worlds and setup records are rejected without conversion or writes. Existing saved data must remain in its independent storage with its matching runtime. There is no physical-state migration, history backfill, dual write or old memory reader. A compact Village CAS publishes one immutable history reference with matching mechanics. The referenced payload contains the collection, active sparse memory preimages and memory-only receipts; ordinary world reads do not load it. Publication intents fence cleanup against concurrent writers and preserve ambiguous recovery. Scene attachment is a separate resumable stage. See [Memories](memories-core.md).

Saved generation, validation, committed effects and Scene bookkeeping are distinct stages. Claims precede provider dispatch; completed responses and effect receipts support local replay. Compare-and-swap retries reuse saved output and preserve request accounting.

Jobs and operations bind the village seed, subject, source revision, attempt and admitted contract. Reset, removed residents, changed inputs, supersession and teardown fence late effects. Existing operations retain their original prompts and stage contracts rather than silently adopting new generation behavior.

Reads, polling, notices, diagnostics and storage retries do not authorize paid dispatch. Unknown provider outcomes require deliberate retry. A successful model response does not by itself establish a committed effect.

Engine document writes are buffered, without a package-visible durable flush barrier. A hard crash can lose recently acknowledged claims or responses. Recovery records improve normal-operation replay; they do not provide crash-proof billing deduplication.

Zone.description is the authoritative current physical account, bounded at 4,000 characters. Zone.state carries only a monotonic revision, updatedAt and one optional recent paragraph (600 characters, occurrence plus 24-hour expiry). Natural updates use unique exact text edits and/or an addition, reject overlapping/ambiguous anchors and overflow, and preserve all text outside edits. System judges meaning, available supplies and consent; code binds actions and consent to witnessed sources, then enforces current authority and revisions. Memories retain knowledge and intentions rather than duplicating physical truth. Scene receipt replay uses exact accepted after-values against frozen context. REPAIR and checkpoint undo restore exact retained expiry, advance revisions and retain the existing Project design hash, which includes descriptions only for deliberate replacement targets. Artwork uses enduring prose, with a bounded 8,000-character input and the existing compiled-style guard. Temporary use requires current access; enduring changes require current-controller action or witnessed consent. Scheduled resident encounters settle physical proof before dependent Memories, with actor-only witness audiences. Catch-up stages all effects atomically. Full physical after-values remain only while their source needs replay, then retirement retains compact outcome identities. Uncommitted failed encounters can be skipped; partially committed encounters must finish recovery.

Saved-data changes preserve existing worlds or explicitly document the compatibility decision. The 0.7.0 fresh-world baseline and later feature-specific draft resets are not standing permission to discard data.

The user-approved storage growth and recovery overhaul is a one-time exception: its PRs may change saved formats and require fresh Villages, including between PRs. Do not add migrations, legacy readers, transitional adapters or cross-PR save compatibility. Each supported format must persist and recover correctly across restarts. This exception does not authorize resetting or replacing an existing installation or world; deployment protections and recovery holds still apply. After the overhaul, saved-world compatibility is again the default recommendation.

### Recovery disposition

Scheduling labels and failure messages do not establish that evidence is disposable. The domain recovery classification checks saved work and uncertainty before accepting a terminal label:

| Disposition | Required evidence and behavior |
| --- | --- |
| Pending | Accepted work is queued, running or paused. Retain its admission and continuation; an explicit pause does not authorize dispatch. |
| Recoverable | A saved reply, result or partially committed effect permits useful continuation. Reuse purchased output before considering a replacement request. |
| Uncertain | A dispatched request, effect or publication has no conclusive outcome. Retain its reconciliation evidence and replay guards; do not automatically purchase a duplicate. |
| Completed | Required effects and publication are acknowledged and no continuation remains. An inconsistent completed label cannot override retained unfinished evidence. |
| Failed | The attempt ended conclusively without saved work or an unresolved obligation. Ordinary diagnostics can eventually be retired independently of replay protection. |
| Safely abandoned | Dispatch/callback authority is fenced and committed effects reconciled. An obsolete label alone does not prove this disposition. |

Compaction requires a terminal disposition, preserved accounting/replay protection and an owner for every still-needed piece of evidence. Full receipt deletion additionally requires a durable closed scope, epoch or high-water rule that rejects every possible replay, and no remaining reference. Age, a failure label and diagnostic retention limits are insufficient. These requirements precede the later compaction implementation; the current background cleanup only adds a guard against discarding pending, recoverable or uncertain records. It does not enable new pruning or paid retries.

### Reference lifetime

Ownership is explicit and world-scoped. Do not infer references by scanning arbitrary player/model prose. Current storage uses existing payload intents, operation records and captured facts; later storage changes must preserve these owner obligations before adding deletion:

| Owner | Protected dependencies and release boundary |
| --- | --- |
| Current authority and meaningful retained history | Current facts, exact evidence, individual knowers, corrections, resolutions and Forget suppression. No automatic history expiration or lifetime cap. |
| Active/frozen Scene | Captured attendance, privacy, facts, accepted own effects, evidence and media. Release only after established retirement and transfer of retained evidence ownership. |
| Departure capture and unfinished catch-up | Exact historical facts, admissions and unsettled outcomes. Release after settlement or proven safe abandonment; retained outcomes remain owned by history. |
| Unfinished or uncertain operation | Admission, saved paid replies, commit/publication evidence and assets. Release only after reconciliation and terminal disposition. |
| Available repair Undo | Exact inverse dependencies and assets. Later retention keeps ten successful Undo records; losing Undo availability does not erase meaningful repair history. |
| Automatic/manual checkpoint | The complete transitive snapshot and media dependencies. Later retention keeps ten automatic checkpoints; manual checkpoints remain until explicitly deleted. Recovery/explicit holds override ordinary eviction. |
| Saved evidence and replay protection | Exact cited sources and information that rejects duplicate effects. Release only after ownership transfer or a proven replay fence with no remaining reference. |

Publication protects existing and proposed dependencies before creating bodies, validates them, then publishes through the existing CAS/repair fence. Ambiguous or interrupted publication retains its intent. Cleanup may release superseded data only after new ownership commits, and must recheck owner revisions and outstanding intents under the same fence before deletion. A writer cannot attach a new reference concurrently with that deletion. Missing, corrupt or unknown ownership defers cleanup. Restore validates/protects its dependencies before publication and cannot rewind operation epochs or replay protection. Startup reconciles unfinished publication/repair journals before cleanup.

Keep native media reference fields visible to Engine's Gallery protection even when historical prose is stored opaquely. Cleanup acts only on attributable Villages candidates. Avoid authoritative reference counts or a generalized collector: extend existing intents/fences and explicit owner manifests only where a concrete storage change requires them.

See [response recovery](scene-response-recovery.md), [Scene continuity recovery](scene-continuity-recovery.md) and the [generation lifecycle](generation-pipeline.md).

## Engine and validation

Villages uses declared permissions and public Engine APIs. Optional Decisions integration feature-detects `api.runtime.decisions.evaluate()`; unsupported capabilities retain System behavior. Private Engine implementations are not bundled.

Locked dependencies and pinned public declarations support builds without an Engine checkout. The repository builder owns generated payloads and deterministic archives; maintained source, tests and documentation are committed.

[DEVELOPMENT.md](../DEVELOPMENT.md) owns commands and release steps; [AGENTS.md](../AGENTS.md) owns development principles. Provider-free tests establish their exercised contracts, not live-provider quality or actual Engine integration.

The former extraction ledger is retained in Git history. This document describes the resulting boundaries rather than intermediate task status.
