import type { InterpretationBatch } from "../models/interpretation-model.js";
import type { VenueScene } from "../models/scene-model.js";
import type { VillageState } from "../models/world.js";
import { asRecord } from "./coerce.js";
import { dismissalDestination } from "./scene-room-events.js";
import { canInviteToZone, resolveVenueZone, zoneArea, zoneClosed } from "./venue-zones.js";

export function applyInterpretedRoomEvents(
  session: VenueScene,
  batch: InterpretationBatch | null | undefined,
  village: VillageState,
): void {
  if (!batch) return;
  session.pendingRoomQuestions = batch.checks
    .filter((_check, index) => batch.results[index].outcome === "unresolved")
    .map((check) => check.question)
    .slice(0, 8);
  const invitationCount = batch.results.filter((result) =>
    ["invite-now", "invite-later"].includes(result.outcome),
  ).length;
  for (const [index, result] of batch.results.entries()) {
    const trace = batch.traces[index],
      facts = asRecord(batch.checks[index].facts);
    const venue = village.venues.find((entry) => entry.id === (facts.venueId ?? session.placeId));
    const zone = venue && resolveVenueZone(venue, String(facts.zoneId));
    const actor = String(facts.actorId);
    trace.applied =
      result.outcome === "unresolved" ? "Unresolved; no new permission or movement was inferred" : "No new room event";
    if (["none", "unresolved"].includes(result.outcome)) continue;
    if (!venue || !zone || zoneClosed(village, venue, zone) || !canInviteToZone(venue, zone, actor)) {
      trace.applied = "Rejected: current Zone authority or availability did not validate";
      continue;
    }
    if (
      !batch.checks[index].evidence.some(
        (line) =>
          line.current &&
          result.evidenceIds.includes(line.id) &&
          (line.speakerId === actor || line.kind === "narration"),
      )
    ) {
      trace.applied = "Rejected: no witnessed current evidence from the authorized speaker";
      continue;
    }
    if (["invite-now", "invite-later"].includes(result.outcome)) {
      if (invitationCount !== 1) {
        trace.applied = "Unresolved: multiple invitation targets; clarification is needed";
        continue;
      }
      trace.applied =
        result.outcome === "invite-now" &&
        session.entryOffers?.some((offer) => offer.zoneId === zone.id && offer.controllerId === actor)
          ? `Entry offer created using ${result.source}; speaker authority validated`
          : result.outcome === "invite-later" || venue.id !== session.placeId
            ? "Future invitation queued for validation against saved speech"
            : "Rejected: no current supporting invitation evidence";
      continue;
    }
    if (
      venue.access &&
      ["refuse", "dismiss", "ban-zone", "ban-venue", "invite-outside-hours"].includes(result.outcome)
    ) {
      trace.applied = "Scoped access event queued for saved speech validation";
      continue;
    }
    if (result.outcome === "dismiss") {
      if (venue.id !== session.placeId) {
        trace.applied = "Rejected: dismissal concerns another Venue";
        continue;
      }
      if (session.zoneId !== zone.id) {
        trace.applied = "Rejected: player is not in the dismissed Zone";
        continue;
      }
      const destinationId = dismissalDestination(village, venue, session);
      const destination = destinationId && resolveVenueZone(venue, destinationId);
      if (!destination) {
        trace.applied = "Unresolved: no adjacent accessible exit path";
        continue;
      }
      session.enteredFromZoneId = zone.id;
      session.zoneId = destination.id;
      session.area = zoneArea(destination);
      session.spaceClass = destination.venueClass;
      session.privateOwnerId = destination.ownerId ?? "";
      session.privateSpaceId = ["private-residence", "staff", "restricted"].includes(destination.kind)
        ? destination.id
        : undefined;
      session.doorwayContacts = [];
      session.recap = "";
      trace.applied = `Moved to ${destination.name} within the same Scene using ${result.source}`;
    } else if (result.outcome === "refuse")
      trace.applied = `Entry refused using ${result.source}; current Scene permission withdrawn`;
    if (venue.id !== session.placeId) {
      trace.applied = "Refusal understood for another Venue; no current Scene access changed";
      continue;
    }
    session.dismissedZoneIds = [...new Set([...(session.dismissedZoneIds ?? []), zone.id])];
    session.entryOffers = session.entryOffers?.filter((offer) => offer.zoneId !== zone.id);
    session.grantedZoneIds = session.grantedZoneIds?.filter((id) => id !== zone.id);
    session.zoneGrants = session.zoneGrants?.filter((grant) => grant.zoneId !== zone.id);
  }
}
