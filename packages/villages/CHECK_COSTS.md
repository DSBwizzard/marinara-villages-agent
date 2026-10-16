# Scene check cost reduction

Measured on 2026-10-02 (local date), using a saved three-resident planning Scene. The replay reads private records into memory and uses a mock provider. No live provider request or Engine source change was made.

| Domain | Earlier reported tokens | Earlier requests | Replay requests | Replay estimated tokens | Estimated input plus full output allowance |
| --- | ---: | ---: | ---: | ---: | ---: |
| Room permission | 44,597 | 6 | 0 | 0 | 0 |
| Wish checks/preparation | 99,472 | 12 | 3 | 5,878 | 7,497 |

Room request admission drops 100%. The Wish token estimate drops 94.1%; estimated input plus all reserved output drops 92.5%. These percentages apply to this reference Scene. Input/output estimates use characters divided by four, rather than the provider's tokenizer. The output allowance is an actual package request cap; the estimated input is not a certified token ceiling. Provider overrides, tokenizer differences and live judgments may change billed usage. Mocked negative judgments test request admission and payload size, not semantic model accuracy.

The old writing requests used 136,540 tokens. Keeping that writing cost fixed would put the reference Scene near 142,418 total tokens instead of 280,609: about 49% overall savings, despite over 90% savings in checks. This work changes check admission and bookkeeping response metadata, not character identities, authored cards, narrative writing directions or the Scene writing model.

## Causes and corrections

- Incomplete routing coverage caused room checks across unrelated Venues, even though there was no permission event. Sparse cited events now admit only a specific target. Missing metadata does not authorize a survey. “Entry points” in surveying plans is not permission. Unknown destinations need clarification locally.
- Wish preparation added paid calls and could invent physical conditions for a recognition goal. New checks use the original Wish as their authoritative goal, with local conservative routing hints and one shared semantic batch.
- Promised physical work was sent to a judge despite having no authoritative receipt. Clear unsupported physical goals settle locally with no change. Uncertain meanings still get a bounded semantic check. Conversational progress can advance a mixed goal; it cannot finish its physical conditions.
- Positional recovery stages broke when cached preparation disappeared on retry. Stable named stages now reuse saved responses; failure updates Scene status. Negative proof results and semantic clarification settle without automatic paid repairs. Invalid model output or an unknown provider outcome remains failed until deliberate retry.

## Boundaries and validation

Room checks admit at most four targets, with a 6,000-character serialized payload and 1,024 output-token cap. Wish checks admit at most four goals, with a 12,000-character payload and 512/768/1,024 output tokens according to batch size. Checks request low reasoning effort. Oversized essential evidence produces clarification without paid splitting or silent evidence truncation. Existing actor, target, witness, Wish fingerprint, expiry, receipt and idempotency checks remain in the application path.

Regressions exercise real production entry points with mock providers: spontaneous/future invitations, contextual answers, named gestures, refusal/dismissal, unknown destinations, shared Wish evidence, mixed progress, physical false positives, semantic ambiguity, invalid output, saved replay, provider failure and explicit retry. Scene, Zone, contact, character-writing, Project and coordinator regressions also pass. Live quality and live billing should be checked after loading the package in the next Scene.

The default replay fixture contains generic planning dialogue. To replay a private saved Scene without saving its text, set `VILLAGES_CHECK_REPLAY_DATA` to the Engine's `capability_documents` directory and `VILLAGES_CHECK_REPLAY_SCENE` to its Scene ID, then run:

```powershell
node --import tsx tests/villages-check-cost-replay.regression.ts
```

The script substitutes the historic Scene time for Wish expiry checks and reports only aggregate request sizes/counts. It never calls the configured live provider or writes to the Engine.
