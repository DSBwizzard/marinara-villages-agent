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

Quotes and continued text are ordinary prose. Every supplied public header starts a paragraph, including inline headers; indexes count each such header and any implicit opening narration, starting at zero. Horizontal whitespace around a header's contents is harmless; it changes neither indexes nor hearing. Supplied IDs and declared NPC introduction references determine syntax, never permission to speak. Unknown inline labels such as `[fresh]` remain prose. Complete single-line or multiline `INPUT` arrays and the isolated `CHANGES` payload are never scanned for prose headers. Private headers must begin a new line; inline or malformed private controls are rejected rather than broadcast. Writing direction owns pacing: meaningful roleplay and character interactions have no fixed word budget or sentence quota. Exchanges stop at a natural player opening. Each paragraph remains within 2,000 characters; the established 64-line validation limit tolerates valid longer replies. Provider output and thinking settings are unchanged.

## Read a persistent change

Meaningful conversational learning can attach directly to its source paragraph:

```text
[p1] [remember]I prefer tart apples to sweet ones.[/remember] They wake me up.
MEMORY {"text":"The speaker prefers tart apples.","learners":["player"],"disclosure":{"kind":"preference","about":"self"}}
```

Code strips the one or two source markers, derives exact contiguous excerpts and the original paragraph index, and expands explicit learner IDs into native Memory proposals. Each marked excerpt is at most 320 UTF-8 bytes; a complete short paragraph needs no markers. Controls do not become dialogue or count as paragraphs. A balanced unused source marker is removed without creating a Memory or discarding dialogue. Unbalanced, nested, empty, overlong or cross-paragraph markers are rejected. Model-selected learners still require actual perception; no one learns merely because they are present. Explicit self-disclosures bind the speaker and notebook subject; disclosures about another person retain their explicit target. The model still chooses meaningful learning, attribution basis and semantic screening. Player/history citations and differing learner evidence use the existing `CHANGES memoryChanges` form. Detailed target/history/Wish-learning instructions follow history only when native recall supplies eligible Memory targets or current Wishes; ordinary new learning remains available on every turn.

Missing screening is supplied only for learners proven from the full captured Memory collection to have no forgotten or repaired canonical roots. Empty retrieved roots are insufficient proof. Supplied invalid, conflicting or uncertain screening remains rejected; live protection and revision checks remain authoritative.

Self-disclosure shorthand binds current generated speech or canonical player utterances; historical learning keeps its explicit native domain/disclosure fields. Only explicitly selected, eligible learners receive the record; its subject does not automatically learn. Invalid compact learner/disclosure metadata stays invalid and is rejected as an individual optional Memory, retaining independent dialogue and effects.

Append `CHANGES` and a JSON object only when needed. The payload may start on that same line or the next. A blank-separated final object is also reserved for effects without that label. The parser rejects ambiguous continuations after a colon or code example; literal JSON examples belong quoted inline in prose. This is a defined footer grammar, not extraction of a JSON subsection from dialogue. An explicit `CHANGES` label takes precedence over literal objects earlier in prose. Spaces after paragraph headers are optional:

```text
INPUT action
[narration] You move the loose blue cup onto the shelf.
CHANGES
{"action":{"happened":true,"segment":0,"actorIds":["player"],"consent":[],"appearanceChanged":false,"edits":[],"recent":{"text":"The blue cup rests on the shelf."}}}
```

The proposed action is not permission to apply it. The existing physical-action validator checks the input, narration, actors, controllers, consent, supplies and current Zone. Natural chat still proposes physical edits and policy administration; no Say/Act mode or extra button is required. A promise is not completion. Construction still uses the existing Project rules.

Player access changes use one source reference: `inputSpan` is the zero-based index of an exact speech or action span in the current `INPUT`. It may be omitted only when there is exactly one eligible span. Thoughts, context, raw drafts and prior speech are not authorization. Spoken sources must match the server-bound utterance's exact offsets and text, including private speech. The separate `evidence` index cites the generated narration establishing the outcome. The current Venue supplies the player's actual management scope and current policies. Venue-wide changes use `zoneId:null`. Policy commands may supply only changed fields; code expands them against the sequential native validation copy, preserving unrelated fields and explicit null/empty values. Code rechecks the exact input binding, canonical current-turn speech, hearing, live management rights and policy revision before saving the change.

Every effective access proposal becomes a native command and runs through the real access rules on an unsaved Venue copy, in listed order, before dialogue is accepted. A command cannot use authority removed by an earlier command. The final save still checks live authority and revisions. A neutral Community Venue advertises its protected status instead of management scopes; policy changes, bans, refusals and dismissals cannot restrict it. Refusing a future visit elsewhere is dialogue, not a current-visit restriction.

The writer must include effect data for every persistent outcome it establishes, including a valid manager's present-tense spoken administration. Local `MEMORY` supplies conversational learning; other effects use `CHANGES`. `INPUT speech` describes what the player sent; it does not make the turn effect-free. Prose alone cannot change a saved policy or physical record. Hypothetical discussion and future intentions still change nothing.

A complete `CHANGES` member list may omit its outer braces and top-level key quotes. The parser restores only that envelope and those known key quotes, preserving every value and then validating the entire JSON object. It never extracts a valid subsection, invents missing values or closes unfinished containers. An omitted action `consent` list means no consent evidence; every nonacting controller still needs actual permission. A plain `recent` paragraph is equivalent to `{text:paragraph}`, without renewal. Malformed supplied values remain errors. None of these local normalizations buys another model answer.

Supported optional fields are `memoryChanges`, `relationshipChanges`, `wishChanges`, `projectSpeech`, `action`, `access`, `events`, `immediateResidentMoves`, `contactAttempt`, `npcIntroductions`, `placeDiscoveries`, `establishmentProgress`, `halt`, `presentation`, `narrativeIntroduction` and `sounds`. Their maintained field contracts live in [scene-gm.ts](../packages/villages/src/server/domain/rules/scene-gm.ts). Only current Project terms add the detailed Project contract, after conversation history so topic changes do not rewrite the stable prefix.

Generated paragraph indexes start at zero **before** player speech insertion. Player speech citations use `utterance:N`; history citations use supplied citable IDs. Code remaps these once and checks exact source bytes and perception. The model cannot set `input`, `segments`, witnesses or server bookkeeping through `CHANGES`. Duplicate JSON keys, excessive nesting, truncation, unknown fields and forged authority are rejected. A narrowly defined empty `halt` report is equivalent to omission; nonempty or unknown data still faces normal validation.

## Read the request

The first system message contains stable writing direction, player/world context, complete local resident identities, then response/effect contracts. Witnessed history starts the following data. Current supporting identities, physical Scene facts, speaker positions, access/hearing, clock, query-dependent mechanics, relevant lore, recalled Memories, prior encounters and authored post-history instructions stay after history. The player's exact message remains last, after a deterministic input boundary.

Each request rebuilds current facts from existing authority. There is no second saved prompt-state journal or chain of edits for the model to reconstruct. Physical changes update the current facts after history, preserving the transcript prefix's eligibility for caching. This leaves more current data uncached during quiet turns but avoids invalidating a long transcript whenever an object moves or the room changes. Current facts remain essential when old history is trimmed and override historical claims. Permissions, selected writers, private knowledge and administrative Memory protections never become frozen cache data. The pending physical-receipt identifier stays in server authority rather than the writing prompt; code binds committed effects.

The location view retains current and directly connected known Zones. More distant known destinations retain route IDs, names and connections. Unseen attendance is private. Available supporting NPCs get a small name/ID index; a directly named candidate gets its profile, and active/admitted speakers retain their full relevant identity. Present people remain eligible, including a fifth local guest. The server limits actual non-player responders to four; remote opportunities remain bounded and require the existing hearing/contact authority.

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

The authoritative Scene contract is writing version **14**, using the text grammar above. Obsolete captured requests, including version 13, are refused before narrative preparation or provider dispatch; accepted canonical records remain readable and unchanged. There is no legacy JSON/tuple writer dispatch, automatic boundary replacement or automatic Project reinterpretation. Current explicit effect retries still use their own JSON effect contracts and existing authority checks. The grammar and strict syntax parser are maintained together in [scene-text-contract.ts](../packages/villages/src/server/domain/rules/scene-text-contract.ts); the native dispatch seam is [writing-service.ts](../packages/villages/src/server/features/scenes/writing-service.ts).
