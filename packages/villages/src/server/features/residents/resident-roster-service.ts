import type { VillagerCard } from "../../domain/models/catalog-model.js";
import type { VillageState } from "../../domain/models/world.js";
import { unwrittenVillageAgenda } from "../../domain/rules/agenda-plan.js";
import { badRequest, notFound } from "../../domain/rules/errors.js";
import { influenceSettings } from "../../domain/rules/owned-routine.js";
import { MAX_VILLAGERS } from "../../domain/rules/village-limits.js";
import { venueResidentIds } from "../../domain/rules/venue-model.js";
import { venueZones } from "../../domain/rules/venue-zones.js";

export interface ResidentRosterPorts {
  readVillageState(): Promise<VillageState>;
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
  findVillagerCard(id: string): Promise<VillagerCard | null>;
  queueVillagerAgenda(characterId: string): Promise<void>;
  retireBackgroundResident(state: VillageState, characterId: string): void;
}

/** Roster commands own their saved-world, library and background connections. Construction is inert. */
export function createResidentRoster({
  readVillageState,
  mutateVillageState,
  findVillagerCard,
  queueVillagerAgenda,
  retireBackgroundResident,
}: ResidentRosterPorts) {
  /**
   * Move a card into the village.
   *
   * The complete card snapshot is captured at this moment so the village keeps
   * working if the source card is later deleted.
   *
   * Nothing is written to the transcript here, and that is the whole of the
   * change from how this used to work: the card's own opening line is NOT the
   * villager's greeting any more. See `greetVillager` for why.
   */
  async function addVillager(characterId: string): Promise<void> {
    const card = await findVillagerCard(characterId);
    if (!card) throw notFound("That character is not in your library.");

    const village = await readVillageState();
    const alreadyResident = village.villagers.some((villager) => villager.characterId === characterId);
    if (!alreadyResident && village.villagers.length >= MAX_VILLAGERS) {
      throw badRequest(`A village holds at most ${MAX_VILLAGERS} villagers.`);
    }

    if (!alreadyResident) {
      const addedAt = new Date().toISOString();
      await mutateVillageState((state) => {
        if (state.villagers.some((villager) => villager.characterId === characterId)) return;
        if (state.villagers.length >= MAX_VILLAGERS) {
          throw badRequest(`A village holds at most ${MAX_VILLAGERS} villagers.`);
        }
        // Begin with a complete local agenda, then replace it with the village's
        // authored answer. A model outage cannot leave a resident without a day.
        // "somebody moves in" and then "and here is what they are after". A move
        // that failed because the model was down would be a villager who exists
        // everywhere except on the map.
        // No translation either, for the same reason: it is derived from a week
        // the villager may not even have, and it arrives behind the agenda rather
        // than in front of it. No refusal on it either — a villager who has just
        // arrived has not been asked and turned down, and a born-clean record is
        // what lets the tab tell those two apart.
        state.villagers.push({
          characterId,
          agendaGeneration: "arrival-" + addedAt,
          cardSnapshot: {
            id: card.id,
            revision: 1,
            sourceStatus: "available",
            name: card.name,
            comment: card.comment,
            summary: card.summary,
            tags: [...card.tags],
            systemPrompt: card.systemPrompt,
            description: card.description,
            personality: card.personality,
            scenario: card.scenario,
            backstory: card.backstory,
            appearance: card.appearance,
            exampleDialogue: card.exampleDialogue,
            postHistoryInstructions: card.postHistoryInstructions ?? "",
            nameColor: card.nameColor,
            dialogueColor: card.dialogueColor,
            capturedAt: addedAt,
          },
          addedAt,
          agenda: unwrittenVillageAgenda(state.venues, card.name),
          completedWishes: [],
          ingestSchedule: false,
          scheduleInfluence: influenceSettings(null),
          remap: null,
          remapFailure: null,
        });
      });
    }

    // Only for a villager who actually moved in just now, and never fatal. A
    // failure here leaves the null that the tick's backfill is looking for, so the
    // only cost is that this villager has nothing to say for themselves until the
    // next part of the day.
    if (!alreadyResident) {
      await queueVillagerAgenda(characterId);
    }
  }

  /** Remove a villager from the village roster. */
  async function removeVillager(characterId: string): Promise<void> {
    let removed = false;
    await mutateVillageState((state) => {
      const remaining = state.villagers.filter((villager) => villager.characterId !== characterId);
      removed = remaining.length !== state.villagers.length;
      if (removed)
        for (const project of state.projects) {
          if (
            project.lifecycle?.phase === "construction" &&
            project.lifecycle.builderId === characterId &&
            project.lifecycle.workOrder &&
            !project.lifecycle.workOrder.pausedAt
          ) {
            const now = new Date();
            project.lifecycle.workOrder.remainingMs = Math.max(
              0,
              Date.parse(project.lifecycle.workOrder.completesAt) - now.getTime(),
            );
            project.lifecycle.workOrder.pausedAt = now.toISOString();
            project.lifecycle.blockedReason = "The Builder left. Choose another willing Villager to finish the work.";
            project.status = "blocked";
            project.updatedAt = now.toISOString();
          }
        }
      state.villagers = remaining;
      state.residences = state.residences.filter((move) => move.characterId !== characterId);
      for (const venue of state.venues) {
        if (venueResidentIds(venue).includes(characterId)) {
          const at = new Date().toISOString();
          venue.zones ??= venueZones(venue);
          venue.layoutVersion = 1;
          const personal = venue.privateSpaces?.filter((space) => space.ownerId === characterId) ?? [];
          if (personal.length)
            venue.archivedPrivateSpaces = [
              ...(venue.archivedPrivateSpaces ?? []),
              ...personal.map((space) => ({ ownerId: characterId, archivedAt: at, space: structuredClone(space) })),
            ].slice(-32);
          for (const zone of venue.zones.filter((zone) => zone.ownerId === characterId)) {
            zone.ownerId = undefined;
            if (zone.access) {
              zone.access.managerIds = null;
              zone.access.inviterIds = [];
              zone.access.memberIds = [];
            }
            zone.seen = false;
            zone.preparation = undefined;
            zone.adaptationPending = false;
            zone.adaptationSourceArchiveAt = "";
            zone.description = zone.purpose || "Vacant residential Private Space.";
            zone.image = null;
            zone.state.publicFacts = [];
            zone.state.traces = [];
            venue.editProposals = venue.editProposals?.filter((proposal) => proposal.zoneId !== zone.id);
          }
          venue.residentIds = venueResidentIds(venue).filter((id) => id !== characterId);
          venue.occupancy.residentCharacterId = venue.residentIds[0] ?? null;
        }
        venue.playerInvitations = venue.playerInvitations?.filter(
          (invite) => invite.residentId !== characterId && invite.ownerId !== characterId,
        );
        venue.workerIds = venue.workerIds?.filter((id) => id !== characterId);
        for (const zone of venue.zones ?? [])
          zone.controllerIds = zone.controllerIds?.filter((id) => id !== characterId);
      }
      retireBackgroundResident(state, characterId);
    });
    if (!removed) throw notFound("That villager does not live here.");
  }
  return { addVillager, removeVillager };
}
export type ResidentRoster = ReturnType<typeof createResidentRoster>;
