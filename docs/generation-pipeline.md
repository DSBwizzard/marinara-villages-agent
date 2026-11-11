# Runtime generation lifecycle

A model response, a validated result, a committed effect and a playable Scene are separate milestones. A failed observer or cancelled request does not establish that a provider failed or that no charge occurred.

## Standalone saved requests

Founding Venue details, opening ideas and Private Space preparation keep a format-2 standalone receipt under the stable request key and exact input fingerprint. It retains provider-reported cache reads and writes alongside other usage; replay integrity covers those fields too. This receipt is distinct from Scene and background receipts even though all use the native `generation-response` kind. An unsupported receipt format fails closed; no legacy reader is provided.

The dispatch intent commits before provider work. Its token remains pending until an actual response conclusively settles it; after interruption or restart, pending means uncertain, never unbilled. Only explicit Retry can authorize a replacement when no reusable response exists. Cancellation, timeouts, another successful attempt and diagnostic retention cannot remove uncertain tokens.

A valid completion is recoverable without purchasing work. The first completion returned for application is selected in the same CAS that records it, or a previously saved late candidate is selected by the read that adopts it. Every later caller receives that immutable selection. A late callback saves evidence only and cannot replace a selected result or apply effects. A newer live result may win over an unadopted late candidate, but it must return an already selected result if another caller adopted first.

Each consumer projects accepted content with its application parser, retaining exact accepted fields, finish reason and usage. Venue details use the frozen target Zone and the complete 4,000-character description limit; live source conflicts retain the selected response for reconciliation. Selection is separate from successful application. Its replay body remains local indefinitely, including after restoring a checkpoint from before its effects. No application acknowledgment, timer or current-world scope alone releases it.

Conclusive rejection means the same application parser cannot apply this response. It requires explicit replacement. Its body moves to the latest 100 private standalone rejection diagnostics, each capped at 24,000 characters and redacted with the existing helper; these diagnostics never authorize effects or replay. Settled unselected valid bodies are also dispensable because they were never returned for effects. Both settle their known token exactly once and keep per-request counts, a chained response digest and known token-usage totals with separate unknown-usage counts. Unknown or duplicate callback tokens cannot recreate bodies or change accounting. Receipt and uncertainty protection never depend on a diagnostic surviving.

Standalone, Scene and background receipts retain their own ownership and uncertainty boundaries.

## Scenes

Scene format 5 in Village format 18 uses one narration contract: `{segments, keep?, commands?, halt?}`. An ordinary successful exchange requires one GM response. Ordinary conversation needs only prose segments; meaningful retained changes use common continuity, while game mechanics use native commands. The same model portrays the exchange and proposes meaning, so semantic judgment still needs playtesting.

Exact submitted input is the final model message, including whitespace, private thoughts and empty Conclude input. The model does not classify the whole submission. Only consequential excerpts need grounding as actual speech, visible action or private input. Code derives source offsets, positions, witnesses, identities and revisions. Generated narration cannot invent the Player's speech, consent or travel. History and playback may display original source input to Engine users; those rows have no resident audience and never establish character speech.

The prompt places stable rules and complete authored identities before witnessed history, with a captured Scene reference and current circumstances. Context fitting preserves required identities, exact input and required evidence. Only actually fitted sources can support later effects. Optional recall and standing initiative are bounded selections, not saved-history deletion. Cache markers remain provider hints; stable prefixes do not establish cache hits or real cost savings.

The saved writing request freezes its fitted messages, source readset, protection scope, native authority and any sprite catalog before purchase. The server filters cues by routed Zone attendance and chooses a concrete sprite from the captured catalog. That choice is stable across retries. Provider responses retain their original request ownership and accounting. A purchased narration envelope is saved in the Scene outbox before application. Replay validates that same response and original source rather than asking another interpreter to reconstruct it.

Code prepares native commands and common keeps against a detached candidate, resolves their explicit dependencies, and publishes a coherent accepted result through one Village root CAS. That publication contains the canonical Episode, per-holder immutable meaning versions, native receipts and gameplay effects. Paged bodies precede the CAS; acknowledging the Scene follows it. A lost acknowledgement recovers the accepted Episode without repeating effects or purchasing another response.

Memories, qualitative relationships, desires, commitments and Room meaning use the same continuity records and provenance rules. Ownership, individual knowledge and native mechanical authority remain distinct. Full conditions and terms belong in the retained meaning. A newly expressed already-completed desire can retain one final version per actual knower; it does not create an invented earlier record. See [Social Wishes](wishes.md).

Invalid required consequences hold the original input, purchased response and diagnostics. Explicitly independent optional failures may be rejected while unrelated coherent fiction commits. Correct and Forget protections, fresh actor incarnations and supplied head revisions govern both new application and recovery. Local Replay makes no provider request. A replacement preserves the original request and requires its existing explicit retry and spending authorization; it is not another domain interpretation.

Scenes refresh Village time, attendance and circumstances between exchanges. Movement between Zones retains the Scene identity. An admitted operation keeps its captured source, and running or interrupted work prevents resynchronizing that request. Later arrivals never become earlier witnesses. Provider deadlines use operational time; fictional calendars and saved effects use Village time.

Mail, offscreen encounters and private reflection retain their own delivery, attendance and activity authority while using common continuity and canonical evidence. They do not maintain separate Wish, relationship or Memory application pipelines. Current owner-held desires and perspectives can inform initiative without selecting the cast or forcing action in unrelated conversations.

Unsupported saved formats fail without conversion. Deterministic navigation and Scene closure retain their native contracts. The Venue coordinator owns cancellation, ownership fences and the watchdog. A late provider response is evidence only; its exact original identity must match before explicit recovery can use it.

## Scene outcome boundaries

Cards and lore establish identity and abilities, not authority over time, attendance, access or construction. The GM can return a native halt with a short explanation and source references, including an exact unspoken input excerpt as context. The original input and response remain held for recovery; no assistant fiction, common meaning, native change or accepted Episode is published.

Before showing that explanation, code checks fresh identities, protection and provenance, then binds every cited halt source. Invalid citations and an in-flight Correct or Forget remain validation failures without exposing the model explanation. A valid halt uses the existing intentional request-error channel and the existing held-reply lifecycle. Saved replay repeats the explanation without purchasing another response.

## Resident access actions

Native access commands bind actual source speech or observed action to current controllers, original parties, ledger revisions, scope and conditions. The same atomic publication retains their receipts and individual knowledge. A book entry, narrator assertion or decorative staging cannot create permission.

For decisions away from home, the GM may receive scoped fictional controllers, policies, permissions and bans relevant to present characters. Remote Room contents, attendance and receipt histories stay outside that authority context. Invitations permit entry without moving the Player or revealing unseen contents.

Invalid consequential authority holds the reply. Code retains the source and saved response for review and replay; it does not run a separate critic or reinterpret historical effects.

## Preparation

Routine contract 2 asks for activities, allowed dayparts, optional weekday restrictions and fixed rhythms. Deterministic code constructs the seven-day choice structure and schedules. Unsupported Routine contracts fail without conversion. Long rest uses fixed rhythms; ordinary activity durations remain bounded.

Usable places and local routines allow entry while optional authored routines, initial Wishes and interiors finish preparing. A quiet Wish result is a completed attempt. Shared background jobs receive at most one automatic retry of a settled empty or malformed result, reusing valid earlier steps. The allowance belongs to the whole job instance and survives restart and manual retries. It preserves existing admission and request limits. A second failure, configuration/limit problem, changed source, storage failure or uncertain request requires REPAIR; startup never purchases retries for historical failures.

Interior failure does not discard or prevent independent resident progress. Founding Venue/interior requests save raw responses before validation/application; these separate requests retain deliberate replacement recovery. Valid responses survive restart and application failures. Preparation completion derives from committed receipts and required Venue/interior state, independently of playability. Activation and explicit retry reconcile interrupted preparation.

Selected setup artwork finishes before entry; an explicit player skip can omit unfinished artwork. Existing automatic pictures for subsequently discovered private spaces retain their access/visibility gates. Preparing setup does not authorize revealing undiscovered interiors.

## Verification

Provider-free checks cover serial slow success, cancellation, ownership fences, restart, saved-response reuse, explicit invalid-response replacement and duplicate-effect prevention. Real-provider checks establish latency and semantic quality only; they do not replace deterministic failure-path tests.

## Opening Projects

Opening ideas have a separate request and receipt from Routines and Wishes. Each resident idea commits independently; missing ideas leave preparation incomplete without blocking a usable Village. Opening ideas use only the current dedicated response contract; Routine results cannot supply or recover an opening idea. Source identity includes authored identity, setting, Venue facts and founding circumstances; stale results remain retained. An explicit preparation retry can request the revised source under a separate receipt identity.
