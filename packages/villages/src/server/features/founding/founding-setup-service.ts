import type { VillagerCard } from "../../domain/models/catalog-model.js";
import type { VillageSnapshot, VillageState, VillageVenue } from "../../domain/models/world.js";
import { unwrittenVillageAgenda } from "../../domain/rules/agenda-plan.js";
import { asTrimmedString } from "../../domain/rules/coerce.js";
import { badRequest, conflict } from "../../domain/rules/errors.js";
import {
  assertFoundingScenarioLocked,
  parsePlaces,
  validateFirstDayDescription,
  validateFoundingRoster,
} from "../../domain/rules/founding-record.js";
import {
  DEFAULT_LORE_TOKEN_BUDGET,
  readLoreTokenBudget,
  readSelectedLorebookIds,
} from "../../domain/rules/lore-policy.js";
import { influenceSettings } from "../../domain/rules/owned-routine.js";
import { assertPlayerRoleLocked, playerRoleForSetup } from "../../domain/rules/player-role.js";
import {
  isHousePlace,
  TOWN_MAP_EXPECTED_WIDTH,
  TOWN_MAP_EXPECTED_HEIGHT,
  villageCurrentSetting,
} from "../../domain/rules/prompt-preset.js";
import { snapshotFromCard } from "../../domain/rules/resident-card-snapshot.js";
import { readFoundingResidentContexts } from "../../domain/rules/resident-founding-context.js";
import { readScenarioImprint, readWorldFacts } from "../../domain/rules/scenario-rules.js";
import { DEFAULT_SCENERY_STYLE, readSceneryStyle } from "../../domain/rules/scenery-context.js";
import { assertVillageVenueCapacity } from "../../domain/rules/venue-capacity.js";
import { validVenueClasses, venueResidentIds, venueSpaces } from "../../domain/rules/venue-model.js";
import { readBool } from "../../domain/rules/village-projections.js";
import { readHomeBuildingNames, readVillageName, readVillageSetting } from "../../domain/rules/world-input.js";
import { isVillageFounded } from "../../domain/rules/world-snapshot.js";
import type { readTownMapSubmission } from "../media/town-map-review.js";
import type { readVillageConnectionSettings, validateVillageSetupConnections } from "../settings/connections.js";
import type { readLinkedPersona } from "../settings/personas.js";
import type { readVillageLore } from "../../adapters/engine/lorebooks.js";
import type { proposeVillage, proposePublicVenueNames, draftVillageVenueDescriptions } from "./village-bootstrap.js";

export interface FoundingSetupPorts {
  readVillageState(): Promise<VillageState>;
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
  buildVillageSnapshot(): Promise<VillageSnapshot>;
  readTownMapSubmission: typeof readTownMapSubmission;
  readVillageConnectionSettings: typeof readVillageConnectionSettings;
  validateVillageSetupConnections: typeof validateVillageSetupConnections;
  readLinkedPersona: typeof readLinkedPersona;
  listVillagerCards(): Promise<VillagerCard[]>;
  prepareFoundedVillage(): Promise<void>;
  queueVillagerAgenda(characterId: string): Promise<void>;
  queueMicrotask(work: () => void): void;
  readVillageLore: typeof readVillageLore;
  proposeVillage: typeof proposeVillage;
  proposePublicVenueNames: typeof proposePublicVenueNames;
  draftVillageVenueDescriptions: typeof draftVillageVenueDescriptions;
}

/** Setup keeps its specific validation, library, generation and preparation connections. Construction is inert. */
export function createFoundingSetup({
  readVillageState,
  mutateVillageState,
  buildVillageSnapshot,
  readTownMapSubmission,
  readVillageConnectionSettings,
  validateVillageSetupConnections,
  readLinkedPersona,
  listVillagerCards,
  prepareFoundedVillage,
  queueVillagerAgenda,
  queueMicrotask,
  readVillageLore,
  proposeVillage,
  proposePublicVenueNames,
  draftVillageVenueDescriptions,
}: FoundingSetupPorts) {
  async function runVillageSetup(input: {
    foundingCharacterIds?: unknown;
    foundingResidentContexts?: unknown;
    name?: unknown;
    setting?: unknown;
    foundingReason?: unknown;
    foundingDetails?: unknown;
    foundingGuidance?: unknown;
    playerRole?: unknown;
    scenarioImprint?: unknown;
    worldFacts?: unknown;
    selectedLorebookIds?: unknown;
    sceneryArtStyle?: unknown;
    personalizeVenueImagesByDefault?: unknown;
    useVisualLoreByDefault?: unknown;
    loreTokenBudget?: unknown;
    playerPersonaId?: unknown;
    venues?: unknown;
    townMapImage?: unknown;
    townMapView?: unknown;
    homeBuildingNames?: unknown;
  }): Promise<VillageSnapshot> {
    const name = readVillageName(input.name);
    const setting = readVillageSetting(input.setting);
    if (setting.length === 0) throw badRequest("Describe the place and world before founding.");
    const foundingReason = asTrimmedString(input.foundingReason);
    if (
      ![
        "rebuild",
        "pioneer",
        "prosper",
        "custom",
        "none",
        "fresh-start",
        "refuge",
        "shared-project",
        "discovery",
        "homecoming",
        "something-else",
      ].includes(foundingReason)
    ) {
      throw badRequest("Choose a founding scenario.");
    }
    if (typeof input.foundingDetails !== "string" || input.foundingDetails.length > 2_000) {
      throw badRequest("Starting circumstances must be text of at most 2,000 characters.");
    }
    const foundingDetails = input.foundingDetails.trim();
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
    const founding = !isVillageFounded(village);
    const playerRole = playerRoleForSetup(village.playerRole, input.playerRole, founding);
    validateFirstDayDescription(foundingDetails, founding);
    if (!founding)
      assertFoundingScenarioLocked(village, {
        foundingReason,
        foundingDetails,
        foundingGuidance,
        scenarioImprint: input.scenarioImprint,
      });
    const scenarioImprint = founding
      ? input.scenarioImprint == null
        ? null
        : readScenarioImprint(input.scenarioImprint)
      : village.scenarioImprint;
    const worldFacts = founding
      ? (scenarioImprint?.worldFacts ?? [])
      : readWorldFacts(input.worldFacts ?? village.worldFacts);
    const townMap = await readTownMapSubmission(input.townMapImage ?? "", input.townMapView);
    if (
      !founding &&
      (townMap.image !== village.townMapImage || JSON.stringify(townMap.view) !== JSON.stringify(village.townMapView))
    )
      throw conflict("Replace the village map from Village Settings.");
    const connections = await readVillageConnectionSettings();
    await validateVillageSetupConnections(connections);
    // Resolved before anything is written, so a village is never founded holding a
    // Persona that does not exist — the wizard would otherwise close on a broken
    // link the player never had a chance to notice.
    const persona = await readLinkedPersona(input.playerPersonaId);
    if (!Array.isArray(input.venues)) throw badRequest("The setup needs the places you put on the map.");
    const cards = await listVillagerCards();
    const cardNames = new Map(cards.map((card) => [card.id, card.name]));
    // Residents are checked against the library rather than against the village,
    // because the villagers are moved in by the write below.
    //
    // A village that is not founded yet is founded with exactly the homes the
    // wizard asked the player to place, so "the setup finished" means "there are
    // four houses on the map". Coming back through the wizard over a village that
    // already exists accepts the map as it now stands, so a player who has since
    // added a fifth house is not made to tear it down to save their own village.
    const places = parsePlaces(input.venues, new Set(cardNames.keys()), founding);
    const privateControllers = places.flatMap(
      (place) => place.zones?.flatMap((zone) => zone.controllerIds ?? []) ?? [],
    );
    const assignedResidents = new Set(
      places.flatMap((place) => (place.occupancy.residentCharacterId ? [place.occupancy.residentCharacterId] : [])),
    );
    const foundingContexts = founding
      ? readFoundingResidentContexts(input.foundingResidentContexts, [...assignedResidents])
      : {};
    if (!founding && input.foundingResidentContexts !== undefined)
      throw badRequest("Resident starting backgrounds are fixed after founding.");
    if (founding && input.foundingCharacterIds !== undefined)
      validateFoundingRoster(input.foundingCharacterIds, assignedResidents, new Set(cardNames.keys()));
    if (founding && privateControllers.some((id) => id !== "player" && !assignedResidents.has(id)))
      throw badRequest("Choose founding villagers as room controllers.");
    const initialResidentIds = [
      ...new Set(places.flatMap((place) => [place.occupancy.residentCharacterId]).filter(Boolean)),
    ];
    const cardsById = new Map(cards.map((card) => [card.id, card]));
    const initialResidents = initialResidentIds.map((characterId) => cardsById.get(characterId)!);
    // Founding posts the houses placed in the wizard. Later setup runs keep the
    // other venues and require every saved pin to stay put; Village Settings owns
    // map replacement and its placement pass.
    //
    // A stored place the posted map does name is not stored twice: the posted copy
    // is the newer one. The picture, though, is the place's rather than the
    // posting's — the wizard posts ids it read off the snapshot and has no way to
    // send an image back — so a place that keeps its id keeps its picture, and one
    // the wizard minted a moment ago simply has none to find.
    const postedIds = new Set<string>(places.map((place) => place.id));
    const storedImages = new Map(village.venues.map((place) => [place.id, place.presentation.image]));
    const postedPlaces: VillageVenue[] = places.map((place) => {
      const prior = village.venues.find((entry) => entry.id === place.id);
      return {
        ...prior,
        ...place,
        layoutVersion: prior?.layoutVersion ?? place.layoutVersion,
        classes: prior?.classes ?? place.classes,
        spaces:
          prior && !founding
            ? venueSpaces(prior).map((space) =>
                space.venueClass === "residence"
                  ? {
                      ...space,
                      description:
                        place.spaces?.find((entry) => entry.venueClass === "residence")?.description ??
                        space.description,
                    }
                  : space,
              )
            : place.spaces,
        residenceCapacity: prior?.residenceCapacity ?? place.residenceCapacity,
        residentIds: prior ? venueResidentIds(prior) : place.residentIds,
        playerInvitations: prior?.playerInvitations ?? [],
        zones: prior?.zones ?? place.zones,
        privateSpaces: prior?.privateSpaces ?? place.privateSpaces,
        playerSeenPrivateIds: prior?.playerSeenPrivateIds,
        imageContext: prior?.imageContext ?? place.imageContext,
        improvements: prior?.improvements ?? [null, null],
        capabilities: prior?.capabilities ?? place.capabilities,
        workerIds: prior?.workerIds ?? [],
        playerSeenPublic: prior?.playerSeenPublic,
        playerSeenShared: prior?.playerSeenShared,
        state: prior?.state ?? place.state,
        presentation: {
          ...place.presentation,
          image: founding ? place.presentation.image : (storedImages.get(place.id) ?? null),
        },
      };
    });
    const keptPlaces = founding
      ? []
      : village.venues.filter((place) => !isHousePlace(place) && !postedIds.has(place.id));
    const venues: VillageVenue[] = [...postedPlaces, ...keptPlaces];
    if (
      !founding &&
      village.venues.some((old) => {
        const next = venues.find((venue) => venue.id === old.id);
        return !next || next.presentation.x !== old.presentation.x || next.presentation.y !== old.presentation.y;
      })
    )
      throw conflict("Move Venue photographs while replacing the map in Village Settings.");
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
      if (isVillageFounded(state) === founding)
        throw conflict("The village changed during setup. Reload it before saving.");
      if (
        !founding &&
        (state.townMapImageSetAt !== village.townMapImageSetAt ||
          state.venues.length !== village.venues.length ||
          state.venues.some((venue) => {
            const prior = village.venues.find((entry) => entry.id === venue.id);
            return (
              !prior || venue.presentation.x !== prior.presentation.x || venue.presentation.y !== prior.presentation.y
            );
          }))
      )
        throw conflict("The village map changed during setup. Reload it before saving.");
      if (!founding)
        assertFoundingScenarioLocked(state, { foundingReason, foundingDetails, foundingGuidance, scenarioImprint });
      if (!founding) assertPlayerRoleLocked(state.playerRole, playerRole);
      state.playerRole = playerRole;
      state.name = name;
      state.setting = setting;
      state.foundingReason = foundingReason;
      state.foundingDetails = foundingDetails;
      state.foundingGuidance = foundingGuidance;
      state.scenarioImprint = scenarioImprint;
      state.worldFacts = worldFacts;
      state.selectedLorebookIds = selectedLorebookIds;
      state.loreTokenBudget = loreTokenBudget;
      if (founding) {
        state.venueCapacityPolicy = "sixteen-total-v1";
        state.townMapImage = townMap.image;
        state.townMapCanvasWidth = townMap.size?.width ?? TOWN_MAP_EXPECTED_WIDTH;
        state.townMapCanvasHeight = townMap.size?.height ?? TOWN_MAP_EXPECTED_HEIGHT;
        state.townMapImageSetAt = townMap.image.length > 0 ? new Date().toISOString() : "";
        state.townMapView = townMap.view;
      }
      // Written on every setup, like the name and the setting: the wizard is the
      // only editor of the village's identity, and it opens holding what is
      // stored, so re-running it to redraw the map cannot quietly unlink the
      // Persona the player chose when they founded the place. Re-reading the copy
      // here costs one read the wizard was making anyway, and means a Persona
      // edited between two runs of the wizard arrives up to date rather than
      // stale until the next time settings open.
      state.playerPersonaId = persona.id;
      state.playerPersonaName = persona.name;
      state.playerPersonaIdentity = persona.identity;
      state.playerPersonaMissing = false;
      assertVillageVenueCapacity(state, venues);
      state.venues = venues;
      if (input.sceneryArtStyle !== undefined) state.sceneryArtStyle = readSceneryStyle(input.sceneryArtStyle);
      else if (founding) state.sceneryArtStyle = DEFAULT_SCENERY_STYLE;
      if (input.personalizeVenueImagesByDefault !== undefined)
        state.personalizeVenueImagesByDefault = readBool(input.personalizeVenueImagesByDefault);
      if (input.useVisualLoreByDefault !== undefined)
        state.useVisualLoreByDefault = readBool(input.useVisualLoreByDefault);
      state.homeBuildingNames = readHomeBuildingNames(input.homeBuildingNames ?? state.homeBuildingNames);
      // The stamp that closes the wizard. Written here and nowhere else, so a
      // village can only become founded by coming through this flow.
      state.setupAt = new Date().toISOString();
      if (founding) state.progressEngineVersion = 1;
      if (founding)
        state.foundingPreparation = {
          status: "pending",
          completedIds: [],
          venueDetailsSeeded: false,
          currentId: "",
          error: "",
          phase: "venues",
          stage: "lore",
          stageStartedAt: new Date().toISOString(),
        };
      // Only a village with nowhere to send anybody needs places invented; a
      // second run must not throw away places the player has since renamed or
      // added by hand. The houses do not count — see `remapVenues`.
      for (const card of initialResidents) {
        if (state.villagers.some((villager) => villager.characterId === card.id)) continue;
        state.villagers.push({
          characterId: card.id,
          ...(founding ? { foundingContext: foundingContexts[card.id] } : {}),
          cardSnapshot: {
            ...snapshotFromCard(card, 1),
          },
          addedAt: new Date().toISOString(),
          agenda: unwrittenVillageAgenda(state.venues, card.name),
          completedWishes: [],
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
          villager.agenda = unwrittenVillageAgenda(state.venues, villager.cardSnapshot.name);
        }
      });
    }

    // Write each agenda after the village has its places. Otherwise a newly
    // forged village asks everyone to plan a day with only the houses available.
    // The complete provisional day written above remains usable if either model
    // call fails, and the next tick can still retry the authored agenda.
    if (founding)
      queueMicrotask(() => {
        void prepareFoundedVillage();
      });
    else for (const card of addedResidents) await queueVillagerAgenda(card.id);
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
