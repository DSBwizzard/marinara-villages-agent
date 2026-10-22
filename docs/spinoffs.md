# Spinoffs: proof of concept

From an active Scene's top-right **…** menu, choose **Start a spinoff**, select one resident in your current Zone, and describe an idea. The setup opens over the Scene; cancelling preserves your text draft and reading position. Engine opens its ordinary scene planner and roleplay chat, with the Village encounter's setting, original time, shared conversation, linked lorebooks, persona, and resolved text connection.

Spinoffs start only when you choose **Continue in Engine**. Ordinary Scene navigation and window focus do not check for or launch spinoffs. Status checks resume only for an existing pending handoff so its return and recovery controls remain available after reloading.

Play freely in Engine. The spinoff is only partly Village continuity. This proof of concept can return up to three specific shared memories; it does not change relationship scores, Village time, tasks, property, possessions, permissions, or the resident roster.

The original Scene and the player's other Village interactions remain occupied until the spinoff is finished or discarded. Village time and residents' subsequent agendas continue. The episode stays anchored to the original Scene instant, even if you finish writing days later; an unfinished transcript does not mean the resident spent those days doing the activity. Engine's narrative clock is not the Village clock.

## Returning

Use Engine's **End Scene** to bring back its recap. The recap is for your review and is never inserted into resident prompts. **Prepare memories** explicitly uses your Villages text connection to review the complete saved conversation. AI interpretation can be mistaken.

The first version is conservative: the whole story must fit one bounded encounter and its captured setting and timing constraints. A two-month sleep, a fourteen-hour outing incompatible with that encounter, or killing a living resident keeps the whole spinoff outside Village memory. Dreams, jokes, and fantasy appropriate to the setting are assessed in context. Uncertain continuity, additional cast, private/excluded messages, or a transcript beyond the proof-of-concept review limits also prevent import; there is no silent truncation or selective rewriting.

Eligible memories preserve significant shared experiences and compatible disclosures or commitments. Each has supporting conversation excerpts. Accept individual offered memories or keep the spinoff separate. The player cannot edit an offered memory, override eligibility, or claim task completion through the import. Only the original resident receives accepted memories; they use the same bounded memory selection as other Village conversations. Recall is contextual, not a guarantee that every later reply mentions the outing.

Discarding, deleting, or converting the Engine scene releases the handoff without memories. Cancelling planning offers a way to discard the prepared handoff. Returning to an unfinished spinoff offers **Go to spinoff**. Accepted memories survive later deletion of the Engine chat.

**Engine independently saves concluded scenes in its character memories.** Keeping a spinoff separate prevents Village import; it does not suppress Engine's own memory behavior.

## Recovery and retention

Callbacks save the outcome without model calls. Missed callbacks reconcile from the linked Engine chat. An interrupted memory preparation requires an explicit retry and may incur another provider call. A saved memory selection is fixed during application so retries cannot duplicate memories or change a partially applied selection. Missing residents or changed Village/persona identities release the handoff without importing stale results.

The source Scene retains its spinoff review until normal Scene-history retention/deletion. Accepted memories retain only their selected supporting excerpts in a private package evidence document independent of Scene retention. Starting the village over removes those evidence documents. Declined spinoffs create no independent transcript copy.

Provider-free regression tests cover lifecycle, evidence restrictions, ownership races, partial application and recovery. Desktop/phone browser tests use mocked Engine navigation and responses. These establish plumbing and policy enforcement, not real-model compatibility judgment or conversational quality. Real-provider acceptance remains a separate test.
