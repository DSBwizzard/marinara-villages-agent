// Villages — the village-level operations the routes call.
//
// Joining a village record to the live library lives here rather than in the
// route file so the rule is stated once: a card is authoritative when it still
// exists, and a remembered name stands in when it does not.

/** How many villagers a village will hold, so the tab keeps rendering sanely. */
export const MAX_VILLAGERS = 12;
