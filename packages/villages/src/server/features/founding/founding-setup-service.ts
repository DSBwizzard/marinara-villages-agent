import { chooseLetterFont } from "../../../shared/helpers/letter-font-selection.js";
import { randomUUID } from "node:crypto";
import { readWorldName } from "../../../shared/helpers/resident-admission.js";
import { validTimeZone } from "../../../shared/helpers/zoned-date.js";
import type { readVillageLore } from "../../adapters/engine/lorebooks.js";
import { villageNow } from "../../adapters/time/clock-gate.js";
import type { VillagerCard } from "../../domain/models/catalog-model.js";
import type { VillageSnapshot, VillageState, VillageVenue } from "../../domain/models/world.js";
import { unwrittenVillageAgenda } from "../../domain/rules/agenda-plan.js";
import { asRecord, asTrimmedString } from "../../domain/rules/coerce.js";
import { badRequest, conflict } from "../../domain/rules/errors.js";
import { parsePlaces, validateFoundingRoster } from "../../domain/rules/founding-record.js";
import { readSceneryStyleProfileId } from "../../domain/rules/image-style-profiles.js";
import {
  DEFAULT_LORE_TOKEN_BUDGET,
  readLoreTokenBudget,
  readSelectedLorebookIds,
} from "../../domain/rules/lore-policy.js";
import { initialOpening } from "../../domain/rules/opening-project.js";
import { influenceSettings } from "../../domain/rules/owned-routine.js";
import { playerBackgroundForSetup } from "../../domain/rules/player-background.js";
import { isHousePlace, villageCurrentSetting } from "../../domain/rules/prompt-preset.js";
import { readFoundingResidentAdmissions } from "../../domain/rules/resident-admission.js";
import { snapshotFromCard } from "../../domain/rules/resident-card-snapshot.js";
import { initialIdentityDescription } from "../../domain/rules/resident-description.js";
import { readScenarioImprint, readWorldFacts } from "../../domain/rules/scenario-rules.js";
import { DEFAULT_SCENERY_STYLE, readSceneryStyle } from "../../domain/rules/scenery-context.js";
import { assertVillageVenueCapacity } from "../../domain/rules/venue-capacity.js";
import { validVenueClasses, venueResidentIds } from "../../domain/rules/venue-model.js";
import { readBool } from "../../domain/rules/village-projections.js";
import { readHomeBuildingNames, readVillageName, readVillageSetting } from "../../domain/rules/world-input.js";
import { isVillageFounded } from "../../domain/rules/world-snapshot.js";
import type { prepareVillageMap } from "../media/town-map-review.js";
import type { readVillageConnectionSettings, validateVillageSetupConnections } from "../settings/connections.js";
import type { readLinkedPersona } from "../settings/personas.js";
import type { draftVillageVenueDescriptions, proposePublicVenueNames, proposeVillage } from "./village-bootstrap.js";

export interface FoundingSetupPorts {
  peekVillageAuthority(): Promise<VillageState>;
  preparedSpriteManager?(
    id: string,
    revision?: number,
  ): Promise<import("../../../shared/contracts/sprites.js").SpriteManagerState | null>;
  readVillageState(): Promise<VillageState>;
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
  buildVillageSnapshot(): Promise<VillageSnapshot>;
  prepareVillageMap: typeof prepareVillageMap;
  readVillageConnectionSettings: typeof readVillageConnectionSettings;
  validateVillageSetupConnections: typeof validateVillageSetupConnections;
  readLinkedPersona: typeof readLinkedPersona;
  listVillagerCards(): Promise<VillagerCard[]>;
  prepareFoundedVillage(): Promise<void>;
  queueStartingTies?(): Promise<void>;
  queueMicrotask(work: () => void): void;
  readVillageLore: typeof readVillageLore;
  proposeVillage: typeof proposeVillage;
  proposePublicVenueNames: typeof proposePublicVenueNames;
  draftVillageVenueDescriptions: typeof draftVillageVenueDescriptions;
}

/** Setup keeps its specific validation, library, generation and preparation connections. Construction is inert. */
export function createFoundingSetup({
  peekVillageAuthority,
  preparedSpriteManager,
  readVillageState,
  mutateVillageState,
  buildVillageSnapshot,
  prepareVillageMap,
  readVillageConnectionSettings,
  validateVillageSetupConnections,
  readLinkedPersona,
  listVillagerCards,
  prepareFoundedVillage,
  queueStartingTies,
  queueMicrotask,
  readVillageLore,
  proposeVillage,
  proposePublicVenueNames,
  draftVillageVenueDescriptions,
}: FoundingSetupPorts) {
  async function runVillageSetup(input: {
    foundingCharacterIds?: unknown;
    foundingSpriteRevisions?: unknown;
    foundingResidentAdmissions?: unknown;
    name?: unknown;
    timeZone?: unknown;
    setting?: unknown;
    foundingReason?: unknown;
    worldName?: unknown;
    foundingDetails?: unknown;
    foundingGuidance?: unknown;
    playerBackground?: unknown;
    scenarioImprint?: unknown;
    worldFacts?: unknown;
    selectedLorebookIds?: unknown;
    sceneryArtStyle?: unknown;
    sceneryStyleProfileId?: unknown;
    personalizeVenueImagesByDefault?: unknown;
    useVisualLoreByDefault?: unknown;
    loreTokenBudget?: unknown;
    playerPersonaId?: unknown;
    venues?: unknown;
    townMapImage?: unknown;
    townMapView?: unknown;
    homeBuildingNames?: unknown;
  }): Promise<VillageSnapshot> {
    if (isVillageFounded(await peekVillageAuthority()))
      throw conflict("This Village is already founded. Use World Configuration.");
    const name = readVillageName(input.name);
    if (input.timeZone !== undefined && !validTimeZone(input.timeZone))
      throw badRequest("Choose a valid village timezone.");
    const setting = readVillageSetting(input.setting);
    if (setting.length === 0) throw badRequest("Describe the place and world before founding.");
    const foundingReason = input.foundingReason === undefined ? "none" : asTrimmedString(input.foundingReason);
    if (!["rebuild", "pioneer", "prosper", "custom", "none"].includes(foundingReason)) {
      throw badRequest("Choose a founding scenario.");
    }
    if (
      input.foundingDetails !== undefined &&
      (typeof input.foundingDetails !== "string" || input.foundingDetails.length > 2_000)
    ) {
      throw badRequest("Starting circumstances must be text of at most 2,000 characters.");
    }
    const foundingDetails = asTrimmedString(input.foundingDetails);
    if (input.worldName !== undefined && readWorldName(input.worldName) === null)
      throw badRequest("Use a world name within 120 characters.");
    if (typeof (input.foundingGuidance ?? "") !== "string" || String(input.foundingGuidance ?? "").length > 500) {
      throw badRequest("Narrative direction must be text of at most 500 characters.");
    }
    const foundingGuidance = String(input.foundingGuidance ?? "").trim();
    const selectedLorebookIds = readSelectedLorebookIds(input.selectedLorebookIds ?? []);
    const loreTokenBudget =
      input.loreTokenBudget === undefined ? DEFAULT_LORE_TOKEN_BUDGET : readLoreTokenBudget(input.loreTokenBudget);
    if (foundingReason === "none" && foundingGuidance) {
      throw badRequest("No preset does not use a separate narrative direction.");
    }
    const village = await readVillageState();
    const playerBackground = playerBackgroundForSetup(village.playerBackground, input.playerBackground, true);
    const scenarioImprint = input.scenarioImprint == null ? null : readScenarioImprint(input.scenarioImprint);
    const worldFacts = scenarioImprint?.worldFacts ?? [];
    if (!input.townMapImage) throw badRequest("Generate or upload map artwork before founding.");
    const townMap = await prepareVillageMap({
      id: randomUUID(),
      name,
      image: input.townMapImage,
      view: input.townMapView,
    });
    const connections = await readVillageConnectionSettings();
    await validateVillageSetupConnections(connections);
    // Resolved before anything is written, so a village is never founded holding a
    // Persona that does not exist — the wizard would otherwise close on a broken
    // link the player never had a chance to notice.
    const persona = await readLinkedPersona(input.playerPersonaId);
    if (!Array.isArray(input.venues)) throw badRequest("The setup needs the places you put on the map.");
    const cards = await listVillagerCards();
    const cardNames = new Map(cards.map((card) => [card.id, card.name]));
    const places = parsePlaces(input.venues, new Set(cardNames.keys()), true);
    const privateControllers = places.flatMap(
      (place) => place.zones?.flatMap((zone) => zone.controllerIds ?? []) ?? [],
    );
    const assignedResidents = new Set(
      places.flatMap((place) => (place.occupancy.residentCharacterId ? [place.occupancy.residentCharacterId] : [])),
    );
    const admissions = readFoundingResidentAdmissions(input.foundingResidentAdmissions, [...assignedResidents]);
    if (input.foundingCharacterIds !== undefined)
      validateFoundingRoster(input.foundingCharacterIds, assignedResidents, new Set(cardNames.keys()));
    if (privateControllers.some((id) => id !== "player" && !assignedResidents.has(id)))
      throw badRequest("Choose founding villagers as room controllers.");
    const initialResidentIds = [
      ...new Set(places.flatMap((place) => [place.occupancy.residentCharacterId]).filter(Boolean)),
    ];
    const cardsById = new Map(cards.map((card) => [card.id, card]));
    const initialResidents = initialResidentIds.map((characterId) => cardsById.get(characterId)!);
    const letterFonts = new Map(initialResidents.map((card) => [card.id, chooseLetterFont(randomUUID())]));
    const preparedSprites = new Map(
      await Promise.all(
        initialResidentIds
          .filter((id) => !village.villagers.some((resident) => resident.characterId === id))
          .map(
            async (id) =>
              [
                id,
                await preparedSpriteManager?.(id, asRecord(input.foundingSpriteRevisions)[id] as number | undefined),
              ] as const,
          ),
      ),
    );
    const venues: VillageVenue[] = places.map((place) => {
      const prior = village.venues.find((entry) => entry.id === place.id);
      return {
        ...prior,
        ...place,
        layoutVersion: prior?.layoutVersion ?? place.layoutVersion,
        zoneLayout: place.zoneLayout,
        classes: prior?.classes ?? place.classes,
        spaces: place.spaces,
        residenceCapacity: prior?.residenceCapacity ?? place.residenceCapacity,
        residentIds: prior ? venueResidentIds(prior) : place.residentIds,
        playerInvitations: prior?.playerInvitations ?? [],
        zones: prior?.zones ?? place.zones,
        privateSpaces: prior?.privateSpaces ?? place.privateSpaces,
        playerSeenPrivateIds: prior?.playerSeenPrivateIds,
        imageContext: prior?.imageContext ?? place.imageContext,

        capabilities: prior?.capabilities ?? place.capabilities,
        workerIds: prior?.workerIds ?? [],
        playerSeenPublic: prior?.playerSeenPublic,
        playerSeenShared: prior?.playerSeenShared,
        state: prior?.state ?? place.state,
        presentation: {
          ...place.presentation,
          image: place.presentation.image,
        },
      };
    });
    for (const old of village.venues) {
      if (!old.occupancy.residentCharacterId) continue;
      const next = venues.find((venue) => venue.id === old.id);
      if (
        !next ||
        next.occupancy.residentCharacterId !== old.occupancy.residentCharacterId ||
        next.presentation.x !== old.presentation.x ||
        next.presentation.y !== old.presentation.y ||
        next.occupancy.homeKind !== old.occupancy.homeKind
      )
        throw conflict("Move the resident before changing or removing their home.");
    }

    const addedResidents: VillagerCard[] = [];
    await mutateVillageState((state) => {
      if (isVillageFounded(state)) throw conflict("The village changed during setup. Reload it before saving.");
      state.playerBackground = playerBackground;
      state.name = name;
      state.setting = setting;
      if (typeof input.timeZone === "string") state.timeZone = input.timeZone;
      state.foundingReason = foundingReason;
      state.foundingDetails = foundingDetails;
      if (input.worldName !== undefined) state.worldName = readWorldName(input.worldName)!;
      state.foundingGuidance = foundingGuidance;
      state.scenarioImprint = scenarioImprint;
      state.worldFacts = worldFacts;
      state.selectedLorebookIds = selectedLorebookIds;
      state.loreTokenBudget = loreTokenBudget;
      state.maps = [townMap];
      for (const venue of venues) venue.presentation.mapId = townMap.id;
      state.playerPersonaId = persona.id;
      state.playerPersonaName = persona.name;
      state.playerPersonaIdentity = persona.identity;
      state.playerPersonaMissing = false;
      assertVillageVenueCapacity(state, venues);
      state.venues = venues;
      if (input.sceneryStyleProfileId !== undefined)
        state.sceneryStyleProfileId = readSceneryStyleProfileId(input.sceneryStyleProfileId);
      if (input.sceneryArtStyle !== undefined) state.sceneryArtStyle = readSceneryStyle(input.sceneryArtStyle);
      else state.sceneryArtStyle = DEFAULT_SCENERY_STYLE;
      if (input.personalizeVenueImagesByDefault !== undefined)
        state.personalizeVenueImagesByDefault = readBool(input.personalizeVenueImagesByDefault);
      if (input.useVisualLoreByDefault !== undefined)
        state.useVisualLoreByDefault = readBool(input.useVisualLoreByDefault);
      state.homeBuildingNames = readHomeBuildingNames(input.homeBuildingNames ?? state.homeBuildingNames);
      state.setupAt ||= villageNow().toISOString();
      state.progressEngineVersion = 1;
      state.opening = initialOpening(
        [...assignedResidents],
        venues.find((venue) => venue.category === "public-center")!.id,
        randomUUID(),
        3,
      );
      state.foundingPreparation = {
        status: "pending",
        completedIds: [],
        venueDetailsSeeded: false,
        currentId: "",
        error: "",
        phase: "venues",
        stage: "lore",
        stageStartedAt: villageNow().toISOString(),
      };
      for (const card of initialResidents) {
        if (state.villagers.some((villager) => villager.characterId === card.id)) continue;
        state.villagers.push({
          characterId: card.id,
          letterFontId:
            (state.formerLetterFonts && Object.hasOwn(state.formerLetterFonts, card.id)
              ? state.formerLetterFonts[card.id]
              : undefined) ?? letterFonts.get(card.id),
          spriteManager: preparedSprites.get(card.id),
          identityDescription: initialIdentityDescription(),
          admission: admissions[card.id] ?? { homeworld: "", startingSituation: "" },
          cardSnapshot: {
            ...snapshotFromCard(card, 1),
          },
          addedAt: villageNow().toISOString(),
          agenda: unwrittenVillageAgenda(state.venues, card.name, villageNow()),
          wishes: [],
          ingestSchedule: false,
          scheduleInfluence: influenceSettings(null),
          remap: null,
          remapFailure: null,
        });
        addedResidents.push(card);
      }
    });

    if (addedResidents.length > 0) {
      const addedIds = new Set(addedResidents.map((card) => card.id));
      await mutateVillageState((state) => {
        for (const villager of state.villagers) {
          if (!addedIds.has(villager.characterId) || villager.agenda?.generatedAt) continue;
          villager.agenda = unwrittenVillageAgenda(state.venues, villager.cardSnapshot.name, villageNow());
        }
      });
    }

    // Write each agenda after the village has its places. Otherwise a newly
    // forged village asks everyone to plan a day with only the houses available.
    // The complete provisional day written above remains usable if either model
    // call fails, and the next tick can still retry the authored agenda.
    queueMicrotask(() => {
      void prepareFoundedVillage();
    });
    if (addedResidents.length) await queueStartingTies?.();
    return buildVillageSnapshot();
  }

  /**
   * Ask the model what places this village has, and keep what it says.
   *
   * Split out from `setVillageSetting` so the tab can offer it as an explicit
   * "suggest places" action for a village whose setting is already saved.
   */
  async function runVillageBootstrap(): Promise<VillageSnapshot> {
    const village = await readVillageState();
    const setting = village.setting.trim();
    if (setting.length === 0) throw badRequest("Write what the village is like before asking for places.");

    const settingForProposal = villageCurrentSetting(village);
    const proposal = await proposeVillage(settingForProposal, {
      lore: await readVillageLore(village.selectedLorebookIds, settingForProposal, undefined, village.loreTokenBudget),
    });
    await mutateVillageState((state) => {
      // Only the places you can be sent to are replaced. The houses stay, because
      // the model was never asked about them: it is asked what there is to do in a
      // village like this, and where everybody sleeps is not one of the answers.
      // Throwing the whole list away would demolish a village the player had just
      // finished drawing, on the strength of an answer to a different question.
      const venues = [...state.venues.filter((place) => isHousePlace(place)), ...proposal.venues];
      assertVillageVenueCapacity(state, venues);
      state.venues = venues;
    });
    return buildVillageSnapshot();
  }

  /** Read-only founding suggestion; the wizard keeps the result until its final write. */
  async function suggestFoundingPlaces(settingValue: unknown, idsValue: unknown, budgetValue?: unknown) {
    const setting = readVillageSetting(settingValue);
    if (!setting) throw badRequest("Describe what the village is like before suggesting places.");
    const ids = readSelectedLorebookIds(idsValue ?? []);
    const budget = budgetValue === undefined ? DEFAULT_LORE_TOKEN_BUDGET : readLoreTokenBudget(budgetValue);
    const proposal = await proposeVillage(setting, { lore: await readVillageLore(ids, setting, undefined, budget) });
    return { places: proposal.venues.map((venue) => ({ name: venue.name })) };
  }

  async function suggestFoundingVenueNames(settingValue: unknown, idsValue: unknown, budgetValue?: unknown) {
    const setting = readVillageSetting(settingValue);
    if (!setting) throw badRequest("Describe what the village is like before suggesting names.");
    const ids = readSelectedLorebookIds(idsValue ?? []);
    const budget = budgetValue === undefined ? DEFAULT_LORE_TOKEN_BUDGET : readLoreTokenBudget(budgetValue);
    return { names: await proposePublicVenueNames(setting, await readVillageLore(ids, setting, undefined, budget)) };
  }

  async function draftVenueDescriptions(value: unknown): Promise<{ descriptions: Record<string, string> }> {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw badRequest("Describe the places to draft.");
    const input = value as Record<string, unknown>;
    const village = await readVillageState();
    const setting = villageCurrentSetting({
      setting: typeof input.setting === "string" ? input.setting.trim() : village.setting,
      worldFacts: input.worldFacts === undefined ? village.worldFacts : readWorldFacts(input.worldFacts),
    });
    const ids = readSelectedLorebookIds(input.selectedLorebookIds ?? village.selectedLorebookIds);
    const rows = Array.isArray(input.venues) ? input.venues : [];
    const venues = rows.map((entry) => {
      const raw = entry && typeof entry === "object" && !Array.isArray(entry) ? (entry as Record<string, unknown>) : {};
      return {
        id: asTrimmedString(raw.id),
        name: asTrimmedString(raw.name),
        classes: validVenueClasses(raw.classes) ? raw.classes : ["other"],
        homeKind: asTrimmedString(raw.homeKind),
      };
    });
    const lore = await readVillageLore(
      ids,
      [setting, ...venues.map((venue) => venue.name)].join("\n"),
      undefined,
      input.loreTokenBudget === undefined ? village.loreTokenBudget : readLoreTokenBudget(input.loreTokenBudget),
    );
    return { descriptions: await draftVillageVenueDescriptions(setting, venues, lore) };
  }
  return {
    runVillageSetup,
    runVillageBootstrap,
    suggestFoundingPlaces,
    suggestFoundingVenueNames,
    draftVenueDescriptions,
  };
}
export type FoundingSetup = ReturnType<typeof createFoundingSetup>;
