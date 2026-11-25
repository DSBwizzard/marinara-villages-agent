# Relationship first pass

Warmth and Romance are separate, directional scores. A Villager has their own scores toward each person. The player decides how their own Persona feels. Zero is neutral on either score. In People, the player’s Persona has a named card with both meters and the Perception line. Other Villagers appear as named rows in a separate card. Positive interest fills hearts, negative interest fills broken hearts, and neutral shows empty hearts. Each Villager's card, history, and circumstances determine how they express a preference. The bands describe when an attitude can change a decision in play.

## Warmth

| Score       | Effect                                                                                                                                                            |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| −100 to −85 | They may give up a preferred outing or move their own flexible plans to keep their distance.                                                                      |
| −84 to −60  | They may make new optional plans at another time, place, or with another group. Either direction at −60 or below excludes a pair from automatic friendly meetups. |
| −59 to −25  | They pull back when there is an easy alternative, such as joining another conversation or choosing another partner.                                               |
| −24 to −1   | A cooler tone or more guarded response.                                                                                                                           |
| 0           | Warmth adds no preference.                                                                                                                                        |
| +1 to +24   | A warmer tone or more open response.                                                                                                                              |
| +25 to +59  | They gravitate toward the person when there is an easy opportunity, such as starting a conversation or inviting them along to an existing activity.               |
| +60 to +84  | They may deliberately propose new plans and reserve free time if the other person agrees. At +60 toward the player, they share their full Agenda.                 |
| +85 to +100 | They may give up another attractive option, rearrange their own flexible plans, or go out of their way to show up.                                                |

These decisions apply to voluntary plans. The hard checks are Agenda sharing at +60 and the automatic meetup cutoff at −60. The other bands guide the GM's choices and portrayal. Active commitments, venue access, and scheduling conflicts follow their existing rules. Villagers can still choose to confront someone or try to reconcile. An amiable Villager may quietly make other plans, while a blunt Villager may say exactly why.

## Romance

| Score      | Effect                                                                                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| −20 to −16 | They may take lasting steps to keep romantic distance, such as ending a date or romance, limiting future contact to group settings, or disengaging from romantic correspondence. |
| −15 to −10 | They may proactively ask for romantic distance, decline date-like plans, or leave an exchange if someone keeps pressing.                                                         |
| −9 to −4   | They may plainly shut down flirtation or ask to keep things platonic.                                                                                                            |
| −3 to −1   | They may let a romantic remark pass or steer the exchange back to friendly ground.                                                                                               |
| 0          | They feel neutral about romance with this person.                                                                                                                                |
| +1 to +3   | Interest may color a response with curiosity or playful banter.                                                                                                                  |
| +4 to +9   | They may initiate flirting, seek one-on-one time, or write a more personal letter.                                                                                               |
| +10 to +15 | They may ask for a date or express romantic feelings directly.                                                                                                                   |
| +16 to +20 | Once interest is reciprocated, they may plan the next date, suggest regular time together, or ask to become partners.                                                            |

Existing scores keep their values. Cooling brings positive Romance toward zero. Negative scores require evidence the prospect is unwelcome. A witnessed change can also ease aversion toward zero. A clear decline can leave Romance at zero. Expressed boundaries apply at any score and carry forward until the person who set them revisits them. Dates and partnerships require agreement. Warmth can stay high while Romance is strongly negative, and romantic pull can persist while low Warmth makes a Villager choose distance.

## Perception refresh

The People profile shows one saved sentence of up to 15 words in the Villager's own voice. The game checks for these triggers after accepting an exchange.

1. The first two-way exchange with the Villager, in a Scene or through a personal letter they answer.
2. An accepted score enters or leaves a behavior band. The breakpoints are ±25, ±60, and ±85 for Warmth, and ±4, ±10, and ±16 for Romance. Changes between the near-neutral values can qualify through the next two triggers.
3. A new clear romantic answer or boundary, a change to a boundary, or a relationship beginning or ending. Repeating an existing answer leaves the line alone.
4. A new grounded perspective on the player that the Villager can attribute to an event they personally experienced. A first spark, reconciliation, realization, or serious breach can qualify even within the same score band.

The blurb is eligible as soon as a trigger is accepted. A Scene's changes become ready for a background call once the Scene closes. Letter changes become ready once processing saves the exchange. Several changes concerning the same Villager are combined into their latest accepted state.

The existing background work queue selects up to four ready Villagers per model request under the current allowance. Each request uses the configured Narration connection and carries only the relevant Villager cards, both committed scores, previous lines, and personally known history and boundaries. The model returns one sentence or an unchanged result per Villager. The server checks the captured state before saving the result. Changes that arrive during a request remain eligible for a later batch. The profile reads the saved line, and a due blurb can wait if the background allowance is unavailable.

The server deduplicates identical impressions. Recognizing a paraphrase of an existing impression remains part of the GM's judgment.
