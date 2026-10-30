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

The current runtime uses Village format 10, native Scene storage format 4 (logical Scene/continuity contract 3) and native relationship root format 4 (logical relationship contract 3). These storage changes require a fresh Village; unsupported records are rejected without conversion or writes. Existing saved data must remain in its independent storage with its matching runtime. There is no migration, history backfill, dual write or legacy reader. Compact Village and relationship CAS roots publish immutable history references with matching mechanics. Bounded pages hold Memories, active sparse memory preimages, relationship event receipts, per-edge records/experiences and per-thread complete letters. Publication intents precede immutable allocation and remain admitted through owner CAS. Owner-aware idle housekeeping reclaims superseded immutable roots, pages, snapshots and retired Undo bodies; checkpoints share heads and transitive pages. Scene attachment is a separate resumable stage. See [Memories](memories-core.md).

Saved generation, validation, committed effects and Scene bookkeeping are distinct stages. Claims precede provider dispatch; completed responses and effect receipts support local replay. Compare-and-swap retries reuse saved output and preserve request accounting.

Jobs and operations bind the village seed, subject, source revision, attempt and admitted contract. Reset, removed residents, changed inputs, supersession and teardown fence late effects. Existing operations retain their original prompts and stage contracts rather than silently adopting new generation behavior.

Reads, polling, notices, diagnostics and storage retries do not authorize paid dispatch. Unknown provider outcomes require deliberate retry. A successful model response does not by itself establish a committed effect.

Engine document writes are buffered, without a package-visible durable flush barrier. A hard crash can lose recently acknowledged claims or responses. Recovery records improve normal-operation replay; they do not provide crash-proof billing deduplication.

Zone.description is the authoritative current physical account, bounded at 4,000 characters. Zone.state carries only a monotonic revision, updatedAt and one optional recent paragraph (600 characters, occurrence plus 24-hour expiry). Natural updates use unique exact text edits and/or an addition, reject overlapping/ambiguous anchors and overflow, and preserve all text outside edits. System judges meaning, available supplies and consent; code binds actions and consent to witnessed sources, then enforces current authority and revisions. Memories retain knowledge and intentions rather than duplicating physical truth. Scene receipt replay uses exact accepted after-values against frozen context. REPAIR and checkpoint undo restore exact retained expiry, advance revisions and retain the existing Project design hash, which includes descriptions only for deliberate replacement targets. Artwork uses enduring prose, with a bounded 8,000-character input and the existing compiled-style guard. Temporary use requires current access; enduring changes require current-controller action or witnessed consent. Scheduled resident encounters settle physical proof before dependent Memories, with actor-only witness audiences. Catch-up stages all effects atomically. Full physical after-values remain only while their source needs replay, then retirement retains compact outcome identities. Uncommitted failed encounters can be skipped; partially committed encounters must finish recovery.

Saved-data changes preserve existing worlds or explicitly document the compatibility decision. The 0.7.0 fresh-world baseline and later feature-specific draft resets are not standing permission to discard data.

The user-approved storage growth and recovery overhaul is a one-time exception: its PRs may change saved formats and require fresh Villages, including between PRs. Do not add migrations, legacy readers, transitional adapters or cross-PR save compatibility. Each supported format must persist and recover correctly across restarts. This exception does not authorize resetting or replacing an existing installation or world; deployment protections and recovery holds still apply. After the overhaul, saved-world compatibility is again the default recommendation.

### Recovery disposition

Scheduling labels and failure messages do not establish that evidence is disposable. The domain recovery classification checks saved work and uncertainty before accepting a terminal label:

| Disposition      | Required evidence and behavior                                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pending          | Accepted work is queued, running or paused. Retain its admission and continuation; an explicit pause does not authorize dispatch.                                       |
| Recoverable      | A saved reply, result or partially committed effect permits useful continuation. Reuse purchased output before considering a replacement request.                       |
| Uncertain        | A dispatched request, effect or publication has no conclusive outcome. Retain its reconciliation evidence and replay guards; do not automatically purchase a duplicate. |
| Completed        | Required effects and publication are acknowledged and no continuation remains. An inconsistent completed label cannot override retained unfinished evidence.            |
| Failed           | The attempt ended conclusively without saved work or an unresolved obligation. Ordinary diagnostics can eventually be retired independently of replay protection.       |
| Safely abandoned | Dispatch/callback authority is fenced and committed effects reconciled. An obsolete label alone does not prove this disposition.                                        |

Compaction requires a terminal disposition, preserved accounting/replay protection and an owner for every still-needed piece of evidence. Full receipt deletion additionally requires a durable closed scope, epoch or high-water rule that rejects every possible replay, and no remaining reference. Age, a failure label and diagnostic retention limits are insufficient. These requirements precede the later compaction implementation; the current background cleanup only adds a guard against discarding pending, recoverable or uncertain records. It does not enable new pruning or paid retries.

An explicit Village Reset ends the old world's ownership and retains the established removal of its private jobs after active work settles. The new seed fences their application to the replacement world. Removing a resident or marking a current-world job obsolete does not confer that authority. Malformed records whose ownership cannot be established remain protected. Unknown token counts are accounting uncertainty, not proof that a completed request is still unfinished.

Unapplied REPAIR reviews are administrative previews produced by simulation. They have no committed effects and are never the sole owner of a paid response: their authoritative source records remain unchanged. Keep at most ten valid current-world previews, discard them on explicit cancellation, and retire an applied preview in the same journal as its effects and acknowledgment. Apply checks the retained preview and its unique creation token before publishing any effects. A repeated request may recreate an evicted/cancelled review, but its new token cannot restore an old Apply's authority or let a late Cancel erase the replacement. Drafts remain client-owned. Unfinished repair journals recover before cache retirement; unknown/corrupt or foreign ownership is retained. This cache limit does not prune player history, Undo or checkpoints.

### Reference lifetime

Ownership is explicit and world-scoped. Do not infer references by scanning arbitrary player/model prose. Current storage uses existing payload intents, operation records and captured facts; later storage changes must preserve these owner obligations before adding deletion:

| Owner                                             | Protected dependencies and release boundary                                                                                                                                                                                                                  |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Current authority and meaningful retained history | Current facts, exact evidence, individual knowers, corrections, resolutions and Forget suppression. No automatic history expiration or lifetime cap.                                                                                                         |
| Active/frozen Scene                               | Captured attendance, privacy, facts, accepted own effects, evidence and media. Release only after established retirement and transfer of retained evidence ownership.                                                                                        |
| Departure capture and unfinished catch-up         | Exact historical facts, admissions and unsettled outcomes. Release after settlement or proven safe abandonment; retained outcomes remain owned by history.                                                                                                   |
| Unfinished or uncertain operation                 | Admission, saved paid replies, commit/publication evidence and assets. Release only after reconciliation and terminal disposition.                                                                                                                           |
| Available repair Undo                             | Exact inverse dependencies and assets. Retain the ten most recently committed successful repair payloads; consumed Undo does not resurrect older payloads. Permanent repair headers preserve changes, audiences and Undo provenance after availability ends. |
| Automatic/manual checkpoint                       | The complete transitive snapshot and media dependencies. Retain ten automatic checkpoints by committed publication order; manual checkpoints remain until explicitly deleted. Recovery/explicit holds override ordinary eviction.                            |
| Saved evidence and replay protection              | Exact cited sources and information that rejects duplicate effects. Release only after ownership transfer or a proven replay fence with no remaining reference.                                                                                              |

Publication protects existing and proposed dependencies before creating bodies, validates them, then publishes through the existing CAS/repair fence. Ambiguous or interrupted publication retains its intent. Cleanup may release superseded data only after new ownership commits, and must recheck owner revisions and outstanding intents under the same fence before deletion. A writer cannot attach a new reference concurrently with that deletion. Missing, corrupt or unknown ownership defers cleanup. Restore validates/protects its dependencies before publication and cannot rewind operation epochs or replay protection. Startup reconciles unfinished publication/repair journals before cleanup.

Checkpoint format 2 headers and separate Undo bodies reference content-addressed native document snapshots. Snapshot data remains identical to its source so Engine can see the same Gallery owners. Snapshot identity includes the complete source, including its saved clock. Configuration saves preserve the original setup identity. Plans and format-3 repair journals reference immutable after-images and before digests, with opaque packets only for validated create-only Memory pages. Application composes effects, retention ownership and plan retirement in one overlay and journal. Every replay frame and source is validated before the first effect. Preparation and owner publication remain admitted through the existing repair gate; cleanup cannot enter that gap. Deleting a manual checkpoint releases its references with one CAS and retains a minimal token tombstone so a delayed save cannot recreate it. Physical cleanup validates all retained owners, including other world scopes, before its first deletion. Each retained review has its own proposed-write overlay; virtual pages cannot validate a missing physical checkpoint dependency. The Memory tracer follows references inside serialized Scene headers and visits shared structural pages once per lookup scope. Malformed or missing ownership defers deletion. After all writers drain, well-formed abandoned intents can release partially created unowned artifacts.

Keep native media reference fields visible to Engine's Gallery protection even when historical prose is stored opaquely. Cleanup acts only on attributable Villages candidates. Avoid authoritative reference counts or a generalized collector: extend existing intents/fences and explicit owner manifests only where a concrete storage change requires them.

Storage admission is shared by canonical Engine backend identity across replacement module snapshots. Disposed activations retain their outstanding admission until invoked host writes settle; they cannot publish new work. Startup journal readiness is invalidated when the shared recovery epoch advances. Full history reads remain admitted across their entire load. Cleanup acquires the same exclusion before tracing and deletion; newly arriving gameplay waits for cleanup rather than receiving a repair conflict. Package installation still uses the guarded stopped-runtime boundary for the first deployment of this participation contract.

One initial idle sweep recovers allocations from an earlier activation. Later sweeps are coalesced after approximately the greater of 1 MiB or the prior live footprint has been allocated. This footprint includes retained owner metadata as well as immutable bodies, so many manual checkpoints do not cause increasingly frequent full owner scans. Estimates are activation-local and may safely overcount failed creates; no routine persistent counter writes or new scheduler are needed. Ordinary saves below that allocation budget do not scan retained history. Cleanup does not expire meaningful Memories, correspondence, Wishes, relationship or repair history, remove manual checkpoint headers, or delete media assets.

See [response recovery](scene-response-recovery.md), [Scene continuity recovery](scene-continuity-recovery.md) and the [generation lifecycle](generation-pipeline.md).

Relationship format 3 retains exact event updates and independent Scene/live predecessor revisions. It never embeds a growing predecessor edge in each receipt. Identical Scene/live updates share one stored patch; applying it to different predecessors still preserves their distinct histories. Both Scene views admit only their own retained submission IDs, order events by the relationship publication sequence, validate complete predecessor chains, and apply updates to one detached captured view. Missing or forked predecessors hold recovery before any patch is applied. Inherited records, individual knowers, exact evidence and shared terms remain intact. Checkpoint restoration and Undo cannot rewind the publication sequence; their live revision increases do not rewrite frozen Scene predecessors. Old or wrong-world relationship records fail closed without conversion.

Relationship root format 4 owns a content-addressed private manifest in the seed/setup namespace. It reuses the existing immutable history-page codec and physical page kind. Separate trees for each edge's records/experiences and each thread's messages prevent a single long pair or correspondence from becoming one growing leaf. A bounded four-head decoded cache supports alternating current and historical reads; only mutable containers detach, and historical leaves stay immutable. Publication reuses a cached layout only when a current native owner still protects it. A stale unowned cache entry must rematerialize every dependency before publication. Root identity, payload digest, page identity, ordered list keys and nested headers are validated; missing or foreign ownership holds cleanup before deletion. Checkpoints, available Undo and proposed repair overlays trace the same nested trees. Recovery replay never treats cache contents as persisted authority.

Native Scenes store their captured relationship head and seed/setup scope, including the exact admitted Scene inside an unfinished operation. Hydration returns the verified canonical immutable value. Only that exact value can retain an associated head; publication reuses it only while the previous native Scene still owns it. New or changed captures prepare the actual logical value, including any reconciled facts, rather than substituting the current live head. The coordinator keeps its admitted snapshot compact; its consumer explicitly hydrates that saved snapshot. Pure logical decoding rejects unhydrated native references, and metadata-only listing/backlog reads cannot access unloaded continuity.

Scene presentation detaches mutable relationship containers for replay while immutable history leaves remain shared. Scene change detection compares the remaining saved fields and immutable body identity without serializing the body. Native ownership checks bind row IDs, Scene IDs, Village seeds and captured scopes before admission or publication. Checkpoints validate all transitive Scene pages with the existing structural tracer before publishing or restoring them; collector marking includes current and checkpoint/Undo/review versions with separate proposed-write overlays. Missing ownership holds every deletion. Native Venue/media fields remain visible to Engine.

Departure captures own one exact relationship head at `returnCatchup.capture.world.relationshipHead`, bound to the containing Village's seed and setup stamp. Repository reads hydrate this explicit owner through the same admitted backend as its World CAS; pure logical decoding rejects unhydrated references. Calendar, resident, narrative and Project projections clone mutable facts while sharing verified immutable departure history. Checkpoints, available Undo records and unfinished repair overlays retain these heads and their pages even after the active capture is removed. Restoration still discards the active absence capture; retained checkpoints continue to own their saved capture. Missing or malformed ownership blocks publication, restoration and cleanup before deletion.

Resident catch-up job inputs and capture fences use exact comparison fingerprints, including the full world namespace. They are not owning references and never hydrate or publish history. Fingerprints reuse the existing page layout and hash the actual reconciled logical value; a live head or event counter alone cannot describe changed permissions. Unknown context remains distinct from a known empty ledger and cannot authorize resident work. Long Scene transcripts and full mailbox responses remain separate scaling work; bounded captured-relationship writes alone do not establish bounded gameplay requests. Social encounter and meeting history has no automatic lifetime limit.

## Engine and validation

Villages uses declared permissions and public Engine APIs. Optional Decisions integration feature-detects `api.runtime.decisions.evaluate()`; unsupported capabilities retain System behavior. Private Engine implementations are not bundled.

Locked dependencies and pinned public declarations support builds without an Engine checkout. The repository builder owns generated payloads and deterministic archives; maintained source, tests and documentation are committed.

[DEVELOPMENT.md](../DEVELOPMENT.md) owns commands and release steps; [AGENTS.md](../AGENTS.md) owns development principles. Provider-free tests establish their exercised contracts, not live-provider quality or actual Engine integration.

The former extraction ledger is retained in Git history. This document describes the resulting boundaries rather than intermediate task status.
