import type { VillageState, VillagePendingDecision } from "../models/world.js";
import { boundText, MAX_VENUE_NOTE_LENGTH } from "./prompt-preset.js";
import { randomVillageSeed } from "./village-clock.js";
import { venueRequestDraft, type VenueRequestCore } from "./venue-requests.js";

/** Save only an explicit, grounded request. All sources share this deduplication rule. */
export function queueVillageVenueRequest(
  state: VillageState,
  core: VenueRequestCore,
  requesterCharacterId: string,
  source: "chat" | "background",
  sourceKey: string,
  at: string,
  requestQuote = "",
): void {
  const requester = state.villagers.find((villager) => villager.characterId === requesterCharacterId);
  if (!requester || !sourceKey) return;
  if (
    state.pendingDecisions.filter((decision) => decision.status !== "approved" && decision.status !== "denied")
      .length >= 256
  )
    return;
  const key = core.name.trim().toLowerCase();
  if (
    state.venues.some((venue) => venue.name.trim().toLowerCase() === key) ||
    state.projects.some(
      (project) =>
        (project.kind === "build-venue" || project.kind === "new-venue") &&
        project.status !== "complete" &&
        project.venueDraft?.name.trim().toLowerCase() === key,
    ) ||
    state.pendingDecisions.some(
      (decision) =>
        decision.sourceKey === sourceKey ||
        (decision.kind === "venue" &&
          decision.status !== "denied" &&
          decision.venueDraft?.name.trim().toLowerCase() === key),
    )
  )
    return;
  const decision: VillagePendingDecision = {
    id: randomVillageSeed(),
    kind: "venue",
    title: core.name,
    detail: core.classes.join(" / "),
    proposedAt: at,
    sourceOpportunityId: source === "background" ? sourceKey : "",
    status: "pending",
    venueDraft: venueRequestDraft(core),
    requesterCharacterId,
    requesterName: requester.cardSnapshot.name,
    requestQuote: boundText(requestQuote, MAX_VENUE_NOTE_LENGTH),
    source,
    sourceKey,
  };
  state.pendingDecisions.push(decision);
  const pending = state.pendingDecisions.filter((entry) => entry.status !== "approved" && entry.status !== "denied");
  const resolved = state.pendingDecisions.filter((entry) => entry.status === "approved" || entry.status === "denied");
  const historyRoom = 256 - pending.length;
  state.pendingDecisions = [...(historyRoom > 0 ? resolved.slice(-historyRoom) : []), ...pending];
}
