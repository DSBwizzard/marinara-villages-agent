# Scene actions release record — 0.6.140

## Before and after

- Planned inspection baseline: 0.6.138, `3df7d5f`. Nothing from this plan had been implemented there.
- Actual freshly fetched starting staging: **0.6.139**, `a88f88b5dd616f91a2c7148ec4f44d78bb5a2298`.
- Delivered package: **0.6.140**. Final implementation and generated-package commit: `268615786d651e88e7a4372668f046b1c548bf3f` (initial implementation: `36fa7d4265b5d27e23ec51af2b0ba32c2b2c4911`). The release record is maintained in separate documentation commits. The delivery report identifies the final staging merge revision.
- Engine source, build and running process were not changed. Installation follows merged-staging checks/build through the existing Villages sideload helper.

| Area | Delivered change | Explicitly deferred |
|---|---|---|
| Physical actions | Shared effects and evidence across Chat and new Act/Fulfill submissions; actual item, recipient, Zone, witnesses, condition/feature/fact/trace changes; effect and durable duplicate receipt saved together | Moving freeform physical judgment to System |
| Composer/contact | Chat/Conclude menu; optional Knock/Call doorway controls retain targeting, existing contact processing and recovery | Replacing contact interpretation |
| Zone movement | Access-checked, ordered Scene turns with origin/destination, operation identity and one code-written transition; frozen attendance, witnesses and existing clock behavior retained | AI-generated arrival exchanges and multi-Zone action sequences |
| Memories/relationships | Existing judging behavior retained; movement alone earns no judged consequences | Selective System judgment of durable memories and consequential relationship changes |

## What now happens

Chat and new legacy Act/Fulfill requests share the existing Narration interpretation and Scene application path. Confirmed physical proof is available to existing Project and Wish checks. The original inventory, authority, construction and reserved Project-source restrictions remain. Older settled outcomes gain no new proof; unfinished legacy Act reactions and earlier Fulfill requests saved as Chat retain recovery.

New physical outcomes keep a canonical receipt in the existing exchange-receipt store as well as the bounded recent Venue feed. This prevents feed trimming or an interrupted Scene acknowledgement from causing another effect. No second ledger or scheduler was introduced. Receipt storage grows with actual effects; evidence supplied to model checks remains bounded.

The Zone selector stays in Venue actions during an active Scene and disables while busy. Straightforward named movement such as “I walk to Common Space” runs locally. Supported less-direct wording may use the existing Narration request to nominate a destination; code requires the actual player words and a matching single Zone. Invitations and invented player movement do not move the player. Combined speech/actions across Zones require separate turns. Both entry controls and written movement use the same movement function. Drafts survive movement and refused busy/stale operations.

## Validation

Passed locally: `npm run check` and `node scripts/build-feature-packages.mjs villages` with Node 24.21 and the configured Engine's read-only dependencies. Generated manifest: Villages 0.6.140, built against Engine 2.4.6 (`e0313a33caef973e645616419d11894f4d8c434e`).

Passed regression suites: venue-session, zones, contact, scene-actions, venue-coordinator, room-events, private-spaces, optional-layouts, project-checks, live-wishes, wish-interpretation, wish-batch, project-interpretation, progress-projects, progress-engine, live-memory, exchange-processing, pipeline-efficiency, reading-pages, scene-staging, character-writing, dialogue-context, scene-text and check-cost-replay. Affected suites were rerun after recovery changes.

Passed browser fixtures: scene-actions (desktop and mobile), contact, scene-controls, room-notices, scene-staging, reading-pages and venue-coordination. Coverage includes equivalent receipts; repairs/pickups/handoffs; promises and elsewhere claims; absent recipients/missing stock/restricted edits/reserved sources; refresh/duplicate/replay/write interruption; access and witness boundaries; one saved transition; voluntary contact and invitation-before-entry; drafts/busy/stale Scenes. The older two-tab fixture was updated to read available paragraphs and use the existing **Recover saved request** label. New mechanics and browser checks are included in CI.

## Measured cost comparison

Same synthetic Scene fixtures, with existing diagnostics, on starting staging and this implementation. Baseline was a temporary archive of the exact starting commit with only the measurement fixture copied in. Run with `VILLAGES_SCENE_ACTION_COST=1 node --import tsx tests/villages-venue-session.regression.ts`. Payloads are UTF-8 serialized request bytes, not tokens. Document operations are the fixture's diagnostic totals; timings include mocks, cloning and local load.

| Fixture | Model requests before → after | Input payload bytes before → after | Document reads/writes before → after | Total elapsed ms before → after | Mock model elapsed ms before → after |
|---|---|---|---|---|---|
| Ordinary Chat | 1 → 1 | 19,175 → 19,981 (+806, 4.2%) | 70/12 → 70/12 | 539 → 203 | 8 → 2 |
| Legacy Act with witnesses | 2 → 1 | 26,239 → 26,358 (+119, 0.45%) | 86/20 → 82/15 | 233 → 125 | 0 → 0 |

Reported-token fields were zero because mocked replies supplied no usage; **actual tokens and billing are unknown**, not free. These single local timings do not establish live speed gains. Act's request reduction applies where the old System action judgment also needed a Narration reaction. Ordinary Chat gains no blanket checking request. Named movement and control transitions make zero language-model requests; a less-direct nomination uses one existing Narration request, with no additional arrival request. Newly usable physical proof may legitimately trigger existing Wish/Project checks. Existing first-discovery image behavior is unchanged.

This release increases the ordinary Chat evidence contract slightly and simplifies action application/recovery. It does not claim universal token savings or better live model quality. Earlier staging cost reductions belong to earlier releases and are not credited here.

## Limits and deferred-work decision

No deferred redesign was implemented. Movement recognition deliberately supports a small set of clear verbs and exact names; unusual phrasing may need the selector or a clearer turn. Freeform feasibility and character fidelity still depend on Narration. Legacy readers and recovery code remain, so maintenance debt is reduced rather than eliminated. The existing Engine document buffer is not crash-proof; a provider result lost before saving still needs explicit recovery and may already have been billed.

Representative labeled expectations are preserved in `tests/fixtures/villages-scene-actions.samples.json`: current repair, physical handoff, substantial commitment, temporary mood, sarcastic character voice, conditional entry and doorway privacy. Use the same character cards, state and exchanges for paired live comparisons before approving the deferred changes.

Decision criteria: **fewer incorrect or missed consequences; better character fidelity; and whether those benefits justify additional tokens, context, latency and maintenance.** Record wrong changes, missed changes, unnecessary clarification, altered voice, actual reported usage, request counts and latency. Mocked tests establish mechanics and request admission, not live quality or billing. No implementation departure from the approved scope is intended; the actual starting version was newer, and durable physical proof uses the existing receipt store so recent-feed trimming cannot undo duplicate prevention.
