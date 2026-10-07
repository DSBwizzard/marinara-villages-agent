# Villages architecture migration

The starting revision is `9e12f23be71c137c2e5017375641f72ec45b38b3` on staging (0.6.170). The completed migration is planned as 0.7.0. Keep the repository and its history. Candidates retain their source revision and package hash; the milestone is complete only after architecture and packaged checks pass.

## Fresh-start scope for 0.7.0

The user has chosen fresh worlds for 0.7.0. Old saved data, migration and backward compatibility are outside this pass. Remove obsolete compatibility paths when they obstruct the authoritative implementation. Future releases can adopt a compatibility policy after this baseline is complete.

New 0.7.0 worlds must save and reload correctly. Preserve Scene continuity across Zones, server-only private attendance, draft and reading state lifetimes, current request identities, revision conflicts, recovery checkpoints, cancellation and model accounting. Keep the chosen Engine interfaces working. Behavioral corrections still need an explanation, tests and independent review; historical extraction notes below describe what those individual commits preserved, rather than imposing old-data compatibility on subsequent work.

## Validation foundation

`npm run check` covers formatting, lint and compiler checking of maintained package code. `npm test` discovers every ordinary regression. `npm run test:browser` runs browser scenarios with mocked APIs. `npm run test:engine` runs the separately identified Engine-dependent checks. `npm run test:inventory` shows all tests and their requirements. Mocked browser coverage does not establish actual Engine activation or provider behavior.

Two baseline checks needed repair: client compiler invocation used an unsupported flag, and the previously omitted route wiring suite expected retired routes and an old function name. The full compiler found unreachable spin-off return-path code with missing identifiers. Its routes were already retired. Remove that code while retaining the active legacy-record scene lock.

## Completion ledger

- Foundation: locked repository build tools, separate package definition, complete test inventory and compiler gate.
- Client: separate styles, requests, contracts, controls and feature panels; feature controllers retain navigation state; shell assembles them.
- Server: independent rules, private stored records, decoding, storage, Engine connections, feature coordination and activation-owned jobs.
- Delivery: source-only commits; reproducible retained archives; staging revisions identified by source/hash; deliberate numbered releases.
- Verification: enforce imports and absence of cycles; remove temporary paths; independently review; run portable and isolated packaged checks; record the completed baseline.

Each item stays open until implementation and verification pass. This document does not approve publication, Engine upgrades/restarts or upstream submission. Save-format changes are allowed within the fresh-start scope, with validation of new-world persistence.

## Venue command ownership

Venue list editing, image access/writes, naming, creation, deletion and player access commands now live in `server/features/venues/venue-service.ts`. Its constructor accepts explicit Village read/mutation, snapshot and active-Scene query ports. The factory imports domain code only; entry assembly supplies its dependencies. Venue, settings and media consumers use the Venue service interface rather than the world coordinator.

This extraction preserves existing function bodies, request contracts, Scene reconciliation timing and validations within each mutation attempt. Provider-free service tests cover independent constructor ports during overlapping calls, replacement binding cleanup, Scene query ordering, active-Scene deletion rejection and retention of a newer image during a simulated revision retry. Existing access, capacity, private-space, Scene, Zone and refresh regressions remain applicable.

Direct Zone editing, resident-controlled edit proposals and witnessed approval application live together in `zone-edit-service.ts`, with their own read/mutation, snapshot and private Scene query ports. The Scene coordinator consumes this service; its approval/evidence ordering remains unchanged. Invitation checks, proposal baselines, controller approval, stale-edit rejection and image preservation stay inside their original mutation callbacks. The private access-context rule accepts only the Scene fields it consumes.

The route dispatch bindings are transitional. Runtime/queue ownership across overlapping activations remains open. Residence moves/adaptation, venue requests/projects, founding and resident agendas are separate remaining services; these extractions do not mark the architecture milestone complete.

## Village storage and state ownership

`adapters/storage/village-repository.ts` owns the raw Village document identifier, decoding, encoding and compare-and-swap operations. Its lazy document connection is captured once per operation, including retries. The generic document mutator retains its existing retry, create-race and ownership-check ordering.

`features/world/village-state-service.ts` owns relationship hydration, social-outbox reconciliation and relationship persistence after the Village write. Its constructor receives a raw repository and relationship ports. Raw reads remain separate from hydrated snapshots; hydrated reads retain the existing outbox refresh and object identity. Mutation retries hydrate from each attempt's relationship seed, and relationship persistence errors still surface after the Village write rather than rolling it back.

Provider-free tests cover these ordering and failure boundaries, including interleaved document connections and retries. The active legacy Scene-link scan remains in its storage adapter for spin-off access checks; obsolete Scene-link writers were removed after checking consumers. No saved documents or stored identifiers were removed or changed. The remaining generic/codec exports and runtime dispatch binding are temporary compatibility paths, pending consumer and activation ownership work.

## Decisions connection ownership

The Decisions compatibility adapter has an instance factory owning its database, canonical module-load promise, build identity and disposal fence. Its Engine loader and supported-build checks remain unchanged. A separately documented correction prevents old cleanup from clearing replacement configuration or an asynchronous call from switching databases; see [Decisions activation ownership](decisions-activation-ownership.md). Synthetic regressions and independent review cover the adapter's loading/resolution races and fallback boundaries. This is one connection owner, not completion of the application's remaining queue/service ownership.

## Activation dispatch ownership

Production assembly captures an activation scope for host-backed connections, supported service dispatch, actual route handlers, cleanup and self-check. Interleaved asynchronous requests retain their originating storage/services; missing or disposed owners cannot borrow the legacy default. Direct configuration remains synchronous and preserves runtime-epoch replacement fences and standalone service tests. The separate correction and compatibility limits are documented in [activation dispatch ownership](activation-dispatch-ownership.md). Queue and cache factories remain open; scoped dispatch alone does not isolate their mutable state.

## Town-map job ownership

`jobs/town-map-service.ts` owns each application's map admission queue, active attempt, lifecycle fence and enabled state. Entry assembly supplies document access, compare-and-swap mutation, image generation and logging ports. The existing job interface selects the scoped instance; its registration cannot be cleared by another activation's cleanup.

The extraction preserves all original function bodies and saved document metadata. Claims are still saved before image dispatch, replayed IDs and concurrent tabs join existing attempts, retired IDs cannot spend again, interrupted attempts require a deliberate new request, and late results retain their lifecycle fence. Provider-free tests exercise independent queues and stores, identical IDs in separate activations, paused continuations, old cleanup and receipt recovery. The existing image-generation regression still covers prompt/result validation and mocked provider dispatch.

This owner does not complete the remaining background, Scene, preparation or cache factories. A separate lifecycle correction guards cleanup by the start's lifecycle token: repeated old cleanup cannot disable a newer start of the same instance. Current cleanup still closes admission and fences late results. Regressions reproduce the former failure, pause queued admission across stale cleanup, preserve an active provider result and saved receipts, and ensure only deliberate new admission dispatches. No saved formats, inputs, model budgets or automatic retries change.

## Scene operation ownership

`jobs/venue-coordinator-service.ts` owns an application's in-flight operation map and shutdown admission. `adapters/operations/operation-context-service.ts` owns its asynchronous Scene authority, cancellation signal, checkpoint access and ownership checks. Entry assembly connects the same operation-context instance to both the coordinator and supported adapter helpers. Document, logging, diagnostics and interpretation-settings ports are explicit. The pure operation summary remains available without runtime setup.

Previously, overlapping activations shared the live map and operation context. Separate worlds with the same Scene/submission identifiers could join or block each other's work; nested dispatch could inherit the other Scene's authority. Independent owners now take their own admission paths, retain their own captured settings and receipts, and preserve the originating context across nested dispatch. Explicit missing/disposed owners cannot use a standalone context. These changes preserve all original operation and context function bodies, saved identifiers, CAS retries, billing journals, deliberate retry authorization and timeout/cancellation order.

Synthetic tests cover concurrent and nested same-ID Scenes, supported scoped helpers, duplicate joins, independent cancellation/settings, old cleanup, saved revocation and late providers that ignore abort. Existing coordinator/recovery/interpretation regressions remain applicable. Shutdown retains its existing coordinator drain and revocation fence; it does not await the physical completion of an abort-ignoring provider. Scene navigation/greeting state, background jobs, preparation and caches still need separate ownership work, and packaged Engine verification remains required.

## Background work ownership

`jobs/background-service.ts` owns each application's handler registry, reservations, running jobs, provider tickets, presence, paused connections, controllers and recovery state. `adapters/operations/background-context-service.ts` owns its completion checkpoint and frozen-setting context. Entry binds that context and supplies all production handlers before starting recovery or reading a Village. The six handler definitions retain their original bodies, with explicit registration replacing module-loading side effects. Registration order was checked against the preceding runtime: retired translation, Wish, Wish checks, mail, Agenda, adaptation and story.

The factory receives document, Village read/mutation, usage, pipeline, diagnostic and completion-context ports. Each instance copies supplied entries into a fresh Map. Existing job APIs select the originating activation; direct context callbacks capture their selected owner before asynchronous work. Explicit missing/disposed owners cannot borrow a standalone context. Pure job identities and resident receipt retirement remain usable without runtime setup.

All 25 background function bodies, both context helpers, handler literals, stored identifiers and metadata retain their existing implementations. Admission still saves claims before dispatch, provider tickets remain serial within an owner, CAS retries retain request counts, completed responses/receipts remain replayable, failed connections remain paused, and unknown billing requires deliberate retry. Synthetic regressions cover simultaneous same-ID jobs and connections, independent presence and provider admission, copied registries, settings, old cleanup, restart without paid repetition, nested/default/scoped contexts and late-result fences. Existing background/recovery/Wish suites remain applicable.

This extraction retains the existing stop/drain and same-instance restart behavior. It does not physically drain an abort-ignoring provider or repair preparation/reconciliation lifecycle gaps. Scene navigation/greetings, preparation, founding work, caches and remaining feature separation still require work; actual packaged Engine verification is still pending.

## Private-space preparation ownership

`jobs/private-space-service.ts` owns the preparation Promise for one application. Its explicit ports cover Village reads/mutations, lore, model resolution, connection selection, completion, founding progress and logging. Entry registers the inert service before lifecycle startup. The supported job interface preserves synchronous duplicate joins and selects the originating activation; pure eligibility and key helpers remain available without configuration.

All six original function bodies retain their implementations. Claim writes still precede provider dispatch, progress and signal checks retain their order, and saved keys/attempts remain unchanged. The existing checks reject a changed space key and cancellation observed after a provider reply, before saving progress. Discovery does not repeat a failed or interrupted paid request; deliberate retry remains required. Synthetic regressions exercise concurrent worlds with identical seed/Venue/Zone/connection identifiers, independent promises and signals, CAS reevaluation, claim persistence, cancellation before saving, late replies, deliberate retry, scoped dispatch and older-owner cleanup. Existing founding-preparation regressions cover continuity, provider/format failures, forecasts and saved-claim recovery.

This extraction preserves two cancellation gaps: callers joining work already started without a signal cannot attach their later startup signal, and cancellation during the awaited saving-progress write can still permit the following content write because its CAS callback does not check the signal. These need separate reproductions and reviewed behavior corrections. The extraction also retains the original lifecycle timing rather than adding physical provider drain. Founding work, Scene navigation/greetings, caches and remaining feature separation still need ownership work; actual packaged Engine verification remains pending.

## First-founding coordination ownership

`features/founding/preparation-service.ts` owns the first-founding Promise and the preparation/retry/readiness commands. Its ports cover Village reads/mutations and snapshots, progress, Venue detail generation, private-space preparation, resident Agenda commands and background checkpoints. Entry supplies the narrow resident Agenda interface and configures founding only after its private-space/background dependencies. World setup and route consumers call the supported founding interface; the world coordinator no longer owns the Promise or reexports these commands.

All four original function bodies and signatures remain unchanged. Venue details, private spaces and residents retain their phase/order, saved progress and seed checks. Duplicate preparation joins the exact owned Promise. Discovery schedules only pending preparation, explicit retry preserves completed steps and resets admission inside CAS, and uncertain paid outcomes retain their deliberate retry gate. Provider-free tests cover simultaneous same-ID worlds, independent completion/failure, saved Venue details, resident order, repeated retry, pending-read resumption, scoped/default dispatch and older-owner cleanup. Existing founding, resident-continuity and route suites cover the assembled production graph and request contracts.

This extraction adds no cancellation or physical provider-drain behavior to founding. Scene navigation/greetings, caches, remaining world/resident/project separation, private-import enforcement and the client assembly audit remain open. Actual packaged Engine and Linux validation remain required before the 0.7.0 milestone.

## Runtime diagnostic ownership

`adapters/observability/runtime-debug-service.ts` owns an application's verbose/usage-meter settings and lazy preference cache. Entry supplies document mutation, Engine debug override, logger and Scene diagnostic context ports. Its six original implementations retain validation, saved metadata and credential redaction. The supported facade binds calls to their activation; released or missing diagnostics remain best effort and cannot borrow another activation's logger.

Provider-free tests pause one world's preference load while another saves settings, then verify independent cached preferences, Engine overrides, redacted logging, reset and older-owner cleanup. The original logging regression still covers model completions, failure handling and no extra provider calls. Independent review found no blocking issues. The preexisting same-instance stale-load race remains: reset/save and concurrent reads have no load generation fence. Metrics context and other private caches still require ownership work.

## Usage accounting and pipeline ownership

`adapters/models/usage-ledger-service.ts` owns the serialized accounting queue, purpose context, private connection snapshot and failure status for each activation. Entry supplies storage, Engine connection lookup, background and Scene contexts, public pricing and exchange-rate ports. Pure accounting, catalog and cost calculations live in `usage-accounting.ts`. The original 19 function implementations retain claim-before-dispatch, CAS retries, rate snapshots, bounded receipts, display-period resets and late-response accounting.

The recovery owner remains one immutable process-uptime identity, supplied explicitly to each ledger. This preserves recovery policy for overlapping live activations sharing a document store: a read must not abandon the other activation's running request. Request IDs remain unique. Provider-free coverage tests this same-store case and separate stores, paused claims, independent caches/errors, CAS count preservation, provider failure, reset during a request and previous-process recovery. A stopped request in the same process can still remain running until a new process performs recovery; this preexisting lifecycle limitation is separate from queue ownership.

`adapters/observability/metrics-context-service.ts` owns each activation's pipeline context. Purpose and metrics callbacks pin their selected activation before asynchronous continuation; a nested activation cannot inherit another owner's purpose or counters. Passive metrics on a released owner remain silent. Public LinkAPI/exchange metadata caches remain shared deliberately: they fetch fixed public endpoints without credentials or world state, while each ledger owns its selected connection/group/rate snapshots. Independent review resolved the same-store recovery concern without changing the original policy.

## Character-library and gallery cache ownership

`adapters/engine/native-schedules-service.ts` owns the parsed schedule cache and library-failure reporting flag. Library and logging ports are explicit; cache keys, freshness, card parsing, status projection and best-effort library reads retain their original implementations. `global-gallery-service.ts` owns the folder lookup Promise and receives JSON/form transport ports. Simultaneous uploads within that owner still share one lookup; failed lookups reset for the next upload, and root uploads remain available when folder filing fails.

Provider-free tests cover identical character IDs in separate libraries, a paused late read, independent resets and failure reports, same-owner gallery joins, separate folder/upload paths, validation and failed-lookup recovery. Scoped helper tests use the assembled runtime graph and verify that older cleanup cannot remove a newer owner's caches. Existing schedule-remap, usage-preview and location-image suites continue to pass. No gallery identifiers or files are migrated, and no Engine installation is changed.

Independent review verified all twelve schedule and five gallery function bodies and found no blocking issues. Existing same-instance limitations remain: a late schedule load can refill a reset cache, and a successfully cached gallery folder is not revalidated after deletion or renaming.

## Interpretation comparison ownership

`features/generation/interpretation-diagnostics-service.ts` owns optional comparison admission and cancellation controllers. Entry provides document access/mutation, execution outside Scene authority and the System comparison interface. The original diagnostic commands and redaction helper retain their bodies, bounded evidence, saved attempt metadata and timeout/abort ordering. Application shutdown calls the supported interface in its originating activation.

Provider-free tests cover identical Scene/check identifiers in separate worlds, independent cancellation, same-owner joins, CAS retries and same-store overlapping admission. Persisted claims still prevent duplicate or automatic repeated model calls. An interrupted attempt retains its unknown receipt even when its provider replies late. Access diagnostics retain their existing redaction, and removal/cleanup cannot select another owner's store or controller. This remains a logical cancellation fence; an abort-ignoring provider is not physically drained.

Independent review verified all six original function bodies and document metadata, with no blocking findings. Cancellation after the provider race has resolved can still permit the final diagnostic write; this existing gap is distinct from aborting a pending provider result and is retained by this extraction.

## Direct Scene-context callback correction

Direct `context.run` and `context.exit` helpers now capture application selection before entering their callback. Previously a direct callback selected default activation A, paused, then resumed with default B: its Scene lookup became uncoordinated, losing A's operation and cancellation authority. The regression reproduced this at `3cdaecf` before the correction.

Pinning the selected activation preserves the original callback result, Promise identity and synchronous failures. It also retains A's checkpoints, inputs, snapshots and cancellation checks across default replacement. Nested explicit B work keeps B's authority, and exiting Scene authority retains the same application before restoring the surrounding Scene on return. This correction changes no saved formats, request identities, provider calls or factory implementations.

## Consistent source module loading

The repository now declares ES module loading for its TypeScript source graph, matching the package builder. Without that declaration, Node/tsx loaded a named `.mjs` coordinator import under a CommonJS export-preparse cache key while entry assembly registered the ordinary CommonJS coordinator instance. A guarded baseline probe showed different function identities: the direct ESM helper reported an unconfigured coordinator while the same entry's ordinary CommonJS helper found its configured owner. This also stalled the mocked browser admission scenario.

Explicit type reexports replace four value reexports that cannot execute under ESM, and `isolatedModules` checks them during compilation. A fast `.mjs` regression exercises runtime assembly, Scene coordination, checkpoints and completion through the actual source imports. The browser admission wait now reports route failures within ten seconds and retains its gameplay and cost assertions. Independent review found no blocking issues. This changes source validation loading; generated package modules already use ESM.

## Village settings feature boundary

`features/settings/village-settings-service.ts` owns twelve settings and noticeboard commands previously implemented by the world coordinator. It receives mutation, snapshot, Persona lookup, bootstrap and logging ports; construction starts no work. Entry supplies those connections and releases the activation binding before Village storage. Settings and notice routes use the supported settings interface, without temporary world reexports.

The original command bodies retain validation and save ordering. Bootstrap eligibility is overwritten on every mutation attempt, so a losing attempt cannot trigger a proposal after a concurrent destination was added. Proposals remain awaited after the saved setting, and failures warn without discarding it. Persona lookup runs once before mutation and retains the private identity in server state. Notice capacity and positional availability are checked inside every mutation attempt; scenery validation remains atomic with the saved mutation.

Provider-free tests cover changing eligibility and notice contents during simulated CAS retries, failed bootstrap without automatic repetition, separate constructor ports, paused Persona lookup across default replacement, missing/disposed owners and actual Fastify settings-route dispatch. This unit preserves the existing bootstrap admission behavior: distinct overlapping setting commands may each request a proposal; bootstrap itself has no persisted admission receipt. Persona refresh/catalogs, setup, bootstrap implementation and history remain outside this extraction.

## Scene navigation and greeting ownership

`features/scenes/scene-work-service.ts` owns activation-specific greeting tasks and movement markers. The previous module-global greeting map could join unrelated worlds by Scene ID and return the other world's private Scene. A two-world assembled-runtime regression reproduced that fault at `e6d3dd0`; the owned map now admits both worlds independently while retaining same-owner joins and cancellation behavior. The supported binding exposes coordination methods, rather than writable maps. Six public navigation/greeting entrypoints capture activation selection before their first asynchronous read; residence navigation cannot switch worlds after a paused Scene read.

The navigation queue is a separate injected coordinator shared by saved-world backend identity. Splitting it per activation would permit a losing admission to save an orphan Scene or consume an invitation before the active-pointer CAS. Entry keeps an unbound coordinator in a WeakMap: production assembly supplies the already-available `app.db` object solely as an opaque identity, with no database access or Engine source imports. Direct configuration falls back to the raw document-store capability identity. Missing storage retains lazy failure behavior. Different stores receive independent queues. Different capabilities for the same physical backend require a common supplied identity; actual Engine identity stability remains part of packaged acceptance.

Provider-free tests pause first Scene creation and verify exactly one saved Scene/active pointer for shared capabilities and distinct facades sharing an identity. A second owner's turn during a live move is refused by the persisted admission gate before model access, retaining the move token and submission state. Queue failure recovery, independent movement/cancellation, default replacement, missing/disposed owners, actual same-ID greetings and duplicate joins are covered. Existing greeting timers, error translation, provider receipts and coordinator shutdown fences remain unchanged; this unit adds no physical provider-drain guarantee or paid retry.
