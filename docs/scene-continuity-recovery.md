# Scene continuity and effect recovery

The current Scene writer uses contract v3. Previously admitted v1/v2 operations retain their saved contracts, source identities and hearing behavior. Existing Scene history never acquires witnesses retrospectively.

## Speech capture

Narration returns an internal `playerSpeechCapture` result: captured, silent or uncertain. Captured utterances cite input quote IDs or exact literal spans with one-based occurrences. Code expands the references into player speech, preserving authored resident segments and remapping their effect citations. Quotes are source references, not proof of audibility. Code resolves source offsets, retains interrupted utterances, and persists provenance on the server alongside delivery, targets and code-owned witnesses. Unquoted speech is supported; quotation marks alone do not establish audibility. Thoughts, actions, remembered or hypothetical quotations and negated speech are excluded by the capture contract.

A missing, uncertain or invalid capture interrupts admission without discarding the saved completion. Explicit retry asks only System to recover capture metadata from the saved input/output. Existing prose cannot be changed. Missing utterances are inserted at specified segment boundaries, with current-segment citations remapped. Capture recovery is bound to the completion hash, so a core-rejected completion cannot replace a later draft. Invalid System recovery is retryable without generating Narration again.

## Bounded Scene retrieval

Before applying the recent-history window, local BM25 ranks the full eligible ongoing Scene using the current input and latest two visible exchanges. No ended-Scene transcript, embedding service, summary call or extra retrieval provider is used. Existing long-term memories remain available.

The serialized history, including row metadata and its guidance, stays within 12,000 characters: up to 8,000 for recent context and 4,000 for older relevant evidence, with unused space reassigned. Whole source lines are deduplicated and returned chronologically. Oversized candidates are skipped. Witness/visibility filtering precedes ranking; acoustic-only listeners receive only their permitted projection. Narrator visibility never establishes shared resident knowledge.

Requests freeze selected evidence, and saved proposals retain evidence fingerprints for replay. Retrieved evidence IDs are available to downstream validators. History is explicitly partial: omitted context cannot establish that something never happened.

Characters may forget, bluff, guess, evade or disagree. Validation constrains authoritative updates, not their dialogue. A denial can support an attributed statement or belief; it cannot prove historical absence. Passing factual recollections join the existing selective System verification batch. No memory proposal requires no additional memory verification call.

## Independent effects

Complete syntax, speaker attribution, capture, hearing/privacy, movement and physical outcomes remain core requirements. Truncated JSON is never salvaged. Memory, relationship, Wish and Project metadata are normalized independently; malformed payloads remain private failed-domain records rather than empty successes.

Accepted prose, stable line IDs, proposals and failures commit together before acknowledgement. Provider completions are checkpointed before validation. Storage replay makes no provider calls. Domain receipts prevent completed effects from being applied twice. Explicit interpretation retry calls System only for the selected failed domain, using saved evidence and relevant context; it never rewrites accepted prose.

Projects retain responsibility for physical effects and receipt checks. Physical settlement precedes Project bookkeeping, and dependent Wish work waits for its physical receipt. Ordinary conversation can continue while noncritical domains remain pending. Existing state/revision/authority gates continue to govern dependent actions.

Raw completions remain server-only until recoverable payloads commit; normal operation completion clears redundant checkpoints and attempt payloads. Public Scene projections exclude raw failures, provenance, fingerprints, checkpoints and interpretation history.

## Validation

Provider-free regressions cover exact and interrupted capture, occurrence selection, source order, missing capture recovery, model-setting changes during retry, rejected-draft replacement, bounded older preference retrieval, conditions, oversized lines, acoustic projections, independent domain corruption, selected-domain recovery, and crashes/lost acknowledgements around atomic prose saving with activation restart. Existing movement/privacy/physical receipt consumers remain applicable. Paid model quality and cost qualification are separate from deterministic correctness and must be reported with their actual coverage.

## Provider-free cost and movement follow-up

The v3 mechanical instructions request compact JSON, inferred segment kinds and source references instead of repeated movement quotes. Explicit kinds and quotes from saved completions remain supported. Authored cards, writing guidance, dialogue and narration are unchanged. A character budget guards the all-capability mechanical instructions; it is not a provider token or dollar guarantee.

A validated annotation to the resident’s current player-local Zone is discarded before movement or witness routing. In v3, words about intending to speak or think elsewhere in the narration cannot make that redundant annotation fail movement validation. Unknown actors, invalid source citations, unlisted/inaccessible destinations and hypothetical or conditional actual crossings still fail. Earlier contracts retain their qualifier behavior.

Saved-response replay can verify this correction and lossless compact formatting without provider calls. It cannot establish new model behavior or paid savings: the historical cost guard remains failed and qualification incomplete. The shared preview stays unchanged until qualification passes.

## Qualification-driven corrections

The v3 writer now starts with the two required object fields and a complete JSON syntax example. Capture remains mandatory for silence as well as speech; whisper recipients and the three valid evidence-reference forms are explicit. Those instructions add no provider repair call or paid retry.

Movement guidance lists residents already in the player’s Zone and encourages entry only for actual remote doorway contacts. It cannot turn a resident already present into an arrival from another Zone. Movement validation remains unchanged.

Unsupported System memory and relationship proposals carry interpretation failures. Storage exceptions retain storage classification. Both remain independently recoverable without changing accepted prose.

The compact contract keeps movement mechanics in one place and explicitly requires effects inside the same JSON object as capture and prose. Unquoted speech uses an exact span plus occurrence when no input quote IDs exist; naming a listener does not imply whisper delivery. Mixed dialogue and narration remain valid. Those prompt changes leave core validation unchanged; the narrowly bounded finished-output normalization below is separate.

Code canonicalizes an omitted occurrence to 1 only for a nonempty exact literal span appearing once in the entire input. Duplicate, overlapping, private/recalled duplicates and invalid supplied occurrences still require recovery. Captured words, order, delivery and witness rules remain unchanged.

BM25 scores the current question first; the latest two visible exchanges disambiguate equal matches and supply fallback context. This prevents a long recent topic from overwhelming a short factual recall question. Recency and stable IDs break remaining ties; witness filtering and the serialized history allowance are unchanged.

## Finished output-format normalization

For a finished v3 response, code can remove one extra closing brace between the complete capture/segments object and appended noncritical effect fields. The joined object must pass strict whole-object JSON parsing, including duplicate-key checks; every supplied value is retained. Only memory, relationship, Wish and Project metadata may follow that boundary. Truncation, missing delimiters, critical or unknown suffix fields, competing objects and trailing prose remain rejected. Invalid effect values remain failed-domain proposals rather than disappearing or becoming successful empty effects.

An explicit dialogue aside using `delivery:"side"` and `presentation:"aside"` maps to the existing ordinary-aside behavior only without a target or a conflicting loud/whisper signal. Ordinary hearing rules still determine witnesses. Ambiguous delivery values remain rejected. The prompt includes a complete multi-field JSON example and uses `presentation:"aside"` with `delivery:"ordinary"`.

These corrections are covered by provider-free parsing, hearing and packaged save/replay tests. They do not establish improved provider reliability, cost qualification or long-session completion. Paid testing remains stopped and the shared preview remains unchanged.
