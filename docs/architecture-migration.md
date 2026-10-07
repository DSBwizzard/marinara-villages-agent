# Villages architecture migration

The starting revision is `9e12f23be71c137c2e5017375641f72ec45b38b3` on staging (0.6.170). The completed migration is planned as 0.7.0. Keep the repository and its history. Candidates retain their source revision and package hash; the milestone is complete only after architecture and packaged checks pass.

## Preserved behavior

Keep routes, saved identifiers and decoding, scene continuity across Zones, server-only private attendance, draft and reading state lifetimes, request identities, revision conflicts, recovery checkpoints, cancellation and model accounting unchanged. Any behavioral correction requires its own explanation, tests and independent review.

## Validation foundation

`npm run check` covers formatting, lint and compiler checking of maintained package code. `npm test` discovers every ordinary regression. `npm run test:browser` runs browser scenarios with mocked APIs. `npm run test:engine` runs the separately identified Engine-dependent checks. `npm run test:inventory` shows all tests and their requirements. Mocked browser coverage does not establish actual Engine activation or provider behavior.

Two baseline checks needed repair: client compiler invocation used an unsupported flag, and the previously omitted route wiring suite expected retired routes and an old function name. The full compiler found unreachable spin-off return-path code with missing identifiers. Its routes were already retired. Remove that code while retaining the active legacy-record scene lock.

## Completion ledger

- Foundation: locked repository build tools, separate package definition, complete test inventory and compiler gate.
- Client: separate styles, requests, contracts, controls and feature panels; feature controllers retain navigation state; shell assembles them.
- Server: independent rules, private stored records, decoding, storage, Engine connections, feature coordination and activation-owned jobs.
- Delivery: source-only commits; reproducible retained archives; staging revisions identified by source/hash; deliberate numbered releases.
- Verification: enforce imports and absence of cycles; remove temporary paths; independently review; run portable and isolated packaged checks; record the completed baseline.

Each item stays open until implementation and verification pass. This document does not approve publication, Engine upgrades/restarts, upstream submission or save-format changes.

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
