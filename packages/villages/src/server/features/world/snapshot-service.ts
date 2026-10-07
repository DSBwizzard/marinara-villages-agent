import type { VillageSnapshot } from "../../domain/models/world.js";
import { sceneAccessContext } from "../../domain/rules/venue-contact.js";
import { canOccupyZone, legacyZoneId, resolveVenueZone, zoneClosed } from "../../domain/rules/venue-zones.js";
import { deriveVillageMoment } from "../../domain/rules/village-clock.js";
import { readPlayerIdentity, villagerPlaceView } from "../../domain/rules/village-projections.js";
import {
  exactSnapshotTransition,
  isVillageFounded,
  projectVillager,
  villageMomentView,
  villageSettings,
} from "../../domain/rules/world-snapshot.js";
import { relationshipChangeNotices } from "../../domain/rules/relationship-presentation.js";

export type VillageSnapshotPorts = {
  readVillageState: typeof import("./village-store.js").readVillageState;
  mutateVillageState: typeof import("./village-store.js").mutateVillageState;
  listVillagerCards: typeof import("../../adapters/engine/catalog.js").listVillagerCards;
  captureMissingVillagerCardColors: typeof import("../../adapters/engine/catalog.js").captureMissingVillagerCardColors;
  rollActiveAgendas: typeof import("../residents/resident-agendas.js").rollActiveAgendas;
  sceneQueries: () => Pick<ReturnType<typeof import("../scenes/services.js").sceneQueries>, "activeVenueSession">;
  backgroundWorkSummaries: typeof import("../../jobs/background-work.js").backgroundWorkSummaries;
  privatePreparationRooms: typeof import("../../jobs/private-space-preparation.js").privatePreparationRooms;
};

/** Inert snapshot assembly; connections belong to its activation. */
export function createVillageSnapshot({
  readVillageState,
  mutateVillageState,
  listVillagerCards,
  captureMissingVillagerCardColors,
  rollActiveAgendas,
  sceneQueries,
  backgroundWorkSummaries,
  privatePreparationRooms,
}: VillageSnapshotPorts) {
  /** The village as the tab draws it: live library labels and adopted card colors. */
  async function buildVillageSnapshot(now: Date = new Date()): Promise<VillageSnapshot> {
    let village = await readVillageState();
    if (!village.visitMemoryBackfilled && (village.setupAt || village.foundedAt)) {
      village = await readVillageState();
    }
    if (await rollActiveAgendas(now, village)) village = await readVillageState();
    const minuteOfDay = deriveVillageMoment({ foundedAt: village.foundedAt, seed: village.seed, now }).minuteOfDay;
    const residentIds = village.villagers.map((villager) => villager.characterId);
    const cards = await listVillagerCards(residentIds);
    const cardsById = new Map(cards.map((card) => [card.id, card]));
    // Existing residents adopted their cards before colors were captured. Fill only
    // the missing fields once; later card edits still require Apply refresh.
    if (
      village.villagers.some(
        ({ cardSnapshot }) => cardSnapshot.nameColor === undefined || cardSnapshot.dialogueColor === undefined,
      )
    ) {
      await mutateVillageState((state) => {
        for (const resident of state.villagers) {
          const card = cardsById.get(resident.characterId);
          if (resident.cardSnapshot.nameColor === undefined || resident.cardSnapshot.dialogueColor === undefined)
            resident.cardSnapshot = captureMissingVillagerCardColors(resident.cardSnapshot, card ?? null);
        }
      });
      village = await readVillageState();
    }
    const player = readPlayerIdentity(village);
    const { activeVenueSession } = sceneQueries();
    const residenceAccess = await activeVenueSession();
    // ONE schedule read for the whole village, so every villager's pin and their
    // own drawer's plate are resolved off the same answer. Null when the Engine
    // will not answer, which leaves every villager unplaced rather than failing
    // the poll — a map with no locators on it is a map, and an error is not.
    const villagers = village.villagers.map((villager) => {
      const card = cardsById.get(villager.characterId) ?? null;
      let destination = villagerPlaceView(village, villager, null, minuteOfDay, now);
      const companion = residenceAccess?.accompanying?.find((entry) => entry.characterId === villager.characterId);
      const companionVenue = companion && village.venues.find((entry) => entry.id === residenceAccess?.placeId);
      const companionZone = companionVenue && resolveVenueZone(companionVenue, companion!.zoneId);
      if (residenceAccess && village.venues.some((venue) => venue.id === residenceAccess.placeId && venue.access)) {
        const position = sceneAccessContext(residenceAccess, village).positions?.[villager.characterId];
        if (position && position !== residenceAccess.zoneId) destination = null;
        else if (position) {
          const sceneVenue = village.venues.find((venue) => venue.id === residenceAccess.placeId)!;
          const sceneZone = resolveVenueZone(sceneVenue, position)!;
          destination = {
            id: sceneVenue.id,
            name: sceneVenue.name,
            image: sceneZone.image,
            kind: "venue",
            zoneId: position,
            zoneName: sceneZone.name,
          };
        }
      }
      if (
        !companionVenue?.access &&
        companionVenue &&
        companionZone &&
        canOccupyZone(companionVenue, companionZone, villager.characterId) &&
        !zoneClosed(village, companionVenue, companionZone)
      )
        destination = {
          id: companionVenue.id,
          name: companionVenue.name,
          image: companionVenue.presentation.image,
          kind: "venue",
          zoneId: companionZone.id,
          zoneName: companionZone.name,
        };
      const destinationVenue = destination && village.venues.find((venue) => venue.id === destination.id);
      if (
        destinationVenue?.access &&
        destination &&
        destination.zoneId !== "exterior" &&
        !(
          residenceAccess?.placeId === destinationVenue.id &&
          sceneAccessContext(residenceAccess, village).positions?.[villager.characterId] === residenceAccess.zoneId
        )
      )
        destination = {
          ...destination,
          zoneId: undefined,
          zoneName: undefined,
          image: destinationVenue.presentation.image,
        };
      return projectVillager(
        villager,
        card?.name ?? null,
        card?.summary ?? "",
        card?.tags ?? [],
        villager.cardSnapshot.nameColor ?? "",
        villager.cardSnapshot.dialogueColor ?? "",
        destination,
      );
    });
    return {
      status: "ready",
      progressEngineVersion: village.progressEngineVersion,
      foundingPreparation: village.foundingPreparation
        ? {
            ...village.foundingPreparation,
            privateSpacesTotal: privatePreparationRooms(village).length,
            privateSpacesReady: privatePreparationRooms(village).filter(
              ({ zone }) => zone.preparation?.status === "ready",
            ).length,
          }
        : null,
      village: villageMomentView(village, now, exactSnapshotTransition(village, now)),
      venueRequests: village.pendingDecisions.filter(
        (decision) =>
          decision.kind === "venue" &&
          decision.status !== "approved" &&
          decision.status !== "denied" &&
          decision.status !== "countered" &&
          decision.venueDraft,
      ),
      projects: village.projects.map((project) =>
        project.lifecycle
          ? {
              ...project,
              lifecycle: {
                ...project.lifecycle,
                recordedItems: project.lifecycle.recordedItems.filter((item) => {
                  const venue = village.venues.find((entry) => entry.id === item.venueId);
                  const zone = venue && resolveVenueZone(venue, item.zoneId ?? legacyZoneId(venue, "public"));
                  return (
                    !!zone &&
                    (zone.seen ||
                      zone.kind === "exterior" ||
                      (venue!.occupancy.playerHome && zone.kind === "shared-residence"))
                  );
                }),
              },
            }
          : project,
      ),
      villageCapabilities: village.villageCapabilities,
      upgradeRequests: village.pendingDecisions.filter(
        (decision) => decision.kind === "venue-upgrade" && decision.status === "pending",
      ),
      residences: village.residences,
      venueMail: village.venueMail,
      noticeboard: village.noticeboard,
      happenings: village.happenings.map((entry) => {
        const encounter = village.relationshipContext?.socialEncounters.find(
          (row) => row.id === entry.sourceOpportunityId + ":social",
        );
        return encounter
          ? {
              ...entry,
              socialOutcome: {
                id: encounter.id,
                changes: relationshipChangeNotices(
                  Object.values(village.relationshipContext!.receipts).filter(
                    (receipt) => receipt.sourceId === encounter.id && receipt.before !== receipt.after,
                  ),
                  village.relationshipContext!,
                  village,
                ).map((notice) => notice.text),
              },
            }
          : entry;
      }),
      villagers,
      relationshipStartingPending: village.villagers.some(
        (person) => !village.relationshipContext?.reviewedActorIds.includes(person.characterId),
      ),
      isFounded: isVillageFounded(village),
      settings: villageSettings(
        village,
        player,
        residenceAccess,
        residenceAccess ? sceneAccessContext(residenceAccess, village) : undefined,
      ),
      recap: null,
      backgroundWork: await backgroundWorkSummaries(),
    };
  }

  return { buildVillageSnapshot };
}
export type VillageSnapshotService = ReturnType<typeof createVillageSnapshot>;
