# Social Wishes

Wishes are concrete personal desires that create opportunities for play. This prototype pass supports social conversations, relationships and shared experiences. Housing, construction, possessions and skill progression are outside this pass. The separate Pursuits prototype is removed.

## Desire and attention

A resident retains a desired outcome independently of their current attention and chosen approach. There is no active-Wish slot cap, intensity score, random size, expiry roll or automatic recurrence cooldown. A retained desire need not affect an unrelated conversation or prompt action. Sustained preoccupation is possible when the character and circumstances support it.

Each Wish has an owner, stable identity, revision, desired outcome, grounded reason, origin, attention, optional approach, expressed essential conditions and a history of accepted changes. Its status is open, fulfilled or withdrawn. Ending an approach does not establish that its owner stopped wanting the outcome. Materially different desires receive separate identities.

Admission requires an actual resident-owned current want, a recognizable outcome, a reason to retain it and an outcome the supported social gameplay can establish. Small ordinary desires qualify. Traits, hypothetical preferences, polite agreement and player suggestions alone need not qualify. No repeated mention, obstacle, strong emotion or player participation is required.

## Sources and initiative

Preparation can establish one initial grounded social desire or a quiet result. Later desires arise through accepted Scene exchanges, correspondence, resident encounters or occasional quiet reflection within the existing resident-activity allowance. There is no separate daily Wish generator, per-Wish model request or missed-day backlog.

Resident activity considers ordinary life, complete character identity, relationships, available social opportunities and retained desires. A Wish never selects the cast merely because it exists. Residents may initiate contact, invite, ask, refuse, wait or reconsider. Other participants retain their own authority; an unchanged open desire does not justify repeatedly soliciting someone who declined.

An invitation, accepted plan, promise, claim, gratitude or elapsed time does not by itself establish the desired shared experience. Apologizing and being forgiven are different outcomes. An actual NPC-only interaction can satisfy a desire without the player participating or learning about it. Fulfillment does not automatically award affection or generate a replacement desire.

## Authority and knowledge

The existing System interpretation proposes source-bound changes. Code verifies the owner incarnation, captured Wish revision, current source references and witnesses. Owner decisions require current owner speech; essential conditions use exact owner words. Quiet reflection can privately create a desire, reconsider attention, choose or stop an approach, or withdraw a desire the owner no longer wants. It leaves an owner-only memory, proves no interaction and cannot establish fulfillment.

Creation IDs and effect receipts are derived from immutable source identities. Replaying saved work does not create another desire, repeat a notice or purchase another interpretation. Existing Scene, encounter and mail outboxes retain their independent recovery boundaries. A stale source cannot revive a changed or withdrawn desire.

Scene turns retain one compact application authority: owner incarnation, fingerprints of targeted Wishes, and a complete-array fingerprint only when proposing creation. Ordered accepted changes advance local guards without changing that saved baseline. Each turn separately retains its complete frozen Wish context for explicit System reinterpretation; application guards never replace the exact evidence or context needed to judge meaning. Mail replies bind the original admission plus their own committed source effects.

Scenes retain their captured situation and receive immutable after-values from their own committed Wish changes, including newly created Wishes. Background changes cannot rewrite that encounter. Live authority governs subsequent world writes.

Scene and personal-mail Narration share a 2,048-token optional Wish allowance across the request's actors, measured by the configured connection. Selection takes an ordered prefix of whole open Wishes, preserving exact conditions, history and evidence references in every included unit. It stops at the first token or rendering limit rather than searching the whole catalogue for filler. Optional rendering is bounded at 64 KiB per unit and packet; an oversized unit is omitted without traversing the rest of its history. These writing limits never prune saved history or replace the complete captured authority used by System and resident planning. Required evidence must fit independently; known context failures stop new writing purchases, and the final System packet is checked again after generation. Retained paid stages remain recoverable.

The notebook projects independently eligible player memories. First disclosure requires the owner's exact communicated desire. Other changes cannot expose an unknown private goal. Later private motives, conditions and results do not fill gaps in the player's knowledge. Mail freezes eligible disclosure facts at delivery and publishes them locally on reading.

Each Wish is a compact selectable entry. Known Wishes contains only information the player has learned; Inspect's All Wishes includes the resident's private and closed records. Detail tabs separate the desired outcome, attention, approach, conditions and chronological history. List and detail pages fit the book's viewport with fixed navigation; opening an entry never scrolls the host page. Entries and statements show timestamps. Following affects only the player's notebook and Wish notices; it changes neither resident motivation nor activity priority. Inspect retrieves private retained state through its separate endpoint.

## Prototype boundary

The current build requires a fresh Village as described in [saved-state contracts](architecture-migration.md#saved-work-and-compatibility). There is no conversion, adoption of legacy Wish responses, or retention of the old Wish/Pursuit implementation. This boundary does not authorize deletion or replacement of another running world's storage.

Provider-free regressions establish source authority, privacy, replay, revision guards, retention and UI behavior. They do not establish live-model characterization or judgment quality; those require playtesting of the isolated preview.
