# Memories core

The pure server domain modules `models/memories.ts` and `rules/memory-{integrity,application,views,protection,recall}.ts` define the final current-format Memories contract. They have no runtime imports, persistence adapter, route, provider call or UI. The existing runtime remains in use until the coordinated cutover. No old-format decoder, migration, dual write or runtime switch is provided. The new collection is intended for the existing Village capability document storage.

## Records and authority

Each record has a stable ID/root, revisions, kind, concise text, subjects, explicit knower states, original source, retained exact support, occurrence and recording times, optional domain reference and direct correction/resolution links. Subjects do not learn. Reinforcement refreshes only supplied actual learners. Reports retain attribution; observations, interpretations and validated events remain distinct. Neither a report nor an interpretation establishes a mechanical outcome.

Canonical roots retain per-knower suppression and player repair. Normal corrections point directly to a root and are visible only to their own learners. Root membership learned through a correction references that correction rather than granting the original claim. Resolutions have independent audiences. Projection and one-hop link following check every knower separately. No link makes a private resolution public.

Authoritative event formation requires a matching trusted **committed** effect receipt, including source fingerprint, domain identity, occurrence, commit time and witnesses. The adapter must obtain it from successfully validated and saved gameplay effects, never a model proposal or a prepared action. Stable effect IDs prevent duplicate outcome records on retries. Source IDs identify immutable accepted exchanges/events, with an optional original Scene ID. Evidence retains line identity and excerpts. Protected replay compares stable evidence units across source revisions; unrelated lines in the same exchange can still form memories.

The decoder accepts only this format and fails closed on corruption. Text is limited to 600 UTF-8 bytes, exact excerpts to 320 bytes (two per knower), and serialized records to 32 KiB. These are record/prompt safety limits, not collection quotas. No meaningful memory expires or is automatically pruned. Reinforcement retains original and newest support, rather than banking every repeated line. Last-application fingerprints support immediate replay; stale revisions reject older attempts. JSON serialization preserves fingerprints. Recovery must retain the accepted source, operation identity and committed receipt.

## Forget and repair

Forget suppresses the selected existing knowers on the canonical root. Repair overrides only their remembered text, retains a direct reference to the repaired record/revision and original sources, and is identified as a player correction. It creates no fictional event, teaches no new knower and writes no gameplay state. Repaired ordinary projections omit that disclosure's saved summary fields and old incompatible source prose; privileged inspection retains the evidence. Independently known disclosures and independently authorized domain information remain separate.

The literal `player` is the only ordinary player conversational audience. Domain references never dereference live private values. Saved disclosed values are explicit per-knower snapshots. The pure player page projection defaults to 50 entries and uses revision-bound cursors; evidence is obtained separately. Inspect does not learn.

## Frozen Scenes without collection copies

Scene capture stores only the collection revision, time and audience. Each subsequent memory mutation returns copy-before-write preimages for changed records in **all supplied active snapshots**, restricted to their captured audiences. A private record first learned later is masked rather than leaked. New records are excluded by creation revision. Full historical lookup combines the current collection with these sparse preimages; changed records without their required preimage fail closed.

The cutover adapter must enumerate all active Scenes and atomically CAS the collection **and returned snapshots** with every memory write, including recovery, Forget and Correct. Closing/deleting a Scene releases its own snapshot. An indefinitely open Scene retains only the old versions necessary to preserve its continuity. This is a transaction contract, not an in-memory closure or a reference to a mutable Village. Retained memory evidence survives source Scene deletion and archive pruning independently of snapshots/transcripts.

## Local recall and write screening

Recall scans the entire eligible collection with deterministic BM25-style scoring over text, retained source wording and subject identities, plus explicit memory/root/domain IDs. Open status alone earns no injection. Relevant opportunities are allocated across participants before remaining relevance. Large shared candidates can be split into complete per-knower slices. Ambiguous/cue-free lookup supplies no guessed mutation target. Correction/resolution can use a supplied candidate's canonical root and revision; reinforcement must target the actual supplied current record.

Narration recalls before generation. The System lookup can add the current Narration reply to current input without another provider call. Complete serialized memory envelopes, metadata, excerpts and administrative protection count toward estimated budgets: Narration 1,000 tokens and System 1,800 (UTF-8 bytes/4). Development callers additionally supply their existing count/overall limits. Required protection outranks optional history; essential evidence/mechanics remain the caller's responsibility within the full prompt allocation.

Protection is administrative System context, never Narration knowledge. Relevant protected roots are selected by explicit targets, stable evidence identity, domain identity and lexical cues. Each proposal needs clear/conflict/uncertain disposition, the complete related root set and the context fingerprint. Changed, malformed, conflicting, uncertain or inadequately screened affected proposals are rejected individually; oversized protection does not suspend unrelated learning. Rejection does not undo accepted dialogue/independent effects or purchase another call. Arbitrary paraphrase contradiction detection remains ordinary System judgment; the core does not claim semantic certainty.

## Validation boundaries

`villages-memories-core.regression.ts` exercises formation, learner scope, corrections, private links, repairs, source/revision/target guards, screening, authoritative commit/replay failures, sparse Scene continuity and retained evidence. It also characterizes existing Wish discoveries/criteria, disclosed Development values, typed relationship snapshots and independent permissions that the cutover must preserve.

`villages-memories-scale.regression.ts` deterministically generates 1,000/10,000/25,000 mixed private/shared histories across residents and offscreen events, with open/resolved matters, corrections, repairs and forgotten records. It checks oldest targets, source wording, draft-enriched lookup, ambiguity, complete prompt budgets, pagination/evidence and simultaneous Scenes. It reports recovery/serialization, mutation, capture, retrieval/assembly, page/search/evidence and approximate process heap costs without machine-sensitive CI speed gates. These are pure-code measurements, not atomic storage, HTTP, browser, packaged persistence or real-provider evidence. Those measurements and the producer/consumer cutover belong to the following PR; manual Correct exposure follows separately.
