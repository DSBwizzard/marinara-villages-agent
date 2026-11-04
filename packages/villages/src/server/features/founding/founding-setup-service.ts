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
import { villageCurrentSetting } from "../../domain/rules/prompt-preset.js";
import { readFoundingResidentAdmissions } from "../../domain/rules/resident-admission.js";
import { snapshotFromCard } from "../../domain/rules/resident-card-snapshot.js";
import { initialIdentityDescription } from "../../domain/rules/resident-description.js";
import { readFoundingCircumstances, seedFoundingCircumstances } from "../../domain/rules/founding-circumstances.js";
import { DEFAULT_SCENERY_STYLE, readSceneryStyle } from "../../domain/rules/scenery-context.js";
import { assertVillageVenueCapacity } from "../../domain/rules/venue-capacity.js";
import { validVenueClasses, venueResidentIds } from "../../domain/rules/venue-model.js";
import { readBool } from "../../domain/rules/village-projections.js";
import { loreText } from "../../domain/rules/lore-context.js";
import { readHomeBuildingNames, readVillageName, readVillageSetting } from "../../domain/rules/world-input.js";
import { isVillageFounded } from "../../domain/rules/world-snapshot.js";
import type { prepareVillageMap } from "../media/town-map-review.js";
import type { readVillageConnectionSettings, validateVillageSetupConnections } from "../settings/connections.js";
import type { readLinkedPersona } from "../settings/personas.js";
import type { draftVillageVenueDescriptions } from "./village-bootstrap.js";

export interface FoundingSetupPorts {
  readFoundingImageLore?: typeof import("./founding-drafts.js").readFoundingImageLore;
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
  draftVillageVenueDescriptions,
  readFoundingImageLore,
}: FoundingSetupPorts) {
  async function runVillageSetup(input: {
    foundingCharacterIds?: unknown;
    foundingSpriteRevisions?: unknown;
    foundingResidentAdmissions?: unknown;
    name?: unknown;
    timeZone?: unknown;
    setting?: unknown;
    worldRules?: unknown;
    worldName?: unknown;
    communityVenueId?: unknown;
    playerBackground?: unknown;
    circumstances?: unknown;
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
    if (typeof (input.worldRules ?? "") !== "string" || String(input.worldRules ?? "").length > 4096)
      throw badRequest("Standing rules must be text of at most 4,096 characters.");
    const worldRules = asTrimmedString(input.worldRules);
    const communityVenueId = asTrimmedString(input.communityVenueId);

    if (input.worldName !== undefined && readWorldName(input.worldName) === null)
      throw badRequest("Use a world name within 120 characters.");
    const selectedLorebookIds = readSelectedLorebookIds(input.selectedLorebookIds ?? []);
    const loreTokenBudget =
      input.loreTokenBudget === undefined ? DEFAULT_LORE_TOKEN_BUDGET : readLoreTokenBudget(input.loreTokenBudget);
    const village = await readVillageState();
    const playerBackground = playerBackgroundForSetup(village.playerBackground, input.playerBackground, true);
    if (!input.townMapImage) throw badRequest("Generate or upload map artwork before founding.");
    const townMap = await prepareVillageMap(
      {
        id: randomUUID(),
        name,
        image: input.townMapImage,
        view: input.townMapView,
      },
      "founding-map",
    );
    const connections = await readVillageConnectionSettings();
    await validateVillageSetupConnections(connections);
    // Resolved before anything is written, so a village is never founded holding a
    // Persona that does not exist — the wizard would otherwise close on a broken
    // link the player never had a chance to notice.
    const persona = await readLinkedPersona(input.playerPersonaId);
    if (!Array.isArray(input.venues)) throw badRequest("The setup needs the places you put on the map.");
    const cards = await listVillagerCards();
    const cardNames = new Map(cards.map((card) => [card.id, card.name]));
    const places = parsePlaces(input.venues, new Set(cardNames.keys()), true, communityVenueId, villageNow());
    const privateControllers = places.flatMap(
      (place) => place.zones?.flatMap((zone) => zone.controllerIds ?? []) ?? [],
    );
    const images = places
      .flatMap((place) => [place.presentation.image, ...(place.zones ?? []).map((zone) => zone.image)])
      .filter((image): image is NonNullable<typeof image> => !!image);
    const imageSources = await readFoundingImageLore?.(images);
    if (imageSources)
      for (const image of images) {
        const lore = imageSources.get(image);
        if (lore?.length) image.lore = lore;
      }
    const assignedResidents = new Set(places.flatMap((place) => place.residentIds));
    const circumstances = readFoundingCircumstances(input.circumstances, places, villageNow().toISOString());
    const admissions = readFoundingResidentAdmissions(input.foundingResidentAdmissions, [...assignedResidents]);
    if (input.foundingCharacterIds !== undefined)
      validateFoundingRoster(input.foundingCharacterIds, assignedResidents, new Set(cardNames.keys()));
    if (privateControllers.some((id) => id !== "player" && !assignedResidents.has(id)))
      throw badRequest("Choose founding villagers as room controllers.");
    const initialResidentIds = [...assignedResidents];
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

    const addedResidents: VillagerCard[] = [];
    await mutateVillageState((state) => {
      if (isVillageFounded(state)) throw conflict("The village changed during setup. Reload it before saving.");
      state.playerBackground = playerBackground;
      state.name = name;
      state.setting = setting;
      if (typeof input.timeZone === "string") state.timeZone = input.timeZone;
      state.worldRules = worldRules;
      if (input.worldName !== undefined) state.worldName = readWorldName(input.worldName)!;
      state.communityVenueId = communityVenueId;
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
      state.homeBuildingNames = readHomeBuildingNames(input.homeBuildingNames ?? state.homeBuildingNames);
      state.setupAt ||= villageNow().toISOString();
      state.progressEngineVersion = 1;
      state.opening = initialOpening([...assignedResidents], communityVenueId, randomUUID());
      state.foundingPreparation = {
        status: "pending",
        completedIds: [],
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
      const at = state.setupAt;
      seedFoundingCircumstances(state, circumstances, ["player", ...assignedResidents], at);
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

  async function draftVenueDescriptions(value: unknown): Promise<{ descriptions: Record<string, string> }> {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw badRequest("Describe the places to draft.");
    const input = value as Record<string, unknown>;
    const village = await readVillageState();
    const setting = villageCurrentSetting({
      setting: typeof input.setting === "string" ? input.setting.trim() : village.setting,
      worldRules: typeof input.worldRules === "string" ? input.worldRules : village.worldRules,
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
      loreText(
        typeof input.setting === "string" ? input.setting : village.setting,
        typeof input.worldRules === "string" ? input.worldRules : village.worldRules,
        village.worldName,
        venues.map((venue) => venue.name),
      ),
      undefined,
      input.loreTokenBudget === undefined ? village.loreTokenBudget : readLoreTokenBudget(input.loreTokenBudget),
    );
    return { descriptions: await draftVillageVenueDescriptions(setting, venues, lore) };
  }
  return {
    runVillageSetup,
    draftVenueDescriptions,
  };
}
export type FoundingSetup = ReturnType<typeof createFoundingSetup>;
