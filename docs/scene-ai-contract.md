# Scene AI contract

A new Scene exchange buys one answer from the configured conversation model. The model classifies the player's input, writes the next exchange, and proposes only the persistent changes that actually happened. Code owns time, positions, witnesses, access, consent, revisions and saved effects. There is no separate System interpretation purchase or automatic repair purchase for this contract.

## Read the answer

```text
INPUT speech
[narration] Mara sets down the kettle.
[p1] Would you like some tea?
[p1 whisper:player] I saved the blue cup for you.
```

`INPUT` describes the player's original message, never the generated reply. A single classification (`speech`, `action`, `thought`, `context`) covers ordinary untargeted input. Mixed input, private speech and cross-Zone contact use an array of exact source spans instead. Empty input uses `INPUT []`. Code inserts the player's actual spoken words and binds their actual witnesses; the model must not repeat them or invent the player's next decision.

Each header starts a paragraph. `narration` means description or action; a supplied person ID means speech. `aside` selects the small chat bubble and does not restrict who hears it. `whisper:recipient` is private local speech, `to:recipient` is ordinary public speech addressed to someone, and `call[:recipient]` attempts communication across one direct Zone connection. An explicitly private conversation in a quiet corner of the same room uses local whisper hearing without inventing a new Zone or forcing another person's cooperation. The internal saved delivery name for a call remains `shout` for compatibility. Calls grant neither entry nor sight. Ordinary speech stays local. Later arrivals do not hear earlier exchanges.

Quotes and continued lines are ordinary text. A line beginning with `[` must be a valid header: malformed private headers are rejected rather than broadcast. Ordinary conversation gets a flexible brief of about 250–300 words across the entire cast, usually one compact reaction per relevant speaker, then a natural stop for the player. Requested detail and necessary consequences may take more space. Each paragraph remains within 2,000 characters; the established 64-line validation limit tolerates valid longer replies. Provider output and thinking settings are unchanged.

## Read a persistent change

Append `CHANGES` and a JSON object only when needed:

```text
INPUT action
[narration] You move the loose blue cup onto the shelf.
CHANGES
{"action":{"happened":true,"segment":0,"actorIds":["player"],"consent":[],"appearanceChanged":false,"edits":[],"recent":{"text":"The blue cup rests on the shelf."}}}
```

The proposed action is not permission to apply it. The existing physical-action validator checks the input, narration, actors, controllers, consent, supplies and current Zone. Natural chat still proposes physical edits and policy administration; no Say/Act mode or extra button is required. A promise is not completion. Construction still uses the existing Project rules.

A complete `CHANGES` member list may omit its outer braces and top-level key quotes. The parser restores only that envelope and those known key quotes, preserving every value and then validating the entire JSON object. It never extracts a valid subsection, invents missing values or closes unfinished containers. An omitted action `consent` list means no consent evidence; every nonacting controller still needs actual permission. A plain `recent` paragraph is equivalent to `{text:paragraph}`, without renewal. Malformed supplied values remain errors. None of these local normalizations buys another model answer.

Supported optional fields are `memoryChanges`, `relationshipChanges`, `wishChanges`, `projectSpeech`, `action`, `access`, `events`, `immediateResidentMoves`, `contactAttempt`, `npcIntroductions`, `placeDiscoveries`, `establishmentProgress`, `halt`, `presentation`, `narrativeIntroduction` and `sounds`. Their maintained field contracts live in [scene-gm.ts](../packages/villages/src/server/domain/rules/scene-gm.ts). Only current Project terms add the detailed Project contract, after conversation history so topic changes do not rewrite the stable prefix.

Generated paragraph indexes start at zero **before** player speech insertion. Player speech citations use `utterance:N`; history citations use supplied citable IDs. Code remaps these once and checks exact source bytes and perception. The model cannot set `input`, `segments`, witnesses or server bookkeeping through `CHANGES`. Duplicate JSON keys, excessive nesting, truncation, unknown fields and forged authority are rejected. A narrowly defined empty `halt` report is equivalent to omission; nonempty or unknown data still faces normal validation.

## Read the request

The first system message contains stable writing direction, player/world context, complete local resident identities, then response/effect contracts. The following data starts with current physical Scene facts: location, geometry and world circumstances. Witnessed history follows. Current supporting identities, speaker positions, access/hearing, clock, query-dependent mechanics, relevant lore, recalled Memories, prior encounters and authored post-history instructions stay after history. The player's exact message remains last, after a deterministic input boundary.

Each request rebuilds current facts from existing authority. There is no second saved prompt-state journal or chain of edits for the model to reconstruct. Quiet conversation can reuse physical facts before growing history; actual physical changes refresh that prefix. Current facts remain essential when old history is trimmed and override historical claims. Permissions, selected writers, private knowledge and administrative Memory protections never become frozen cache data. The pending physical-receipt identifier stays in server authority rather than the writing prompt; code binds committed effects.

The location view retains current and directly connected known Zones. More distant known destinations retain route IDs, names and connections. Unseen attendance is private. Available supporting NPCs get a small name/ID index; a directly named candidate gets its profile, and active/admitted speakers retain their full relevant identity. Four non-player speakers may write in a reply; this is not a four-person lifetime attendance limit.

## Follow continuity

Before a settled Scene is removed, an encounter header retains ownership of its original immutable transcript pages. It contains source identity/revision, place/time, participant dictionary and a few recent witnessed speech positions. It contains no copied Village, Wish or recovery snapshot. Publication precedes revision-checked Scene removal and Memory reservation release. Terminal receipts remain separate.

A deterministic native Memory records that a conversation occurred, giving existing Forget/Correct controls a target even when the model saved no meaningful Memory. It implies no friendship, learned names or shared private facts. A cue-free greeting can retrieve each present person's latest actual shared encounter. Ordinary native Memory recall still supplies relevant longer-term facts and commitments.

Prior quotations preserve whole source lines and their actual hearers. They use at most 600 estimated tokens **shared by the cast inside the existing 1,796-token Memory allowance**. Administrative protection gets space first. Overlong quotes are omitted, not cut before a condition or refusal. No summarizer or extra provider call is required.

Forget/Correct suppresses protected raw replay per knower. The encounter's native Memory must remain available to that knower; other protected source roots and administrative timestamps are also checked. When a cross-source semantic match cannot be proven locally, old raw quotes are conservatively withheld rather than guessed safe. Effective repaired Memories remain authoritative. This can reduce incidental recognition after an unrelated administrative edit; it protects the user's edit without an extra inference purchase.

Recall bounds quote page reads and prompt size. Retained archive storage and the small-header scan grow with completed Scenes. Cleanup, checkpoint/restore, Undo and village reset must account for encounter page ownership. Do not prune those pages as orphaned just because the original Scene was retired.

## Troubleshoot a turn

1. Inspect the captured request's `writingVersion`, fitted messages and usage records in private diagnostics. Never publish prompts, cards, account data or connection secrets.
2. Read `INPUT`, labeled paragraphs and optional `CHANGES` separately. Check source spans and citations before investigating an effect.
3. Follow alias expansion, player-speech insertion, typed effect normalization, speaker/source validation, server hearing projection and revision-checked application. A rejected optional effect must not silently authorize another domain.
4. Compare accepted dialogue with saved effect outcomes. A validated proposal can still fail a live revision or access check.
5. A failed new-format answer is held without another purchase. Explicit Retry authorizes another attempt and retains diagnostics/accounting for the rejected answer. Replaying accepted work buys nothing.

The authoritative Scene contract is writing version **11**, using the text grammar above. Obsolete captured requests are refused before narrative preparation or provider dispatch; their saved data stays available for diagnostics. There is no legacy JSON/tuple writer dispatch, automatic boundary replacement or automatic Project reinterpretation. Current explicit effect retries still use their own JSON effect contracts and existing authority checks. The grammar and strict syntax parser are maintained together in [scene-text-contract.ts](../packages/villages/src/server/domain/rules/scene-text-contract.ts); the native dispatch seam is [writing-service.ts](../packages/villages/src/server/features/scenes/writing-service.ts).
