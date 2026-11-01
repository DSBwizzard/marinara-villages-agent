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

Current format-13 Scenes use semanticVersion: 2, writingContractVersion: 3, semanticPipelineVersion: 3 and residentActionsVersion: 2. Turns require interactionScopeVersion: 6; greetings may omit it. Narration drafts first; a single System exchange check interprets original input and draft together. System supplies cited meaning, ordered input spans and proposed effects. Code retains authority over witness timelines, consent/access, physical receipts and Project revisions. Unsupported or ambiguous consequential outcomes remain unresolved before play.

That same System exchange interprets optional per-segment sprite expressions and attention from the completed draft. Its frozen selection catalog contains IDs, names, available views and defaults, without image files or contextual descriptions. Concrete variants resolve inside the exchange checkpoint and survive replay. Invalid or missing visual cues preserve prose and fall back to the prior/default presentation. Narration receives no sprite catalog and cannot supply presentation cues. Code owns screen placement, facing, mirroring and animation; visual cues cannot establish attendance, hearing, access or physical movement. Sprite setup uses editable names and Front/Side views without vision requests; all side-view source artwork faces right.

Resolved input timelines cover every clause and punctuation in source order; only whitespace and surrounding quotation marks may sit outside exact spans. Roleplay wrappers remain inside action/context spans. Incidental Zone annotations on non-movement spans must match both the frozen context and current Scene Zone and are discarded before use. Other Zone values remain invalid, and conversational input cannot authorize player travel. Validation errors retain the draft and require explicit retry of the failed interpretation; frozen prompts and completed writing stay unchanged.

The combined System check requests non-thinking JSON within its 4,096-token task cap. For supported admissions, completed responses from the earlier low-reasoning policy remain locally replayable, including raw responses whose validation was interrupted. A rejected response still needs explicit replacement; the policy change never authorizes another request.

Retired generation contracts refuse new work before a provider request or paid-draft replacement. Their history, raw responses and committed effects remain readable; markers and frozen prompts are never backfilled. A completed greeting-reply checkpoint can be applied through POST /rooms/greet with recovery:true. This path disables provider dispatch; missing stages remain interrupted. Deterministic navigation, ending a Scene and explicit saved-domain interpretation keep their separate contracts. Supported paid replacement remains a separate explicit retry.

The Venue coordinator owns cancellation and the operation watchdog. Provider requests retain independent bounded deadlines. Greeting observers do not impose a shorter generation deadline. A late provider success is evidence, never authorization to append lines or apply effects. Its original source identity must match before a later local replay can use it.

For new admissions, pending memories and non-standing social updates do not block the next turn. Standing permission, physical, Project and Wish work retains its authority and required recovery behavior. Pending optional updates stay visible and retain their original evidence; background recovery must not invent a paid retry.

An unfinished Venue visit has no inactivity deadline. New Scenes (`liveSceneVersion: 1`) refresh time, scheduled attendance and current world facts between exchanges. Scene movement lasts until the resident's routine changes. Admitted operations keep their original Scene snapshot and each model stage retains its exact prompt/evidence; running or interrupted operations and required effect recovery prevent resynchronizing that request. Live Scenes use current eligible Memories and one revision-checked social timeline, without an encounter-wide Memory reservation. New arrivals never become earlier witnesses. Idle refreshes and current-presence notices make no model requests.

Existing Scenes without the marker retain their original captured moment and sparse Memory reservations until concluded. Their own accepted effects extend that captured context. Provider deadlines and usage bookkeeping use operational time; calendar allowances and saved world effects use Village time, including development advances. Older closed Scenes remain archived; this change never reopens them or buys replacement interpretation.

Social Wish effects are applied from the existing saved Scene, encounter and mail interpretations. Captured owner revisions and immutable source evidence govern creation and changes. Wishes have no automatic expiry; source replay purchases no replacement interpretation. See [Social Wishes](wishes.md).

## Scene outcome boundaries

New semantic Scene operations carry sceneBoundaryVersion: 1, including greetings. Cards and lore preserve identity and abilities; completed consequences must fit authoritative Scene facts and supported Village behavior. Compatible ordinary and supernatural effects need no separate numerical mechanic. System adjudicates meaning in the existing exchange, checking original player input before the draft. Adverse findings and calendar proposals cite their player or draft source; materialized player speech is never narrator evidence.

Unsupported player outcomes use HALT. A supported input with a cited unsupported generated outcome receives one automatic replacement, followed by the normal System check. The valid negative adjudication remains replayable. The replacement decision saves before the invalid writing receipt is retired, and separate replacement checkpoints reuse the frozen original writing packet plus a short fixed correction. Rejected prose and effects never enter accepted history. Identical evidence can reuse its check.

Successful turns still use two requests; automatic replacement adds at most two within the existing token/request allowances. One replacement applies to the original operation across restarts and explicit retries. A second violation stops with the input preserved; further replacement is explicit. Invalid metadata, provider errors, uncertain billing, player-agency errors and live revision conflicts retain their existing recovery rules. Older admissions retain their original instructions and retry behavior. Semantic recognition remains an LLM judgment; deterministic tests establish evidence routing, acceptance and spending limits, not provider accuracy.

## Resident access actions

Resident access actions use version 2. Retired version 1 admissions retain their saved evidence without continuing generation. System snapshots freeze the full prompt and retrieval policy alongside the evidence so completed raw responses survive prompt upgrades. Current checks adjudicate current evidence in that response; essential uncertainty holds the draft, while unsupported optional historical enrichment is omitted. Older snapshots retain their admitted retrieval behavior. Narration supplies scoped resident actions bound to exact current speech or witnessed narration. The existing System exchange must disposition every proposal and cover every player-heard resident/narration segment, adding any omitted action. This remains two model requests. Invalid speech capture or action metadata holds the draft instead of purchasing a repair call.

Code checks source/witness identity, current invitation authority, duration, conditions and scope before using existing access and standing-permission mechanics. System receives private Zone IDs, kinds and captured adjacency for access adjudication; the player-known Zone projection remains separate. Unresolved, rejected or contradictory actions hold the complete turn. Equivalent repeated invitations produce one effect. Invitations permit entry; they neither move the player nor reveal unseen contents. Standing revocation checks authority even when a space is closed; admission still checks availability. Unsupported conditions require clarification rather than unconditional permission.

The private saved receipt retains proposals, review and the System response. Rejected completions use the existing bounded private diagnostic journal. Neither appears in public Scene data. Saved-response reuse is bound to the action payload as well as the draft; explicit retry reuses valid Narration and replaces only the rejected stage. Existing admissions retain their original contract and effects, with no retrospective interpretation or regeneration. These checks enforce explicit coverage and consistency; two models can still both miss the meaning of a sentence.

## Preparation

Routine contract 2 asks for activities, allowed dayparts, optional weekday restrictions and fixed rhythms. Deterministic code constructs the seven-day choice structure and schedules. Contract 1 and legacy saved responses remain readable, including lossless four-daypart normalization. Long rest uses fixed rhythms; ordinary activity durations remain bounded.

Usable places and local routines allow entry while optional authored routines, initial Wishes and interiors finish preparing. A quiet Wish result is a completed attempt. Shared background jobs receive at most one automatic retry of a settled empty or malformed result, reusing valid earlier steps. The allowance belongs to the whole job instance and survives restart and manual retries. It preserves existing admission and request limits. A second failure, configuration/limit problem, changed source, storage failure or uncertain request requires REPAIR; startup never purchases retries for historical failures.

Interior failure does not discard or prevent independent resident progress. Founding Venue/interior requests save raw responses before validation/application; these separate requests retain deliberate replacement recovery. Valid responses survive restart and application failures. Preparation completion derives from committed receipts and required Venue/interior state, independently of playability. Activation and explicit retry reconcile interrupted preparation.

Selected setup artwork finishes before entry; an explicit player skip can omit unfinished artwork. Existing automatic pictures for subsequently discovered private spaces retain their access/visibility gates. Preparing setup does not authorize revealing undiscovered interiors.

## Verification

Provider-free checks cover serial slow success, cancellation, ownership fences, restart, saved-response reuse, explicit invalid-response replacement and duplicate-effect prevention. Real-provider checks establish latency and semantic quality only; they do not replace deterministic failure-path tests.

## Opening Projects

Opening ideas have a separate request and receipt from Routines and Wishes. Each resident idea commits independently; missing ideas leave preparation incomplete without blocking a usable Village. Opening ideas use only the current dedicated response contract; Routine results cannot supply or recover an opening idea. Source identity includes authored identity, setting, Venue facts and founding circumstances; stale results remain retained. An explicit preparation retry can request the revised source under a separate receipt identity.
