import type { VillageState, VillageVenue } from "../models/world.js";
import { initializeVenueAccess, reconcileVenueAccess } from "./venue-access.js";
import { assertVillageVenueCapacity, villageVenueUsage } from "./venue-capacity.js";
import { synchronizeVenueZones } from "./venue-zones.js";
import { randomVillageSeed } from "./village-clock.js";
import { pruneWishActivities } from "./wish-policy.js";

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
  const previousCapacity = villageVenueUsage(state);
  mutate(state);
  if (state.seed !== relationshipSeed) delete state.relationshipContext;
  const capacity = villageVenueUsage(state);
  if (capacity.total > previousCapacity.total || capacity.nonResidential > previousCapacity.nonResidential)
    assertVillageVenueCapacity(state);
  for (const resident of state.villagers)
    for (const entry of state.wishKnowledge[resident.characterId] ?? []) {
      if (
        (entry.status && entry.status !== "active") ||
        resident.agenda?.wishes.some((wish) => wish.id === entry.wishId)
      )
        continue;
      const outcome = resident.wishLifecycle?.pendingOutcomes.find((outcome) => outcome.wish.id === entry.wishId);
      entry.status = outcome?.kind === "fulfilled" ? "fulfilled" : "expired";
    }
  // Assign notice order in the same document write as its committed effect.
  for (const receipt of Object.values(state.exchangeReceipts))
    if (receipt.notice && !receipt.noticeSequence) {
      receipt.noticeSequence = ++state.noticeSequence;
      receipt.committedAt = sources.now().toISOString();
    }
  for (const venue of state.venues) {
    synchronizeVenueZones(venue, previousVenues.get(venue.id));
    if (!previousVenues.has(venue.id) && state.venues.some((entry) => entry.access)) initializeVenueAccess(venue);
    else if (venue.access) initializeVenueAccess(venue);
    reconcileVenueAccess(venue, ["player", ...state.villagers.map((person) => person.characterId)]);
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
  pruneWishActivities(state, sources.now());
  if (state.foundedAt.length === 0) state.foundedAt = sources.now().toISOString();
  if (state.seed.length === 0) state.seed = sources.seed();
  // Relationship authority lives in its own seed-scoped document, never the village DTO.
  delete state.relationshipContext;
}
