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

## Wish invocation clock ownership

`features/residents/wishes/wish-attempt-clocks.ts` owns ephemeral attempt clock functions for each activation. Ordinary jobs retain their wall-clock fallback; saved attempts and Background CAS admission remain authoritative. Handler application reads and invokes the selected clock inside its existing mutation callback, rather than caching a Date. Pure application without runtime setup retains its fallback and cannot borrow another activation's clock.

Direct attempt processing and lifecycle reconciliation capture their selected activation before the first asynchronous read. A paused default-A attempt therefore keeps A's Village/background connections after default B is selected. Processing also captures its clock registry for final cleanup. Provider-free tests cover same-ID attempts with different clocks, repeated application with an advancing clock, independent forgetting, missing/disposed owners and paused default replacement. Existing Wish regressions retain midnight, allowance, provider receipt and deliberate-retry coverage.

The original clock cleanup scope is unchanged: cleanup surrounds settling, while an earlier queue/mutation failure can retain an entry. Same-owner duplicate invocations can still overwrite or clear each other's injected clock. These preexisting test/invocation timing limitations are separate from ownership; no saved schema, model admission, retry policy or provider call is added.

## Sprite command and write ownership

`features/media/sprite-manager-service.ts` receives explicit Village read/mutation/snapshot, image decoding, Engine JSON/file/deletion and logging ports. The supported Sprite Manager interface selects its activation before a queued command begins; image inspection belongs to the injected codec connection. The pure PNG encoder remains available without runtime configuration. Entry registers and releases this service with its Village storage connections.

Write admission is an unbound queue shared only by canonical saved-world backend identity, using raw document capabilities or the explicit identity already supplied by application assembly. Separate worlds with identical resident IDs no longer share admission. Commands for the same world retain serialized adoption, including distinct document facades supplied a common identity. Cleanup does not clear another activation's queued work, and task-identity guards retain failure recovery.

Provider-free regressions exercise independent actual commands, a delayed default replacement, missing/disposed owners, failed queue recovery, older task cleanup and assembled same-backend adoption with one original/rendered pair. Independent review verified all twenty original functions and signatures after the single file-read port substitution. Incarnation and expected-URL checks remain inside mutation attempts; complete batches decode before uploads, files save before assignment commits and deletion follows the saved removal. No model calls or saved formats change. Legacy adoption behavior is retained for this mechanical extraction and remains a separate fresh-start cleanup item.

This unit preserves upload-before-commit orphan-file behavior, existing cross-process admission limits and lack of physical provider drain. Backend identity stability still requires packaged Engine acceptance. Resident signature requests, remaining feature interfaces and obsolete paths are still open.

## Resident signature connection and admission ownership

`features/residents/resident-signature-service.ts` receives explicit authority-only Village reads, mutations, document access, runtime epoch, image connection/generation/preparation and gallery ports. Entry supplies the immutable process recovery identity. Pure prompt construction lives in the domain. The supported async interface binds a request before its first authority read, retaining its selected connections during delayed work.

The signature task registry belongs to the canonical saved-world backend. `entry/backend-work.ts` assembles unbound Scene navigation, Sprite write and signature admission resources for that identity; different worlds with identical seed/resident/incarnation identifiers cannot join or block each other's signature requests. Shared capabilities, or distinct facades supplied a common identity, retain one provider request for duplicate actions. Old cleanup cannot forget a replacement task or clear another activation's admission.

Provider-free tests cover equal incarnation IDs in independent worlds, delayed default replacement, claim-before-dispatch, duplicates, replay, different-action refusal, missing/disposed owners and assembled shared-backend admission. Existing signatures tests retain blank-output validation, free paid-response/gallery recovery even with generation disabled, stale revision/incarnation rejection and deliberate retry gates. Independent review verified all seven original function bodies and signatures after the task cleanup port substitution. Persisted identifiers, claim metadata and CAS/checkpoint order remain unchanged.

There is one visible ownership correction: a pending direct request from retired runtime A used to return a profile through newly selected default B. It now rejects when its final A-owned read finds the unavailable runtime. Its saved claim remains interrupted, and a separate B read reports that claim without generation. Late gallery/Village writes remain fenced in the tested replacement case; no paid retry is introduced.

Existing limitations remain explicit. A live B activation reading A's running claim reports interrupted because profile status compares the reader's runtime epoch; shared admission still prevents another request. A duplicate joining a retired A task inherits its rejection. Epoch checks retain their original locations, so shutdown during an awaited image preparation/gallery operation may permit an upload before the next checkpoint. An unresponsive provider can retain admission; this unit adds no physical drain or cross-process coordination. Canonical backend identity still requires actual Engine acceptance. Remaining feature interfaces, obsolete paths and the client assembly audit are open.

## Fresh Sprite provenance and obsolete endpoint removal

New Sprite artwork now has explicit provenance: an upload carries no Engine source, and an Engine adoption carries its character/filename identity. The shared contract expresses those two variants. Decoding validates the chosen variant and drops unsupported or unsafe entries, pruning dangling assignments/defaults; it does not migrate or attribute older artwork. Fresh upload/adoption data, framing, expressions and assignments survive a JSON save/reload unchanged.

Library listing matches only explicit Engine provenance. It no longer downloads images to infer adoption from matching filenames and hashes, and adoption no longer backfills missing metadata. A deliberate upload with the same name and bytes remains independent. Repeated/current concurrent adoptions still reuse the recorded artwork with no file or document writes. Stored originals remain hash-checked during editing, and removal still deletes only files owned by that manager entry.

Nine retired Sprite Studio/source/generation compatibility routes and their unused HTTP handler are removed. Current Sprite Manager routes, body limits and maintained registration order remain unchanged; the route fixture records the fresh-start change. Requests to obsolete paths use the host's ordinary missing-route behavior. No Engine API, source installation or provider request path changes.

Independent review and provider-free probes cover exact current DTO roundtrips, invalid/missing/mixed provenance, assignment pruning, metadata-only listing, malformed-file atomic failure, repeat adoption and deletion boundaries. Scene staging keeps its filled/unfilled expression assertions using a current upload fixture. Mocked client Sprite fixtures also carry explicit origin. This cleanup follows the user's fresh-world scope and introduces no migration or model requests.

## Persona query ports and private factory imports

`features/settings/persona-service.ts` constructs Persona queries from explicit catalog list/find ports. The supported `personas.ts` interface owns dispatch for linked identity, picker catalog and selected preview. The world coordinator no longer implements the catalog/preview or reexports the linked query; settings and founding consumers use the interface. Entry registers the inert service after host connections and releases it before the host.

The three original query bodies and signatures retain their validation, text limits, DTO fields and async behavior. Catalogs exclude full identity/authored text, and previews retain their exact-ID guard against a fallback library record. Linked queries retain their existing fallback-record behavior; this extraction does not change selection policy. Provider-free tests cover independent same-ID libraries, a paused direct query across default replacement, originating callback scope, old cleanup, missing/disposed owners, bounded identity and actual Persona routes with their established paths/envelopes.

The architecture checker now reserves feature modules named `*-service.ts`, `.tsx`, `.js` or `.mjs` as private factories. Only their owning feature and server entry assembly may import them. Checks use resolved destinations before type erasure, including aliases, type imports/import types, reexports and delayed imports. Fixtures prove rejection through those paths and acceptance of supported public interfaces, internal feature use and entry wiring. Independent review verified all three query implementations and the maintained source graph.

This is enforcement for named feature factories, not completion of every feature boundary. Other cross-feature implementation imports and supported contract design still need their classification/port work. The client audit likewise found substantial existing assembly plus remaining feature-owned state and navigation lifetime scenarios to reproduce separately; current browser coverage does not prove all those transitions.

## Project client controller

`features/projects/useProjectsController.tsx` owns creation and renovation drafts, selection, finishing layout, image candidates and request commands. The Project panel renders those values and retains its DOM focus/ref work. Opening a Venue and uploading a renovation Zone image now call feature commands instead of implementing requests in JSX. Existing paths, payloads, image-input guards, snapshot callbacks, busy/error handling and deliberate image acceptance/discard remain unchanged.

This structural extraction keeps the controller at the panel's existing mount lifetime. It does not yet retain an unsaved Project draft or pending image result across menu navigation. Those transitions need a demonstrated correction and request-identity coverage before application-level mounting; simply relocating the state would leave selection and late-response hazards unresolved. Actual Engine testing remains separate from the mocked desktop/mobile Project layout and menu regressions.

## Project draft and request lifetime correction

Mocked browser probes of the preceding checkpoint reproduced three navigation losses: the unsaved creation form, the finishing editor with a pending image, and an edited renovation revision all disappeared when leaving Projects for the menu. The application now mounts the Project controller throughout navigation. Creation drafts retain their form state; each selected Project has an independent finishing/revision workspace, image candidate, pending status and error. Returning to a Project resumes its draft. Explicit village reset clears this session state; browser reload still discards these unsaved drafts.

Requests claim their originating workspace synchronously, so duplicate clicks before rendering cannot dispatch twice. Completion and cleanup use that claim identity: A's image cannot attach to B or clear B's pending work. Current image inputs and global scenery context still fence stale results. An explicit image acceptance/discard remains required, and navigation, failure, changed inputs and disposal never retry providers automatically. Application disposal and reset prevent old callbacks from applying snapshots or replacing a new workspace's result.

Repeated explicit Project navigation carries a request sequence as well as an ID, preserving “View Project A” after a later local selection of B. Renovation revision edits merge their latest matching source state; a new saved Project revision retains the former editor reset behavior, and old completion cannot replace its newer draft. No server route, saved schema, approval requirement or provider payload changes. The mocked package tests cover desktop/mobile navigation; a mounted source-hook browser harness additionally exercises repeated focus, batched revision edits, hidden-context changes, duplicate admission, reset and disposal. Actual packaged Engine acceptance remains pending.

## Resident card feature connections

`features/residents/resident-card-service.ts` owns the library catalog and resident card preview/apply commands previously implemented by the world coordinator. Its six ports supply the existing Village read/mutation/snapshot and library list/find/catalog projection. Construction is inert; the supported interface binds direct calls before their first await. Entry registers it after Village state and releases it before storage. Catalog and resident routes retain their paths, handlers and response envelopes without temporary world reexports.

All three original bodies and signatures remain unchanged. Catalog reads still begin in parallel and use the approved fields/library order. Residency is checked before previewing a card. Unchanged available content causes no mutation; colors alone preserve the agenda and remap. Prose changes replace the adopted card and clear remap, deriving a fresh unwritten agenda from each mutation attempt's Venues without immediate generation. The proposed revision, capture time and prose comparison remain computed once before mutation retries, and a resident removed during retry is not recreated. The existing Village read also retains social-outbox behavior.

Provider-free coverage exercises inert connections, independent same-ID libraries, exact catalog fields, missing cards/residents, source-status recovery, no-write and colors-only refresh, changed Venues/removal during simulated CAS retries, delayed default replacement through the final snapshot, older cleanup and missing/disposed bindings. Actual Fastify catalog/refresh routes use the supported service. Independent review verified the original implementations and assembly. The library adapter's first-record fallback remains unchanged; it can still select a different ID when an expected record is absent, and any selection-policy correction requires a separate reproduction.

## Linked Persona cache ownership

Settings now owns the linked Persona cache writer through three explicit Village read/mutation and library lookup ports. The inert factory retains the original async body, bounded comparison and diff-only save policy. A missing Persona keeps the cached name/identity and changes only its missing flag. Chat still reads the saved cache without resolving the library. The supported interface binds calls before their first await; entry registers after Village state and releases before it. The refresh route retains its existing handler and snapshot envelope.

Provider-free coverage checks independent same-ID owners, long text without repeat saves, missing/restored records, empty links, errors before mutation, unrelated concurrent Village metadata, delayed default replacement and cleanup. The assembled Fastify refresh endpoint updates the cache without exposing private Persona prose in the ordinary snapshot. Independent review confirmed body/signature preservation and failure propagation without retries. Existing first-record fallback, link selection changes during mutation and potentially redundant concurrent refresh writes are unchanged; this structural unit adds no locking or recovery policy.

## Resident Agenda coordination

The residents feature now owns Agenda request preparation, its background handler, local schedule influence, deliberate regeneration and Agenda views. Fourteen specific ports connect saved Village state, adopted cards, lore, founding progress/allowance, background admission/recovery, generation, schedules, day rolling and wish accounting. Construction does no work. The input revision remains a pure calculation using saved inputs. World/founding coordination, routes and usage preview use the supported resident interface without a temporary world reexport. Entry owns the service and explicitly binds its nested handler callbacks before registering background work.

Original command/helper bodies, signatures and handler expressions retain their behavior: explicit action IDs, finite admission, initial-wish allowance, request context/revision, saved-response parsing, current-day preservation, removed/changed resident rejection and failure policy. Schedule reads/influence and ordinary Agenda views still dispatch no paid generation. The existing deprecated ingestion/reset aliases remain for separately scoped fresh-start cleanup.

Provider-free ownership probes cover inert construction, independent same-ID worlds, absent/unavailable cards, exact port errors without retries, explicit admission, saved recovery without generation, current-day preservation, invalid influence input before writes, delayed direct calls and originating background callbacks. Existing assembled Agenda, founding preparation and usage regressions retain their generation/usage assertions. Two older tests now follow the moved implementation: a delayed import uses the supported command interface, and a source-text inventory includes the extracted service. Actual Engine lifecycle acceptance and broader feature separation remain open.

## Residence transition and adaptation connections

Venues now owns residence proposals/approval/completion and archived private-space adaptation through eleven specific saved-world, consent, operation-context, preparation, lore, background and model ports. The factory is inert. World and Scene coordination, Venue routes and test consumers use its supported interface. Entry registers after Village state, supplies its owned operation context directly, explicitly binds adaptation handler callbacks and releases the service before state.

All five command bodies/signatures, the revision helper and complete background handler remain unchanged. Approval parties, capacity/reservation checks, delayed completion, private-space archival/access cleanup, caller clocks, finite request identity, bounded System generation and exact portable-item/feature filtering retain their policy. There is no new provider retry or concurrency mechanism. Existing mocked Scene/access/layout and automatic-refresh coverage exercises the assembled callers; additional ownership probes cover independent worlds, capacity changes during save retries, inactive bindings and delayed originating callbacks.

Independent review confirmed the structural preservation and separately reproduced an existing completion-retry limitation: a losing mutation attempt can retain its captured `moved` flag when the winning retry postpones the move, causing private preparation despite no completed move. This remains unchanged in this mechanical unit and requires a separately demonstrated correction. Actual Engine acceptance remains pending.

## Residence completion retry correction

A provider-free reproduction confirmed that a losing completion attempt could authorize private preparation after the winning retry moved the deadline into the future. The saved resident stayed `moving`, but preparation still started. Completion now resets its post-save authorization inside each mutation attempt, so only a completed winning attempt can launch adaptation/private preparation.

The regression fails before this correction and passes afterward. It also verifies that a winning completed retry preserves concurrent metadata and still prepares exactly once. No approval, deadline, force-completion, saved schema, private-space ownership or provider retry policy changes. The correction avoids unnecessary preparation admission; it does not cancel work already admitted elsewhere or add a shutdown drain.

## Exact library identity correction

A provider-free reproduction showed both character and Persona lookups returning the first different library record when the requested ID was absent. That could offer another character's writing for resident refresh or overwrite a linked player's cached identity with another Persona. Both adapters now require the exact requested ID and return unavailable otherwise. A matching record still resolves regardless of its position in the returned list, and library failures propagate without retries.

The assembled-runtime regression fails before the correction and covers mismatched/empty records, a matching second record, selected linked identity, missing/restored Persona cache flags, retained cached identity, unavailable resident refresh without adoption, and unchanged failure propagation. Existing unavailable-card/Persona handling provides the response; no route, schema, Engine API, model payload or automatic provider retry changes. This removes the first-record fallback for the user's fresh-world scope.

## Persona cache selection and save retry correction

A provider-free reproduction showed a delayed refresh for Persona A overwriting cached identity after the player selected Persona B, leaving B's saved ID paired with A's prose. Refresh now checks its originating link inside every mutation attempt and writes only when the winning attempt still has that link and different fields. An unlink or selection change keeps its selected identity; a losing save attempt cannot report a write or overwrite the winning cache. Overlapping identical candidates save once and report the actual changed attempt.

A missing source changes its flag while retaining the current authoritative cached name/identity, including updates that arrived during the lookup. Ordinary bounded refresh and one library read per explicit request remain unchanged. Regressions fail before the correction and cover delayed selection/unlinking, changed links during save retries, identical candidates, updated missing-source cache and ordinary diff-only refresh. No saved fields, route envelopes, model calls, extra lookups or automatic retries are added. Different delayed library replies for the same ID still have their existing completion-order behavior; this correction introduces no library revision clock, serialization or physical cancellation.

## Retired Agenda compatibility surface

The fresh-world scope removes three unused HTTP routes: unidentified Agenda regeneration via DELETE, the deprecated schedule-ingestion alias and the retired translation-reset no-op. Their two service aliases and the unused constant translation-signature export are removed. The current client already uses regeneration with an explicit action identity and the schedule-influence command. The maintained route inventory now contains 134 definitions.

Actual Fastify injection verifies that retired paths return 404 and malformed regeneration identities return 400 before reaching the mocked Agenda service. Maintained regeneration/influence envelopes and dispatch remain covered, while the existing real-service Agenda suite verifies request deduplication and provider-free influence changes. No current schema, native schedule reading, regeneration ordering or background recovery policy changes. Old data and clients are not migrated.

## Resident roster connections

Resident arrival and departure now belong to the residents feature through five specific saved-world, library, Agenda-admission and background-retirement ports. The factory is inert; entry configures it after state/Agendas and releases it before them. Resident routes and the assembled optional-layout regression use its supported interface, with no world compatibility reexports.

Both original command bodies/signatures remain unchanged. Arrival captures the full card, checks capacity again inside save retries, persists a local day before Agenda admission and preserves existing queue-failure ordering. Departure pauses builder work, removes residences/worker/controller/invitation links, clears the vacated private Zone, archives prior private writing and retires resident receipts. Regressions cover independent same-ID libraries, capacity changes during retries, missing/failed sources, current departure privacy cleanup, existing failure ordering, delayed originating activation and cleanup. This mechanical move adds no provider dispatch, saved fields or new cancellation/drain guarantee. Actual Engine acceptance remains pending.

## Venue proposal review connections

Venue proposal deduplication is now an authoritative domain rule. Scene and background authors use the venues feature's supported rule export. Four review commands and their decision helper belong to an inert venues service with five explicit saved-world, projection, Project-planning and counteroffer ports. Entry owns the connection lifetime; Venue routes and assembled upgrade tests use the supported interface. World has no compatibility reexports.

All six original bodies/signatures remain unchanged. Grounded source identity, pending/history bounds, same-name/request deduplication, counteroffer admission, Project planning without premature construction, home-tier/residency checks inside save retries, chronicle writing and caller clocks retain their policy. Provider-free ownership probes cover independent worlds with equal request IDs, paused original decisions, cleanup, exact failure propagation and losing home-approval retries. Existing pure request, Scene, route and automatic-refresh regressions exercise the assembled callers. This separation adds no model request, saved field or recovery/cancellation mechanism; actual Engine acceptance remains pending.

## Town map review connections

Map submission validation, image retrieval and atomic image/pin replacement now belong to media through four explicit saved-world, projection and image-inspection ports. Founding setup calls the same supported submission validator. Media routes and assembled replacement tests use the supported interface, with no world compatibility reexports. Entry owns registration and release; construction performs no work.

All three original bodies/signatures and validation/save order remain unchanged. Explicit empty-image choice, view normalization, safe image inspection, complete pin inventory, prior stamp/coordinate checks on every save attempt and monotonic replacement stamps retain their policy. Ownership regressions cover read-only validation, missing/invalid submissions, atomic image/pin writes, concurrent map changes on retry, exact inspection errors and a paused originating activation after another becomes current. Existing founding and real-adapter mocked replacement regressions pass. No new provider request, data migration, Engine interface, automatic retry or cancellation/drain guarantee is introduced; actual Engine acceptance remains pending.

## Founding setup connections

Five setup/bootstrap/suggestion commands now belong to founding through fifteen explicit state/projection, map validation, connection validation, Persona/card library, lore, generation, Agenda and preparation/scheduler ports. Construction is inert. Founding routes, Settings bootstrap wiring and assembled role/context/capacity tests use the supported interface. Entry releases Settings and setup before their preparation/state connections. Invalid-input-only fixtures construct the inert service with rejecting ports, so validation probes do not borrow an unconfigured runtime.

All five original bodies/signatures remain unchanged. First-day/scenario/role locks, approved roster/map/layout validation, pre-save Persona/connection checks, capacity and concurrent founding checks, local resident days, pending preparation markers, queued preparation and bootstrap home preservation retain their ordering. Read-only suggestions keep the original generation/lore budget inputs; no automatic retry or additional model dispatch is introduced. Ownership tests cover first-save/preparation order, exact connection failures, losing concurrent founding, locks, independent same-ID libraries/lore and a paused setup plus actual queued microtasks retaining their originating activation. This mechanical move does not establish provider drain, new admission serialization or actual Engine acceptance.

## Retired prose Events mutation branch

World story application no longer contains the always-disabled compatibility branch that could turn prose response fields into memories, notices, Venue requests/features or wish removals. Its policy constant was already false, so removing the branch and unused imports preserves current runtime behavior. The separate structured housing, social and routine inputs retain their existing handling. Generation prompt/parser policy remains unchanged in this unit.

A typed provider-free probe passes an unfiltered response directly to the application handler. A valid happening updates the feed and opportunity/date markers exactly once, while hostile legacy memory, notice, Venue and wish fields leave authoritative state unchanged. Existing assembled automatic-refresh and Scene tests retain their prompt/privacy/usage assertions. No data migration, provider request, saved field or Engine interface is added.

## World advancement and history connections

The world coordinator now owns reconciliation, reset, reactions, story/memory projections and deliberate deletion through twenty-two specific state/projection, catalog, lore, resident/Project lifecycle, background, preparation, operation and generation ports. The factory is inert. Its supported facade binds direct calls before their first await, and entry explicitly binds the nested story handler before background registration. Entry releases the world service before its connections. Pure player/Venue projections remain canonical domain exports.

All seven original command bodies/signatures and the complete handler retain their implementation. Required local advancement still precedes optional paid discovery; backward clocks cannot rewind the durable cursor. Trace privacy, Agenda/wish ordering, finite story identities, context inputs, opportunity validation/application, direct reaction deduplication, projection audiences and deletion errors remain unchanged. Safety source inventories now inspect the extracted implementation as well as the supported interface.

Typed provider-free probes exercise inert construction, independent equal-ID libraries/worlds, clock forwarding/order, finite story admission without provider dispatch, history/memory evidence, deletion save retries, reset, reaction failures without retries, paused originating calls, older cleanup and nested generation callbacks across default replacement. Simulated unavailable original connections reject without borrowing the new default. Existing assembled activation, automatic-refresh, Agenda and Scene tests complement these explicit-port probes. This ownership move adds no shutdown drain, physical provider cancellation, serialization, saved schema or Engine interface; actual Engine acceptance remains pending.

Independent review also reproduced an unchanged same-activation reset limitation: a reaction paused at its model response can repopulate the feed after reset. The original reaction does not recheck its captured world identity before saving. This needs a separate demonstrated correction; it is not an ownership-extraction guarantee.

## Reaction response admission after reset

A provider-free reproduction confirmed that a paused direct reaction could repopulate an empty reset feed. Reaction saving now checks its captured seed, setup stamp and founding stamp against the authoritative world inside every mutation attempt. Reset or re-founding discards the former world's response; a losing save attempt cannot carry it into a replacement world. Ordinary same-world reactions retain their text deduplication and leave the simulation cursor unchanged.

The regression fails before the guard and passes afterward, including direct reset, a newly founded world and replacement during a save retry. The existing ordinary reaction/error tests retain their one-request and no-retry assertions. This correction introduces no model request, extra read, schema, migration, physical cancellation or shutdown drain. It fences the tested reaction response, not every other in-flight world command.

## Settings draft session across navigation

A mounted source-hook reproduction showed that returning from the menu to Settings replaced unsaved knowledge with its saved value. Settings now owns reopening through a draft-session command, replacing the menu's nine raw seeding connections. Each field compares its current draft to its previous saved baseline: edited fields survive navigation, and untouched fields adopt the latest snapshot when Settings is reopened. Snapshot arrivals do not reseed an open editor. Explicit reset retires the baseline; unmount/browser reload starts a fresh unsaved session.

The existing explicit save retains its route and five-field payload. Successful acknowledgement adopts canonical response values only for fields still equal to that request's submitted values, so a newer edit is retained. Separately saved scenery/Venue drafts keep their own baselines. Failures retain the draft and introduce no retry or automatic save. Settings catalog loading no longer auto-selects the Engine's active Persona over an explicit None choice; founding still requests the original active-selection behavior.

Mocked desktop/mobile coverage exercises mounted source hooks and the actual built package client. Probes cover repeated navigation, knowledge/Persona/lore/scenery/Venue drafts, untouched refresh after an external snapshot, exact save payload/admission, newer edits during a pending response, canonical acknowledgement, failure, reset/remount and the distinct Persona choices. The failing original reproduction is retained privately. This is application-session draft retention, not persistence across reload or completion of global busy ownership, all Settings request lifetimes or actual Engine acceptance.

## Settings save ownership after reset

A paused Settings save reproduced restoration of a reset world's old snapshot and draft acknowledgement. The explicit five-field Settings save now claims its response synchronously. Duplicate calls while that owner has a pending save dispatch once. An observed unfounded reset or unmount retires the claim; its late success, error and cleanup cannot replace the current snapshot, acknowledge drafts, report an obsolete error or clear a newer operation's busy state. A new owner can submit while the retired response remains pending, and current failures still permit deliberate retry.

Mounted mocked desktop/mobile probes cover reset, re-founding with a newer pending save, old success/error replies, duplicate admission, retry and unmount/remount. Existing payload and newer-field-edit assertions remain. This fences this client's acknowledgement and cleanup; it does not cancel admitted server/provider work, solve other Settings commands or global busy ownership, or detect replacement worlds without an observed reset transition. No route, saved schema, automatic save or retry is introduced; actual Engine acceptance remains pending.

## Scene archive connections

Seven archive listing/detail, deletion and retention commands now belong to an inert Scenes service with six explicit document, saved-world, progress-application and diagnostics ports. Document access remains lazy and narrowed to list/read/remove. Entry connects the service and releases it before state/diagnostics. Scene, Settings and world routes use its activation-bound supported interface; Project evidence retains full server-only Scene records through SceneQueries. Closing a Scene calls the same supported prune command.

All seven original bodies/signatures retain their implementation. Ordinary listing does not prune; summaries prune before listing. Manual deletion still rejects unfinished exchanges, applies pending progress serially, refetches the current closed document and removes by revision. Retention excludes unfinished/pending changes and removes diagnostics only after successful deletion. Manual deletion retains its distinct existing diagnostics behavior. Sorting, pagination bounds, validation, errors, clocks and bulk failure order remain unchanged.

Typed provider-free probes cover inert construction, independent equal-ID stores, these recovery/CAS/retention distinctions, paused direct reads and progress/diagnostics callbacks across default replacement, older cleanup and missing/disposed owners. Actual Fastify injection checks archive envelopes, 404/409 errors and the existing privacy projection without changing private saves. Assembled Scene, live-memory and privacy suites complement the explicit ports. This extraction adds no model request, schema, migration, shutdown drain or physical cancellation. Scene storage, active/effectful queries, reset/startup recovery and turn coordination retain their separate ownership work; actual Engine acceptance remains pending.

## Scene reading position across Venue navigation

A built-client mocked reproduction showed that View Venue/Return to Scene replaced a selected earlier paragraph with the latest one. The always-mounted Scenes feature now retains a checkpoint of committed paragraph and mobile text positions, reading inventory and reflow anchors. The panel keeps its original local React state, DOM refs, layout measurement, pagination and overlays. Paging does not rerender the application controller. Repeated Venue navigation restores the same paragraph and mobile text position; viewport reflow still follows a character anchor. An observed unfounded reset retires the checkpoint, while application remount/browser reload starts a fresh reading session.

The existing paragraph reconciliation and sprite animation scheduling remain unchanged. The built-client mocked suite covers repeated paragraph/page navigation at three mobile sizes and desktop alongside its existing dossier, formatted text, backward paging, keyboard, hide/restore, reflow and ended-Scene scenarios. Mounted actual-panel probes cover initial/latest and changed Scene IDs, hidden/mounted appends, transcript shrinkage, reset with reused IDs and unmount/remount in ordinary and StrictMode renders. Pure reading-rule regressions complement these probes. No public Scene data, saved schema, route, automatic provider request or draft persistence across reload is added. Other panel overlays retain their current mount lifetime, and late Scene command cleanup remains a separate concern; actual Engine acceptance remains pending.

## Scene document repository connections

The four raw Scene reads/mutations now belong to an inert repository with two explicit ports: a lazy document reader and the existing generic document mutator. Entry supplies the originating connections and releases the repository after Scene consumers and before operation context. The supported storage facade binds each call before its first await; canonical document IDs and slots live separately from command dispatch.

All four command bodies and five slot definitions retain their original implementation. Scene mutation still applies authoritative fingerprint/revision/outbox rules inside each CAS attempt. The generic mutator captures its document store once across retries. Clearing an unrelated active pointer retains the selected Scene and the existing metadata-write policy; a replacement pointer from a winning retry remains selected. Missing-pointer normalization, errors and clocks remain unchanged.

Typed provider-free probes use the real generic mutator with independent document stores. They cover inertness, decoded snapshots, no-op Scene writes, losing CAS attempts with concurrent transcript/metadata, missing records, pointer replacement, exact errors, paused same-ID commands across default replacement, older cleanup and missing/disposed owners. This is an explicit storage boundary, not a new race correction, migration, provider cancellation or completion of the coordinator's remaining direct document access. Actual Engine acceptance remains pending.
