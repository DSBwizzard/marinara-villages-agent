import { chooseLetterFont } from "../../../shared/helpers/letter-font-selection.js";
import { randomUUID } from "node:crypto";
import { MAX_IDENTITY_DESCRIPTION_LENGTH } from "../../../shared/contracts/resident-description.js";
import { EMPTY_RESIDENT_ADMISSION, readResidentAdmission } from "../../../shared/helpers/resident-admission.js";
import { villageNow } from "../../adapters/time/clock-gate.js";
import type { VillagerCard } from "../../domain/models/catalog-model.js";
import type { VillageState } from "../../domain/models/world.js";
import { unwrittenVillageAgenda } from "../../domain/rules/agenda-plan.js";
import { badRequest, conflict, notFound } from "../../domain/rules/errors.js";
import { influenceSettings } from "../../domain/rules/owned-routine.js";
import { initialIdentityDescription } from "../../domain/rules/resident-description.js";
import { venueResidentIds } from "../../domain/rules/venue-model.js";
import { venueZones } from "../../domain/rules/venue-zones.js";
import { randomVillageSeed } from "../../domain/rules/village-clock.js";
import { MAX_VILLAGERS } from "../../domain/rules/village-limits.js";
import { snapshotFromCard } from "../../domain/rules/resident-card-snapshot.js";
import { villageWorldScope } from "../../domain/rules/village-identity.js";

export interface ResidentRosterPorts {
  preparedSpriteManager?(
    id: string,
    revision?: number,
  ): Promise<import("../../../shared/contracts/sprites.js").SpriteManagerState | null>;
  readVillageState(): Promise<VillageState>;
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
  findVillagerCard(id: string): Promise<VillagerCard | null>;
  queueVillagerAgenda(characterId: string): Promise<void>;
  queueStartingTies?(): Promise<void>;
  retireBackgroundResident(state: VillageState, characterId: string): void;
}

/** Roster commands own their saved-world, library and background connections. Construction is inert. */
export function createResidentRoster({
  preparedSpriteManager,
  readVillageState,
  mutateVillageState,
  findVillagerCard,
  queueVillagerAgenda,
  queueStartingTies,
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
  async function addVillager(
    characterId: string,
    spriteSetupRevision?: number,
    admissionValue?: unknown,
    scope?: string,
  ): Promise<void> {
    const admission =
      admissionValue === undefined ? { ...EMPTY_RESIDENT_ADMISSION } : readResidentAdmission(admissionValue);
    if (!admission)
      throw badRequest("Use a homeworld within 120 characters and starting situation within 1,200 characters.");
    const card = scope ? null : await findVillagerCard(characterId);
    if (!scope && !card) throw notFound("That character is not in your library.");
    const village = await readVillageState();
    const worldScope = villageWorldScope(village);
    if (scope && worldScope !== scope) throw conflict("The Village changed.");
    const expectedVisitor = village.visitors?.find((person) => person.characterId === characterId);
    const alreadyResident = village.villagers.some((villager) => villager.characterId === characterId);
    if (scope && !expectedVisitor && !alreadyResident) throw notFound("That Visitor is no longer here.");
    if (!alreadyResident && village.villagers.length >= MAX_VILLAGERS) {
      throw badRequest(`A village holds at most ${MAX_VILLAGERS} villagers.`);
    }

    let movedIn = false;
    let promoted = false;
    if (!alreadyResident) {
      const spriteManager = expectedVisitor ? null : await preparedSpriteManager?.(characterId, spriteSetupRevision);
      const addedAt = villageNow().toISOString();
      const incarnation = randomUUID();
      const letterFontId = chooseLetterFont(randomVillageSeed());
      await mutateVillageState((state) => {
        movedIn = false;
        promoted = false;
        if (villageWorldScope(state) !== worldScope) throw conflict("The Village changed.");
        if (state.villagers.some((villager) => villager.characterId === characterId)) return;
        if (state.villagers.length >= MAX_VILLAGERS) {
          throw badRequest(`A village holds at most ${MAX_VILLAGERS} villagers.`);
        }
        // Begin with a complete local agenda, then replace it with the village's
        // authored answer. A model outage cannot leave a resident without a day.
        // "somebody moves in" and then "and here is what they are after". A move
        // that failed because the model was down would be a villager who exists
        // everywhere except on the map.
        const visitor = state.visitors?.find((person) => person.characterId === characterId);
        if (visitor?.incarnation !== expectedVisitor?.incarnation)
          throw conflict("This Visitor changed. Reopen People.");
        if (visitor && scope && !visitor.firstMetAt) throw badRequest("Meet this Visitor before moving them in.");
        state.villagers.push({
          incarnation: visitor?.incarnation ?? incarnation,
          characterId,
          letterFontId:
            visitor?.letterFontId ??
            (state.formerLetterFonts && Object.hasOwn(state.formerLetterFonts, characterId)
              ? state.formerLetterFonts[characterId]
              : undefined) ??
            letterFontId,
          admission,
          spriteManager: visitor?.spriteManager ?? spriteManager,
          ...(visitor?.signature ? { signature: visitor.signature } : {}),
          ...(visitor?.relationshipScene ? { relationshipScene: visitor.relationshipScene } : {}),
          identityDescription: visitor?.identityDescription ?? initialIdentityDescription(),
          agendaGeneration: "arrival-" + addedAt,
          cardSnapshot: visitor?.cardSnapshot ?? { ...snapshotFromCard(card!, 1), capturedAt: addedAt },
          addedAt: visitor?.addedAt ?? addedAt,
          agenda: unwrittenVillageAgenda(villageNow()),
          scheduleInfluence: influenceSettings(null),
        });
        if (visitor) state.visitors = state.visitors!.filter((person) => person.characterId !== characterId);
        if (visitor?.firstMetAt) {
          state.startingHistory.reviewed[characterId] = visitor.incarnation;
          promoted = true;
        }
        movedIn = true;
      });
    }

    // Only for a villager who actually moved in just now, and never fatal. A
    // failure here leaves the null that the tick's backfill is looking for, so the
    // only cost is that this villager has nothing to say for themselves until the
    // next part of the day.
    if (movedIn) {
      await queueVillagerAgenda(characterId);
      if (!promoted) await queueStartingTies?.();
    }
  }

  async function setVisitor(characterId: string, scope: string, visitsEnabled: boolean) {
    const village = await readVillageState();
    if (!village.foundedAt || villageWorldScope(village) !== scope) throw conflict("The Village changed.");
    const existing = village.visitors?.some((person) => person.characterId === characterId);
    const card = existing ? null : await findVillagerCard(characterId);
    const addedAt = villageNow().toISOString();
    const incarnation = randomUUID();
    const letterFontId = chooseLetterFont(randomVillageSeed());
    await mutateVillageState((state) => {
      if (villageWorldScope(state) !== scope) throw conflict("The Village changed.");
      if (
        state.villagers.some((person) => person.characterId === characterId) ||
        characterId === state.playerPersonaId ||
        characterId === "player" ||
        characterId.startsWith("npc:")
      )
        throw badRequest("Choose an unused Character Card.");
      const visitor = state.visitors?.find((person) => person.characterId === characterId);
      if (visitor) {
        if (visitor.visitsEnabled === visitsEnabled) return;
        visitor.visitsEnabled = visitsEnabled;
        visitor.visitsRevision = incarnation;
        if (!visitsEnabled) delete visitor.visitPreference;
        return;
      }
      if (!visitsEnabled || !card) throw notFound("That character is not in your library.");
      (state.visitors ??= []).push({
        characterId,
        incarnation,
        letterFontId,
        addedAt,
        cardSnapshot: { ...snapshotFromCard(card, 1), capturedAt: addedAt },
        visitsEnabled,
        visitsRevision: incarnation,
      });
    });
  }

  /** Remove a villager from the village roster. */
  async function removeVillager(characterId: string): Promise<void> {
    let removed = false;
    await mutateVillageState((state) => {
      const departing = state.villagers.find((villager) => villager.characterId === characterId);
      if (departing) {
        state.formerLetterFonts ??= {};
        Object.defineProperty(state.formerLetterFonts, characterId, {
          value: departing.letterFontId,
          enumerable: true,
          writable: true,
          configurable: true,
        });
      }
      const remaining = state.villagers.filter((villager) => villager.characterId !== characterId);
      removed = remaining.length !== state.villagers.length;
      if (removed)
        for (const project of state.projects) {
          if (
            project.lifecycle?.phase === "working" &&
            project.lifecycle.builderId === characterId &&
            project.lifecycle.workOrder &&
            !project.lifecycle.workOrder.pausedAt
          ) {
            const now = villageNow();
            project.lifecycle.workOrder.remainingMs = Math.max(
              0,
              Date.parse(project.lifecycle.workOrder.completesAt) - now.getTime(),
            );
            project.lifecycle.workOrder.pausedAt = now.toISOString();
            project.lifecycle.blockedReason = "Choose a willing resident lead, then Resume.";
            project.status = project.lifecycle.phase = "paused";
            project.updatedAt = now.toISOString();
          }
        }
      state.villagers = remaining;
      state.residences = state.residences.filter((move) => move.characterId !== characterId);
      for (const venue of state.venues) {
        if (venueResidentIds(venue).includes(characterId)) {
          const at = villageNow().toISOString();
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
          }
          venue.residentIds = venueResidentIds(venue).filter((id) => id !== characterId);
          venue.occupancy.residentCharacterId = venue.residentIds[0] ?? null;
        }
        venue.workerIds = venue.workerIds?.filter((id) => id !== characterId);
        for (const zone of venue.zones ?? [])
          zone.controllerIds = zone.controllerIds?.filter((id) => id !== characterId);
      }
      retireBackgroundResident(state, characterId);
    });
    if (!removed) throw notFound("That villager does not live here.");
  }
  async function editIdentityDescription(characterId: string, value: unknown): Promise<void> {
    const body = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
    if (
      typeof body.text !== "string" ||
      body.text.length > MAX_IDENTITY_DESCRIPTION_LENGTH ||
      typeof body.revision !== "string"
    )
      throw badRequest("Use a description of at most 240 characters.");
    const text = body.text.trim();
    await mutateVillageState((state) => {
      const resident = state.villagers.find((row) => row.characterId === characterId);
      if (!resident) throw notFound("That villager does not live here.");
      if ((resident.identityDescription?.revision ?? "") !== body.revision)
        throw conflict("Description changed. Reopen the editor to try again.");
      resident.identityDescription = { text, revision: randomVillageSeed(), initialGenerationComplete: true };
    });
  }
  return { addVillager, setVisitor, removeVillager, editIdentityDescription };
}
export type ResidentRoster = ReturnType<typeof createResidentRoster>;
