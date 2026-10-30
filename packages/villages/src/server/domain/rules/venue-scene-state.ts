import type { VillageState, VillageVenue, VillageVenueClass, VillageVenueEvent } from "../models/world.js";
import type { PlaceAfter, PlaceEvidence, PlaceUpdate } from "../../../shared/contracts/place-continuity.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { conflict } from "./errors.js";
import { clearRepairedConditions } from "./narrative-development.js";
import { applyPlaceUpdate, assertPlaceAuthority, readPlaceUpdate } from "./zone-continuity.js";
import { canOccupyZone, legacyZoneId, resolveVenueZone, zoneClosed, zoneControllerIds } from "./venue-zones.js";

/** Committed physical proofs survive recent-feed trimming. */
export function physicalVenueEvents(state: VillageState): VillageVenueEvent[] {
  return [
    ...new Map(
      [
        ...state.venueEvents,
        ...Object.values(state.exchangeReceipts).flatMap((receipt) =>
          receipt.domain === "physical" && receipt.physicalOutcome ? [receipt.physicalOutcome] : [],
        ),
      ].map((event) => [event.id, event]),
    ).values(),
  ];
}
/** Only a completed, retired source may release its full replay payload. */
export function releasePhysicalOutcomes(state: VillageState, sceneId: string, keepNarrative = false): void {
  if (state.narrative && !keepNarrative)
    state.narrative.receipts = state.narrative.receipts.filter((row) => row.sourceId !== sceneId);
  const ids = new Set<string>();
  for (const receipt of Object.values(state.exchangeReceipts))
    if (receipt.domain === "physical" && receipt.sceneId === sceneId) {
      ids.add(receipt.id);
      delete receipt.physicalOutcome;
    }
  state.venueEvents = state.venueEvents.filter((row) => !ids.has(row.id));
}
export type VenueSceneChange = PlaceUpdate;

export function readVenueSceneChange(value: unknown, venue: VillageVenue | undefined, at: string): PlaceUpdate | null {
  if (value == null) return null;
  if (!venue) throw conflict("That Zone is no longer here.");
  return readPlaceUpdate(value, venue, at);
}

/** Source-bound evidence is mandatory; return exact after-values for receipt replay. */
export function applyVenueSceneChange(
  state: VillageState,
  placeId: string,
  change: PlaceUpdate,
  sceneId: string,
  at: string,
  spaceClass?: VillageVenueClass,
  area: "outside" | "shared" | "private" | "public" = "public",
  privateOwnerId = "",
  zoneId?: string,
  evidence?: PlaceEvidence,
  admittedConditions?: import("../models/narrative-model.js").NarrativeCondition[],
): PlaceAfter {
  const venue = state.venues.find((place) => place.id === placeId);
  if (!venue) throw conflict("That place is no longer in the Village.");
  const zone = resolveVenueZone(venue, zoneId || legacyZoneId(venue, area, spaceClass, privateOwnerId));
  if (!zone || zoneClosed(state, venue, zone) || venue.constructionStatus === "worksite")
    throw conflict("Physical changes are unavailable in this Zone.");
  if (area === "private" && zone.ownerId !== privateOwnerId) throw conflict("The private Zone owner changed.");
  if (
    !evidence ||
    evidence.actorIds.some(
      (id) =>
        evidence.positions?.[id] !== zone.id ||
        !canOccupyZone(venue, zone, id, {
          sceneId,
          at: new ZonedDate(at, state.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone),
          positions: evidence.positions,
          accepting: false,
          relationships: state.relationshipContext,
        }),
    )
  )
    throw conflict("Physical actions need valid access and actual local actors.");
  const after = applyPlaceUpdate(zone, change, at);
  if (
    change.conditionClears?.some(
      (clear) =>
        !admittedConditions?.some(
          (condition) =>
            condition.id === clear.id &&
            condition.revision === clear.expectedRevision &&
            condition.venueId === placeId &&
            condition.zoneId === zone.id,
        ),
    )
  )
    throw conflict("The corrective work names a condition outside its captured source.");
  const enduring = after.description !== zone.description;
  if (
    !enduring &&
    change.conditionClears?.some((clear) =>
      state.narrative?.conditions.some(
        (condition) => condition.id === clear.id && condition.physicalRevision !== undefined,
      ),
    )
  )
    throw conflict("Reopening this repair-linked condition needs an enduring physical correction.");
  const controllers = enduring ? zoneControllerIds(venue, zone) : [];
  if (enduring && (zone.kind === "staff" || zone.kind === "restricted") && !controllers.length)
    throw conflict("This Zone has no current authority for the change.");
  assertPlaceAuthority(
    evidence,
    controllers,
    state.villagers.map((person) => person.characterId),
  );
  if (enduring && change.appearanceChanged === true) {
    zone.picture = { ...zone.picture, base: zone.picture?.base ?? zone.image, dirty: true };
  }
  zone.description = after.description;
  zone.state = after.state;
  clearRepairedConditions(state, placeId, zone.id, change.conditionClears, sceneId, at);
  return structuredClone(after);
}
