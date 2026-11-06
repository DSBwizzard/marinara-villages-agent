import { sceneAccessState } from "./scene-layout.js";
import type { InterpretationBatch } from "../models/interpretation-model.js";
import type { VenueScene } from "../models/scene-model.js";
import type { VillageState } from "../models/world.js";
import { asRecord } from "./coerce.js";
import { canInviteToZone, resolveVenueZone, zoneClosed } from "./venue-zones.js";

export function applyInterpretedRoomEvents(
  session: VenueScene,
  batch: InterpretationBatch | null | undefined,
  village: VillageState,
): void {
  if (!batch) return;
  village = sceneAccessState(village, session);
  session.pendingRoomQuestions = batch.checks
    .filter((_check, index) => batch.results[index].outcome === "unresolved")
    .map((check) => check.question)
    .slice(0, 8);
  for (const [index, result] of batch.results.entries()) {
    const facts = asRecord(batch.checks[index].facts);
    const venue = village.venues.find((entry) => entry.id === (facts.venueId ?? session.placeId));
    const zone = venue && resolveVenueZone(venue, String(facts.zoneId));
    const actor = String(facts.actorId);
    if (result.outcome !== "invite-now" || venue?.id !== session.placeId) continue;
    if (!venue || !zone || zoneClosed(village, venue, zone) || !canInviteToZone(venue, zone, actor)) continue;
    if (
      !batch.checks[index].evidence.some(
        (line) =>
          line.current &&
          result.evidenceIds.includes(line.id) &&
          (line.speakerId === actor || line.kind === "narration"),
      )
    )
      continue;
    session.dismissedZoneIds = session.dismissedZoneIds?.filter((id) => id !== zone.id);
    session.grantedZoneIds = [...new Set([...(session.grantedZoneIds ?? []), zone.id])];
    session.zoneGrants = [
      ...(session.zoneGrants ?? []).filter((row) => row.zoneId !== zone.id),
      { zoneId: zone.id, controllerId: actor },
    ];
    session.entryOffers = [
      ...(session.entryOffers ?? []).filter((row) => row.zoneId !== zone.id),
      { zoneId: zone.id, label: zone.name, controllerId: actor, accompanies: facts.accompanies === true },
    ];
  }
}
