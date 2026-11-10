# Memories core

Common continuity records retain memories, qualitative relationships, Wishes, motivations, offers, commitments and room details. The Village publishes their immutable versions together with accepted Episodes and any native effects. Village format 18 and Scene format 5 use the strict current-format readers described in [saved work and compatibility](architecture-migration.md#saved-work-and-compatibility).

## Records and authority

A stable record identifies one piece of retained meaning. Each character or room has its own current head, with versions and exact sources retained for evidence. The statement holds the complete meaning, including qualifications and terms. Small classifications support retrieval, initiative and player-facing books. A resident can learn a changed statement only through supported communication or perception. Someone mentioned in a statement gains no knowledge from being its subject.

An Episode records an accepted interaction, its sources and what each participant could perceive. Original submissions remain private GM chronology. A consequential change can cite an exact grounded excerpt, accepted dialogue or another eligible source. Reports retain their attribution and uncertainty. Commitments can cite a current valid offer from an earlier turn or Scene, with assent bound to its exact terms. See [social Wishes](wishes.md) for the common meaning rules.

Native authority comes from the matching mechanical validator and receipt. A retained statement can record a promise, preference or refusal. It cannot grant access, complete a Project or change a schedule. Publication checks the selected sources, audiences and revisions before atomically saving the accepted changes.

## Forget and correction

Forget suppresses the selected holder's existing account and protects its affected sources from reappearing through later recall or replay. Correct publishes a player-authored replacement for selected holders who already know the statement. Independently known material remains separate. Neither operation changes prior dialogue, creates a fictional event or modifies mechanical state. Privileged Inspect can show retained evidence. Reading Inspect does not teach a character.

Correction and Forget use REPAIR's reviewed operation, with exact scope and revision checks. Conflicting edits require a fresh review. Available Undo and checkpoints retain their referenced dependencies.

## Local recall and request bounds

Scene preparation selects current actor and room entries with deterministic text matching. Current resident motives can receive a fair turn even without a match in the player's input. Recent shared Episodes receive priority, followed by other recent eligible exchanges and older word matches. Episode views preserve actual witnesses, exact eligible wording and acoustic-only cues. Archived Scene playback and canonical Episode evidence have separate lifetimes.

Episode selection has a 32,000-byte preliminary budget. Optional memories and Episode views share an estimated 8,000-token allowance per request, with at most 4,000 estimated tokens for optional actor and room entries. Required entries and the complete identities and input are checked by the selected model's context fitter. Fitting removes whole optional blocks, then refuses the request before dispatch if required context still exceeds the window. Only sources that survive fitting can support a later effect. Omitted material stays saved.

Room entries preserve one ordered current account. Ordinary requests can supply selected complete entries. An operation that needs the whole room must fit it intact. Revisions and exact supplied targets preserve unrelated entries on a change. Retrieval and selection run locally.

## Storage and validation

Immutable pages in Engine's existing document store retain the common collections, with compact Village references published alongside mechanical state. Warm writes share unchanged text and page structure. Cold reads and local selection still process retained history. The storage contract preserves admitted requests, checkpoints, Undo and repair dependencies. See [architecture](architecture-migration.md#saved-work-and-compatibility).

The continuity, Episode source, narration writing and continuity storage regression suites cover individual knowledge, retained exact evidence, fit, corrections, Forget and large histories. Packaged Engine behavior, provider recall quality and actual usage have separate validation.
