# Runtime generation lifecycle

A model response, a validated result, a committed effect and a playable Scene are separate milestones. A failed observer or cancelled request does not establish that a provider failed or that no charge occurred.

## Standalone saved requests

Founding Venue details, opening ideas and Private Space preparation keep a format-2 standalone receipt under the stable request key and exact input fingerprint. It retains provider-reported cache reads and writes alongside other usage; replay integrity covers those fields too. This receipt is distinct from Scene and background receipts even though all use the native `generation-response` kind. An unsupported receipt format fails closed; no legacy reader is provided.

The dispatch intent commits before provider work. Its token remains pending until an actual response conclusively settles it; after interruption or restart, pending means uncertain, never unbilled. Only explicit Retry can authorize a replacement when no reusable response exists. Cancellation, timeouts, another successful attempt and diagnostic retention cannot remove uncertain tokens.

A valid completion is recoverable without purchasing work. The first completion returned for application is selected in the same CAS that records it, or a previously saved late candidate is selected by the read that adopts it. Every later caller receives that immutable selection. A late callback saves evidence only and cannot replace a selected result or apply effects. A newer live result may win over an unadopted late candidate, but it must return an already selected result if another caller adopted first.

Each consumer projects accepted content with its application parser, retaining exact accepted fields, finish reason and usage. Venue details use the frozen target Zone and the complete 4,000-character description limit; live source conflicts retain the selected response for reconciliation. Selection is separate from successful application. Its replay body remains local indefinitely, including after restoring a checkpoint from before its effects. No application acknowledgment, timer or current-world scope alone releases it.

Conclusive rejection means the same application parser cannot apply this response. It requires explicit replacement. Its body moves to the latest 100 private standalone rejection diagnostics, each capped at 24,000 characters and redacted with the existing helper; these diagnostics never authorize effects or replay. Settled unselected valid bodies are also dispensable because they were never returned for effects. Both settle their known token exactly once and keep per-request counts, a chained response digest and known token-usage totals with separate unknown-usage counts. Unknown or duplicate callback tokens cannot recreate bodies or change accounting. Receipt and uncertainty protection never depend on a diagnostic surviving.

These rules do not yet compact Scene or background operational records; those owners retain their existing recovery contracts.

## Scenes

Scene format 4 in Village format 17 uses one current generation contract: `{input, segments, events?}`. One GM request supplies dialogue, selected audible input and sparse event proposals. The saved Narration connection is labelled GM; its model and generation settings are unchanged. Code derives exact source offsets, revisions, attribution, physical baselines, defaults and native operations, then validates witnesses and authority without another request. The same model writes and interprets the exchange, so semantic omissions or misinterpretations remain possible.

GM prompts begin with stable rules and output instructions, then complete authored identities and character-specific instructions in reproducible actor order. Engine cache breakpoints mark both stable messages. Witnessed history, recalled context and current circumstances follow; exact submitted input is the final message, including empty Conclude input. The model receives one witnessed-history representation while the server retains its full validation context. They contain one current social view, one native Memory envelope and sparse effect schemas. Code expands relationship patches and Project citations against captured facts and full source speech. Unchanged domains settle locally. The writing checkpoint freezes fitted messages, cache markers, semantic context, protection scope and sprite catalog before purchase. Validation checks the saved response without another call. Providers with automatic prefix caching ignore the markers; providers supporting explicit breakpoints use them. Cache TTL remains the saved connection's choice. Prompt stability does not establish a provider cache hit.

Witnessed history remains chronological and appendable while it fits the selected model. There is no second fixed history window that repeatedly invalidates cached prefixes. The latest two exchanges (or six recent rows before exchange ownership exists) are mandatory; all character identities and the exact input also remain whole. Only actual context pressure prunes optional rows, using relevance and recency per serialized byte, in bounded batches. The final retained source IDs alone become validation evidence and the saved request freezes that choice for replay. Long cold histories can cost more; cached input is still billed, and reasoning cost remains provider-dependent.

The GM selects optional per-segment expressions and attention from a frozen catalog of IDs, names, views and defaults, without image files or contextual descriptions. Concrete variants survive replay. Invalid or missing cues preserve prose and fall back to prior/default presentation. Code owns placement, facing, mirroring and animation; visual cues establish no attendance, hearing, access or movement. Sprite setup remains provider-free.

Outgoing correspondence, offscreen resident encounters and world developments return content and effects together in one request. Setup, schedules, Wish generation and other single-call tasks remain separate.

The model selects actual speech, delivery and addressees, plus actions needed for movement requests or physical consent. Repeated exact text requires an occurrence number. Code preserves every omitted byte as non-audible context and derives canonical Unicode-safe offsets. Thoughts, roleplay wrappers, examples and quoted hypothetical speech do not become audible by omission. Conversation cannot authorize player travel. Calendar proposals identify a day offset, weekday or explicit date; code computes dates against the captured calendar. Validation errors retain their source and require explicit replacement of the rejected response. A draft boundary violation permits the existing bounded replacement before display, so exceptional turns can purchase another response.

The model sees concise Memory text with individual knowers, attribution, repairs and disclosed values; private source and protection bookkeeping stays in the saved server context. All current Wishes remain available as compact desires. Foreground or conservatively topic-selected Wishes include complete conditions and history; an existing Wish cannot be fulfilled from a summary. A new desire can be created and satisfied by the same witnessed exchange. Project terms are selected by participants, location and conversation; other active Projects retain concise titles. Consequential Project decisions require supplied full terms. Personal desires belong to Wishes, unresolved learning to Memories, and authoritative agreements to relationship records; there is no standalone social-intention ledger.

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
