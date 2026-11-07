# Runtime generation lifecycle

A model response, a validated result, a committed effect and a playable Scene are separate milestones. A failed observer or cancelled request does not establish that a provider failed or that no charge occurred.

## Standalone saved requests

Founding Venue details, opening ideas and Private Space preparation keep a format-1 standalone receipt under the stable request key and exact input fingerprint. This receipt is distinct from Scene and background receipts even though all use the native `generation-response` kind. An unknown receipt format fails closed; this overhaul provides no legacy reader.

The dispatch intent commits before provider work. Its token remains pending until an actual response conclusively settles it; after interruption or restart, pending means uncertain, never unbilled. Only explicit Retry can authorize a replacement when no reusable response exists. Cancellation, timeouts, another successful attempt and diagnostic retention cannot remove uncertain tokens.

A valid completion is recoverable without purchasing work. The first completion returned for application is selected in the same CAS that records it, or a previously saved late candidate is selected by the read that adopts it. Every later caller receives that immutable selection. A late callback saves evidence only and cannot replace a selected result or apply effects. A newer live result may win over an unadopted late candidate, but it must return an already selected result if another caller adopted first.

Each consumer projects accepted content with its application parser, retaining exact accepted fields, finish reason and usage. Venue details use the frozen target Zone and the complete 4,000-character description limit; live source conflicts retain the selected response for reconciliation. Selection is separate from successful application. Its replay body remains local indefinitely, including after restoring a checkpoint from before its effects. No application acknowledgment, timer or current-world scope alone releases it.

Conclusive rejection means the same application parser cannot apply this response. It requires explicit replacement. Its body moves to the latest 100 private standalone rejection diagnostics, each capped at 24,000 characters and redacted with the existing helper; these diagnostics never authorize effects or replay. Settled unselected valid bodies are also dispensable because they were never returned for effects. Both settle their known token exactly once and keep per-request counts, a chained response digest and known token-usage totals with separate unknown-usage counts. Unknown or duplicate callback tokens cannot recreate bodies or change accounting. Receipt and uncertainty protection never depend on a diagnostic surviving.

These rules do not yet compact Scene or background operational records; those owners retain their existing recovery contracts.

## Scenes

Scene format 4 uses one current generation contract. One GM request supplies dialogue, exact ordered input spans and sparse proposed effects. The saved Narration connection is labelled GM; its model and generation settings are unchanged. Code retains authority over exact sources, witness timelines, consent/access, physical receipts, protected Memories and Project revisions. The same model writes and interprets the exchange, so semantic omissions or misinterpretations remain possible.

GM prompts keep reusable rules, deterministically ordered complete character identities and authored world/player context in a standing system message. Chronological witnessed exchanges follow before current Scene facts, circumstances, optional older callbacks and authored post-history instructions. Grouped history preserves event time, Zone, audiences and player perception; short source references bind to private native event IDs. Whole old exchanges may be removed to fit, while the latest two exchanges and intervening notices remain required. Query-ranked callbacks appear only when their parent exchange is absent. The fitter returns the exact retained evidence and reference map; new requests use that same whitelist for effects, never a second history selector. Anonymous historical noise supplies continuity without exposing or authorizing its private source speech.

The fitter reserves the declared connection output cap without changing completion settings. This Engine does not expose saved custom output defaults through the package model handle. Without declared context and output limits, chronological history stays within a conservative 12,000-character allowance, with at most 4,000 characters of optional callbacks; required exchanges that cannot fit fail before purchase. With declared limits, whole history can use the fitted connection window. Existing actor-scoped Memories supply durable continuity; no additional summary model call is introduced.

Hearing groups preserve server-computed audiences, while actor rows consolidate activity, location and cosmetic state. Permissions, clock, revisions and query-selected Memories stay current; Scene Memory fingerprints bind server-side. Wish conditions and meaningful history remain available without their storage source pointers; Memory views omit administrative repair/source pointers while retaining write protections. The context footer declares a unique boundary before the unchanged exact player input, including empty Conclude input; that boundary survives native transports merging adjacent user messages. Query-matched lore and per-turn narrative grants cannot change the standing message. Full server evidence stays saved. Code expands sparse relationship patches and Project citations against captured facts and full source speech. Unchanged domains settle locally. The writing checkpoint freezes fitted messages, evidence contract, semantic context, protection scope and sprite catalog before purchase. Requests saved before the new evidence contract retain their original validation behavior. Validation freezes canonical input/hash and checks the saved response without another call. Provider prefix caching remains best effort; Villages does not guarantee hits or change provider cache policy.

The GM selects optional per-segment expressions and attention from a frozen catalog of IDs, names, views and defaults, without image files or contextual descriptions. Concrete variants survive replay. Invalid or missing cues preserve prose and fall back to prior/default presentation. Code owns placement, facing, mirroring and animation; visual cues establish no attendance, hearing, access or movement. Sprite setup remains provider-free.

Outgoing correspondence, offscreen resident encounters and world developments return content and effects together in one request. Setup, schedules, Wish generation and other single-call tasks remain separate.

Resolved input timelines cover every clause and punctuation in source order; only whitespace and surrounding quotation marks may fall outside exact spans. Roleplay wrappers stay in action/context spans. Zone annotations must match frozen and current positions; conversation cannot authorize player travel. Validation errors retain their source and require explicit replacement of the rejected response. GM retry replaces that response. A draft boundary violation permits the existing bounded replacement before display, so exceptional turns can purchase another response.

Explicit saved-domain interpretation remains a separate operation with its own source, response ownership and request accounting.

Unsupported Scene formats are rejected without conversion. A completed current greeting-reply checkpoint can be applied through POST /rooms/greet with recovery:true. This disables provider dispatch; missing stages remain interrupted. Deterministic navigation, ending a Scene and explicit saved-domain interpretation keep separate contracts. Only explicit Retry authorizes a paid replacement.

The Venue coordinator owns cancellation and the operation watchdog. Provider requests retain independent bounded deadlines. Greeting observers do not impose a shorter generation deadline. A late provider success is evidence, never authorization to append lines or apply effects. Its original source identity must match before a later local replay can use it.

For new admissions, pending memories and non-standing social updates do not block the next turn. Standing permission, physical, Project and Wish work retains its authority and required recovery behavior. Pending optional updates stay visible and retain their original evidence; background recovery must not invent a paid retry.

An unfinished Venue visit has no inactivity deadline. Physical Scenes refresh time, scheduled attendance and current world facts between exchanges. Scene movement lasts until the resident's routine changes. Admitted operations keep their original Scene snapshot and each model stage retains its exact prompt/evidence; running or interrupted operations and required effect recovery prevent resynchronizing that request. Live Scenes use current eligible Memories and one revision-checked social timeline, without an encounter-wide Memory reservation. New arrivals never become earlier witnesses. Idle refreshes and current-presence notices make no model requests.

Noninteractive captured sources retain their admitted facts. Provider deadlines and usage bookkeeping use operational time; calendar allowances and saved world effects use Village time, including development advances.

New NPC encounter admissions exclude residents whose effective live Scene position contradicts their scheduled position, including capacity fallback. Solo reflection, mail and future choices remain eligible. Routine transitions release this restriction; already admitted background work retains its original source.

Social Wish effects are applied from the existing saved Scene, encounter and mail interpretations. Captured owner revisions and immutable source evidence govern creation and changes. Wishes have no automatic expiry; source replay purchases no replacement interpretation. See [Social Wishes](wishes.md).

## Scene outcome boundaries

Every GM exchange reviews outcome boundaries, including greetings. Cards and lore preserve identity and abilities, while supported consequences, exact cited sources, witnesses and calendar facts remain binding.

Unsupported player outcomes use HALT. A supported input with a cited unsupported generated outcome receives one bounded replacement before display. Its decision saves before the invalid response is retired; replacement checkpoints reuse the frozen packet plus a short correction. Rejected prose and effects never enter accepted history.

Ordinary GM turns use one request; automatic boundary replacement adds at most one. The one-replacement limit survives restart and explicit retries. Another violation stops with input preserved. Provider errors, uncertain billing, invalid metadata and revision conflicts keep their existing recovery rules. Deterministic tests establish routing and accounting, not semantic recognition accuracy.

## Resident access actions

GM access proposals cite the actual current speech/narration once and go through existing authority, witness, scope, conditions and revision checks. There is no separate coverage critic to discover omitted proposals.

Code checks exact source/witness identity, current invitation authority, duration, conditions and scope before applying access or standing permission. The GM receives private Zone IDs, kinds and captured adjacency; player-known projections stay separate. Invalid or contradictory consequential authority holds the turn. Valid unresolved access outcomes become pending questions while independent valid invitations can settle. Equivalent repeated invitations produce one effect. Invitations permit entry without moving the player or revealing unseen contents. Standing revocation checks current authority even when a space is closed.

Private receipts retain source proposals and responses. Rejected completions use the bounded private diagnostic journal; neither appears in public Scene data. GM retries replace a rejected combined response. No historical effects are retrospectively reinterpreted.

## Preparation

Routine contract 2 asks for activities, allowed dayparts, optional weekday restrictions and fixed rhythms. Deterministic code constructs the seven-day choice structure and schedules. Unsupported Routine contracts fail without conversion. Long rest uses fixed rhythms; ordinary activity durations remain bounded.

Usable places and local routines allow entry while optional authored routines, initial Wishes and interiors finish preparing. A quiet Wish result is a completed attempt. Shared background jobs receive at most one automatic retry of a settled empty or malformed result, reusing valid earlier steps. The allowance belongs to the whole job instance and survives restart and manual retries. It preserves existing admission and request limits. A second failure, configuration/limit problem, changed source, storage failure or uncertain request requires REPAIR; startup never purchases retries for historical failures.

Interior failure does not discard or prevent independent resident progress. Founding Venue/interior requests save raw responses before validation/application; these separate requests retain deliberate replacement recovery. Valid responses survive restart and application failures. Preparation completion derives from committed receipts and required Venue/interior state, independently of playability. Activation and explicit retry reconcile interrupted preparation.

Selected setup artwork finishes before entry; an explicit player skip can omit unfinished artwork. Existing automatic pictures for subsequently discovered private spaces retain their access/visibility gates. Preparing setup does not authorize revealing undiscovered interiors.

## Verification

Provider-free checks cover serial slow success, cancellation, ownership fences, restart, saved-response reuse, explicit invalid-response replacement and duplicate-effect prevention. Real-provider checks establish latency and semantic quality only; they do not replace deterministic failure-path tests.

## Opening Projects

Opening ideas have a separate request and receipt from Routines and Wishes. Each resident idea commits independently; missing ideas leave preparation incomplete without blocking a usable Village. Opening ideas use only the current dedicated response contract; Routine results cannot supply or recover an opening idea. Source identity includes authored identity, setting, Venue facts and founding circumstances; stale results remain retained. An explicit preparation retry can request the revised source under a separate receipt identity.
