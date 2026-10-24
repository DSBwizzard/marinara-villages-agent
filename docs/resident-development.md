# Resident development prototype

Resident development is an opt-in experiment in **Settings → DEBUG Settings → Resident development**. It currently supports one kind of pursuit: moving into an existing home.

## How it works

1. Enabling it starts a fresh interval. Each resident becomes eligible for a first review after 24 real hours.
2. A due review considers existing intentions first. One System request reviews at most four residents and six chronological decisions. Residents can choose nothing, reconsider, wait, refuse or end a pursuit.
3. The model proposes typed decisions. Code checks the saved world, timing, dependencies, available space and each person's consent. Model prose cannot change housing.
4. A move needs agreement from the mover, household, property controllers and any room controllers. A player's agreement must come from witnessed Scene speech. Arranged moves take 24 hours and complete through the normal residence transition.
5. The same saved interval is resolved after an absence. No running server or internet connection is required during that absence. An unavailable model leaves creative work pending; local clocks and arranged moves still work.
6. Conversations can disclose an intention, change consent, delay or end it. The notebook retains what the player last heard. Private later developments do not update that entry automatically.

Large Projects remain player-started. This prototype cannot make a resident leave the Village. Existing Wish rules are unchanged and do not constrain pursuits.

## What to inspect

The private development inspector shows each resident's current intentions, last review reason, next review time and recent accepted/rejected decisions. Effective time says when something happened; saved time says when catch-up committed it. A move cannot be backdated across housing the player has already seen.

Existing Background work shows request progress, failures, usage and explicit retry. Failed or interrupted reviews remain held even if other housing changes. **Review due intentions** can deliberately reconsider stale inputs. Reopening the game does not purchase automatic repairs.

## Small extension points

| Change | Owner |
| --- | --- |
| Pacing, eligibility, accepted decisions and catch-up | `server/domain/rules/resident-development.ts` |
| Required move consent | `server/domain/rules/development-consent.ts` |
| Existing physical move transition | `server/domain/rules/residence-move.ts` |
| One review prompt and job admission | `server/features/world/development-service.ts` |
| Witnessed conversation changes | `server/domain/rules/development-scene.ts` |
| Saved format and input validation | `server/domain/models/development-model.ts`, `server/domain/rules/development-codec.ts` |

Paths are relative to `packages/villages/src`. Add another supported action through explicit typed decisions and its own authoritative rules. Reuse the saved review, timing, knowledge and job lifecycle. Keep host I/O outside domain rules.

The initial limits are experimental: two substantial pursuits per resident, one active move, 24–168 hours between ordinary reviews and 24 hours for moving. A relevant witnessed conversation can make a review due earlier. Batches stop at moving and retain the remaining interval for later reviews. Tests compare eligible opportunities and causal results under scripted decisions; stochastic provider output need not match word for word.
