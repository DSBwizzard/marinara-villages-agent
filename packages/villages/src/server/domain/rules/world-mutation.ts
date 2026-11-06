import type { VillageState, VillageVenue } from "../models/world.js";
import { placeRegistry, sceneActorIds } from "./places.js";
import { projectAgendaReservations } from "./project-focus.js";

import { refreshProjectAgreements } from "./project-lifecycle-rules.js";
import { initializeVenueAccess, reconcileVenueAccess } from "./venue-access.js";
import { assertVillageVenueCapacity, villageVenueUsage } from "./venue-capacity.js";
import { synchronizeVenueZones } from "./venue-zones.js";
import { randomVillageSeed } from "./village-clock.js";

export interface VillageMutationSources {
  now(): Date;
  seed(): string;
}
/** Normalize a Village change independently of hydration and revision-safe storage. */
export function normalizeVillageMutation(
  state: VillageState,
  relationshipSeed: string,
  mutate: (state: VillageState) => void,
  sources: VillageMutationSources = { now: () => new Date(), seed: randomVillageSeed },
): void {
  const previousVenues = new Map(state.venues.map((venue) => [venue.id, structuredClone(venue)]));
  const placementKey = (world: VillageState, id: string) =>
    JSON.stringify([
      world.venues
        .filter((venue) => venue.presentation.mapId === id)
        .map((venue) => [venue.id, venue.presentation.x, venue.presentation.y]),
      world.projects
        .filter(
          (project) =>
            project.kind === "new-venue" &&
            !["complete", "cancelled"].includes(project.status) &&
            project.venueDraft?.position.mapId === id,
        )
        .map((project) => [project.id, project.venueDraft!.position.x, project.venueDraft!.position.y]),
    ]);
  const previousMaps = new Map(
    state.maps.map((map) => [map.id, { revision: map.revision, key: placementKey(state, map.id) }]),
  );
  const previousCapacity = villageVenueUsage(state);
  mutate(state);
  for (const map of state.maps) {
    const prior = previousMaps.get(map.id);
    if (prior && map.revision === prior.revision && placementKey(state, map.id) !== prior.key) map.revision++;
  }
  for (const venue of state.venues) {
    const prior = previousVenues.get(venue.id);
    if (prior && venue.presentation.mapId !== prior.presentation.mapId)
      throw new Error("Moving an existing Venue between maps is not supported.");
  }
  if (state.seed !== relationshipSeed) delete state.relationshipContext;
  const capacity = villageVenueUsage(state);
  if (capacity.total > previousCapacity.total || capacity.nonResidential > previousCapacity.nonResidential)
    assertVillageVenueCapacity(state);
  // Assign notice order in the same document write as its committed effect.
  for (const receipt of Object.values(state.exchangeReceipts)) {
    if (receipt.status === "applied") receipt.committedAt ||= sources.now().toISOString();
    if (!receipt.notice || receipt.noticeSequence) continue;
    receipt.noticeSequence = ++state.noticeSequence;
    receipt.committedAt = sources.now().toISOString();
  }
  for (const venue of state.venues) {
    synchronizeVenueZones(venue, previousVenues.get(venue.id));
    if (previousVenues.has(venue.id) && !venue.access)
      throw new Error("This saved Place needs its native access ledger.");
    initializeVenueAccess(venue);
    const previousNpcRights = [
      ...(previousVenues.get(venue.id)?.access?.managerIds ?? []),
      ...(previousVenues.get(venue.id)?.zones ?? []).flatMap((zone) => [
        ...(zone.access?.managerIds ?? []),
        ...(zone.access?.memberIds ?? []),
        ...(zone.access?.inviterIds ?? []),
      ]),
    ].filter((id) => id.startsWith("npc:"));
    reconcileVenueAccess(venue, [
      "player",
      ...sceneActorIds(state),
      ...(!placeRegistry(state) ? previousNpcRights : []),
    ]);
    const previous = previousVenues.get(venue.id);
    const semanticAccess = (entry: VillageVenue) =>
      JSON.stringify({
        managers: entry.access?.managerIds,
        hours: entry.access?.visitorHours,
        zones: entry.zones?.map((zone) => ({ id: zone.id, ownerId: zone.ownerId, policy: zone.access })),
        residents: entry.residentIds,
        workers: entry.workerIds,
        playerHome: entry.occupancy.playerHome,
        permissions: entry.access?.permissions.map(({ sceneId: _scene, ...permission }) => permission),
        bans: entry.access?.bans,
        exceptions: entry.access?.exceptions,
        denials: entry.access?.visitDenials,
      });
    if (
      previous?.access &&
      venue.access &&
      previous.access.revision === venue.access.revision &&
      semanticAccess(previous) !== semanticAccess(venue)
    ) {
      venue.access.revision++;
      venue.access.changes.push({
        id: sources.seed(),
        revision: venue.access.revision,
        actorId: "system",
        zoneId: null,
        action: "lifecycle",
        at: sources.now().toISOString(),
        sourceLineIds: [],
      });
    }
  }
  for (const place of Object.values(placeRegistry(state)?.places ?? {}))
    reconcileVenueAccess(place.location, ["player", ...sceneActorIds(state)]);
  refreshProjectAgreements(state);
  projectAgendaReservations(state);
  if (state.foundedAt.length === 0) state.foundedAt = sources.now().toISOString();
  if (state.seed.length === 0) state.seed = sources.seed();
  // Relationship authority lives in its own seed-scoped document, never the village DTO.
  delete state.relationshipContext;
}
