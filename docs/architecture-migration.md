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

The route dispatch binding is transitional. Runtime/queue ownership across overlapping activations remains open. Resident-controlled Zone edits, residence moves/adaptation, venue requests/projects, founding and resident agendas are separate remaining services; this extraction does not mark the architecture milestone complete.
