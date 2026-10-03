import {
  addRoutineIdea,
  deriveInfluence,
  influenceSettings,
  INFLUENCE_CATEGORIES,
  routineDay,
  validateRoutineDay,
} from "./owned-routine.js";
import {
  settleBackgroundWork,
  backgroundStatus,
  retryBackgroundJob,
  backgroundWorkSummaries,
} from "./background-work.js";
import { relationshipZoneController } from "./relationship-store.js";
import { socialPlanCandidates, socialContinuationValid } from "./relationship-social.js";
import { relationshipWritingPrompt, relationshipChangeNotices } from "./relationships.js";
import { readBaseVenueLayout, assertResidencePrivateDestination } from "./venue-layout.js";
import { assertPlayerRoleLocked, playerRoleForSetup } from "./player-role.js";
import { outsideVenueOperation } from "./venue-coordinator.js";
import { DEFAULT_SCENERY_STYLE, sceneryImageKey, readSceneryStyle } from "./scenery-context.js";
import { preparePrivateSpaces } from "./private-space-preparation.js";
import { zoneControllerIds } from "./venue-zones.js";
import { venueCardProfile } from "./venue-writing.js";
import {
  correctResidentWish,
  expireResidentWishes,
  reconcileWishLifecycle,
  registerInitialWish,
  reserveInitialWishAllowance,
} from "./wish-lifecycle.js";
import {
  backgroundRevision,
  backgroundWorkSummaries,
  queueBackgroundJob,
  registerBackgroundHandler,
  retireBackgroundResident,
} from "./background-work.js";
import {
  venueZones,
  resolveVenueZone,
  legacyZoneId,
  chooseAgendaZone,
  canOccupyZone,
  zoneClosed,
} from "./venue-zones.js";
// Villages — the village-level operations the routes call.
//
// Joining a village record to the live library lives here rather than in the
// route file so the rule is stated once: a card is authoritative when it still
// exists, and a remembered name stands in when it does not.
import {
  captureMissingVillagerCardColors,
  findPlayerPersona,
  findVillagerCard,
  listPlayerPersonas,
  listVillagerCards,
  readEffectiveVillagerCard,
  toCatalogEntry,
  type VillagerCard,
} from "./catalog.js";
import { asTrimmedString } from "./coerce.js";
import { agendaAt, agendaDayPlan, unwrittenVillageAgenda } from "./agenda-plan.js";
import { agendaBlocksFor, agendaDateKey, workingAgendaWeek } from "./agenda-week.js";
import { readVillageConnectionSettings, validateVillageSetupConnections } from "./connections.js";
import { villagesConnectionIdFor } from "./connections.js";
import { badRequest, conflict, notFound } from "./errors.js";
import {
  DEFAULT_LORE_TOKEN_BUDGET,
  MAX_LORE_TOKEN_BUDGET,
  MIN_LORE_TOKEN_BUDGET,
  readLoreTokenBudget,
  readSelectedLorebookIds,
  readVillageLore,
} from "./lorebooks.js";

import { selectPromptMemories } from "./memory-selection.js";
import { readScenarioImprint, readWorldFacts } from "./scenario-imprint.js";
import { DEFAULT_TOWN_MAP_LAYOUT_PROMPT, DEFAULT_TOWN_MAP_NEGATIVE_PROMPT } from "./town-map-image.js";
import { inspectVillageImage } from "./image-generation.js";

import { readNativeScheduleSnapshot, type NativeRoutine } from "./native-schedules.js";
import { completeWithRoom, villagesLanguageModels, villagesLogger } from "./package-runtime.js";
import { extractJsonObject } from "./village-bootstrap.js";
import { seedFoundingVenueDetails } from "./founding-drafts.js";
import { reconcileBuildProjects } from "./build-projects.js";
import { draftNewVenueProject, draftRenovationProject, reconcileProjectLifecycles } from "./project-lifecycle.js";
import {
  defaultVenueSpace,
  hasVenueClass,
  venueAssignedCount,
  venueCapacity,
  venueResidentIds,
  venueSpaces,
  validVenueClasses,
} from "./venue-model.js";
import { queueSharedMoveConsent, queueVenueCounteroffer, respondDueVenueMail } from "./venue-mailbox.js";

import {
  boundText,
  DEFAULT_HOME_BUILDING,
  HOME_BUILDING_ORDER,
  HOME_BUILDINGS,
  DEFAULT_TOWN_MAP_VIEW,
  homeBuildingOptions,
  isHomeBuildingKind,
  isHousePlace,
  isGlobalGalleryRef,
  isTownMapImage,
  LEGACY_EVENTS_CAN_AFFECT_VILLAGE,
  MAX_CHRONICLE_ABOUT_ONE_VILLAGER,
  MAX_CHRONICLE_IN_PROMPT,
  MAX_CHRONICLE_LENGTH,
  MAX_HAPPENINGS,
  MAX_NOTICEBOARD_NOTES,
  MAX_NOTICE_LENGTH,
  MAX_PLAYER_PERSONA_ID_LENGTH,
  MAX_PLAYER_PERSONA_IDENTITY_LENGTH,
  MAX_PLAYER_PERSONA_NAME_LENGTH,
  MAX_PLACES,
  MAX_SETTING_LENGTH,
  MAX_TOWN_MAP_IMAGE_LENGTH,
  MAX_VILLAGE_NAME_LENGTH,
  MAX_VENUE_IMAGE_BYTES,
  MAX_VENUE_IMAGE_ID_LENGTH,
  MAX_VENUE_IMAGE_URL_LENGTH,
  MAX_VENUE_NAME_LENGTH,
  MAX_VENUE_NOTE_LENGTH,
  MAX_VENUE_DESCRIPTION_LENGTH,
  MAX_VENUES,
  prependHappenings,
  remapVenues,
  SETUP_MAX_VILLAGER_COUNT,
  SETUP_MIN_VILLAGER_COUNT,
  TOWN_MAP_EXPECTED_HEIGHT,
  TOWN_MAP_EXPECTED_WIDTH,
  TOWN_MAP_ZOOM_MAX,
  TOWN_MAP_ZOOM_MIN,
  TOWN_MAP_ZOOM_STEP,
  VILLAGE_PRESET_MACROS,
  VILLAGES_DEFAULT_KNOWLEDGE,
  VILLAGES_GALLERY_FOLDER_NAME,
  VILLAGES_PROMPT_BOX_MAX_LENGTH,
  villageCurrentSetting,
  villageFoundingSetting,
  type VillageHomeLine,
} from "./prompt-preset.js";
import type {
  VillageAgenda,
  VillageAgendaView,
  VillageCatalogEntry,
  VillageChronicleEntry,
  VillageChronicleEntryView,
  VillageMomentView,
  VillageOpportunity,
  VillagePersonaEntry,
  VillagePersonaPreview,
  VillagePlaceView,
  VillagePlayerIdentity,
  VillageRecap,
  VillageResidence,
  VillageStoryPace,
  VillageSettingsView,
  VillageSnapshot,
  VillageState,
  VillageVenue,
  VillageVenueClass,
  VillageVenueFeature,
  VillagePendingDecision,
  VillageVenueImage,
  VillageVillager,
  VillageVillagerCardSnapshot,
  VillageVillagerRefreshPreview,
  VillageVillagerView,
} from "./types.js";
import { readVenueRequestCore, venueRequestDraft, type VenueRequestCore } from "./venue-requests.js";
import { proposeCompactFounding } from "./founding-compact.js";
import {
  proposeHappenings,
  proposeReaction,
  proposeVillage,
  proposePublicVenueNames,
  draftVillageVenueDescriptions,
  type VillageTickContext,
} from "./village-bootstrap.js";
import {
  deriveVillageMoment,
  hashString,
  randomVillageSeed,
  VILLAGE_WEEKDAYS,
  villageDateLabel,
} from "./village-clock.js";
import { coerceTownMapView, defaultVillageState, mutateVillageState, readVillageState } from "./village-store.js";

/** How many villagers a village will hold, so the tab keeps rendering sanely. */
export const MAX_VILLAGERS = 12;

function projectVillager(
  villager: VillageVillager,
  cardName: string | null,
  cardSummary: string,
  cardTags: string[],
  nameColor: string,
  dialogueColor: string,
  place: VillagePlaceView | null,
): VillageVillagerView {
  return {
    characterId: villager.characterId,
    nameColor,
    dialogueColor,
    sprite: villager.sprite
      ? {
          ...villager.sprite,
          images: villager.sprite.expressions.map(({ view, label, filename, assetId, expressionId }) => ({
            view,
            label,
            expressionId,
            isDefault: Boolean(expressionId) && expressionId === villager.sprite!.defaultExpressionId,
            url: `/api/sprites/${assetId}/file/${encodeURIComponent(filename)}`,
          })),
        }
      : null,
    name: cardName ?? villager.cardSnapshot.name,
    summary: cardSummary,
    tags: cardTags,
    missing: cardName === null,
    place,
  };
}

/**
 * The village as the tab draws it.
 *
 * Everything except the name, the setting and the venues is DERIVED here rather
 * than stored, so the tab cannot show a stale time and the prompt and the chips
 * are always describing the same instant.
 */
function villageMomentView(village: VillageState, now: Date, nextTransitionAt?: string): VillageMomentView {
  const moment = deriveVillageMoment({ foundedAt: village.foundedAt, seed: village.seed, now });
  return {
    name: village.name,
    setting: village.setting,
    dateLabel: moment.dateLabel,
    weekday: moment.weekday,
    season: moment.season,
    dayPhase: moment.dayPhase,
    instant: moment.instant,
    localTime: moment.localTime,
    minuteOfDay: moment.minuteOfDay,
    timeZone: moment.timeZone,
    hour: moment.hour,
    minute: moment.minute,
    weather: moment.weather,
    dayIndex: moment.dayIndex,
    nextTransitionAt: nextTransitionAt ?? moment.nextTransitionAt,
  };
}

function exactSnapshotTransition(village: VillageState, now: Date): string {
  const moment = deriveVillageMoment({ foundedAt: village.foundedAt, seed: village.seed, now });
  const candidates = [Date.parse(moment.nextTransitionAt)];
  const currentMinute = moment.minuteOfDay;
  const addMinute = (minute: number) => {
    if (minute <= currentMinute || minute >= 1440) return;
    const at = new Date(now);
    at.setHours(Math.floor(minute / 60), minute % 60, 0, 0);
    candidates.push(at.getTime());
  };
  for (const villager of village.villagers) {
    for (const row of villager.agenda ? agendaBlocksFor(villager.agenda, villager.ingestSchedule !== false, now) : []) {
      addMinute(row.startMinute);
      addMinute(row.endMinute);
    }
  }
  return new Date(Math.min(...candidates.filter(Number.isFinite))).toISOString();
}

/**
 * Who the player is, as the prompt layer is told it.
 *
 * Read straight off the village record and nothing else. A village has exactly
 * one answer to this question now, and it is the Persona: the copy of that
 * Persona's name and prose which the village cached the last time it wrote them.
 * That is why this can be synchronous. The version before it went to the
 * Engine's Persona library — on every chat turn — to find out whether the player
 * had renamed themselves, which is a great deal of latency to spend on a
 * question the village had already been given the answer to.
 *
 * A Persona that has been deleted is NOT read as "no Persona". The link survives
 * with `missing` set and the cached copy still answers, so the villagers go on
 * addressing the player the way they have all along. What the player loses is
 * the notice in the tab, not their name.
 */
export function readPlayerIdentity(village: VillageState): VillagePlayerIdentity {
  if (village.playerPersonaId.length === 0) {
    return { name: "", description: "", personaId: "", missing: false };
  }
  return {
    name: village.playerPersonaName,
    description: village.playerPersonaIdentity,
    personaId: village.playerPersonaId,
    missing: village.playerPersonaMissing,
  };
}

/**
 * Bring the cached copy of the linked Persona up to date. Returns whether it
 * wrote.
 *
 * This is the only writer of the cache, and it is deliberately off the chat
 * path: the tab asks for it when the village tab opens and when its settings
 * open, and a send asks for nothing at all. Chat turns read the copy.
 *
 * The write is gated on a diff, and that diff is the part worth being careful
 * about. The candidate is built through the same caps the record is coerced
 * with, so the comparison is between two already-bounded strings. Comparing raw
 * resolved text against a bounded stored one would make a Persona whose prose
 * runs past the cap look changed on every single refresh, and re-write the
 * record forever.
 *
 * A Persona that has gone missing keeps its cached copy and only flips the flag.
 * A refresh is not the moment to forget who the player was.
 */
export async function refreshPlayerPersona(): Promise<boolean> {
  const village = await readVillageState();
  if (village.playerPersonaId.length === 0) return false;
  const persona = await findPlayerPersona(village.playerPersonaId);
  const next = {
    name: persona ? boundText(persona.name, MAX_PLAYER_PERSONA_NAME_LENGTH) : village.playerPersonaName,
    identity: persona ? boundText(persona.identity, MAX_PLAYER_PERSONA_IDENTITY_LENGTH) : village.playerPersonaIdentity,
    missing: persona === null,
  };
  const unchanged =
    next.name === village.playerPersonaName &&
    next.identity === village.playerPersonaIdentity &&
    next.missing === village.playerPersonaMissing;
  if (unchanged) return false;
  await mutateVillageState((state) => {
    state.playerPersonaName = next.name;
    state.playerPersonaIdentity = next.identity;
    state.playerPersonaMissing = next.missing;
  });
  return true;
}

/**
 * The editable side of the village, as the settings panel needs it. The limits
 * and the macro list travel with the values so the tab never restates a number
 * or a token the server already owns.
 */
export function villageSettings(
  village: VillageState,
  player: VillagePlayerIdentity,
  residenceAccess: {
    placeId: string;
    area: "outside" | "shared" | "private" | "public";
    privateOwnerId: string;
    zoneId?: string;
  } | null,
): VillageSettingsView {
  return {
    visitRetention: village.visitRetention,
    promptKnowledge: village.promptKnowledge,
    defaultPromptKnowledge: VILLAGES_DEFAULT_KNOWLEDGE,
    promptBoxMaxLength: VILLAGES_PROMPT_BOX_MAX_LENGTH,
    macros: VILLAGE_PRESET_MACROS,
    storyPace: village.storyPace,
    storyPaces: ["off", "quiet", "balanced", "lively"],
    characterSpeechColors: village.characterSpeechColors,
    sendOnEnter: village.sendOnEnter,
    villageNameMaxLength: MAX_VILLAGE_NAME_LENGTH,
    playerPersonaId: village.playerPersonaId,
    // The cached name travels even when the link is broken, so the panel can
    // name the Persona it is telling the player about — "Robin Hale is gone" is
    // a sentence worth reading and "your Persona is gone" is not. The flag
    // beside it is what tells a panel whether to draw a choice or a notice.
    playerPersonaName: player.name,
    playerPersonaMissing: player.missing,
    maxNoticeboardNotes: MAX_NOTICEBOARD_NOTES,
    maxNoticeLength: MAX_NOTICE_LENGTH,
    setting: village.setting,
    foundingReason: village.foundingReason,
    foundingDetails: village.foundingDetails,
    foundingGuidance: village.foundingGuidance,
    playerRole: village.playerRole,
    scenarioImprint: village.scenarioImprint,
    worldFacts: village.worldFacts,
    selectedLorebookIds: village.selectedLorebookIds,
    sceneryArtStyle: village.sceneryArtStyle,
    personalizeVenueImagesByDefault: village.personalizeVenueImagesByDefault,
    useVisualLoreByDefault: village.useVisualLoreByDefault,
    loreTokenBudget: village.loreTokenBudget,
    loreTokenBudgetMin: MIN_LORE_TOKEN_BUDGET,
    loreTokenBudgetMax: MAX_LORE_TOKEN_BUDGET,
    foundingDetailsMaxLength: 2_000,
    foundingGuidanceMaxLength: 500,
    townMapLayoutPrompt: DEFAULT_TOWN_MAP_LAYOUT_PROMPT,
    townMapNegativePrompt: DEFAULT_TOWN_MAP_NEGATIVE_PROMPT,
    settingMaxLength: MAX_SETTING_LENGTH,
    venues: village.venues.map((venue) => {
      const blankState = { condition: "", items: [], publicFacts: [], features: [], traces: [], updatedAt: "" };
      const zones = venueZones(venue).map((originalZone) => {
        const zone = {
          ...originalZone,
          relationshipAccess: !!relationshipZoneController(
            village.relationshipContext,
            village,
            venue,
            originalZone,
            "player",
          ),
        };
        const visible =
          zone.kind === "exterior" ||
          zone.seen ||
          (zone.kind === "shared-residence" && venue.occupancy.playerHome) ||
          (residenceAccess?.placeId === venue.id && residenceAccess.zoneId === zone.id);
        return visible
          ? { ...zone, closed: zoneClosed(village, venue, zone) }
          : {
              ...zone,
              closed: zoneClosed(village, venue, zone),
              description: "",
              image: null,
              state: blankState,
              initialImageAttemptedAt: undefined,
              adaptationPending: undefined,
              adaptationSourceArchiveAt: undefined,
            };
      });
      const visibleIds = new Set(
        zones
          .filter(
            (zone) =>
              zone.kind === "exterior" ||
              zone.seen ||
              (residenceAccess?.placeId === venue.id && residenceAccess.zoneId === zone.id) ||
              (zone.kind === "shared-residence" && venue.occupancy.playerHome),
          )
          .map((zone) => zone.id),
      );
      const primary = zones.find(
        (zone) =>
          !zone.upgradeId && zone.kind !== "exterior" && zone.kind !== "private-residence" && visibleIds.has(zone.id),
      );
      return {
        ...venue,
        zones,
        archivedZones: [],
        archivedPrivateSpaces: [],
        state: primary
          ? {
              ...venue.state,
              condition: primary.state.condition,
              furniture: primary.state.items,
              publicFacts: primary.state.publicFacts,
              features: primary.state.features,
              traces: primary.state.traces,
            }
          : { ...venue.state, condition: "", furniture: [], publicFacts: [], features: [], traces: [] },
        spaces: zones.filter(
          (zone) => !zone.upgradeId && zone.kind !== "exterior" && zone.kind !== "private-residence",
        ),
        privateSpaces: zones
          .filter((zone) => zone.kind === "private-residence")
          .map((zone) => ({ ...zone, ownerId: zone.ownerId! })),
        improvements: venue.improvements?.map((upgrade) =>
          upgrade
            ? {
                ...upgrade,
                zones: upgrade.zones?.map((zone) => (visibleIds.has(zone.id) ? zone : { ...zone, description: "" })),
              }
            : null,
        ),
        editProposals: venue.editProposals?.filter((proposal) =>
          visibleIds.has(proposal.zoneId ?? legacyZoneId(venue, proposal.target, "residence", proposal.ownerId)),
        ),
      };
    }),
    homeBuildingNames: village.homeBuildingNames,
    maxPlaces: MAX_PLACES,
    maxVenueNameLength: MAX_VENUE_NAME_LENGTH,
    maxVenueNoteLength: MAX_VENUE_NOTE_LENGTH,
    maxVenueImageUrlLength: MAX_VENUE_IMAGE_URL_LENGTH,
    maxVenueImageIdLength: MAX_VENUE_IMAGE_ID_LENGTH,
    maxVenueImageBytes: MAX_VENUE_IMAGE_BYTES,
    villageGalleryFolderName: VILLAGES_GALLERY_FOLDER_NAME,
    homeBuildings: homeBuildingOptions(),
    defaultHomeBuilding: DEFAULT_HOME_BUILDING,
    setupHomeCount: 1 + SETUP_MAX_VILLAGER_COUNT,
    setupPlaceCount: 2 + SETUP_MAX_VILLAGER_COUNT,
    setupMinVillagerCount: SETUP_MIN_VILLAGER_COUNT,
    setupMaxVillagerCount: SETUP_MAX_VILLAGER_COUNT,
    // The stamp, not the image: the tab holds the picture and refetches it from
    // `/town-map` when this changes, which keeps a megabyte off every snapshot.
    townMapImageSetAt: village.townMapImageSetAt,
    townMapImageMaxLength: MAX_TOWN_MAP_IMAGE_LENGTH,
    townMapCanvasWidth: village.townMapCanvasWidth,
    townMapCanvasHeight: village.townMapCanvasHeight,
    townMapView: village.townMapView,
    // The shape, and the picture size it is authored against. The tab lays its
    // frame out from these rather than owning a ratio of its own, so the shape
    // the map is drawn in and the shape the panel describes are one number.
    townMapExpectedWidth: village.townMapCanvasWidth,
    townMapExpectedHeight: village.townMapCanvasHeight,
    townMapGenerationWidth: TOWN_MAP_EXPECTED_WIDTH,
    townMapGenerationHeight: TOWN_MAP_EXPECTED_HEIGHT,
    townMapZoomMin: TOWN_MAP_ZOOM_MIN,
    townMapZoomMax: TOWN_MAP_ZOOM_MAX,
    townMapZoomStep: TOWN_MAP_ZOOM_STEP,
  };
}

/**
 * Whether the village has been founded yet, which is what decides between the
 * wizard and the village.
 *
 * The setup stamp alone is not enough. A village that already has a house on its
 * map or anybody living in it was plainly founded, whatever its record says, so
 * a village in progress is never dropped back into the wizard. The stamp is
 * still the only thing that says the flow FINISHED, which is why it is checked
 * alongside the other two rather than instead of them.
 *
 * A place the MODEL proposed is not one of those three. Coming up with the
 * village's geography is a question asked once the village exists, so a record
 * that holds nothing but proposed places is a record whose wizard was never
 * finished — and the wizard is what puts the four houses on the map.
 */
function isVillageFounded(village: VillageState): boolean {
  return (
    village.setupAt.length > 0 || village.villagers.length > 0 || village.venues.some((place) => isHousePlace(place))
  );
}

/**
 * The places somebody lives in, as the prompt block reads them: each occupant
 * named from the live card when there is one, and from the village's remembered
 * copy when the card has been deleted — so a line never goes nameless just
 * because the card behind it went away. Shared by the prompt builder, so what a
 * villager is told and what the map draws cannot disagree about who lives
 * where. A house nobody has moved into yet contributes no line at all.
 *
 * Every check here is "does this place say it is a home", not "is this place a
 * home", which is the same reading `remapVenues` makes and for the same reason:
 * a place that says nothing about itself renders nothing rather than being
 * guessed at, because a line invented for a place that is not a house would put
 * a building in the prompt that the village does not have.
 */
export function projectHomeLines(
  village: Pick<VillageState, "venues" | "villagers"> & Partial<Pick<VillageState, "homeBuildingNames">>,
  names: ReadonlyMap<string, string>,
): VillageHomeLine[] {
  const occupants = new Map(
    village.villagers.map((villager) => [
      villager.characterId,
      names.get(villager.characterId) ?? villager.cardSnapshot.name,
    ]),
  );
  const lines: VillageHomeLine[] = [];
  for (const place of village.venues) {
    if (place.occupancy.playerHome) {
      lines.push({
        isPlayerHome: true,
        occupant: "",
        building: place.occupancy.homeKind,
        buildingName: place.occupancy.homeKind ? village.homeBuildingNames?.[place.occupancy.homeKind] : undefined,
        venueName: place.name,
      });
    }
    for (const residentId of venueResidentIds(place)) {
      const occupant = occupants.get(residentId) ?? names.get(residentId) ?? "";
      if (!occupant) continue;
      lines.push({
        isPlayerHome: false,
        occupant,
        building: place.occupancy.homeKind,
        buildingName: place.occupancy.homeKind ? village.homeBuildingNames?.[place.occupancy.homeKind] : undefined,
        venueName: place.name,
      });
    }
  }
  return lines;
}

/** The village as the tab draws it: live library labels and adopted card colors. */
export async function buildVillageSnapshot(now: Date = new Date()): Promise<VillageSnapshot> {
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
  const { activeVenueSession } = await import("./venue-session.js");
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
    if (
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
    foundingPreparation: village.foundingPreparation ?? null,
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
        : project.plan
          ? {
              ...project,
              plan: {
                ...project.plan,
                recordedItems: project.plan.recordedItems.filter((item) => {
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
    settings: villageSettings(village, player, residenceAccess),
    recap: null,
    backgroundWork: await backgroundWorkSummaries(),
  };
}

/** Every card the player owns, flagged with whether it already lives here. */
export async function buildVillageCatalog(): Promise<VillageCatalogEntry[]> {
  const [village, cards] = await Promise.all([readVillageState(), listVillagerCards()]);
  const resident = new Set(village.villagers.map((villager) => villager.characterId));
  return cards.map((card) => toCatalogEntry(card, resident.has(card.id)));
}

/**
 * Every Persona the player could be, for the picker.
 *
 * Narrowed to what a chooser needs: the full identity text is what a villager
 * is told, and sending a library's worth of it down to fill a card strip would
 * be paying for prose nobody reads on the way.
 */
export async function buildVillagePersonaCatalog(): Promise<VillagePersonaEntry[]> {
  const personas = await listPlayerPersonas();
  return personas.map((persona) => ({
    id: persona.id,
    name: persona.name,
    summary: persona.summary,
    isActive: persona.isActive,
    avatarPath: persona.avatarPath,
    avatarCrop: persona.avatarCrop,
  }));
}

/** Read only the chosen Persona's authored fields for the Founding preview. */
export async function readVillagePersonaPreview(personaId: string): Promise<VillagePersonaPreview | null> {
  const persona = await findPlayerPersona(personaId);
  // Some Engine readers return the first library record for an unknown id.
  if (!persona || persona.id !== personaId) return null;
  return {
    id: persona.id,
    name: persona.name,
    description: persona.description,
    appearance: persona.appearance,
    personality: persona.personality,
    backstory: persona.backstory,
    avatarPath: persona.avatarPath,
    avatarCrop: persona.avatarCrop,
  };
}

/**
 * Write, or re-write, what one villager is after.
 *
 * Called from exactly two places and both of them are the same situation seen
 * twice: a villager who has just moved in, and a villager whose agenda is still
 * null. It returns the agenda it stored, or null when nothing could be written —
 * the caller decides whether that is worth a word to the player.
 *
 * The one thing worth knowing about the order here is that the record is written
 * LAST. A model that is unreachable, slow or talking nonsense costs the villager
 * their agenda and nothing else, and the null it leaves behind is exactly the
 * state that asks for another try. A villager who exists without wishes is a
 * villager with less to say; a villager who does not exist because the model
 * was offline is a villager who has to be added again.
 *
 * A card that has gone from the library gets an EMPTY agenda rather than a
 * failed one. There is nothing left to ask about, and a null that could never be
 * filled would be asked about again on every part of every day for the rest of
 * the village's life. An empty agenda is the honest answer and it terminates;
 * moving the card back and pressing "write it again" is the way out.
 */
export function agendaRevision(village: VillageState, characterId: string): string {
  const resident = village.villagers.find((entry) => entry.characterId === characterId);
  return backgroundRevision([
    villageCurrentSetting(village),
    village.selectedLorebookIds,
    village.loreTokenBudget,
    village.venues.map((venue) => [
      venue.id,
      venue.name,
      venue.form,
      venue.occupancy.residentCharacterId,
      venue.residentIds,
      venue.workerIds,
      venue.zones?.map((zone) => [zone.id, zone.name, zone.kind, zone.ownerId]),
    ]),
    resident?.agendaGeneration,
    resident?.addedAt,
    resident && [
      resident.cardSnapshot.capturedAt,
      resident.cardSnapshot.revision,
      resident.cardSnapshot.name,
      resident.cardSnapshot.summary,
      resident.cardSnapshot.tags,
      resident.cardSnapshot.personality,
      resident.cardSnapshot.description,
    ],
  ]);
}

async function queueVillagerAgenda(characterId: string, finite = true): Promise<void> {
  const village = await readVillageState();
  const villager = village.villagers.find((entry) => entry.characterId === characterId);
  if (!villager) return;
  const effectiveCard = await readEffectiveVillagerCard(villager);
  if (!effectiveCard) {
    await mutateVillageState((state) => {
      const resident = state.villagers.find((entry) => entry.characterId === characterId);
      if (!resident) return;
      resident.agenda ??= unwrittenVillageAgenda(state.venues, resident.cardSnapshot.name);
      resident.agenda.personalizationPending = false;
      resident.agenda.personalizationFailure =
        "Character identity is unavailable. Keep the existing routine and retry deliberately after restoring the card.";
    });
    return;
  }
  const agendaSetting =
    village.foundingPreparation?.status === "pending"
      ? villageFoundingSetting(village)
      : villageCurrentSetting(village);
  const initialWishAttemptId =
    village.foundingPreparation?.status === "pending"
      ? await reserveInitialWishAllowance(characterId, new Date())
      : undefined;
  const context = {
    card: effectiveCard,
    characterId,
    allowInitialWish: !!initialWishAttemptId,
    playerRole: village.playerRole,
    playerPersonaName: village.playerPersonaName,
    schedule: null,
    influenceHints: villager.scheduleInfluence?.enabled ? villager.agenda?.scheduleInfluenceSnapshot?.unresolved : [],
    village: village.name,
    setting: agendaSetting,
    home: (() => {
      const home = village.venues.find((venue) => venue.occupancy.residentCharacterId === characterId);
      return home ? [home.name, home.form, home.state.condition].filter(Boolean).join("; ") : "";
    })(),
    completedWishes: villager.completedWishes,
    activeWishes: villager.agenda?.wishes ?? [],
    lore: await readVillageLore(
      village.selectedLorebookIds,
      [
        agendaSetting,
        effectiveCard.name,
        effectiveCard.summary,
        effectiveCard.personality,
        effectiveCard.description,
        ...remapVenues(village.venues).map((venue) => venue.name),
      ].join("\n"),
      undefined,
      village.loreTokenBudget,
    ),
    // The SENDABLE places: a wish is about something somebody does out in the
    // village, and "they would like to spend more time at home" is not a wish a
    // house can be named for. The houses are left out for the same reason the
    // translation leaves them out — see `remapVenues`.
    venues: remapVenues(village.venues),
    name: effectiveCard.name,
    summary: effectiveCard.summary,
    tags: effectiveCard.tags,
    personality: effectiveCard.personality,
    description: effectiveCard.description,
    routineSummary: "",
  };
  await queueBackgroundJob({
    kind: "agenda",
    subjectId: characterId,
    seed: village.seed,
    revision: agendaRevision(village, characterId),
    finite,
    label: villager.cardSnapshot.name + "'s agenda",
    legacyError: villager.agenda?.personalizationFailure,
    input: {
      characterId,
      initialWishAttemptId,
      revision: agendaRevision(village, characterId),
      context,
    },
  });
}
registerBackgroundHandler("agenda", {
  generate: async (input) => (await proposeCompactFounding(input.context, async () => {})).agenda,
  valid: (state, input) =>
    state.villagers.some((resident) => resident.characterId === input.characterId) &&
    agendaRevision(state, input.characterId) === input.revision,
  apply: (state, input, agenda) => applyAgenda(state, input.characterId, agenda, input.initialWishAttemptId),
});

/**
 * Put one agenda on one villager's record.
 *
 * Re-checked inside the mutation for the reason every other write here is: a
 * model call takes time, and a villager who was moved out while it was in flight
 * must not be written back onto a roster they have left. Silently doing nothing
 * is right in that case — the call was made for a villager who no longer
 * exists, and there is no error a player could act on.
 */
function applyAgenda(
  state: VillageState,
  characterId: string,
  agenda: VillageAgenda,
  initialWishAttemptId?: string,
): void {
  const villager = state.villagers.find((entry) => entry.characterId === characterId);
  if (!villager) return;
  const previous = villager.agenda;
  const now = new Date();
  const initialAttempt = villager.wishLifecycle?.attempt;
  const acceptsInitialWish =
    !initialAttempt ||
    (initialAttempt.id === initialWishAttemptId &&
      initialAttempt.dateKey === agendaDateKey(now) &&
      !initialAttempt.candidate);
  const weekday = VILLAGE_WEEKDAYS[(now.getDay() + 6) % 7]!;
  const nextDay = agenda.week?.[weekday] ?? workingAgendaWeek(state.venues, villager.cardSnapshot.name)[weekday]!;
  villager.agenda = {
    ...agenda,
    // Initial preparation alone may add a wish. A routine result cannot resurrect stale wishes.
    wishes: [...(previous?.wishes ?? []), ...(acceptsInitialWish ? agenda.wishes : [])]
      .filter((wish) => !villager.completedWishes.some((entry) => entry.wish.id === wish.id))
      .filter((wish, index, all) => all.findIndex((entry) => entry.id === wish.id) === index)
      .slice(0, previous?.wishes.length ? Math.max(previous.wishes.length, 2) : acceptsInitialWish ? 1 : 0),
    plannedDays: Object.fromEntries(
      Object.entries(previous?.plannedDays ?? {}).filter(
        ([key]) =>
          [...(previous?.wishActivities ?? []), ...(previous?.socialActivities ?? [])].some(
            (entry) => entry.dateKey === key,
          ) ||
          (previous?.projectWork &&
            key >= previous.projectWork.startsAt.slice(0, 10) &&
            key <= previous.projectWork.endsAt.slice(0, 10)),
      ),
    ),
    wishActivities: previous?.wishActivities ?? [],
    socialActivities: previous?.socialActivities ?? [],
    projectWork: previous?.projectWork,
    scheduleInfluenceSnapshot: previous?.scheduleInfluenceSnapshot,
    activeDay: {
      dateKey: agendaDateKey(now),
      weekday,
      blocks: previous?.activeDay?.dateKey === agendaDateKey(now) ? previous.activeDay.blocks : nextDay,
      scheduleInformed: false,
    },
    personalizationAttemptDate: agendaDateKey(now),
  };
  registerInitialWish(villager, now);
  if (initialAttempt && initialAttempt.id === initialWishAttemptId) {
    initialAttempt.candidate = villager.agenda.wishes[0];
    initialAttempt.reason = initialAttempt.candidate
      ? "Initial wish granted during preparation."
      : "No initial wish today.";
  }
  if (villager.agenda.week)
    for (const weekday of VILLAGE_WEEKDAYS)
      villager.agenda.week[weekday] = validateRoutineDay(villager.agenda.week[weekday]!, villager, state);
  if (!previous?.activeDay || previous.activeDay.dateKey !== agendaDateKey(now)) {
    villager.agenda.activeDay = undefined;
    planRoutineDays(state, now);
    activateVillagerDay(villager, now, state);
  }
}

function planRoutineDays(state: VillageState, now: Date): void {
  for (const resident of [...state.villagers].sort((a, b) => a.characterId.localeCompare(b.characterId))) {
    const agenda = resident.agenda;
    if (!agenda?.routineProfile) continue;
    agenda.plannedDays ??= {};
    for (let offset = 0; offset < 7; offset++) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, 12),
        key = agendaDateKey(date);
      if (agenda.activeDay?.dateKey === key) {
        agenda.plannedDays[key] = agenda.activeDay.blocks;
        continue;
      }
      if (agenda.plannedDays[key]) {
        if (offset > 0) agenda.plannedDays[key] = validateRoutineDay(agenda.plannedDays[key]!, resident, state);
        continue;
      }
      let blocks = validateRoutineDay(
        routineDay(
          agenda.routineProfile,
          agenda.generatedAt || agenda.routineSummary,
          date,
          agenda.scheduleInfluenceSnapshot,
          influenceSettings(resident.scheduleInfluence),
        ),
        resident,
        state,
      );
      blocks = blocks.map((block) => {
        if (!block.venueId) return block;
        const otherBlocks = state.villagers
          .filter((other) => other.characterId !== resident.characterId)
          .map((other) => {
            const home = state.venues.find((venue) => venueResidentIds(venue).includes(other.characterId))?.id ?? "";
            return {
              blocks:
                other.agenda?.plannedDays?.[key] ?? (other.agenda ? agendaBlocksFor(other.agenda, false, date) : []),
              home,
            };
          });
        const boundaries = new Set([
          block.startMinute,
          ...otherBlocks.flatMap((other) =>
            other.blocks
              .filter((row) => row.startMinute > block.startMinute && row.startMinute < block.endMinute)
              .map((row) => row.startMinute),
          ),
        ]);
        const full = [...boundaries].some(
          (minute) =>
            otherBlocks.filter(
              (other) =>
                (other.blocks.find((row) => row.startMinute <= minute && row.endMinute > minute)?.venueId ||
                  other.home) === block.venueId,
            ).length >= 4,
        );
        return full
          ? {
              ...block,
              venueId: "",
              zoneId: undefined,
              activity: "Taking care of their own affairs",
              status: "idle" as const,
              flexible: true,
            }
          : block;
      });
      agenda.plannedDays[key] = blocks;
    }
    const today = agendaDateKey(now);
    for (const key of Object.keys(agenda.plannedDays)) if (key < today) delete agenda.plannedDays[key];
  }
}
function activateVillagerDay(villager: VillageVillager, now: Date, state: VillageState): void {
  const agenda = villager.agenda;
  if (!agenda) return;
  const weekday = VILLAGE_WEEKDAYS[(now.getDay() + 6) % 7]!;
  agenda.activeDay = {
    dateKey: agendaDateKey(now),
    weekday,
    blocks:
      agenda.plannedDays?.[agendaDateKey(now)] ??
      validateRoutineDay(agendaBlocksFor(agenda, false, now), villager, state),
    scheduleInformed: false,
  };
}

export async function rollActiveAgendas(now: Date, known?: VillageState): Promise<boolean> {
  const village = known ?? (await readVillageState());
  if (village.villagers.every((villager) => villager.agenda?.activeDay?.dateKey === agendaDateKey(now))) return false;
  await mutateVillageState((state) => {
    planRoutineDays(state, now);
    for (const villager of state.villagers) {
      if (villager.agenda?.activeDay?.dateKey !== agendaDateKey(now)) activateVillagerDay(villager, now, state);
    }
  });
  return true;
}

/** Discover missing agendas. The coordinator retains failures across dates and throttles provider requests. */
async function backfillAgendas(village: VillageState, _now: Date): Promise<VillageState> {
  const pending = village.villagers.filter((resident) => resident.agenda?.personalizationPending === true);
  if (village.villagers.some((resident) => resident.agenda === null))
    await mutateVillageState((state) => {
      for (const resident of state.villagers)
        if (!resident.agenda) {
          resident.agenda = unwrittenVillageAgenda(state.venues, resident.cardSnapshot.name);
          resident.agenda.personalizationPending = false;
        }
    });
  // Only explicitly admitted new/regen profiles are eligible, never missing legacy data.
  for (const resident of pending) await queueVillagerAgenda(resident.characterId, Boolean(resident.agendaGeneration));
  return readVillageState();
}

/** Deprecated compatibility helper; no timetable authority. */
export function remapSignatureFor(..._args: unknown[]): string {
  return "deprecated-owned-agenda";
}

/** Normalize preferences locally without altering today's persisted plan. */
async function refreshVillagerRemaps(village: VillageState, now: Date, only?: string): Promise<void> {
  const snapshot = await readNativeScheduleSnapshot(
    now,
    village.villagers.map((resident) => resident.characterId),
  );
  if (!snapshot.cardsReadable) return;
  const weeks = new Map(snapshot.schedules.map((schedule) => [schedule.characterId, schedule]));
  await mutateVillageState((state) => {
    for (const resident of state.villagers) {
      if ((only && resident.characterId !== only) || !resident.agenda) continue;
      const next = deriveInfluence(weeks.get(resident.characterId) ?? null, resident, state);
      if (next.signature !== resident.agenda.scheduleInfluenceSnapshot?.signature) {
        for (const key of Object.keys(resident.agenda.plannedDays ?? {})) {
          if (
            key === resident.agenda.activeDay?.dateKey ||
            [...(resident.agenda.wishActivities ?? []), ...(resident.agenda.socialActivities ?? [])].some(
              (activity) => activity.dateKey === key,
            )
          )
            continue;
          delete resident.agenda.plannedDays![key];
        }
        resident.agenda.scheduleInfluenceSnapshot = next;
      }
    }
    planRoutineDays(state, now);
  });
}

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
export async function addVillager(characterId: string): Promise<void> {
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

function snapshotFromCard(card: VillagerCard, revision: number): VillageVillagerCardSnapshot {
  return {
    id: card.id,
    revision,
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
    capturedAt: new Date().toISOString(),
  };
}

function snapshotContent(snapshot: VillageVillagerCardSnapshot): string {
  return JSON.stringify({
    id: snapshot.id,
    name: snapshot.name,
    comment: snapshot.comment,
    summary: snapshot.summary,
    tags: snapshot.tags,
    systemPrompt: snapshot.systemPrompt,
    description: snapshot.description,
    personality: snapshot.personality,
    scenario: snapshot.scenario,
    backstory: snapshot.backstory,
    appearance: snapshot.appearance,
    exampleDialogue: snapshot.exampleDialogue,
    postHistoryInstructions: snapshot.postHistoryInstructions ?? "",
    nameColor: snapshot.nameColor ?? "",
    dialogueColor: snapshot.dialogueColor ?? "",
  });
}

export async function previewVillagerRefresh(characterId: string): Promise<VillageVillagerRefreshPreview> {
  const village = await readVillageState();
  const villager = village.villagers.find((entry) => entry.characterId === characterId);
  if (!villager) throw notFound("That villager does not live here.");
  const card = await findVillagerCard(characterId);
  const proposed = card ? snapshotFromCard(card, villager.cardSnapshot.revision + 1) : null;
  return {
    characterId,
    current: villager.cardSnapshot,
    proposed,
    sourceAvailable: card !== null,
    changed: proposed !== null && snapshotContent(proposed) !== snapshotContent(villager.cardSnapshot),
  };
}

export async function applyVillagerRefresh(characterId: string): Promise<VillageSnapshot> {
  const village = await readVillageState();
  const villager = village.villagers.find((entry) => entry.characterId === characterId);
  if (!villager) throw notFound("That villager does not live here.");
  const card = await findVillagerCard(characterId);
  if (!card) throw badRequest("That character card is no longer in your library.");
  const proposed = snapshotFromCard(card, villager.cardSnapshot.revision + 1);
  const proseChanged =
    snapshotContent({
      ...villager.cardSnapshot,
      nameColor: proposed.nameColor,
      dialogueColor: proposed.dialogueColor,
    }) !== snapshotContent(proposed);
  if (
    snapshotContent(proposed) === snapshotContent(villager.cardSnapshot) &&
    villager.cardSnapshot.sourceStatus === "available"
  ) {
    return buildVillageSnapshot();
  }
  await mutateVillageState((state) => {
    const resident = state.villagers.find((entry) => entry.characterId === characterId);
    if (!resident) return;
    resident.cardSnapshot = {
      ...proposed,
    };
    if (proseChanged) {
      resident.agenda = unwrittenVillageAgenda(state.venues, card.name);
      resident.remap = null;
      resident.remapFailure = null;
    }
  });
  return buildVillageSnapshot();
}

/** Remove a villager from the village roster. */
export async function removeVillager(characterId: string): Promise<void> {
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
        if (
          project.kind !== "build-venue" ||
          !project.plan ||
          project.plan.builderId !== characterId ||
          project.status === "complete"
        )
          continue;
        project.status = "blocked";
        project.plan.blockedReason = "The builder left; recruit a new resident to continue.";
        if (project.plan.workOrder) project.plan.workOrder.pausedAt = new Date().toISOString();
      }
    state.villagers = remaining;
    state.residences = state.residences.filter((move) => move.characterId !== characterId);
    for (const venue of state.venues) {
      if (venueResidentIds(venue).includes(characterId)) {
        const at = new Date().toISOString();
        venue.zones ??= venueZones(venue);
        venue.layoutVersion = 1;
        const personal = venue.privateSpaces?.find((space) => space.ownerId === characterId);
        if (personal)
          venue.archivedPrivateSpaces = [
            ...(venue.archivedPrivateSpaces ?? []),
            { ownerId: characterId, archivedAt: at, space: structuredClone(personal) },
          ].slice(-32);
        const zone = venue.zones.find((zone) => zone.kind === "private-residence" && zone.ownerId === characterId);
        if (zone) {
          zone.ownerId = undefined;
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
      for (const zone of venue.zones ?? []) zone.controllerIds = zone.controllerIds?.filter((id) => id !== characterId);
    }
    retireBackgroundResident(state, characterId);
  });
  if (!removed) throw notFound("That villager does not live here.");
}

/**
 * Where this villager is, said as a place the drawer can draw.
 *
 * The last step of the join the translation starts: the remap says which venue
 * an hour belongs to, and this turns that into the one thing a drawer needs —
 * a name and a picture.
 *
 * There are TWO fallbacks and they are not the same kind of thing. A venue is
 * the translation's answer and it is only reached when the hour genuinely
 * belongs somewhere the village has a name for. Failing that, the answer is the
 * villager's own HOME, which is the same default the hour itself lands on — see
 * `VILLAGE_UNTRANSLATED_ACTIVITY` — so that the picture behind somebody and the
 * sentence in their mouth come out of one decision instead of two that agree by
 * luck. Only when they have no home either does this answer null, and that is the
 * ordinary state for a villager whose card was moved around the map by hand.
 *
 * Read on demand rather than carried on the snapshot, because the snapshot is a
 * sixty-second poll of the whole village and this is wanted on the moment rather
 * than on the poll — the drawer to draw it, and the prompt to say who else is
 * standing in it. The schedule read behind it is the one the prompt already does,
 * from the same thirty-second cache, and it is passed IN rather than taken here
 * so that a conversation pays for it once and the two things built from it — the
 * place and the availability — can never come from different reads of the clock.
 *
 * Exported for the prompt's own use, which is the second reader and the only
 * other one: `presentFor` in `chat.ts` calls this once per villager to group the
 * village by where everybody is standing. Exported rather than reimplemented
 * there for the reason the whole join exists — the place a villager's own plate
 * shows them standing in and the place their neighbour is told they are standing
 * in have to be ONE answer, and a second implementation is a second answer.
 *
 * It has a THIRD reader as of the map: the snapshot fills this in for every
 * villager off the one schedule read the poll already performs, so the locator
 * pin on the map and the plate over the conversation are the same answer rather
 * than two that agree by luck. The `routine` argument is what keeps that cheap —
 * the caller reads the whole village's schedules once and hands each villager
 * their own — and it is why this is a pure function over the record rather than
 * anything that reads a clock.
 */
export function villagerPlaceView(
  village: VillageState,
  villager: VillageVillager,
  _routine: NativeRoutine | null,
  minuteOfDay = deriveVillageMoment({ foundedAt: village.foundedAt, seed: village.seed, now: new Date() }).minuteOfDay,
  at = new Date(),
): VillagePlaceView | null {
  const agenda = agendaAt(villager.agenda, minuteOfDay, at, villager.ingestSchedule !== false);
  const venueId = agenda?.venueId ?? "";
  // A translation can name a place that has since been deleted from the village,
  // so the lookup is by id against the current list rather than by position into
  // the one the translation was written from. A place that is gone reads as
  // unplaced, which is where the fallback below picks the villager up.
  const venue =
    venueId.length > 0
      ? village.venues.find(
          (entry) =>
            entry.id === venueId &&
            (entry.constructionStatus === "worksite" ||
              !isHousePlace(entry) ||
              (entry.classes?.some((item) => item !== "residence") ?? false)),
        )
      : undefined;
  if (venue) {
    const zone = chooseAgendaZone(venue, villager.characterId, agenda?.activity, agenda?.zoneId, village);
    return {
      id: venue.id,
      name: venue.name,
      image: venue.presentation.image,
      kind: "venue",
      zoneId: zone.id,
      zoneName: zone.name,
    };
  }
  // Where they are when nothing has sent them anywhere: their own house. Named
  // after the BUILDING rather than after whoever lives there, because the name
  // of the person is already on the plate in front of them and the tab reads
  // that one — what this answers is only what kind of house it is.
  const home = village.venues.find((entry) => venueResidentIds(entry).includes(villager.characterId));
  if (!home) return null;
  const building = homeBuildingOptions().find((option) => option.kind === home.occupancy.homeKind);
  const zone = chooseAgendaZone(home, villager.characterId, agenda?.activity, agenda?.zoneId, village);
  return {
    id: home.id,
    name: building?.name ?? home.name,
    image: home.presentation.image,
    kind: "home",
    zoneId: zone.id,
    zoneName: zone.name,
  };
}

// ── Village settings ─────────────────────────────────────────────────────────
// What a villager is told about the world beyond their own card. It used to be
// two things and is now one: the box about how everyone TALKS is gone, because
// that question belongs to the player's own Engine preset and is answered in the
// narration settings. The box about what a villager KNOWS stayed, because no
// preset knows where this village is or who lives in it.

/**
 * Read the village's prompt box out of a request body.
 *
 * An over-long box is refused rather than silently truncated — the player is
 * editing text they can see, so quietly dropping the end of it would be the
 * worst possible outcome. `what` names the box the refusal is about, which is
 * now one name but was two.
 */
function readPromptBox(value: unknown, what: string): string {
  if (typeof value !== "string") throw badRequest(`${what} must be text.`);
  if (value.length > VILLAGES_PROMPT_BOX_MAX_LENGTH) {
    throw badRequest(`${what} can be at most ${VILLAGES_PROMPT_BOX_MAX_LENGTH} characters.`);
  }
  return value;
}

/** Store the box: what a villager in this village knows. */
export async function setVillagePromptKnowledge(value: unknown): Promise<VillageSnapshot> {
  const text = readPromptBox(value, "The information villagers know");
  await mutateVillageState((state) => {
    state.promptKnowledge = text;
  });
  return buildVillageSnapshot();
}

export async function setVillageLoreSettings(idsValue?: unknown, budgetValue?: unknown): Promise<VillageSnapshot> {
  const ids = idsValue === undefined ? undefined : readSelectedLorebookIds(idsValue);
  const budget = budgetValue === undefined ? undefined : readLoreTokenBudget(budgetValue);
  await mutateVillageState((state) => {
    if (ids) state.selectedLorebookIds = ids;
    if (budget !== undefined) state.loreTokenBudget = budget;
  });
  return buildVillageSnapshot();
}

/**
 * Read a part of the village day out of a request body.
 *
 * Refused rather than ignored, for the same reason an over-long preset is: the
 * player is looking at the switches they pressed, so a value that cannot name a
 * part of the day has to come back as an error rather than as a village that
 * quietly disagrees with the panel.
 */
export async function setVillageStoryPace(value: unknown): Promise<VillageSnapshot> {
  const paces: readonly VillageStoryPace[] = ["off", "quiet", "balanced", "lively"];
  if (typeof value !== "string" || !paces.includes(value as VillageStoryPace)) {
    throw badRequest("Background events and wishes must be off, quiet, balanced or lively.");
  }
  await mutateVillageState((state) => {
    state.storyPace = value as VillageStoryPace;
  });
  return buildVillageSnapshot();
}

export async function setVillageSendOnEnter(value: unknown): Promise<VillageSnapshot> {
  if (typeof value !== "boolean") throw badRequest("Send on Enter must be on or off.");
  await mutateVillageState((state) => {
    state.sendOnEnter = value;
  });
  return buildVillageSnapshot();
}

export async function setVillageCharacterSpeechColors(value: unknown): Promise<VillageSnapshot> {
  if (typeof value !== "boolean") throw badRequest("Character speech colors must be on or off.");
  await mutateVillageState((state) => {
    state.characterSpeechColors = value;
  });
  return buildVillageSnapshot();
}

/**
 * Read a village name out of a request body.
 *
 * Shared with the setup flow so the wizard and the settings panel cannot
 * disagree about what counts as a name. An over-long one is refused rather
 * than cut down: the player is looking at the field they typed it into.
 */
function readVillageName(value: unknown): string {
  if (typeof value !== "string") throw badRequest("The village name must be text.");
  const name = value.trim();
  if (name.length === 0) throw badRequest("Give the village a name.");
  if (name.length > MAX_VILLAGE_NAME_LENGTH) {
    throw badRequest(`The village name can be at most ${MAX_VILLAGE_NAME_LENGTH} characters.`);
  }
  return name;
}

/** Read the setting out of a request body. Shared with the setup flow. */
function readVillageSetting(value: unknown): string {
  if (typeof value !== "string") throw badRequest("The setting must be text.");
  if (value.length > MAX_SETTING_LENGTH) {
    throw badRequest(`The setting can be at most ${MAX_SETTING_LENGTH} characters.`);
  }
  return value.trim();
}

/** Rename the village. */
export async function setVillageName(value: unknown): Promise<VillageSnapshot> {
  const name = readVillageName(value);
  await mutateVillageState((state) => {
    state.name = name;
  });
  return buildVillageSnapshot();
}

/**
 * The Persona a write is about to link, as the three fields the cache holds.
 *
 * Both doors that set the player — founding the village and changing it in
 * settings — have to answer the same question in the same way, so the read and
 * its two refusals live here rather than twice over.
 *
 * It refuses an empty id because there is no longer a "none" to fall back on:
 * the typed name and description that used to stand in for a Persona are gone,
 * so a village with no Persona would have no answer at all to who the player is.
 * It refuses an id that does not resolve for the same reason from the other
 * side — storing it would put the village straight into the state the tab calls
 * a broken link, on the very turn the player was picking someone who exists.
 */
export async function readLinkedPersona(personaId: unknown): Promise<{ id: string; name: string; identity: string }> {
  if (typeof personaId !== "string") throw badRequest("Your Persona must be an id.");
  const id = boundText(personaId, MAX_PLAYER_PERSONA_ID_LENGTH);
  if (id.length === 0) throw badRequest("Choose a Persona — the village needs one to know who you are.");
  const persona = await findPlayerPersona(id);
  if (!persona) throw badRequest("That Persona is no longer in your library.");
  return {
    id,
    name: boundText(persona.name, MAX_PLAYER_PERSONA_NAME_LENGTH),
    identity: boundText(persona.identity, MAX_PLAYER_PERSONA_IDENTITY_LENGTH),
  };
}

/**
 * Store who the player is: the Persona they are.
 *
 * There were two other fields here once — a name and a description the player
 * typed by hand — and they are gone rather than merely unread. A village has one
 * answer to who the player is now, and keeping a second one only ever gave the
 * two a way to disagree about it.
 *
 * The Persona is resolved at the write rather than at every read, and that is
 * the trade this whole change turns on: one library read when the player picks
 * someone, instead of one on every single chat turn.
 */
export async function setVillagePlayer(input: { personaId?: unknown }): Promise<VillageSnapshot> {
  const persona = await readLinkedPersona(input.personaId);
  await mutateVillageState((state) => {
    state.playerPersonaId = persona.id;
    state.playerPersonaName = persona.name;
    state.playerPersonaIdentity = persona.identity;
    state.playerPersonaMissing = false;
  });
  return buildVillageSnapshot();
}

/**
 * Store what the village IS.
 *
 * This is the fork in the whole design: the setting alone says nothing about
 * who lives here, and saving one for a village that has no places yet is the
 * moment to invent them. The bootstrap runs only on that transition — once a
 * village has venues, editing the wording of its setting must never overwrite
 * places the player has since renamed, reworded or added by hand.
 */
export async function setVillageSetting(value: unknown): Promise<VillageSnapshot> {
  const setting = readVillageSetting(value);
  let shouldPropose = false;
  await mutateVillageState((state) => {
    state.setting = setting;
    // The houses are places now, and a village with four houses and nowhere to
    // send anybody is exactly the village that needs places invented. Counting
    // every stored place here would read the roofs as the answer and leave a
    // village of four cottages and nothing else.
    shouldPropose = setting.length > 0 && remapVenues(state.venues).length === 0;
  });

  if (shouldPropose) {
    // The setting is saved either way. A model that is offline, unconfigured or
    // merely unhelpful must not cost the player the text they just typed; they
    // are told in the tab that no places arrived and can ask again.
    try {
      await runVillageBootstrap();
    } catch (error) {
      villagesLogger().warn("[villages] could not propose places for the new setting: %s", String(error));
    }
  }
  return buildVillageSnapshot();
}

/**
 * Replace every place in the village in one write.
 *
 * Positions are not meaningful the way they are for notices, so the whole list
 * is replaced rather than merged — and now that the houses are in the same list
 * as the venues that matters more than it did: the panel that edits names and
 * notes and the map that moves pins are editing ONE list, and a merge would mean
 * a save from either of them silently reverting the other.
 *
 * Over-long entries are refused for the same reason over-long presets are: the
 * player typed them and can see them.
 */
export async function setVillageVenues(value: unknown, scope: "all" | "homes" = "all"): Promise<VillageSnapshot> {
  if (!Array.isArray(value)) throw badRequest("The places must be a list.");
  if (value.length > MAX_PLACES) throw badRequest(`A village holds at most ${MAX_PLACES} places.`);

  const stored = await readVillageState();
  const residents = new Set(stored.villagers.map((villager) => villager.characterId));
  // Pictures come across by id rather than out of the request. The panel edits
  // names and notes and has no opinion about art, so a save that arrives
  // without a picture means "unchanged" — and trusting the request instead
  // would let a tab built before this field existed, or a save sent while a
  // generation was still running, quietly delete every picture in the village.
  const previous = new Map(stored.venues.map((place) => [place.id, place.presentation.image]));
  const previousPlaces = new Map(stored.venues.map((place) => [place.id, place]));

  const places: VillageVenue[] = [];
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const seenOccupants = new Set<string>();
  let sawPlayerHome = false;
  for (const entry of value) {
    const place = parsePlace(entry);
    if (seenIds.has(place.id)) throw badRequest("Two places cannot share an id.");
    if (place.occupancy.playerHome) {
      if (sawPlayerHome) throw badRequest("Only one place can be your home.");
      sawPlayerHome = true;
    }
    if (place.occupancy.residentCharacterId !== null) {
      if (!residents.has(place.occupancy.residentCharacterId)) {
        throw badRequest("A place can only belong to somebody who lives here.");
      }
      if (seenOccupants.has(place.occupancy.residentCharacterId))
        throw badRequest("A villager can only live in one place.");
      seenOccupants.add(place.occupancy.residentCharacterId);
    }
    const key = place.name.toLowerCase();
    if (seenNames.has(key)) throw badRequest("Every Venue needs a distinct name.");
    seenNames.add(key);
    seenIds.add(place.id);
    const prior = previousPlaces.get(place.id);
    if (!prior && !place.description.trim()) throw badRequest("Approve a description before creating this venue.");
    if (
      prior?.occupancy.residentCharacterId &&
      (!place.occupancy.residentCharacterId ||
        place.occupancy.residentCharacterId !== prior.occupancy.residentCharacterId ||
        place.presentation.x !== prior.presentation.x ||
        place.presentation.y !== prior.presentation.y ||
        place.occupancy.homeKind !== prior.occupancy.homeKind)
    )
      throw conflict("This home is occupied. Its resident must approve a move first.");
    places.push({
      ...place,
      form: place.form || prior?.form || "",
      classes: prior?.classes ?? place.classes,
      spaces: prior?.spaces ?? place.spaces,
      residenceCapacity: prior?.residenceCapacity ?? place.residenceCapacity,
      residentIds: prior ? venueResidentIds(prior) : place.residentIds,
      playerInvitations: prior?.playerInvitations ?? [],
      exteriorState: prior?.exteriorState,
      privateSpaces: prior?.privateSpaces,
      archivedPrivateSpaces: prior?.archivedPrivateSpaces,
      editProposals: prior?.editProposals,
      playerSeenShared: prior?.playerSeenShared,
      playerSeenPublic: prior?.playerSeenPublic,
      playerSeenPrivateIds: prior?.playerSeenPrivateIds,
      improvements: prior?.improvements ?? [null, null],
      description: prior?.description ?? place.description,
      capabilities: prior?.capabilities ?? place.capabilities,
      workerIds: prior?.workerIds ?? [],
      state: prior?.state ?? place.state,
      presentation: { ...place.presentation, image: previous.get(place.id) ?? null },
    });
  }

  await mutateVillageState((state) => {
    if (isVillageFounded(state)) {
      const target = scope === "homes" ? state.venues.filter(isHousePlace) : state.venues;
      if (places.length !== target.length || places.some((place) => !target.some((entry) => entry.id === place.id)))
        throw conflict("After founding, new venues begin as projects; the settings list cannot add or remove them.");
      for (const place of places) {
        const current = state.venues.find((entry) => entry.id === place.id)!;
        if (place.presentation.x !== current.presentation.x || place.presentation.y !== current.presentation.y)
          throw conflict("Moving a map pin needs a later project type.");
        if (current.constructionStatus === "worksite") {
          if (place.name !== current.name || place.description !== current.description)
            throw conflict("A worksite's identity belongs to its active project.");
          continue;
        }
        if (
          state.projects.some(
            (project) =>
              project.kind === "build-venue" &&
              project.status !== "complete" &&
              project.venueDraft?.name.toLowerCase() === place.name.toLowerCase(),
          )
        )
          throw conflict("That name is reserved by a build project.");
        current.name = place.name;
        current.description = place.description;
      }
      return;
    }
    const next =
      scope === "homes"
        ? [...places.filter(isHousePlace), ...state.venues.filter((place) => !isHousePlace(place))]
        : places;
    const names = next.map((place) => place.name.trim().toLowerCase()).filter(Boolean);
    if (new Set(names).size !== names.length) throw badRequest("Every Venue needs a distinct name.");
    if (
      state.venues.some((place) => place.occupancy.residentCharacterId && !next.some((entry) => entry.id === place.id))
    )
      throw conflict("Move the resident before removing their home.");
    if (isVillageFounded(state) && !next.some((place) => place.occupancy.playerHome))
      throw conflict("The village must keep your home.");
    if (next.length > MAX_PLACES) throw badRequest(`A village holds at most ${MAX_PLACES} places.`);
    state.venues = next.map((place) => {
      const latest = state.venues.find((entry) => entry.id === place.id);
      return latest
        ? {
            ...place,
            spaces: latest.spaces,
            state: latest.state,
            exteriorState: latest.exteriorState,
            privateSpaces: latest.privateSpaces,
            archivedPrivateSpaces: latest.archivedPrivateSpaces,
            editProposals: latest.editProposals,
            playerInvitations: latest.playerInvitations,
            playerSeenShared: latest.playerSeenShared,
            playerSeenPublic: latest.playerSeenPublic,
            playerSeenPrivateIds: latest.playerSeenPrivateIds,
            presentation: { ...place.presentation, image: latest.presentation.image },
          }
        : place;
    });
    keepAgendaPlaces(state);
  });
  return buildVillageSnapshot();
}

/** An edited map cannot leave a daily plan pointing at a vanished public place. */
function keepAgendaPlaces(state: VillageState): void {
  const publicIds = new Set(remapVenues(state.venues).map((venue) => venue.id));
  for (const villager of state.villagers) {
    if (!villager.agenda) continue;
    villager.agenda.day = villager.agenda.day.map((part) =>
      part.venueId && !publicIds.has(part.venueId)
        ? { ...part, venueId: "", activity: "taking it easy at home" }
        : part,
    );
    const repair = (week: VillageAgenda["week"]) =>
      week &&
      Object.fromEntries(
        Object.entries(week).map(([weekday, blocks]) => [
          weekday,
          blocks.map((part) =>
            part.venueId && !publicIds.has(part.venueId)
              ? {
                  ...part,
                  venueId: "",
                  activity: "Taking it easy at home",
                  reason: "The previous place is unavailable",
                }
              : part,
          ),
        ]),
      );
    villager.agenda.week = repair(villager.agenda.week);
    villager.agenda.scheduleWeek = repair(villager.agenda.scheduleWeek ?? undefined) ?? null;
    if (villager.agenda.activeDay) {
      villager.agenda.activeDay.blocks = villager.agenda.activeDay.blocks.map((part) =>
        part.venueId && !publicIds.has(part.venueId)
          ? { ...part, venueId: "", activity: "Taking it easy at home", reason: "The previous place is unavailable" }
          : part,
      );
    }
  }
}

/**
 * Give one place its picture, or take it away again with null.
 *
 * Deliberately not part of `setVillageVenues`. The list is typed into the
 * settings panel and saved as a whole in one gesture, while a picture arrives
 * from an upload or from a generation that took twenty seconds and may land
 * long after the panel was closed. Folding the two together would mean any edit
 * made while a generation was running threw the generation away.
 *
 * A place that has since been deleted is refused rather than ignored, and it is
 * refused INSIDE the write so there is no window between checking and saving.
 * By the time this runs the picture is already in the gallery, so quietly doing
 * nothing would leave the player holding an image they never asked to keep with
 * no hint of where it came from.
 */
export async function setVillageVenueImage(
  venueId: string,
  image: VillageVenueImage | null,
  spaceClass?: VillageVenueClass,
  privateOwnerId = "",
  onlyIfEmpty = false,
  zoneId?: string,
  expectedContext?: string,
): Promise<VillageSnapshot> {
  await assertVenueImageAccess(venueId, spaceClass, privateOwnerId, zoneId);
  await mutateVillageState((state) => {
    const venue = state.venues.find((entry) => entry.id === venueId);
    if (!venue) throw notFound("That place is no longer in the village.");
    if (
      expectedContext &&
      expectedContext !==
        sceneryImageKey(
          state,
          venue,
          zoneId ??
            legacyZoneId(
              venue,
              privateOwnerId ? "private" : spaceClass === "residence" ? "shared" : spaceClass ? "public" : "outside",
              spaceClass,
              privateOwnerId,
            ),
        )
    )
      throw conflict("The scenery changed while its image was generated. Generate again.");
    if (zoneId) {
      const zone = resolveVenueZone(venue, zoneId);
      if (!zone) throw notFound("That zone no longer exists.");
      if (zone.kind !== "exterior" && !zone.seen && !(zone.kind === "shared-residence" && venue.occupancy.playerHome))
        throw conflict("Visit this zone before changing its image.");
      if (!onlyIfEmpty || !zone.image) zone.image = image;
    } else if (privateOwnerId) {
      const space = venue.privateSpaces?.find((entry) => entry.ownerId === privateOwnerId);
      if (!space) throw notFound("That private space no longer exists.");
      if (!venue.playerSeenPrivateIds?.includes(privateOwnerId))
        throw conflict("Visit this Residence space before changing its image.");
      if (onlyIfEmpty && space.image) return;
      space.image = image;
    } else if (spaceClass) {
      if (spaceClass === "residence" && !venue.occupancy.playerHome && !venue.playerSeenShared)
        throw conflict("Visit this Residence space before changing its image.");
      venue.spaces = venueSpaces(venue);
      const space = venue.spaces.find((entry) => entry.venueClass === spaceClass);
      if (!space) throw badRequest("That Class has no space at this Venue.");
      space.image = image;
    } else venue.presentation.image = image;
  });
  return buildVillageSnapshot();
}

export async function assertVenueImageAccess(
  venueId: string,
  spaceClass?: VillageVenueClass,
  privateOwnerId = "",
  zoneId?: string,
): Promise<void> {
  if (zoneId || privateOwnerId) {
    const village = await readVillageState(),
      venue = village.venues.find((entry) => entry.id === venueId),
      zone = venue && resolveVenueZone(venue, zoneId || legacyZoneId(venue, "private", "residence", privateOwnerId));
    if (!zone) throw notFound("That zone no longer exists.");
    if (
      ["private-residence", "staff", "restricted"].includes(zone.kind) &&
      !zoneControllerIds(venue!, zone).includes("player") &&
      zone.ownerId !== "player"
    ) {
      const { activeVenueSession } = await import("./venue-session.js");
      const session = await activeVenueSession();
      const controllers = zoneControllerIds(venue!, zone);
      const grant = session?.zoneGrants?.find((entry) => entry.zoneId === zone.id);
      if (
        !session ||
        session.placeId !== venueId ||
        session.zoneId !== zone.id ||
        !controllers.length ||
        (grant && !controllers.includes(grant.controllerId)) ||
        zoneClosed(village, venue!, zone)
      )
        throw conflict("Enter this private space with a current invitation before changing its image.");
    }
    if (zone.kind === "exterior" || zone.seen || (zone.kind === "shared-residence" && venue!.occupancy.playerHome))
      return;
    throw conflict("Visit this zone before changing its image.");
  }
  if (spaceClass) {
    const venue = (await readVillageState()).venues.find((entry) => entry.id === venueId);
    if (
      venue?.layoutVersion === 1 &&
      !venueZones(venue).some(
        (zone) => ["public", "shared-residence"].includes(zone.kind) && zone.venueClass === spaceClass,
      )
    )
      throw notFound("That Common Space is absent from this Venue.");
  }
  if (spaceClass !== "residence" && !privateOwnerId) return;
  const village = await readVillageState();
  const venue = village.venues.find((entry) => entry.id === venueId);
  if (!venue || !hasVenueClass(venue, "residence")) throw notFound("That Residence is no longer here.");
  if (privateOwnerId && !venueResidentIds(venue).includes(privateOwnerId))
    throw notFound("That resident no longer has a private space here.");
  if (venue.occupancy.playerHome && !privateOwnerId) return;
  if (privateOwnerId ? venue.playerSeenPrivateIds?.includes(privateOwnerId) : venue.playerSeenShared) return;
  throw conflict("Visit this Residence space before changing its image.");
}

export async function setVillageHomeBuildingNames(value: unknown): Promise<VillageSnapshot> {
  const names = readHomeBuildingNames(value);
  await mutateVillageState((state) => {
    state.homeBuildingNames = names;
  });
  return buildVillageSnapshot();
}

function venueFieldText(value: unknown, fallback: string, limit: number): string {
  return value === undefined ? fallback : boundText(value, limit);
}

function readHomeBuildingNames(value: unknown): VillageState["homeBuildingNames"] {
  const record = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  return Object.fromEntries(
    HOME_BUILDING_ORDER.map((kind) => [kind, boundText(record[kind], 60).trim() || HOME_BUILDINGS[kind].name]),
  ) as VillageState["homeBuildingNames"];
}

function venueStringList(value: unknown, fallback: string[]): string[] {
  if (value === undefined) return [...fallback];
  if (!Array.isArray(value)) throw badRequest("Venue lists must be arrays of text.");
  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => boundText(entry, MAX_VENUE_NOTE_LENGTH))
    .filter(Boolean)
    .slice(0, 24);
}

function venueFeatures(value: unknown, existing: readonly VillageVenueFeature[]): VillageVenueFeature[] {
  if (value === undefined) return [...existing];
  if (!Array.isArray(value) || value.length > 5) throw badRequest("A venue can have at most five features.");
  const ids = new Set<string>();
  return value.map((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw badRequest("Each feature needs text.");
    const row = entry as Record<string, unknown>;
    const requestedId = asTrimmedString(row.id);
    const prior = existing.find((feature) => feature.id === requestedId);
    const id = prior?.id ?? randomVillageSeed();
    const text = boundText(row.text, MAX_VENUE_NOTE_LENGTH);
    if (!text || ids.has(id)) throw badRequest("Each feature needs distinct text and an identity.");
    ids.add(id);
    return {
      id,
      text,
      sourceCharacterId: prior && prior.text === text ? prior.sourceCharacterId : "",
      locked: row.locked === true,
      updatedAt:
        prior && prior.text === text && prior.locked === (row.locked === true)
          ? prior.updatedAt
          : new Date().toISOString(),
    };
  });
}

function venueDraft(value: unknown, existing: VillageVenue | null): VillageVenue {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw badRequest("A venue must be an object.");
  }
  const record = value as Record<string, unknown>;
  const name = venueFieldText(record.name, existing?.name ?? "", MAX_VENUE_NAME_LENGTH).trim();
  if (name.length === 0 && !existing?.occupancy.homeKind) throw badRequest("Every venue needs a name.");
  const description = venueFieldText(
    record.description,
    existing?.description ?? "",
    MAX_VENUE_DESCRIPTION_LENGTH,
  ).trim();
  if (!description) throw badRequest("Approve a description before saving this venue.");
  const category = venueFieldText(record.category, existing?.category ?? "", MAX_VENUE_NOTE_LENGTH).trim();
  const form = venueFieldText(record.form, existing?.form ?? "", MAX_VENUE_NOTE_LENGTH).trim();
  if (record.classes !== undefined && !validVenueClasses(record.classes))
    throw badRequest("Choose one or two different Venue Classes.");
  if (existing && record.classes !== undefined && JSON.stringify(record.classes) !== JSON.stringify(existing.classes))
    throw badRequest("Changing Classes requires a Venue proposal.");
  const classes: VillageVenueClass[] =
    existing?.classes ?? (validVenueClasses(record.classes) ? record.classes : ["other"]);
  const requestedCapacity = record.residenceCapacity;
  if (existing && requestedCapacity !== undefined && requestedCapacity !== existing.residenceCapacity)
    throw badRequest("Changing residence capacity requires a Venue proposal.");
  if (
    requestedCapacity !== undefined &&
    (!Number.isInteger(requestedCapacity) || Number(requestedCapacity) < 1 || Number(requestedCapacity) > 4)
  )
    throw badRequest("A Residence holds between one and four people.");
  const residenceCapacity =
    existing?.residenceCapacity ?? (typeof requestedCapacity === "number" ? requestedCapacity : 1);
  const presentationValue = record.presentation;
  const presentation =
    presentationValue && typeof presentationValue === "object" && !Array.isArray(presentationValue)
      ? (presentationValue as Record<string, unknown>)
      : {};
  const x = presentation.x === undefined ? (existing?.presentation.x ?? null) : presentation.x;
  const y = presentation.y === undefined ? (existing?.presentation.y ?? null) : presentation.y;
  const position = readPlacePosition({ x, y });
  const stateValue = record.state;
  const state =
    stateValue && typeof stateValue === "object" && !Array.isArray(stateValue)
      ? (stateValue as Record<string, unknown>)
      : {};
  const priorSpaces = existing
    ? venueSpaces(existing)
    : classes.map((venueClass) => defaultVenueSpace(venueClass, description));
  const editableSpaceClasses = existing?.layoutVersion === 1 ? priorSpaces.map((space) => space.venueClass) : classes;
  const postedSpaces = record.spaces;
  if (
    postedSpaces !== undefined &&
    (!Array.isArray(postedSpaces) || postedSpaces.length !== editableSpaceClasses.length)
  )
    throw badRequest("Provide one scene for each Venue Class.");
  const spaces = editableSpaceClasses.map((venueClass) => {
    const prior =
      priorSpaces.find((space) => space.venueClass === venueClass) ?? defaultVenueSpace(venueClass, description);
    const posted = Array.isArray(postedSpaces)
      ? postedSpaces.find((space) => typeof space === "object" && space !== null && space.venueClass === venueClass)
      : null;
    const row = posted && typeof posted === "object" ? (posted as Record<string, unknown>) : {};
    const scene =
      row.state && typeof row.state === "object" && !Array.isArray(row.state)
        ? (row.state as Record<string, unknown>)
        : {};
    const nextDescription = venueFieldText(row.description, prior.description, MAX_VENUE_DESCRIPTION_LENGTH).trim();
    const nextState = {
      condition: venueFieldText(scene.condition, prior.state.condition, MAX_VENUE_NOTE_LENGTH),
      items: venueStringList(scene.items, prior.state.items),
      publicFacts: venueStringList(scene.publicFacts, prior.state.publicFacts),
      features: venueFeatures(scene.features, prior.state.features),
      traces: prior.state.traces,
      updatedAt: prior.state.updatedAt,
    };
    const changed =
      nextDescription !== prior.description ||
      nextState.condition !== prior.state.condition ||
      JSON.stringify(nextState.items) !== JSON.stringify(prior.state.items) ||
      JSON.stringify(nextState.publicFacts) !== JSON.stringify(prior.state.publicFacts) ||
      JSON.stringify(nextState.features) !== JSON.stringify(prior.state.features);
    if (changed) nextState.updatedAt = new Date().toISOString();
    return {
      ...prior,
      description: nextDescription,
      state: nextState,
    };
  });
  if (spaces.some((space) => !space.description)) throw badRequest("Approve a description for every Venue space.");
  const draft: VillageVenue = {
    layoutVersion: existing?.layoutVersion,
    baseClasses: existing?.baseClasses,
    zones: existing?.zones,
    archivedZones: existing?.archivedZones,
    usedInvitationIds: existing?.usedInvitationIds,
    id: (existing?.id ?? asTrimmedString(record.id)) || randomVillageSeed(),
    name,
    form,
    classes,
    spaces,
    residenceCapacity,
    residentIds: existing ? venueResidentIds(existing) : [],
    playerInvitations: existing?.playerInvitations ?? [],
    exteriorState: existing?.exteriorState,
    privateSpaces: existing?.privateSpaces,
    archivedPrivateSpaces: existing?.archivedPrivateSpaces,
    editProposals: existing?.editProposals,
    playerSeenShared: existing?.playerSeenShared,
    playerSeenPublic: existing?.playerSeenPublic,
    playerSeenPrivateIds: existing?.playerSeenPrivateIds,
    improvements: existing?.improvements ?? [null, null],
    description,
    category,
    presentation: {
      image: existing?.presentation.image ?? null,
      x: position.x,
      y: position.y,
    },
    occupancy: existing?.occupancy ?? { playerHome: false, residentCharacterId: null, homeKind: null },
    capabilities: venueStringList(record.capabilities, existing?.capabilities ?? []),
    workerIds: venueStringList(record.workerIds, existing?.workerIds ?? []),
    state: {
      condition: venueFieldText(state.condition, existing?.state.condition ?? "", MAX_VENUE_NOTE_LENGTH),
      upgrades: venueStringList(state.upgrades, existing?.state.upgrades ?? []),
      furniture: venueStringList(state.furniture, existing?.state.furniture ?? []),
      publicFacts: venueStringList(state.publicFacts, existing?.state.publicFacts ?? []),
      features: venueFeatures(state.features, existing?.state.features ?? []),
      traces: existing?.state.traces ?? [],
      updatedAt: new Date().toISOString(),
    },
  };
  // Older editors submit the single scene as `state`. Keep its Class space in
  // step so the next visit and the next edit see the same feature identities.
  if (postedSpaces === undefined && record.state !== undefined && draft.spaces?.[0]) {
    draft.spaces[0].state = {
      ...draft.spaces[0].state,
      condition: draft.state.condition,
      items: [...draft.state.furniture],
      publicFacts: [...draft.state.publicFacts],
      features: [...(draft.state.features ?? [])],
      traces: [...(draft.state.traces ?? [])],
      updatedAt: draft.state.updatedAt,
    };
  }
  return draft;
}

export type VillageVenueDeletionDependencies = {
  venueId: string;
  venueName: string;
  residentCharacterIds: string[];
  playerHome: boolean;
  workerCharacterIds: string[];
  pendingMailCount: number;
  pendingResidenceCharacterIds: string[];
  remapCount: number;
  roomPresent: boolean;
  eventCount: number;
};

export async function previewVillageVenueDeletion(venueId: string): Promise<VillageVenueDeletionDependencies> {
  const village = await readVillageState();
  const venue = village.venues.find((entry) => entry.id === venueId);
  if (!venue) throw notFound("That place is no longer in the village.");
  return {
    venueId,
    venueName: venue.name,
    residentCharacterIds: venueResidentIds(venue),
    playerHome: venue.occupancy.playerHome,
    workerCharacterIds: venue.workerIds ?? [],
    pendingMailCount: village.venueMail.filter(
      (entry) =>
        entry.venueId === venueId && (entry.status === "pending-player" || entry.status === "awaiting-villagers"),
    ).length,
    pendingResidenceCharacterIds: village.residences
      .filter((residence) => residence.status === "pending" && residence.proposedVenueId === venueId)
      .map((residence) => residence.characterId),
    remapCount: village.villagers.reduce(
      (count, villager) => count + (villager.remap?.moves.filter((move) => move.venueId === venueId).length ?? 0),
      0,
    ),
    roomPresent: (await activeVisitAtVenue(venueId)) === true,
    eventCount: village.venueEvents.filter((event) => event.venueId === venueId).length,
  };
}

async function activeVisitAtVenue(venueId: string): Promise<boolean> {
  const { activeVenueSession } = await import("./venue-session.js");
  return (await activeVenueSession())?.placeId === venueId;
}

export async function createVillageVenue(value: unknown): Promise<VillageSnapshot> {
  const draft = venueDraft(value, null);
  if (!draft.description) throw badRequest("Approve a description before creating this venue.");
  await mutateVillageState((state) => {
    if (isVillageFounded(state)) throw conflict("After founding, propose a venue project instead.");
    addVillageVenue(state, draft);
  });
  return buildVillageSnapshot();
}

export function addVillageVenue(state: VillageState, draft: VillageVenue): void {
  if (
    state.venues.length >= MAX_PLACES ||
    (draft.classes?.some((item) => item !== "residence") && remapVenues(state.venues).length >= MAX_VENUES)
  ) {
    throw badRequest("The village has no room for another venue.");
  }
  if (state.venues.some((venue) => venue.name.trim().toLowerCase() === draft.name.toLowerCase())) {
    throw badRequest("A venue with that name already exists.");
  }
  state.venues.push({
    ...draft,
    id: randomVillageSeed(),
    occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
  });
}

/** Save only an explicit, grounded request. All sources share this deduplication rule. */
export function queueVillageVenueRequest(
  state: VillageState,
  core: VenueRequestCore,
  requesterCharacterId: string,
  source: "chat" | "background",
  sourceKey: string,
  at: string,
  requestQuote = "",
): void {
  const requester = state.villagers.find((villager) => villager.characterId === requesterCharacterId);
  if (!requester || !sourceKey) return;
  if (
    state.pendingDecisions.filter((decision) => decision.status !== "approved" && decision.status !== "denied")
      .length >= 256
  )
    return;
  const key = core.name.trim().toLowerCase();
  if (
    state.venues.some((venue) => venue.name.trim().toLowerCase() === key) ||
    state.projects.some(
      (project) =>
        (project.kind === "build-venue" || project.kind === "new-venue") &&
        project.status !== "complete" &&
        project.venueDraft?.name.trim().toLowerCase() === key,
    ) ||
    state.pendingDecisions.some(
      (decision) =>
        decision.sourceKey === sourceKey ||
        (decision.kind === "venue" &&
          decision.status !== "denied" &&
          decision.venueDraft?.name.trim().toLowerCase() === key),
    )
  )
    return;
  const decision: VillagePendingDecision = {
    id: randomVillageSeed(),
    kind: "venue",
    title: core.name,
    detail: core.classes.join(" / "),
    proposedAt: at,
    sourceOpportunityId: source === "background" ? sourceKey : "",
    status: "pending",
    venueDraft: venueRequestDraft(core),
    requesterCharacterId,
    requesterName: requester.cardSnapshot.name,
    requestQuote: boundText(requestQuote, MAX_VENUE_NOTE_LENGTH),
    source,
    sourceKey,
  };
  state.pendingDecisions.push(decision);
  const pending = state.pendingDecisions.filter((entry) => entry.status !== "approved" && entry.status !== "denied");
  const resolved = state.pendingDecisions.filter((entry) => entry.status === "approved" || entry.status === "denied");
  const historyRoom = 256 - pending.length;
  state.pendingDecisions = [...(historyRoom > 0 ? resolved.slice(-historyRoom) : []), ...pending];
}

export async function recordVillageVenueRequest(
  core: VenueRequestCore,
  requesterCharacterId: string,
  sourceKey: string,
): Promise<void> {
  await mutateVillageState((state) =>
    queueVillageVenueRequest(state, core, requesterCharacterId, "chat", sourceKey, new Date().toISOString()),
  );
}

export async function decideVillageVenueRequest(
  requestId: string,
  approved: boolean,
  value: unknown,
): Promise<VillageSnapshot> {
  const edits = approved ? readVenueRequestCore(value) : null;
  const description = approved
    ? boundText((value as Record<string, unknown>)?.description, MAX_VENUE_DESCRIPTION_LENGTH)
    : "";
  if (approved && !edits) throw badRequest("A venue request needs a name and Class.");
  if (approved && !description) throw badRequest("Approve a description before creating this venue.");
  await mutateVillageState((state) => {
    applyVillageVenueDecision(state, requestId, approved, edits, description, new Date());
  });
  return buildVillageSnapshot();
}

export async function requestVillageHomeUpgrade(
  characterValue: unknown,
  venueValue: unknown,
  sourceKey = "",
): Promise<VillageSnapshot> {
  const characterId = residenceCharacterId(characterValue);
  const venueId = residenceVenueId(venueValue);
  await mutateVillageState((state) => {
    if (sourceKey && state.processedOpportunityIds.includes(sourceKey)) return;
    const venue = state.venues.find((entry) => entry.id === venueId);
    if (!venue || venue.occupancy.residentCharacterId !== characterId || !venue.occupancy.homeKind)
      throw badRequest("Only the resident can request an upgrade to their home.");
    const index = HOME_BUILDING_ORDER.indexOf(venue.occupancy.homeKind);
    const next = HOME_BUILDING_ORDER[index + 1];
    if (!next) throw badRequest("This home is already at the highest tier.");
    if (
      state.pendingDecisions.some(
        (decision) =>
          decision.kind === "venue-upgrade" && decision.venueId === venueId && decision.status === "pending",
      )
    )
      return;
    const resident = state.villagers.find((entry) => entry.characterId === characterId)!;
    state.pendingDecisions.push({
      id: randomVillageSeed(),
      kind: "venue-upgrade",
      title: `Upgrade ${venue.name || resident.cardSnapshot.name + "'s home"}`,
      detail: `${resident.cardSnapshot.name} requests ${state.homeBuildingNames[next]}.`,
      proposedAt: new Date().toISOString(),
      sourceOpportunityId: "",
      status: "pending",
      requesterCharacterId: characterId,
      requesterName: resident.cardSnapshot.name,
      venueId,
      proposedHomeKind: next,
      source: "chat",
    });
    if (sourceKey) state.processedOpportunityIds = [...state.processedOpportunityIds, sourceKey].slice(-256);
  });
  return buildVillageSnapshot();
}

export async function decideVillageHomeUpgrade(requestId: string, approved: boolean): Promise<VillageSnapshot> {
  await mutateVillageState((state) => {
    const decision = state.pendingDecisions.find(
      (entry) => entry.id === requestId && entry.kind === "venue-upgrade" && entry.status === "pending",
    );
    if (!decision) throw notFound("That home upgrade request is no longer pending.");
    if (approved) {
      const venue = state.venues.find((entry) => entry.id === decision.venueId);
      if (!venue || venue.occupancy.residentCharacterId !== decision.requesterCharacterId || !venue.occupancy.homeKind)
        throw conflict("The requester no longer lives in that home.");
      const next = HOME_BUILDING_ORDER[HOME_BUILDING_ORDER.indexOf(venue.occupancy.homeKind) + 1];
      if (!next || next !== decision.proposedHomeKind)
        throw conflict("The home's tier has changed since this request.");
      const project = draftRenovationProject(state, venue.id, {
        title: `Renovate ${venue.name}`,
        detail: `${decision.requesterName || "The resident"} wants ${state.homeBuildingNames[next]}.`,
        homeKind: next,
      });
      const flow = project.lifecycle!;
      if (decision.requesterCharacterId && flow.affectedIds.includes(decision.requesterCharacterId))
        flow.approvals.push({
          residentId: decision.requesterCharacterId,
          source: "conversation",
          evidenceId: decision.id,
          at: decision.proposedAt,
        });
      if (flow.affectedIds.every((id) => flow.approvals.some((entry) => entry.residentId === id)))
        flow.phase = "builder";
    }
    decision.status = approved ? "approved" : "denied";
  });
  return buildVillageSnapshot();
}

export function applyVillageVenueDecision(
  state: VillageState,
  requestId: string,
  approved: boolean,
  edits: VenueRequestCore | null,
  description: string,
  now: Date,
): void {
  const decision = state.pendingDecisions.find((entry) => entry.id === requestId && entry.kind === "venue");
  if (!decision || decision.status === "approved" || decision.status === "denied" || !decision.venueDraft)
    throw notFound("That venue request is no longer pending.");
  const core = edits ?? decision.venueDraft;
  if (
    approved &&
    edits &&
    (edits.name !== decision.venueDraft.name ||
      JSON.stringify(edits.classes) !== JSON.stringify(decision.venueDraft.classes))
  ) {
    queueVenueCounteroffer(state, requestId, edits, description, now);
    return;
  }
  if (approved) {
    draftNewVenueProject(
      state,
      { ...core, classes: core.classes.slice(0, 1), description, requestQuote: decision.requestQuote },
      decision.requesterCharacterId,
      `request:${requestId}`,
    );
  }
  decision.status = approved ? "approved" : "denied";
  const moment = deriveVillageMoment({ foundedAt: state.foundedAt, seed: state.seed, now });
  const who = decision.requesterName || "A villager";
  const text = approved
    ? `The player accepted ${who}'s request to plan ${core.name}. Construction has not begun.`
    : `The player declined ${who}'s request for ${decision.venueDraft.name}.`;
  state.chronicle = [
    {
      id: randomVillageSeed(),
      dayIndex: moment.dayIndex,
      clock: moment.dayPhase,
      occurredAt: moment.instant,
      timePrecision: "exact",
      scope: "village",
      actors: decision.requesterCharacterId ? [{ id: decision.requesterCharacterId, name: who }] : [],
      kind: "chat",
      text,
    },
    ...state.chronicle,
  ];
}

export async function updateVillageVenue(venueId: string, value: unknown): Promise<VillageSnapshot> {
  await mutateVillageState((state) => {
    const index = state.venues.findIndex((venue) => venue.id === venueId);
    if (index < 0) throw notFound("That place is no longer in the village.");
    const posted =
      value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
    const disallowed = Object.keys(posted).filter(
      (key) => !["id", "name", "description", "imageContext"].includes(key),
    );
    if (disallowed.length)
      throw badRequest(
        "Edit Venue may change only name and description. Physical changes need their own earned route.",
      );
    const current = state.venues[index]!;
    if (current.constructionStatus === "worksite") throw conflict("The worksite is governed by its build project.");
    const name = boundText(posted.name ?? current.name, MAX_VENUE_NAME_LENGTH);
    const description = boundText(posted.description ?? current.description, MAX_VENUE_DESCRIPTION_LENGTH);
    if (!name || !description) throw badRequest("A venue needs a name and description.");
    if (state.venues.some((venue) => venue.id !== venueId && venue.name.toLowerCase() === name.toLowerCase()))
      throw conflict("A venue with that name already exists.");
    if (
      state.projects.some(
        (project) =>
          (project.kind === "build-venue" || project.kind === "new-venue") &&
          project.status !== "complete" &&
          project.venueDraft?.name.toLowerCase() === name.toLowerCase(),
      )
    )
      throw conflict("That name is reserved by a build project.");
    current.name = name;
    current.description = description;
    if (posted.imageContext !== undefined) current.imageContext = readVenueImageContext(posted.imageContext);
  });
  return buildVillageSnapshot();
}

export async function updateVillageZone(venueId: string, zoneId: string, value: unknown): Promise<VillageSnapshot> {
  const row = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  if (Object.keys(row).some((key) => !["name", "description", "state"].includes(key)))
    throw badRequest("Structural zone changes need a Renovation.");
  const village = await readVillageState(),
    venue = village.venues.find((entry) => entry.id === venueId),
    zone = venue && resolveVenueZone(venue, zoneId);
  if (!venue || !zone) throw notFound("That zone is no longer here.");
  if (zone.kind !== "exterior" && !zone.seen && !(venue.occupancy.playerHome && zone.kind === "shared-residence"))
    throw conflict("Visit this zone before editing it.");
  if (["staff", "restricted"].includes(zone.kind) && !zoneControllerIds(venue, zone).length)
    throw conflict("This restricted space has no current controllers who can approve edits.");
  if (zoneControllerIds(venue, zone).some((id) => id !== "player"))
    return proposeResidenceSpaceEdit(venueId, {
      ...row,
      zoneId,
      target: zone.kind === "shared-residence" ? "shared" : "private",
      ownerId: zone.ownerId,
    });
  await mutateVillageState((state) => {
    const currentVenue = state.venues.find((entry) => entry.id === venueId)!,
      current = resolveVenueZone(currentVenue, zoneId)!;
    const scene = row.state && typeof row.state === "object" ? (row.state as Record<string, unknown>) : {};
    if (Object.keys(scene).some((key) => !["condition", "items", "publicFacts", "features"].includes(key)))
      throw badRequest("That scene field cannot be edited here.");
    current.name = venueFieldText(row.name, current.name, MAX_VENUE_NAME_LENGTH).trim();
    current.description = venueFieldText(row.description, current.description, MAX_VENUE_DESCRIPTION_LENGTH).trim();
    if (!current.name || !current.description) throw badRequest("Give the zone a name and description.");
    current.state = {
      ...current.state,
      condition: venueFieldText(scene.condition, current.state.condition, MAX_VENUE_NOTE_LENGTH),
      items: venueStringList(scene.items, current.state.items),
      publicFacts: venueStringList(scene.publicFacts, current.state.publicFacts),
      features: venueFeatures(scene.features, current.state.features),
      updatedAt: new Date().toISOString(),
    };
  });
  return buildVillageSnapshot();
}

/** Keep a proposed Residence edit exact until the affected residents approve it aloud. */
export async function proposeResidenceSpaceEdit(venueId: string, value: unknown): Promise<VillageSnapshot> {
  const row = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const target: "shared" | "private" = row.target === "private" ? "private" : "shared";
  const ownerId = asTrimmedString(row.privateOwnerId ?? row.ownerId);
  if (row.privateSpaceId && row.zoneId && row.privateSpaceId !== row.zoneId)
    throw conflict("Conflicting private space targets.");
  const zoneId = asTrimmedString(row.privateSpaceId ?? row.zoneId);

  const { activeVenueSession } = await import("./venue-session.js");
  const session = await activeVenueSession();
  if (
    !session ||
    session.placeId !== venueId ||
    (zoneId && session.zoneId !== zoneId) ||
    (!zoneId &&
      (target === "shared"
        ? session.area !== "shared" && session.area !== "private"
        : session.area !== "private" || session.privateOwnerId !== ownerId))
  )
    throw conflict("Enter the space with its resident's invitation before proposing a change.");
  await mutateVillageState((state) => {
    const venue = state.venues.find((entry) => entry.id === venueId);
    if (!venue) throw notFound("That Venue is no longer here.");
    if (zoneId && ownerId && zoneId !== legacyZoneId(venue, "private", "residence", ownerId))
      throw conflict("Conflicting private space targets.");
    const current = zoneId
      ? resolveVenueZone(venue, zoneId)
      : target === "shared"
        ? venueSpaces(venue).find((space) => space.venueClass === "residence")
        : venue.privateSpaces?.find((space) => space.ownerId === ownerId);
    if (!current) throw notFound("That Residence space is no longer here.");
    if (zoneId) {
      const zone = resolveVenueZone(venue, zoneId)!;
      const grant = session.zoneGrants?.find((entry) => entry.zoneId === zoneId);
      if (zoneClosed(state, venue, zone) || (grant && !zoneControllerIds(venue, zone).includes(grant.controllerId)))
        throw conflict("This space's invitation is no longer valid.");
    }
    const requiredIds = zoneId
      ? zoneControllerIds(venue, resolveVenueZone(venue, zoneId)!)
      : target === "shared"
        ? venueResidentIds(venue)
        : [ownerId];
    if (!requiredIds.length) throw conflict("The space has no current resident who can approve this edit.");
    const scene =
      row.state && typeof row.state === "object" && !Array.isArray(row.state)
        ? (row.state as Record<string, unknown>)
        : {};
    const proposed = {
      ...current,
      description: venueFieldText(row.description, current.description, MAX_VENUE_DESCRIPTION_LENGTH).trim(),
      state: {
        ...current.state,
        condition: venueFieldText(scene.condition, current.state.condition, MAX_VENUE_NOTE_LENGTH),
        items: venueStringList(scene.items, current.state.items),
        publicFacts: venueStringList(scene.publicFacts, current.state.publicFacts),
        features: venueFeatures(scene.features, current.state.features),
      },
    };
    if (!proposed.description) throw badRequest("Describe the proposed space.");
    venue.editProposals = [
      ...(venue.editProposals ?? []).filter((proposal) => !proposal.declined),
      {
        id: randomVillageSeed(),
        target,
        zoneId: current.id,
        privateSpaceId: target === "private" ? current.id : undefined,
        ownerId: target === "private" ? ownerId : "",
        baseUpdatedAt: current.state.updatedAt,
        proposed,
        requiredIds,
        approvedIds: requiredIds.includes("player") ? ["player"] : [],
        declined: false,
        createdAt: new Date().toISOString(),
      },
    ].slice(-8);
  });
  return buildVillageSnapshot();
}

export async function applyResidenceEditApproval(
  venueId: string,
  proposalId: string,
  residentId: string,
  approved: boolean,
): Promise<void> {
  await mutateVillageState((state) => {
    const venue = state.venues.find((entry) => entry.id === venueId);
    const proposal = venue?.editProposals?.find((entry) => entry.id === proposalId);
    if (!venue || !proposal || proposal.declined || !proposal.requiredIds.includes(residentId)) return;
    const current = proposal.zoneId
      ? resolveVenueZone(venue, proposal.zoneId)
      : proposal.target === "shared"
        ? venueSpaces(venue).find((space) => space.venueClass === "residence")
        : venue.privateSpaces?.find((space) => space.ownerId === proposal.ownerId);
    const currentResidents = proposal.zoneId
      ? zoneControllerIds(venue, resolveVenueZone(venue, proposal.zoneId)!)
      : proposal.target === "shared"
        ? venueResidentIds(venue)
        : [proposal.ownerId];
    if (
      !current ||
      current.state.updatedAt !== proposal.baseUpdatedAt ||
      JSON.stringify([...currentResidents].sort()) !== JSON.stringify([...proposal.requiredIds].sort())
    ) {
      proposal.declined = true;
      return;
    }
    if (!approved) {
      proposal.declined = true;
      return;
    }
    proposal.approvedIds = [...new Set([...proposal.approvedIds, residentId])];
    if (!proposal.requiredIds.every((id) => proposal.approvedIds.includes(id))) return;
    const applied = {
      ...proposal.proposed,
      state: { ...proposal.proposed.state, updatedAt: new Date().toISOString() },
    };
    if (proposal.zoneId) {
      const zone = resolveVenueZone(venue, proposal.zoneId);
      if (!zone) return;
      zone.description = applied.description;
      zone.state = applied.state;
    } else if (proposal.target === "shared") {
      venue.spaces = venueSpaces(venue).map((space) =>
        space.venueClass === "residence" ? { ...applied, image: space.image } : space,
      );
      venue.description = applied.description;
      venue.state.condition = applied.state.condition;
      venue.state.furniture = applied.state.items;
      venue.state.publicFacts = applied.state.publicFacts;
      venue.state.features = applied.state.features;
      venue.state.updatedAt = applied.state.updatedAt;
    } else {
      venue.privateSpaces = (venue.privateSpaces ?? []).map((space) =>
        space.ownerId === proposal.ownerId ? { ...applied, image: space.image, ownerId: proposal.ownerId } : space,
      );
    }
    venue.editProposals = venue.editProposals?.filter((entry) => entry.id !== proposal.id);
  });
}

export async function deleteVillageVenue(venueId: string, confirmed: boolean): Promise<VillageSnapshot> {
  if (!confirmed) throw badRequest("Deleting a venue requires confirmation.");
  const dependencies = await previewVillageVenueDeletion(venueId);
  if (dependencies.residentCharacterIds.length || dependencies.playerHome)
    throw conflict("Move every resident, including yourself, before deleting this Residence.");
  if (dependencies.roomPresent) throw conflict("End the active Scene before deleting this venue.");
  if (dependencies.pendingMailCount) throw conflict("Resolve pending Venue decisions before deleting this Venue.");
  await mutateVillageState((state) => {
    const current = state.venues.find((venue) => venue.id === venueId);
    if (!current) throw notFound("That Venue no longer exists.");
    if (current.buildProjectId) throw conflict("A project-built venue requires an explicit future demolition project.");
    if (hasVenueClass(current, "residence") && venueAssignedCount(current) > 0)
      throw conflict("Move every resident before deleting this Residence.");
    if (
      state.venueMail.some(
        (entry) =>
          entry.venueId === venueId && (entry.status === "pending-player" || entry.status === "awaiting-villagers"),
      )
    )
      throw conflict("Resolve pending Venue decisions before deleting this Venue.");
    state.venues = state.venues.filter((venue) => venue.id !== venueId);
    keepAgendaPlaces(state);
    state.residences = state.residences.filter(
      (residence) => residence.venueId !== venueId && residence.proposedVenueId !== venueId,
    );
    for (const villager of state.villagers) {
      if (!villager.remap) continue;
      villager.remap.moves = villager.remap.moves.filter((move) => move.venueId !== venueId);
    }
  });
  return buildVillageSnapshot();
}

function residenceCharacterId(value: unknown): string {
  const characterId = asTrimmedString(value);
  if (characterId.length === 0) throw badRequest("A character id is required.");
  return characterId;
}

function residenceVenueId(value: unknown): string {
  const venueId = asTrimmedString(value);
  if (venueId.length === 0) throw badRequest("A venue id is required.");
  return venueId;
}

export async function proposeVillageResidence(
  characterValue: unknown,
  venueValue: unknown,
  requestedBy: "player" | "villager" = "player",
  sourceKey = "",
  privateZoneId = "",
): Promise<VillageSnapshot> {
  const characterId = residenceCharacterId(characterValue);
  const proposedVenueId = residenceVenueId(venueValue);
  await mutateVillageState((state) => {
    if (sourceKey && state.processedOpportunityIds.includes(sourceKey)) return;
    if (!state.villagers.some((villager) => villager.characterId === characterId)) {
      throw notFound("That villager is not in this village.");
    }
    const destination = state.venues.find((venue) => venue.id === proposedVenueId);
    if (!destination) throw notFound("That place is no longer in the village.");
    if (!hasVenueClass(destination, "residence")) throw badRequest("Choose a Residence for this move.");
    const current = state.residences.find((residence) => residence.characterId === characterId);
    const currentVenueId = state.venues.find((venue) => venueResidentIds(venue).includes(characterId))?.id ?? "";
    if (currentVenueId === proposedVenueId) throw badRequest("That villager already lives there.");
    if (current?.status === "moving" || current?.status === "pending")
      throw conflict("That villager already has a move request in progress.");
    const reserved = state.residences.filter(
      (entry) =>
        entry.characterId !== characterId && entry.proposedVenueId === proposedVenueId && entry.status === "moving",
    ).length;
    if (venueAssignedCount(destination) + reserved >= venueCapacity(destination))
      throw conflict("This Residence has no available bed.");
    assertResidencePrivateDestination(state, destination, characterId, privateZoneId);
    const next: VillageResidence = {
      proposedPrivateZoneId: privateZoneId,
      venueId: currentVenueId,
      characterId,
      status: "pending",
      proposedVenueId,
      requestedAt: new Date().toISOString(),
      requestedBy,
      villagerDecision: "pending",
    };
    const index = state.residences.findIndex((residence) => residence.characterId === characterId);
    if (index < 0) state.residences.push(next);
    else state.residences[index] = next;
    if (sourceKey) state.processedOpportunityIds = [...state.processedOpportunityIds, sourceKey].slice(-256);
  });
  return buildVillageSnapshot();
}

export async function approveVillageResidence(characterValue: unknown): Promise<VillageSnapshot> {
  return decideVillageResidence(characterValue, true, "player");
}

export async function decideVillageResidence(
  characterValue: unknown,
  approved: boolean,
  actor: "player" | "villager",
): Promise<VillageSnapshot> {
  const characterId = residenceCharacterId(characterValue);
  await mutateVillageState((state) => {
    const residence = state.residences.find((entry) => entry.characterId === characterId);
    if (!residence || residence.status !== "pending" || residence.proposedVenueId.length === 0) {
      throw badRequest("That villager has no pending residence change.");
    }
    if (residence.requestedBy === actor) throw badRequest("The requester cannot approve their own move request.");
    if (
      residence.villagerDecision === "approved" &&
      state.venueMail.some(
        (entry) =>
          entry.kind === "villager-move" &&
          entry.movingCharacterId === characterId &&
          entry.status === "awaiting-villagers",
      )
    )
      throw conflict("The household is already considering this move.");
    if (!approved) {
      if (actor === "villager") residence.villagerDecision = "denied";
      state.residences = state.residences.filter((entry) => entry.characterId !== characterId);
      return;
    }
    const nextVenue = state.venues.find((venue) => venue.id === residence.proposedVenueId);
    if (!nextVenue) throw notFound("The proposed residence is no longer in the village.");
    if (!hasVenueClass(nextVenue, "residence")) throw conflict("The destination is no longer a Residence.");
    const reserved = state.residences.filter(
      (entry) =>
        entry.characterId !== characterId && entry.proposedVenueId === nextVenue.id && entry.status === "moving",
    ).length;
    if (venueAssignedCount(nextVenue) + reserved >= venueCapacity(nextVenue))
      throw conflict("This Residence has no available bed.");
    assertResidencePrivateDestination(state, nextVenue, characterId, residence.proposedPrivateZoneId);
    const now = Date.now();
    if (venueResidentIds(nextVenue).some((id) => id !== characterId)) {
      residence.villagerDecision = "approved";
      queueSharedMoveConsent(state, residence, new Date(now));
      return;
    }
    residence.status = "moving";
    residence.villagerDecision = "approved";
    residence.approvedAt = new Date(now).toISOString();
    residence.completesAt = new Date(now + 24 * 60 * 60_000).toISOString();
  });
  return buildVillageSnapshot();
}

/** The clock and debug action share the exact same atomic transition. */
export async function completeVillageResidence(
  characterValue: unknown,
  force = false,
  now = new Date(),
  queueAdaptation = true,
): Promise<VillageSnapshot> {
  const characterId = residenceCharacterId(characterValue);
  let moved = false;
  await mutateVillageState((state) => {
    const residence = state.residences.find((entry) => entry.characterId === characterId);
    if (!residence || residence.status !== "moving") throw badRequest("That villager is not moving.");
    if (!force && Date.parse(residence.completesAt ?? "") > now.getTime()) return;
    const destination = state.venues.find((venue) => venue.id === residence.proposedVenueId);
    if (
      !destination ||
      !hasVenueClass(destination, "residence") ||
      venueAssignedCount(destination) >= venueCapacity(destination)
    )
      throw conflict("The new venue is no longer available for this move.");
    assertResidencePrivateDestination(state, destination, characterId, residence.proposedPrivateZoneId);
    const old = state.venues.find((venue) => venueResidentIds(venue).includes(characterId));
    destination.layoutVersion = 1;
    destination.zones ??= venueZones(destination);
    if (old) {
      old.zones ??= venueZones(old);
      old.layoutVersion = 1;
    }
    const archivedAt = new Date(now).toISOString();
    const oldPrivate = old?.privateSpaces?.find((space) => space.ownerId === characterId);
    const needsAdaptation = Boolean(
      oldPrivate &&
      (oldPrivate.state.items.length ||
        oldPrivate.state.features.length ||
        oldPrivate.description !== `A private space for this resident at ${old?.name}.`),
    );
    if (old) {
      if (oldPrivate) {
        old.archivedPrivateSpaces = [
          ...(old.archivedPrivateSpaces ?? []),
          { ownerId: characterId, archivedAt, space: structuredClone(oldPrivate) },
        ].slice(-32);
        old.privateSpaces = (old.privateSpaces ?? []).filter((space) => space.ownerId !== characterId);
        if (old.layoutVersion === 1) {
          const zone = old.zones?.find((zone) => zone.id === oldPrivate.id);
          if (zone) {
            zone.ownerId = undefined;
            zone.seen = false;
            zone.state.publicFacts = [];
            zone.state.traces = [];
            zone.preparation = undefined;
            zone.adaptationPending = false;
            zone.adaptationSourceArchiveAt = "";
            zone.image = null;
            zone.description = zone.purpose || "Vacant residential Private Space.";
          }
          old.playerInvitations = old.playerInvitations?.filter((invitation) => invitation.zoneId !== oldPrivate.id);
          old.editProposals = old.editProposals?.filter((proposal) => proposal.zoneId !== oldPrivate.id);
        }
      }
      old.residentIds = venueResidentIds(old).filter((id) => id !== characterId);
      old.playerSeenPrivateIds = (old.playerSeenPrivateIds ?? []).filter((id) => id !== characterId);
      old.occupancy.residentCharacterId = old.residentIds[0] ?? null;
    }
    destination.residentIds = [...venueResidentIds(destination), characterId];
    destination.playerSeenPrivateIds = (destination.playerSeenPrivateIds ?? []).filter((id) => id !== characterId);
    if (destination.layoutVersion === 1 && residence.proposedPrivateZoneId) {
      const zone = destination.zones!.find((zone) => zone.id === residence.proposedPrivateZoneId)!;
      zone.ownerId = characterId;
      zone.seen = false;
      zone.preparation = needsAdaptation ? undefined : { status: "pending" };
      zone.adaptationPending = needsAdaptation;
      zone.adaptationSourceArchiveAt = needsAdaptation ? archivedAt : "";
    }
    destination.occupancy.residentCharacterId = destination.residentIds[0] ?? null;
    residence.venueId = destination.id;
    residence.proposedVenueId = "";
    residence.status = "current";
    residence.completesAt = "";
    keepAgendaPlaces(state);
    moved = true;
  });
  if (moved && queueAdaptation) {
    await retryResidencePrivateSpaceAdaptation(characterId);
    outsideVenueOperation(() => {
      void preparePrivateSpaces().catch(() => {});
    });
  }
  return buildVillageSnapshot(now);
}

function adaptationRevision(venue: VillageVenue, characterId: string): string {
  const room = venue.privateSpaces?.find((space) => space.ownerId === characterId);
  return backgroundRevision([
    venue.id,
    venue.name,
    venue.form,
    room?.description,
    room?.state.items,
    room?.state.features,
    room?.adaptationSourceArchiveAt,
  ]);
}
/** One bounded System call moves only portable personal details from the archived room. */
export async function retryResidencePrivateSpaceAdaptation(characterValue: unknown): Promise<VillageSnapshot> {
  const characterId = residenceCharacterId(characterValue);
  const village = await readVillageState();
  const destination = village.venues.find((venue) => venueResidentIds(venue).includes(characterId));
  const room = destination?.privateSpaces?.find((space) => space.ownerId === characterId);
  if (!destination || !room || !room.adaptationPending) return buildVillageSnapshot();
  const archive = village.venues
    .flatMap((venue) => venue.archivedPrivateSpaces ?? [])
    .find((entry) => entry.ownerId === characterId && entry.archivedAt === room.adaptationSourceArchiveAt);
  if (!archive) return buildVillageSnapshot();
  const card = village.villagers.find((person) => person.characterId === characterId)?.cardSnapshot;
  const lore = await readVillageLore(
    village.selectedLorebookIds,
    [village.setting, destination.form, card?.name, card?.personality].filter(Boolean).join("\n"),
    undefined,
    village.loreTokenBudget,
  );
  await queueBackgroundJob({
    kind: "adaptation",
    subjectId: characterId,
    seed: village.seed,
    revision: adaptationRevision(destination, characterId),
    finite: true,
    label: "Adapt " + destination.name + "'s Private Space",
    input: {
      characterId,
      destination,
      archive,
      card,
      lore,
      roomRevision: adaptationRevision(destination, characterId),
      capturedAt: village.villagers.find((resident) => resident.characterId === characterId)?.cardSnapshot.capturedAt,
    },
  });
  return buildVillageSnapshot();
}
registerBackgroundHandler("adaptation", {
  async generate(input) {
    const { characterId, destination, archive, card, lore } = input;
    const model = await villagesLanguageModels().resolveForRequest({
      connectionId: await villagesConnectionIdFor("system"),
    });
    const messages = [
      {
        role: "system" as const,
        content: `Choose portable personal elements from the archived Private Space and adapt its description to the new Residence form. Never copy shared furnishings or invent possessions. Return JSON only: {"description":"brief room description","items":["exact portable item from input"],"featureIds":["exact portable feature id from input"]}. Keep the result grounded and concise.`,
      },
      {
        role: "user" as const,
        content: JSON.stringify({
          resident: characterId,
          personality: card?.personality,
          lore,
          destination: destination.name,
          destinationForm: destination.form,
          archivedDescription: archive.space.description.slice(0, 500),
          archivedItems: archive.space.state.items.slice(0, 24),
          archivedFeatures: archive.space.state.features
            .map((feature) => ({ id: feature.id, text: feature.text }))
            .slice(0, 5),
        }),
      },
    ];
    const fitted = model.fitContext(messages, { maxTokens: Math.min(model.maxOutputTokens ?? 1000, 1000) });
    const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? 1000, {
      temperature: 0.4,
      debugMode: false,
    });
    const answer = extractJsonObject(completion.content ?? "");
    const description = boundText(answer?.description, MAX_VENUE_DESCRIPTION_LENGTH).trim();
    if (!description) throw new Error("Private space adaptation returned no description.");
    const selectedItems: unknown[] = Array.isArray(answer?.items) ? answer.items : [];
    const items = archive.space.state.items.filter((item) => selectedItems.includes(item));
    const featureIds = Array.isArray(answer?.featureIds) ? answer.featureIds : [];
    const features = archive.space.state.features.filter((feature) => featureIds.includes(feature.id));

    return { description, items, features };
  },
  valid: (state, input) =>
    state.villagers.some(
      (resident) => resident.characterId === input.characterId && resident.cardSnapshot.capturedAt === input.capturedAt,
    ) &&
    state.venues
      .find(
        (venue) =>
          venue.id === input.destination.id && adaptationRevision(venue, input.characterId) === input.roomRevision,
      )
      ?.privateSpaces?.some(
        (space) =>
          space.ownerId === input.characterId &&
          space.adaptationPending &&
          space.adaptationSourceArchiveAt === input.archive.archivedAt,
      ) === true,
  apply(state, input, result) {
    const { characterId, destination, archive } = input;
    const { description, items, features } = result;

    const currentVenue = state.venues.find((venue) => venue.id === destination.id);
    const current = currentVenue?.privateSpaces?.find((space) => space.ownerId === characterId);
    if (!current?.adaptationPending || current.adaptationSourceArchiveAt !== archive.archivedAt) return;
    current.description = description;
    current.state.items = currentVenue?.layoutVersion === 1 ? [...new Set([...current.state.items, ...items])] : items;
    current.state.features =
      currentVenue?.layoutVersion === 1
        ? [...new Map([...current.state.features, ...features].map((feature) => [feature.id, feature])).values()]
        : features;
    current.state.updatedAt = new Date().toISOString();
    current.adaptationPending = false;
  },
});

// ── Places: the village's one list ───────────────────────────────────────────
// A place is somewhere the player or a villager can BE, whether that is a shop
// on the map or the house they sleep in. Both are written through
// `setVillageVenues`; what is here is the reading of a request body, which
// refuses rather than repairs because the player typed it and can still see it.

/** A place as it comes out of a request body, once it has been checked over. */
type ParsedPlace = {
  layoutVersion?: 1;
  zones?: VillageVenue["zones"];
  privateSpaces?: VillageVenue["privateSpaces"];
  imageContext?: VillageVenue["imageContext"];
  id: string;
  name: string;
  form: string;
  classes: VillageVenueClass[];
  spaces: NonNullable<VillageVenue["spaces"]>;
  residenceCapacity: number;
  residentIds: string[];
  improvements: NonNullable<VillageVenue["improvements"]>;
  description: string;
  category: string;
  presentation: VillageVenue["presentation"];
  occupancy: VillageVenue["occupancy"];
  capabilities: string[];
  state: VillageVenue["state"];
};

/** Where a place stands, or a refusal — see `parsePlace` for why the two are exclusive. */
function readPlacePosition(record: Record<string, unknown>): { x: number | null; y: number | null } {
  const x = record.x ?? null;
  const y = record.y ?? null;
  // Absent on BOTH counts is "not on the map yet" and is ordinary. Absent on one
  // is half a position, which is not a position: silently dropping the half that
  // arrived would move the pin to the wrong street, and inventing the other half
  // would be worse.
  if (x === null && y === null) return { x: null, y: null };
  const placed = typeof x === "number" && typeof y === "number" && x >= 0 && x <= 1 && y >= 0 && y <= 1;
  if (!placed) throw badRequest("A place's spot on the map is two fractions between 0 and 1.");
  return { x: x as number, y: y as number };
}

/**
 * Read one place out of a request body.
 *
 * Refuses rather than repairs, unlike the store's own `coerceVenue`: this is
 * input the player just typed and can still see, so quietly nudging a pin onto
 * the map or dropping an occupant would hide the very mistake they need to fix.
 * The store is the other way round for the same reason in reverse — a document
 * that has been sitting on disk is repaired so a hand-edit cannot cost the
 * player a village.
 *
 * A place that is somebody's house does not need a name, and a place that is not
 * does. That is not a leniency: the village genuinely has no name for a house.
 * It knows "Bram's house", which is a sentence about Bram, not a name for a
 * building — nobody stands in the street and calls it that. Names exist on this
 * list for one reason, which is that the model is shown them and told to answer
 * with the number of the one it means, and the houses are not in that list. So
 * demanding a name for one would be demanding a fact nothing reads.
 */
function foundingImage(value: unknown): VillageVenueImage | null {
  if (value === null || value === undefined) return null;
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw badRequest("A founding image must come from the gallery.");
  const row = value as Record<string, unknown>;
  const ref = asTrimmedString(row.ref);
  const id = asTrimmedString(row.id);
  const url = asTrimmedString(row.url);
  if (
    !isGlobalGalleryRef(ref) ||
    id !== ref.slice("global-gallery:".length) ||
    !url ||
    url.length > MAX_VENUE_IMAGE_URL_LENGTH
  ) {
    throw badRequest("A founding image needs a valid gallery reference.");
  }
  return { ref, id, url };
}

function foundingSpace(
  value: unknown,
  venueClass: VillageVenueClass,
  description: string,
): NonNullable<VillageVenue["spaces"]>[number] {
  const row = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const spaceDescription = boundText(row.description, MAX_VENUE_DESCRIPTION_LENGTH).trim();
  if (!spaceDescription) throw badRequest("Describe the interior before founding the village.");
  return {
    ...defaultVenueSpace(venueClass, description),
    description: spaceDescription,
    image: foundingImage(row.image),
  };
}

export function parsePlace(value: unknown, founding = false): ParsedPlace {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw badRequest("Every place needs a name.");
  }
  const record = value as Record<string, unknown>;
  const occupancyRecord =
    record.occupancy && typeof record.occupancy === "object" && !Array.isArray(record.occupancy)
      ? (record.occupancy as Record<string, unknown>)
      : {};
  if (occupancyRecord.playerHome !== undefined && typeof occupancyRecord.playerHome !== "boolean") {
    throw badRequest("A place is either your home or a villager's.");
  }
  if (
    occupancyRecord.residentCharacterId !== undefined &&
    occupancyRecord.residentCharacterId !== null &&
    typeof occupancyRecord.residentCharacterId !== "string"
  ) {
    throw badRequest("A place's resident must be a character.");
  }
  const playerHome = occupancyRecord.playerHome === true;
  const characterId =
    typeof occupancyRecord.residentCharacterId === "string" ? occupancyRecord.residentCharacterId.trim() : "";
  if (
    occupancyRecord.homeKind !== undefined &&
    occupancyRecord.homeKind !== null &&
    !isHomeBuildingKind(occupancyRecord.homeKind)
  ) {
    throw badRequest("A place has to be a building this village has, or no building at all.");
  }
  const homeKind = isHomeBuildingKind(occupancyRecord.homeKind) ? occupancyRecord.homeKind : null;
  if (record.name !== undefined && typeof record.name !== "string") {
    throw badRequest("A place name must be text.");
  }
  const name = typeof record.name === "string" ? record.name.trim() : "";
  // A house can leave this blank; anything a villager could be SENT to cannot,
  // because the name is the only thing the translation list has to say about it.
  if (name.length === 0) throw badRequest("Every Venue needs a name.");
  if (name.length > MAX_VENUE_NAME_LENGTH) {
    throw badRequest(`A place name can be at most ${MAX_VENUE_NAME_LENGTH} characters.`);
  }
  const description = typeof record.description === "string" ? record.description.trim() : "";
  const form = boundText(record.form, MAX_VENUE_NOTE_LENGTH).trim();
  if (founding && !form) throw badRequest("Describe what each venue actually is in Form before founding.");
  if (founding && !description) throw badRequest("Describe the exterior of each venue before founding.");
  const classes: VillageVenueClass[] = validVenueClasses(record.classes)
    ? record.classes
    : playerHome || characterId
      ? ["residence"]
      : record.category === "public-center"
        ? ["gathering"]
        : ["other"];
  const capacity =
    Number.isInteger(record.residenceCapacity) &&
    Number(record.residenceCapacity) >= 1 &&
    Number(record.residenceCapacity) <= 4
      ? Number(record.residenceCapacity)
      : 1;
  if (description.length > MAX_VENUE_DESCRIPTION_LENGTH) throw badRequest("A venue description is too long.");
  const presentationRecord =
    record.presentation && typeof record.presentation === "object" && !Array.isArray(record.presentation)
      ? (record.presentation as Record<string, unknown>)
      : {};
  const { x, y } = readPlacePosition(presentationRecord);
  // The player's home is their own. Letting a villager be recorded against it
  // would make two different parts of the tab disagree about who lives there.
  if (playerHome && characterId.length > 0) {
    throw badRequest("Your own home cannot also belong to a villager.");
  }
  if (founding && record.layoutVersion !== 1) throw badRequest("Choose the venue layout before founding.");
  const explicitZones =
    record.layoutVersion === 1 && founding
      ? readBaseVenueLayout(record, classes, playerHome ? "player" : characterId, foundingImage)
      : undefined;
  return {
    layoutVersion: record.layoutVersion === 1 ? 1 : undefined,
    zones: explicitZones ?? (founding ? readCreationPrivateZones(record.privateSpaces, classes) : undefined),
    privateSpaces:
      !explicitZones && founding && playerHome
        ? [
            {
              ...defaultVenueSpace(
                "residence",
                boundText(
                  (Array.isArray(record.privateSpaces)
                    ? record.privateSpaces.find((room) => room.ownerId === "player")
                    : {}
                  )?.description,
                  1000,
                ) || "Your personal space.",
              ),
              id: "private:player",
              ownerId: "player",
              image: foundingImage(
                (Array.isArray(record.privateSpaces)
                  ? record.privateSpaces.find((room) => room.ownerId === "player")
                  : {}
                )?.image,
              ),
            },
          ]
        : undefined,
    imageContext: readVenueImageContext(record.imageContext),
    id: asTrimmedString(record.id) || randomVillageSeed(),
    name,
    form,
    classes,
    spaces: explicitZones
      ? explicitZones.filter((zone) => ["public", "shared-residence"].includes(zone.kind))
      : classes.map((venueClass) => {
          const posted = Array.isArray(record.spaces)
            ? record.spaces.find(
                (entry) =>
                  entry && typeof entry === "object" && (entry as Record<string, unknown>).venueClass === venueClass,
              )
            : null;
          const scene = posted && typeof posted === "object" ? (posted as Record<string, unknown>) : {};
          return founding
            ? foundingSpace(scene, venueClass, description)
            : defaultVenueSpace(venueClass, boundText(scene.description, MAX_VENUE_DESCRIPTION_LENGTH) || description);
        }),
    residenceCapacity: founding && record.layoutVersion === 1 ? 1 : capacity,
    residentIds: characterId ? [characterId] : [],
    improvements: [null, null],
    description,
    category: typeof record.category === "string" ? record.category.trim() : "",
    presentation: { image: founding ? foundingImage(presentationRecord.image) : null, x, y },
    occupancy: {
      playerHome,
      residentCharacterId: characterId.length > 0 ? characterId : null,
      homeKind,
    },
    capabilities: [],
    state: { condition: "", upgrades: [], furniture: [], publicFacts: [], updatedAt: "" },
  };
}

/**
 * Read a whole list of places, enforcing the rules no single place can check for
 * itself: at most one of them is the player's, every occupant is somebody who
 * lives here, and a villager sleeps in one place at a time.
 *
 * `residents` is who is allowed to hold a home — the village's villagers when
 * the map is being edited, or the cards being moved in when the village is being
 * founded, since neither is written to the record yet at that point.
 *
 * `requiredHomes` is the founding flow's own rule, and it counts HOMES rather
 * than places: a village is founded with four houses on its map, and the venues
 * the model proposes afterwards are not part of that count. Null means "accept
 * the map as it now stands", which is what a second run through the wizard over
 * a village that already exists passes. A house counts whether or not anybody
 * has moved into it yet — see `isHousePlace` — because the wizard's four pins are
 * four buildings on a picture long before they are four people.
 */
function parsePlaces(value: unknown, residents: ReadonlySet<string>, founding: boolean): ParsedPlace[] {
  if (!Array.isArray(value)) throw badRequest("The places must be a list.");
  if (value.length > MAX_PLACES) throw badRequest(`A village holds at most ${MAX_PLACES} places.`);
  const places = value.map((entry) => parsePlace(entry, founding));
  const homes = places.filter((place) => isHousePlace(place));
  const playerHomes = places.filter((place) => place.occupancy.playerHome).length;
  if (playerHomes > 1) throw badRequest("Only one place can be your home.");
  if (founding && playerHomes !== 1) throw badRequest("One of the homes has to be yours.");
  const seenIds = new Set<string>();
  const seenOccupants = new Set<string>();
  const seenNames = new Set<string>();
  for (const place of places) {
    if (seenIds.has(place.id)) throw badRequest("Two places cannot share an id.");
    seenIds.add(place.id);
    const nameKey = place.name.toLowerCase();
    if (seenNames.has(nameKey)) throw badRequest("Every Venue needs a distinct name.");
    seenNames.add(nameKey);
    if ((place.occupancy.playerHome || place.occupancy.residentCharacterId) && !place.classes.includes("residence"))
      throw badRequest("An assigned home must have the Residence Class.");
    if (place.zones?.some((zone) => zone.controllerIds?.some((id) => id !== "player" && !residents.has(id))))
      throw badRequest("Choose current villagers as Private Space controllers.");
    if (place.occupancy.residentCharacterId === null) continue;
    if (!residents.has(place.occupancy.residentCharacterId)) {
      throw badRequest("Every villager's home has to belong to someone who lives here.");
    }
    if (seenOccupants.has(place.occupancy.residentCharacterId))
      throw badRequest("A villager can only live in one place.");
    seenOccupants.add(place.occupancy.residentCharacterId);
  }
  if (founding) {
    if (places.some((place) => !place.description.trim())) throw badRequest("Describe every founding venue.");
    if (places.some((place) => place.spaces?.some((space) => !space.description.trim())))
      throw badRequest("Describe every founding venue scene.");
    if (homes.some((place) => place.presentation.x === null || place.presentation.y === null))
      throw badRequest("Every founding home needs a spot on the map.");
    const assignedVillagers = places.filter((place) => place.occupancy.residentCharacterId !== null);
    if (assignedVillagers.length < SETUP_MIN_VILLAGER_COUNT || assignedVillagers.length > SETUP_MAX_VILLAGER_COUNT) {
      throw badRequest(
        `Founding needs between ${SETUP_MIN_VILLAGER_COUNT} and ${SETUP_MAX_VILLAGER_COUNT} villager homes.`,
      );
    }
    if (homes.length !== assignedVillagers.length + 1) {
      throw badRequest("Founding needs exactly one player home plus one home for each initial villager.");
    }
    if (assignedVillagers.some((place) => place.occupancy.playerHome)) {
      throw badRequest("A villager home cannot also be the player's home.");
    }
    const publicCenters = places.filter(
      (place) => !isHousePlace(place) && place.category.trim().toLowerCase() === "public-center",
    );
    if (publicCenters.length !== 1) {
      throw badRequest("Founding needs exactly one public center marked public-center.");
    }
    if (publicCenters[0]?.name.length === 0) {
      throw badRequest("The founding public center needs a name.");
    }
    if (publicCenters[0]?.presentation.x === null || publicCenters[0]?.presentation.y === null)
      throw badRequest("Place the public center on the map.");
    if (places.filter((place) => !isHousePlace(place)).length !== 1)
      throw badRequest("Founding needs exactly one public venue.");
  }
  return places;
}

// ── Founding the village ─────────────────────────────────────────────────────

/**
 * Found the village in one go: its name, what it is like, who the player is,
 * and the places placed on the map.
 *
 * Everything is checked BEFORE anything is written, and the record is written
 * exactly once. A setup that failed halfway would leave a village claiming to
 * be founded with no homes, or homes with nobody in them, and the player would
 * have no way to tell which half had happened.
 *
 * Re-running this is safe and is not the same as `resetVillage`: villagers are
 * only ever added, so a player who runs setup again to redraw their map keeps
 * everyone who already lives here.
 */
export function assertFoundingScenarioLocked(
  village: Pick<VillageState, "foundingReason" | "foundingDetails" | "foundingGuidance" | "scenarioImprint">,
  submitted: { foundingReason: string; foundingDetails: string; foundingGuidance: string; scenarioImprint?: unknown },
): void {
  if (
    submitted.foundingReason !== village.foundingReason ||
    submitted.foundingDetails !== village.foundingDetails ||
    submitted.foundingGuidance !== village.foundingGuidance ||
    (submitted.scenarioImprint !== undefined &&
      JSON.stringify(submitted.scenarioImprint) !== JSON.stringify(village.scenarioImprint))
  )
    throw conflict("The founding Scenario is locked. Start a new village to choose another one.");
}

/** Existing villages keep their locked beginning, including older records without starting circumstances. */
export function validateFirstDayDescription(description: string, founding: boolean): void {
  if (founding && !description.trim()) throw badRequest("Describe what brings you and the others together here.");
}

/** Bind a new wizard's selected roster to its assigned homes before generation or writes. */
export function validateFoundingRoster(
  value: unknown,
  assigned: ReadonlySet<string>,
  available: ReadonlySet<string>,
): void {
  if (
    !Array.isArray(value) ||
    value.length < 1 ||
    value.length > 3 ||
    value.some((id) => typeof id !== "string" || !available.has(id)) ||
    new Set(value).size !== value.length
  )
    throw badRequest("Choose one to three available founding villagers.");
  if (assigned.size !== value.length || value.some((id) => !assigned.has(id)))
    throw badRequest("Assign every villager chosen in Step 2 to one Residence.");
}

export async function runVillageSetup(input: {
  foundingCharacterIds?: unknown;
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
  const privateControllers = places.flatMap((place) => place.zones?.flatMap((zone) => zone.controllerIds ?? []) ?? []);
  const assignedResidents = new Set(
    places.flatMap((place) => (place.occupancy.residentCharacterId ? [place.occupancy.residentCharacterId] : [])),
  );
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
                      place.spaces?.find((entry) => entry.venueClass === "residence")?.description ?? space.description,
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
  const keptPlaces = founding ? [] : village.venues.filter((place) => !isHousePlace(place) && !postedIds.has(place.id));
  const venues: VillageVenue[] = [...postedPlaces, ...keptPlaces];
  if (
    !founding &&
    village.venues.some((old) => {
      const next = venues.find((venue) => venue.id === old.id);
      return !next || next.presentation.x !== old.presentation.x || next.presentation.y !== old.presentation.y;
    })
  )
    throw conflict("Move map pins while replacing the map in Village Settings.");
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
      };
    // Only a village with nowhere to send anybody needs places invented; a
    // second run must not throw away places the player has since renamed or
    // added by hand. The houses do not count — see `remapVenues`.
    for (const card of initialResidents) {
      if (state.villagers.some((villager) => villager.characterId === card.id)) continue;
      state.villagers.push({
        characterId: card.id,
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

let foundingWork: Promise<void> | null = null;

/** Durable, idempotent first-founding work. The read route restarts it after a process exit. */
export function prepareFoundedVillage(): Promise<void> {
  if (foundingWork) return foundingWork;
  foundingWork = (async () => {
    const initial = await readVillageState();
    if (initial.foundingPreparation?.status !== "pending") return;
    if (!initial.foundingPreparation.venueDetailsSeeded) {
      try {
        const details = await seedFoundingVenueDetails(initial);
        await mutateVillageState((state) => {
          if (state.foundingPreparation?.status !== "pending" || state.foundingPreparation.venueDetailsSeeded) return;
          for (const venue of state.venues) {
            const seed = details[venue.id];
            if (!seed) continue;
            const space = venue.spaces?.[0] ?? venue.zones?.find((zone) => zone.kind === "exterior");
            if (!space) continue;
            const features = seed.features.map((text) => ({
              id: randomVillageSeed(),
              text,
              sourceCharacterId: "",
              locked: false,
              updatedAt: "",
            }));
            space.state = {
              ...space.state,
              condition: seed.condition,
              items: seed.items,
              publicFacts: seed.publicFacts,
              features,
            };
            venue.state = {
              ...venue.state,
              condition: seed.condition,
              furniture: seed.items,
              publicFacts: seed.publicFacts,
              features,
            };
          }
          state.foundingPreparation.venueDetailsSeeded = true;
        });
      } catch (error) {
        villagesLogger().warn("[villages] initial venue details unavailable: %s", String(error));
        await mutateVillageState((state) => {
          if (state.foundingPreparation?.status === "pending") state.foundingPreparation.venueDetailsSeeded = true;
        });
      }
    }
    try {
      await preparePrivateSpaces();
      const prepared = await readVillageState();
      if (
        prepared.venues.some((venue) =>
          venue.zones?.some((zone) => zone.preparation && zone.preparation.status !== "ready"),
        )
      )
        throw new Error("Private spaces need preparation. Retry to continue.");
    } catch {
      await mutateVillageState((state) => {
        if (state.foundingPreparation) {
          state.foundingPreparation.status = "failed";
          state.foundingPreparation.error = "Private spaces need preparation. Retry to continue.";
        }
      });
      return;
    }
    for (const villager of initial.villagers) {
      const latest = await readVillageState();
      if (latest.foundingPreparation?.status !== "pending") return;
      if (latest.foundingPreparation.completedIds.includes(villager.characterId)) continue;
      const adopted = latest.villagers.find((resident) => resident.characterId === villager.characterId)?.agenda;
      if (adopted && !adopted.personalizationPending) {
        await mutateVillageState((state) => {
          const marker = state.foundingPreparation;
          if (marker?.status === "pending" && !marker.completedIds.includes(villager.characterId))
            marker.completedIds.push(villager.characterId);
        });
        continue;
      }
      await queueVillagerAgenda(villager.characterId, true);
      await settleBackgroundWork();
      const saved = await readVillageState();
      const resident = saved.villagers.find((entry) => entry.characterId === villager.characterId);
      if (
        !resident?.agenda?.generatedAt ||
        resident.agenda.personalizationPending ||
        (await backgroundStatus("agenda", villager.characterId)) !== "completed"
      ) {
        await mutateVillageState((state) => {
          if (state.foundingPreparation) {
            state.foundingPreparation.status = "failed";
            state.foundingPreparation.error =
              "Routine preparation stopped. Saved responses are retained; retry deliberately.";
          }
        });
        return;
      }
      await mutateVillageState((state) => {
        const marker = state.foundingPreparation;
        if (marker?.status === "pending" && !marker.completedIds.includes(villager.characterId))
          marker.completedIds.push(villager.characterId);
      });
    }
    await mutateVillageState((state) => {
      if (state.foundingPreparation?.status === "pending") {
        state.foundingPreparation.status = "ready";
        state.foundingPreparation.currentId = "";
        state.foundingPreparation.stage = undefined;
      }
    });
  })()
    .catch(async (error) => {
      villagesLogger().warn("[villages] founding preparation stopped: %s", String(error));
      try {
        await mutateVillageState((state) => {
          if (state.foundingPreparation?.status !== "pending") return;
          state.foundingPreparation.status = "failed";
          state.foundingPreparation.error = boundText(error instanceof Error ? error.message : String(error), 300);
        });
      } catch (writeError) {
        villagesLogger().warn("[villages] founding preparation failure could not be recorded: %s", String(writeError));
      }
    })
    .finally(() => {
      foundingWork = null;
    });
  return foundingWork;
}

export async function retryFoundedVillagePreparation(): Promise<VillageSnapshot> {
  // Called only by POST /setup/preparation/retry after the player presses Retry.
  // This explicit action is the authorization; discovery and clock reconciliation never call it.
  const requested = await readVillageState();
  if (requested.foundingPreparation?.status !== "failed") return buildVillageSnapshot();
  await mutateVillageState((state) => {
    const marker = state.foundingPreparation;
    if (!marker || marker.status !== "failed") return;
    for (const venue of state.venues)
      for (const zone of venue.zones ?? [])
        if (zone.preparation?.status === "failed") zone.preparation = { status: "pending" };
    marker.status = "pending";
    marker.error = "";
    marker.attempt = 0;
    marker.stage = undefined;
  });
  const unfinished = requested.villagers
    .filter((resident) => !requested.foundingPreparation!.completedIds.includes(resident.characterId))
    .map((resident) => resident.characterId);
  for (const job of await backgroundWorkSummaries()) {
    if (
      job.kind === "agenda" &&
      unfinished.includes(job.subjectId) &&
      ["failed", "interrupted", "paused"].includes(job.status)
    )
      await retryBackgroundJob(job.id, job.attempt, randomVillageSeed());
  }
  queueMicrotask(() => {
    void prepareFoundedVillage();
  });
  return buildVillageSnapshot();
}

export async function foundingPreparationSnapshot(): Promise<VillageSnapshot> {
  const state = await readVillageState();
  if (state.foundingPreparation?.status === "pending")
    queueMicrotask(() => {
      void prepareFoundedVillage();
    });
  return buildVillageSnapshot();
}

export async function assertFoundedVillageReady(): Promise<void> {
  const marker = (await readVillageState()).foundingPreparation;
  if (marker && marker.status !== "ready")
    throw conflict("The village is still preparing. Retry any failed preparation before entering.");
}

/**
 * Put the village back to how it was before it was founded.
 *
 * This is the destructive half of the pair the General settings panel offers,
 * and it is deliberately total: homes, villagers, their conversations, the
 * places, the notices, the narration style, the player's own details and the
 * uploaded map all go, and the clock starts over from the founding day. A
 * "start over" that quietly kept some of it would be worse than not offering it.
 */
export async function resetVillage(): Promise<VillageSnapshot> {
  await mutateVillageState((state) => {
    Object.assign(state, defaultVillageState());
  });
  return buildVillageSnapshot();
}

/** Replace the background and its complete pin layout in one village write. */
export async function replaceVillageTownMap(value: unknown): Promise<VillageSnapshot> {
  const body = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const submitted = await readTownMapSubmission(body.image, body.view);
  if (typeof body.expectedMapSetAt !== "string") throw badRequest("Reload the village map before replacing it.");
  if (!Array.isArray(body.placements)) throw badRequest("Review every venue pin before saving the map.");
  const positions = new Map<
    string,
    { x: number | null; y: number | null; fromX: number | null; fromY: number | null }
  >();
  const coordinate = (value: unknown): number | null => {
    if (value === null) return null;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1)
      throw badRequest("Map pin coordinates must be between 0 and 1.");
    return value;
  };
  for (const row of body.placements) {
    if (!row || typeof row !== "object" || Array.isArray(row)) throw badRequest("A venue pin is invalid.");
    const item = row as Record<string, unknown>;
    const id = asTrimmedString(item.venueId);
    if (!id || positions.has(id)) throw badRequest("Every venue must have one distinct pin entry.");
    const x = coordinate(item.x);
    const y = coordinate(item.y);
    const fromX = coordinate(item.fromX);
    const fromY = coordinate(item.fromY);
    if ((x === null) !== (y === null) || (fromX === null) !== (fromY === null))
      throw badRequest("A venue pin needs both coordinates or neither.");
    positions.set(id, { x, y, fromX, fromY });
  }
  await mutateVillageState((state) => {
    if (!isVillageFounded(state)) throw conflict("Found the village before replacing its map.");
    if (state.townMapImageSetAt !== body.expectedMapSetAt)
      throw conflict("The village map changed. Reload it before saving.");
    if (state.venues.length !== positions.size || state.venues.some((venue) => !positions.has(venue.id)))
      throw conflict("The venue list changed. Reload the village map before saving.");
    for (const venue of state.venues) {
      const spot = positions.get(venue.id)!;
      if (venue.presentation.x !== spot.fromX || venue.presentation.y !== spot.fromY)
        throw conflict("A venue pin changed. Reload the village map before saving.");
      if (submitted.image === state.townMapImage && (spot.x !== spot.fromX || spot.y !== spot.fromY))
        throw conflict("Choose a replacement map before moving venues.");
    }
    for (const venue of state.venues) {
      const spot = positions.get(venue.id)!;
      venue.presentation.x = spot.x;
      venue.presentation.y = spot.y;
    }
    if (!submitted.image || submitted.image !== state.townMapImage) {
      state.townMapCanvasWidth = submitted.size?.width ?? TOWN_MAP_EXPECTED_WIDTH;
      state.townMapCanvasHeight = submitted.size?.height ?? TOWN_MAP_EXPECTED_HEIGHT;
    }
    state.townMapImage = submitted.image;
    state.townMapImageSetAt = submitted.image
      ? new Date(Math.max(Date.now(), (Date.parse(state.townMapImageSetAt) || 0) + 1)).toISOString()
      : "";
    state.townMapView = submitted.view;
  });
  return buildVillageSnapshot();
}

async function readTownMapSubmission(
  value: unknown,
  view?: unknown,
): Promise<{
  image: string;
  size: { width: number; height: number } | null;
  view: ReturnType<typeof coerceTownMapView>;
}> {
  if (typeof value !== "string") throw badRequest("The town map must be an image or an explicit empty choice.");
  const image = value.trim();
  if (image.length > 0 && !isTownMapImage(image)) {
    throw badRequest("The town map must be a base64 image file.");
  }
  if (image.length > MAX_TOWN_MAP_IMAGE_LENGTH) {
    throw badRequest(
      `The town map can be at most ${Math.round(MAX_TOWN_MAP_IMAGE_LENGTH / 1_000_000)} MB of image data.`,
    );
  }
  return {
    image,
    size: image.length > 0 ? await inspectVillageImage(image) : null,
    view: image.length > 0 ? coerceTownMapView(view) : { ...DEFAULT_TOWN_MAP_VIEW },
  };
}

/**
 * The stored map on its own, away from the snapshot.
 *
 * A snapshot is read on every chat send, so the image is deliberately not part
 * of it: the tab asks for the picture here, once, and asks again only when the
 * stamp it was given changes.
 */
export async function readVillageTownMapImage(): Promise<{ image: string }> {
  const village = await readVillageState();
  return { image: village.townMapImage };
}

/**
 * Ask the model what places this village has, and keep what it says.
 *
 * Split out from `setVillageSetting` so the tab can offer it as an explicit
 * "suggest places" action for a village whose setting is already saved.
 */
export async function runVillageBootstrap(): Promise<VillageSnapshot> {
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
    state.venues = [...state.venues.filter((place) => isHousePlace(place)), ...proposal.venues];
  });
  return buildVillageSnapshot();
}

/** Read-only founding suggestion; the wizard keeps the result until its final write. */
export async function suggestFoundingPlaces(settingValue: unknown, idsValue: unknown, budgetValue?: unknown) {
  const setting = readVillageSetting(settingValue);
  if (!setting) throw badRequest("Describe what the village is like before suggesting places.");
  const ids = readSelectedLorebookIds(idsValue ?? []);
  const budget = budgetValue === undefined ? DEFAULT_LORE_TOKEN_BUDGET : readLoreTokenBudget(budgetValue);
  const proposal = await proposeVillage(setting, { lore: await readVillageLore(ids, setting, undefined, budget) });
  return { places: proposal.venues.map((venue) => ({ name: venue.name })) };
}

export async function suggestFoundingVenueNames(settingValue: unknown, idsValue: unknown, budgetValue?: unknown) {
  const setting = readVillageSetting(settingValue);
  if (!setting) throw badRequest("Describe what the village is like before suggesting names.");
  const ids = readSelectedLorebookIds(idsValue ?? []);
  const budget = budgetValue === undefined ? DEFAULT_LORE_TOKEN_BUDGET : readLoreTokenBudget(budgetValue);
  return { names: await proposePublicVenueNames(setting, await readVillageLore(ids, setting, undefined, budget)) };
}

export async function draftVenueDescriptions(value: unknown): Promise<{ descriptions: Record<string, string> }> {
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

function localDateKey(now: Date): string {
  const year = String(now.getFullYear()).padStart(4, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function storyAllowance(pace: VillageStoryPace, seed: string, date: string): number {
  if (pace === "off") return 0;
  if (pace === "quiet") return 1;
  if (pace === "lively") return 3;
  return 1 + (hashString(`${seed}|${date}|creative-allowance`) % 3);
}

function creativeOpportunity(
  village: VillageState,
  routines: ReadonlyMap<string, NativeRoutine>,
  moment: ReturnType<typeof deriveVillageMoment>,
  startsAt: string,
): VillageOpportunity | null {
  const currentPlaces = new Map<string, string[]>();
  for (const villager of village.villagers) {
    const place = villagerPlaceView(village, villager, routines.get(villager.characterId) ?? null, moment.minuteOfDay);
    if (!place) continue;
    const destinationKey = JSON.stringify([place.id, place.zoneId ?? "exterior"]);
    currentPlaces.set(destinationKey, [...(currentPlaces.get(destinationKey) ?? []), villager.characterId]);
  }
  const overlap = [...currentPlaces.entries()].find(([, actorIds]) => actorIds.length >= 2);
  const activeProject = village.projects.find((project) => project.status === "active");
  const wishing = village.villagers.find((villager) => (villager.agenda?.wishes.length ?? 0) > 0);
  const publicVenue = village.venues.find((venue) => !isHousePlace(venue));
  const firstResident = village.villagers[0];
  const kind: VillageOpportunity["kind"] = overlap
    ? "encounter"
    : activeProject
      ? "project"
      : wishing
        ? "wish"
        : publicVenue
          ? "weather"
          : firstResident
            ? "routine"
            : "weather";
  const actorIds =
    overlap?.[1].slice(0, 4) ??
    activeProject?.participantIds.slice(0, 4) ??
    (wishing ? [wishing.characterId] : firstResident ? [firstResident.characterId] : []);
  const destinationKey =
    overlap?.[0] ??
    (wishing ? currentPlaces.entries().find(([, ids]) => ids.includes(wishing.characterId))?.[0] : undefined);
  const [destinationVenueId, zoneId] = destinationKey
    ? (JSON.parse(destinationKey) as [string, string])
    : [undefined, "exterior"];
  const venueId = destinationVenueId ?? activeProject?.venueId ?? publicVenue?.id ?? "";
  if (actorIds.length === 0 && venueId.length === 0) return null;
  const facts = [
    `${moment.localTime} local time`,
    `${moment.weather} weather`,
    overlap ? `${actorIds.length} residents share this zone` : "",
    activeProject ? `active project: ${activeProject.title}` : "",
    wishing?.agenda?.wishes[0] ? `active wish: ${wishing.agenda.wishes[0].wish}` : "",
  ].filter(Boolean);
  const identity = `${village.seed}|${startsAt}|${moment.instant}|${kind}|${actorIds.join(",")}|${venueId}`;
  return {
    id: `opportunity-${hashString(identity)}`,
    kind,
    startsAt,
    endsAt: moment.instant,
    actorIds,
    venueId,
    zoneId,
    facts,
  };
}

function buildReturnRecap(
  village: VillageState,
  from: string,
  through: string,
  elapsedMs: number,
): VillageRecap | null {
  const pendingDecisionCount = village.pendingDecisions.filter(
    (decision) => decision.status !== "approved" && decision.status !== "denied",
  ).length;
  if (elapsedMs < 6 * 60 * 60 * 1_000 && pendingDecisionCount === 0) return null;
  const throughMs = Date.parse(through);
  const fromMs = Date.parse(from);
  const details = village.happenings
    .filter((entry) => {
      const at = Date.parse(entry.occurredAt);
      return Number.isFinite(at) && at >= throughMs - 48 * 60 * 60 * 1_000 && at <= throughMs && at >= fromMs;
    })
    .slice(0, 4);
  const older = village.happenings.filter((entry) => {
    const at = Date.parse(entry.occurredAt);
    return Number.isFinite(at) && at >= fromMs && at < throughMs - 48 * 60 * 60 * 1_000;
  });
  const counts = new Map<string, number>();
  for (const entry of older) {
    const at = new Date(entry.occurredAt);
    const ageDays = Math.floor((throughMs - at.getTime()) / 86_400_000);
    const label =
      ageDays <= 14
        ? at.toLocaleDateString(undefined, { month: "short", day: "numeric" })
        : `week of ${new Date(at.getFullYear(), at.getMonth(), at.getDate() - at.getDay()).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const summaries = [...counts.entries()]
    .slice(-6)
    .reverse()
    .map(([label, count]) => `${count} remembered ${count === 1 ? "event" : "events"} from ${label}.`);
  if (summaries.length === 0 && elapsedMs >= 48 * 60 * 60 * 1_000) {
    const days = Math.max(2, Math.floor(elapsedMs / 86_400_000));
    summaries.push(`${days} days passed in the village.`);
  }
  return { from, through, details, summaries, pendingDecisionCount };
}

/**
 * Advance the village from its durable high-water mark to one exact instant.
 * Required local state is committed before optional narration is requested, so
 * an unavailable model can never stop time, schedules, wishes or migrations.
 */
export async function reconcileVillage(
  options: { forceStory?: boolean; now?: Date; actionId?: string; expectedAttempt?: number } = {},
): Promise<VillageSnapshot> {
  const forced = options.forceStory === true;
  const now = options.now ?? new Date();
  let recorded = await readVillageState();
  if (!isVillageFounded(recorded)) return buildVillageSnapshot(now);
  if (recorded.foundingPreparation && recorded.foundingPreparation.status !== "ready") return buildVillageSnapshot(now);
  let completedMove = false;
  for (const residence of recorded.residences) {
    if (residence.status !== "moving" || Date.parse(residence.completesAt ?? "") > now.getTime()) continue;
    try {
      await completeVillageResidence(residence.characterId, false, now, false);
      completedMove = true;
    } catch (error) {
      villagesLogger().warn("[villages] pending move could not complete: %s", String(error));
    }
  }
  if (completedMove) recorded = await readVillageState();
  await mutateVillageState((state) => {
    reconcileBuildProjects(state, now);
    reconcileProjectLifecycles(state, now);
  });
  recorded = await readVillageState();
  const moment = deriveVillageMoment({ foundedAt: recorded.foundedAt, seed: recorded.seed, now });
  const previousThrough = recorded.simulatedThrough || recorded.foundedAt || moment.instant;
  const previousMs = Date.parse(previousThrough);
  const currentMs = Date.parse(moment.instant);
  const elapsedMs = Number.isFinite(previousMs) && Number.isFinite(currentMs) ? Math.max(0, currentMs - previousMs) : 0;

  // These are deterministic reconciliation rules. They run for both the live
  // timer and restart catch-up, irrespective of story pace.
  await mutateVillageState((state) => {
    for (const resident of state.villagers) {
      const expired = resident.agenda?.wishes.filter((wish) => Date.parse(wish.expiresAt) <= now.getTime()) ?? [];
      if (expired.length)
        state.wishRefillIntents[resident.characterId] = {
          id: backgroundRevision(expired.map((wish) => wish.id)),
          settled: expired.map((wish) => wish.wish).join("; "),
        };
      expireResidentWishes(resident, now);
    }
  });
  await rollActiveAgendas(now);
  await mutateVillageState((state) => {
    const storedMs = Date.parse(state.simulatedThrough);
    if (!Number.isFinite(storedMs) || currentMs > storedMs) state.simulatedThrough = moment.instant;
    state.lastKnownTimeZone = moment.timeZone;
    const discoveries: VillageChronicleEntry[] = [];
    for (const venue of state.venues) {
      for (const zone of venueZones(venue)) {
        const remaining = [] as NonNullable<VillageVenue["state"]["traces"]>;
        for (const trace of zone.state.traces ?? []) {
          if (trace.expiresAt && Date.parse(trace.expiresAt) <= currentMs) continue;
          if (trace.kind === "scene-note") {
            remaining.push(trace);
            continue;
          }
          const created = Date.parse(trace.createdAt);
          if (!Number.isFinite(created) || currentMs - created < 60_000) {
            remaining.push(trace);
            continue;
          }
          const present = state.villagers.filter((villager) => {
            const destination = villagerPlaceView(state, villager, null, moment.minuteOfDay, now);
            return destination?.id === venue.id && destination.zoneId === zone.id;
          });
          const finders = present.filter((villager) =>
            trace.kind === "note"
              ? villager.characterId === trace.recipientId
              : !(trace.seenBy ?? []).includes(villager.characterId),
          );
          for (const finder of finders) {
            const id = `${trace.id}:found:${finder.characterId}`;
            if (state.chronicle.some((entry) => entry.id === id)) continue;
            discoveries.push({
              id,
              dayIndex: moment.dayIndex,
              clock: moment.dayPhase,
              occurredAt: moment.instant,
              timePrecision: "exact",
              scope: "private",
              actors: [{ id: finder.characterId, name: finder.cardSnapshot.name }],
              kind: "chat",
              text:
                trace.kind === "note"
                  ? `${finder.cardSnapshot.name} found a note at ${venue.name}: ${trace.text}`
                  : `${finder.cardSnapshot.name} noticed ${trace.text} at ${venue.name}.`,
            });
          }
          if (trace.kind !== "note" || finders.length === 0)
            remaining.push({
              ...trace,
              seenBy: [...new Set([...(trace.seenBy ?? []), ...finders.map((finder) => finder.characterId)])],
            });
        }
        zone.state.traces = remaining;
      }
    }
    if (discoveries.length) state.chronicle = [...discoveries, ...state.chronicle];
  });

  // Discover optional paid work only after deterministic advancement has committed.
  await respondDueVenueMail(now);
  // Initial space preparation retains the founding generation path; begin it only after local advancement.
  outsideVenueOperation(() => {
    void preparePrivateSpaces().catch(() => {});
  });
  const pendingRooms = (await readVillageState()).venues.flatMap(
    (venue) => venue.privateSpaces?.filter((room) => room.adaptationPending).map((room) => room.ownerId) ?? [],
  );
  for (const characterId of new Set(pendingRooms)) await retryResidencePrivateSpaceAdaptation(characterId);
  const withAgendas = await backfillAgendas(await readVillageState(), now);
  await refreshVillagerRemaps(withAgendas, now);
  await reconcileWishLifecycle(now);
  const village = await readVillageState();
  const dateKey = localDateKey(now);
  const remainingSocialEvents =
    storyAllowance(village.storyPace, village.seed, dateKey) -
    village.happenings.filter((entry) => localDateKey(new Date(entry.occurredAt)) === dateKey).length;
  const activeSocialPlan =
    !forced && village.storyPace !== "off" && remainingSocialEvents > 0
      ? village.relationshipContext?.socialPlans.find(
          (plan) =>
            plan.status === "planned" &&
            plan.kind === "meeting" &&
            plan.dateKey === dateKey &&
            plan.startMinute <= moment.minuteOfDay &&
            plan.endMinute > moment.minuteOfDay,
        )
      : undefined;
  const shouldCreateStory =
    forced || (village.storyPace !== "off" && (village.lastCreativeDate < dateKey || !!activeSocialPlan));
  if (!shouldCreateStory) {
    const snapshot = await buildVillageSnapshot(now);
    return { ...snapshot, recap: buildReturnRecap(village, previousThrough, moment.instant, elapsedMs) };
  }

  const routines = new Map<string, NativeRoutine>();
  const opportunity: VillageOpportunity | null = activeSocialPlan
    ? {
        id: activeSocialPlan.id + ":encounter",
        kind: "encounter",
        startsAt: now.toISOString(),
        endsAt: now.toISOString(),
        actorIds: activeSocialPlan.actorIds,
        venueId: activeSocialPlan.venueId,
        zoneId: activeSocialPlan.zoneId,
        facts: [activeSocialPlan.activity, "An accepted free-time plan is happening now."],
      }
    : creativeOpportunity(village, routines, moment, previousThrough);
  if (!opportunity) {
    const snapshot = await buildVillageSnapshot(now);
    return { ...snapshot, recap: buildReturnRecap(village, previousThrough, moment.instant, elapsedMs) };
  }
  await mutateVillageState((state) => {
    if (state.processedOpportunityIds.includes(opportunity.id)) return;
    const withoutDuplicate = state.opportunities.filter((entry) => entry.id !== opportunity.id);
    state.opportunities = [...withoutDuplicate, opportunity].slice(-256);
  });
  const narrationMemories = selectPromptMemories(
    village.chronicle,
    village.villagers.map((villager) => villager.characterId),
    opportunity.facts.join(" "),
    900,
  );
  const context: VillageTickContext = {
    village: village.name,
    playerRole: village.playerRole,
    playerPersonaName: village.playerPersonaName,
    setting: village.setting,
    worldFacts: village.worldFacts,
    lore: await readVillageLore(
      village.selectedLorebookIds,
      [
        villageCurrentSetting(village),
        opportunity.facts.join(" "),
        village.venues.find((venue) => venue.id === opportunity.venueId)?.name ?? "",
      ].join("\n"),
      undefined,
      village.loreTokenBudget,
    ),
    moment,
    // Taken off the record rather than off `now`, because it is only ever used
    // as a lower bound for the date labels on the memory block and the founding
    // stamp is what those labels are measured from.
    foundedAt: village.foundedAt,
    at: now.toISOString(),
    residents: village.villagers.map((villager) => {
      const card = readEffectiveVillagerCard(villager);
      // Their whole day, block by block, off the schedule read taken above —
      // the very list `blockAt` already searched to find this hour. The times
      // live only in the Engine's raw week and the words only in the stored
      // translation, so this join is the only place either half becomes a day
      // somebody could be written into: without it the narrator knows one
      // clause about each person and can only honestly write weather.
      const today = agendaDayPlan(villager.agenda, moment.minuteOfDay, now, villager.ingestSchedule !== false);
      return {
        characterId: villager.characterId,
        name: card.name,
        summary: card.summary,
        tags: card.tags,
        profile: venueCardProfile(card, readPlayerIdentity(village).name),
        // What they are doing, said the way it happens here. A miss answers with
        // the village's own default rather than with the Engine's sentence,
        // which is the leak this whole file exists to close: see
        // `VILLAGE_UNTRANSLATED_ACTIVITY`.
        doing: agendaAt(villager.agenda, moment.minuteOfDay, now, villager.ingestSchedule !== false)?.activity ?? "",
        // And whether this hour is theirs at all, off the VERY SAME block the
        // sentence above came from. Two lookups would be two chances to pick
        // different blocks, and a villager recorded as asleep during their own
        // shift is exactly that bug with a narrator's voice on it.
        status: agendaAt(villager.agenda, moment.minuteOfDay, now, villager.ingestSchedule !== false)?.status ?? "",
        // The one-line description of an ordinary day, in the village's words
        // when it has any. It travels separately from the agenda rather than
        // being left for the block to pick off `agenda.routineSummary`, because
        // the sentence the narrator reads and the sentence the agenda holds are
        // two different facts about the same person and only one of them is true
        // here.
        //
        // The Engine's own summary is not allowed to stand in for a missing
        // translation, which is the second half of the same leak: an agenda
        // marked `native` holds the Engine's sentence word for word, and it is
        // prose about a life this village may have no room for. Only the
        // village's own writing is allowed here, and a villager with neither has
        // nothing said about their ordinary day at all — a shorter prompt rather
        // than a wrong one.
        routine: villager.agenda?.routineSummary ?? "",
        // Their whole day, block by block — see above.
        today,
        // And the shape of the rest of the week, so one day of somebody's life
        // does not read as the whole of it. Also a join, and also free.
        week: VILLAGE_WEEKDAYS.filter((day) => day !== moment.weekday).flatMap(
          (day) => villager.agenda?.week?.[day]?.map((block) => block.activity) ?? [],
        ),
        agenda: villager.agenda,
        remembered: rememberedFor(narrationMemories, villager.characterId),
      };
    }),
    recent: village.happenings.map((entry) => entry.text),
    memory: sharedMemoryFor(
      narrationMemories,
      village.happenings.map((entry) => entry.text),
    ),
    noticeboard: village.noticeboard,
    venues: village.venues,
    pendingVenueNames: village.pendingDecisions
      .filter((decision) => decision.kind === "venue" && decision.status !== "approved" && decision.status !== "denied")
      .map((decision) => decision.venueDraft?.name ?? decision.title),
    pendingHousingCharacterIds: [
      ...village.residences.filter((entry) => entry.status !== "current").map((entry) => entry.characterId),
      ...village.pendingDecisions
        .filter((decision) => decision.kind === "venue-upgrade" && decision.status === "pending")
        .map((decision) => decision.requesterCharacterId ?? ""),
    ],
    social:
      !forced && village.storyPace !== "off"
        ? {
            candidates:
              !activeSocialPlan && storyAllowance(village.storyPace, village.seed, dateKey) > 1
                ? socialPlanCandidates(village, now)
                : [],
            relationships: opportunity.actorIds.map((actorId) => relationshipWritingPrompt(village, actorId)),
          }
        : undefined,
    opportunities: [opportunity],
    lastSimulatedAt: previousThrough,
    forced,
  };
  await queueBackgroundJob({
    kind: "story",
    subjectId: activeSocialPlan ? "social:" + activeSocialPlan.id : "village",
    seed: village.seed,
    revision: forced ? "manual:" + (options.actionId ?? opportunity.id) : dateKey,
    finite: forced,
    label: forced ? "Requested village event" : "Today's village story",
    automaticDate: forced ? undefined : dateKey,
    expectedAttempt: forced ? options.expectedAttempt : undefined,
    input: {
      context,
      forced,
      socialPlanId: activeSocialPlan?.id,
      socialPlan: activeSocialPlan,
      dateKey,
      opportunity,
      moment,
      now: now.toISOString(),
      actorIncarnations: Object.fromEntries(
        opportunity.actorIds.map((id) => [
          id,
          village.villagers.find((resident) => resident.characterId === id)?.cardSnapshot.capturedAt,
        ]),
      ),
    },
  });
  const reconciled = await readVillageState();
  const snapshot = await buildVillageSnapshot(now);
  return { ...snapshot, recap: buildReturnRecap(reconciled, previousThrough, moment.instant, elapsedMs) };
}

registerBackgroundHandler("story", {
  generate: (input) => proposeHappenings(input.context),
  valid: (state, input) =>
    input.opportunity.actorIds.every((id: string) =>
      state.villagers.some(
        (resident) => resident.characterId === id && resident.cardSnapshot.capturedAt === input.actorIncarnations[id],
      ),
    ) &&
    (!input.opportunity.venueId || state.venues.some((venue) => venue.id === input.opportunity.venueId)) &&
    (input.forced ||
      (state.storyPace !== "off" &&
        (state.lastCreativeDate < input.dateKey ||
          (input.socialPlanId && socialContinuationValid(state, input.socialPlanId, input.socialPlan))) &&
        localDateKey(new Date(state.simulatedThrough)) <= input.dateKey)),
  apply(state, input, proposal) {
    const { forced, dateKey, opportunity, moment } = input;
    const now = new Date(input.now);

    if (!forced && (state.storyPace === "off" || (!input.socialPlanId && state.lastCreativeDate >= dateKey))) return;
    const dailyAllowance = storyAllowance(state.storyPace, state.seed, dateKey);
    const used = state.happenings.filter((entry) => localDateKey(new Date(entry.occurredAt)) === dateKey).length;
    const offeredPlan = input.context.social?.candidates.some((plan) => plan.id === proposal.social?.planId);
    const allowance = forced
      ? 3
      : input.socialPlanId
        ? Math.max(0, dailyAllowance - used)
        : Math.max(1, dailyAllowance - (offeredPlan ? 1 : 0));
    if (!allowance) return;
    const opportunityId = opportunity.id;
    if (state.processedOpportunityIds.includes(opportunityId)) return;
    const happenings = proposal.happenings.slice(0, allowance);
    state.happenings = [...happenings, ...state.happenings].slice(0, MAX_HAPPENINGS);
    if (!forced && proposal.social && input.context.social) {
      const id = opportunity.id + ":social";
      state.socialOutbox ??= [];
      if (!state.socialOutbox.some((entry) => entry.id === id))
        state.socialOutbox.push({
          id,
          seed: state.seed,
          at: input.now,
          opportunity,
          candidates: input.context.social.candidates,
          proposal: proposal.social,
          requiredPlanId: input.socialPlanId,
        });
    }
    if (proposal.routineIdea) {
      const resident = state.villagers.find((entry) => entry.characterId === proposal.routineIdea.characterId);
      if (resident?.agenda) addRoutineIdea(resident.agenda, proposal.routineIdea, resident, state);
    }
    for (const request of proposal.housingRequests) {
      if (!opportunity.actorIds.includes(request.characterId)) continue;
      const resident = state.villagers.find((entry) => entry.characterId === request.characterId);
      const venue = state.venues.find((entry) => entry.id === request.venueId);
      if (!resident || !venue) continue;
      if (
        state.residences.some((entry) => entry.characterId === request.characterId && entry.status !== "current") ||
        state.pendingDecisions.some(
          (entry) =>
            entry.kind === "venue-upgrade" &&
            entry.requesterCharacterId === request.characterId &&
            entry.status === "pending",
        )
      )
        continue;
      if (request.kind === "move") {
        if (venue.occupancy.playerHome || venue.occupancy.residentCharacterId) continue;
        if (
          state.residences.some(
            (entry) => entry.proposedVenueId === venue.id && (entry.status === "pending" || entry.status === "moving"),
          )
        )
          continue;
        const currentVenueId =
          state.venues.find((entry) => entry.occupancy.residentCharacterId === request.characterId)?.id ?? "";
        const next: VillageResidence = {
          proposedPrivateZoneId: "",
          venueId: currentVenueId,
          characterId: request.characterId,
          status: "pending",
          proposedVenueId: venue.id,
          requestedAt: now.toISOString(),
          requestedBy: "villager",
          villagerDecision: "pending",
        };
        const index = state.residences.findIndex((entry) => entry.characterId === request.characterId);
        if (index < 0) state.residences.push(next);
        else state.residences[index] = next;
      }
    }
    // The prose Events feed may still update its panel, but must not write
    // memories, notices, venue requests/features, or wish state. Structured
    // Events will replace this boundary; old saved prose remains visual only.
    if (LEGACY_EVENTS_CAN_AFFECT_VILLAGE) {
      // The chronicle is trimmed by weight rather than from the tail. Ordinary
      // material is still forgotten oldest-first — nothing here is evicted until
      // the record is genuinely full, which is many real days of play away — but
      // what the player DID for somebody is kept ahead of it, because the record
      // of a favour is not the same kind of thing as the record of a Tuesday.
      if (proposal.memory.length > 0) {
        state.chronicle = [...proposal.memory, ...state.chronicle];
      }
      // Notices are only ever added while there is room. Trimming the oldest to
      // make space would take the player's own pins off the board before the
      // village's, and the player cannot tell which was which once it is gone.
      const room = Math.max(0, MAX_NOTICEBOARD_NOTES - state.noticeboard.length);
      state.noticeboard = [...state.noticeboard, ...proposal.notices.slice(0, room)];
      for (const request of proposal.venueRequests) {
        queueVillageVenueRequest(state, request.core, request.characterId, "background", opportunityId, moment.instant);
      }
      for (const edit of proposal.featureEdits) {
        const venue = state.venues.find((place) => place.id === edit.venueId);
        const resident = state.villagers.find((person) => person.characterId === edit.characterId);
        if (
          !venue ||
          !resident ||
          opportunity.venueId !== venue.id ||
          !opportunity.actorIds.includes(resident.characterId)
        )
          continue;
        if (
          venue.occupancy.residentCharacterId !== resident.characterId &&
          !venue.workerIds?.includes(resident.characterId)
        )
          continue;
        if (villagerPlaceView(state, resident, null, moment.minuteOfDay, now)?.id !== venue.id) continue;
        const features = venue.state.features ?? [];
        const prior = features.find((feature) => feature.id === edit.featureId);
        if (edit.featureId) {
          if (!prior || prior.locked) continue;
          venue.state.features = edit.text
            ? features.map((feature) =>
                feature.id === prior.id
                  ? {
                      ...feature,
                      text: edit.text,
                      sourceCharacterId: resident.characterId,
                      updatedAt: moment.instant,
                    }
                  : feature,
              )
            : features.filter((feature) => feature.id !== prior.id);
        } else if (edit.text && features.length < 5) {
          venue.state.features = [
            ...features,
            {
              id: randomVillageSeed(),
              text: edit.text,
              sourceCharacterId: resident.characterId,
              locked: false,
              updatedAt: moment.instant,
            },
          ];
        } else continue;
        venue.state.updatedAt = moment.instant;
      }
      // A wish the village has just decided the world will not allow goes here
      // rather than in the proposal pass, because this is the only place that
      // holds the whole reply and writes it in one go: a wish taken off the list
      // by a pass that then failed to write its news would leave a villager
      // without something the village never agreed to take.
      //
      // Nothing is written ABOUT it. A wish is the villager's own, and the day it
      // becomes impossible is not the village's news — it is the absence of a
      // small ordinary thing in brackets, which is how a wish is supposed to be
      // visible in the first place.
      //
      // Taken off by ID, not by the words, even though the words are what the
      // model wrote: the words were the handle it used to point at the list it
      // was shown, and this is the village's own copy of that wish. A villager
      // who has meanwhile answered it, or had it taken off by age, is a villager
      // with nothing to take.
      for (const lapse of proposal.lapsed) {
        const entry = state.villagers.find((villager) => villager.characterId === lapse.characterId);
        if (!entry?.agenda) continue;
        const kept = entry.agenda.wishes.filter((wish) => wish.id !== lapse.wishId);
        if (kept.length !== entry.agenda.wishes.length) entry.agenda = { ...entry.agenda, wishes: kept };
      }
    }
    if (state.lastCreativeDate < dateKey) state.lastCreativeDate = dateKey;
    if (!state.processedOpportunityIds.includes(opportunityId)) {
      state.processedOpportunityIds = [...state.processedOpportunityIds, opportunityId].slice(-256);
    }
  },
});

/**
 * Write down what the rest of the village saw of something the player just did.
 *
 * This is the answer to the only complaint the world panel cannot otherwise
 * answer. A settled wish is filed as a private memory, a conversation is filed
 * as a memory, and a memory is invisible: the record is read in the story tab
 * and nowhere else, and the window the player actually watches only moves when
 * the narrator writes a part of day. So the player does something definite, the
 * villager they did it for knows, and the square carries on as though nothing
 * happened until the clock turns over — which is the one thing that makes a
 * village feel like it is not paying attention.
 *
 * `deed` is the village's own past-tense line about what happened, and the
 * caller is responsible for it never being the player's raw claim. That is where
 * the safety of the whole route lies: by the time anything is written here, some
 * other call has already decided that the thing actually happened.
 *
 * It writes NOTHING on its own initiative. An empty list, a failure, a reply with
 * no JSON, a village with nobody else in it — all of them mean the window keeps
 * exactly what it had. Nothing here may cost the player the thing they did, so a
 * caller that catches this has already done the right thing.
 *
 * ponytail: one extra model call per settled wish. It is the only way to put an
 * action in the panel the player watches without also letting a model invent
 * something, because the narrator is the only other writer and it runs on a
 * clock. The upgrade path, if the cost ever matters, is to ride it on the verdict
 * call the way the end of a conversation rides on its own closing call — the
 * judge would then have to write prose, which is exactly why it was left alone.
 */
export async function runVillageReaction(params: {
  villagerName: string;
  playerName: string;
  /** What happened, in the village's own words and in the past tense. */
  deed: string;
  signal?: AbortSignal;
}): Promise<void> {
  const deed = boundText(params.deed, MAX_CHRONICLE_LENGTH);
  if (deed.length === 0) return;
  const village = await readVillageState();
  const moment = deriveVillageMoment({ foundedAt: village.foundedAt, seed: village.seed, now: new Date() });
  const { happenings } = await proposeReaction(
    {
      village: village.name,
      setting: villageCurrentSetting(village),
      moment,
      playerName: params.playerName,
      villagerName: params.villagerName,
      deed,
      recent: village.happenings.map((entry) => entry.text),
    },
    { signal: params.signal },
  );
  if (happenings.length === 0) return;
  await mutateVillageState((state) => {
    // Deduped against the window as it stands rather than the copy read before
    // the call, because a narrator batch can land while the model is thinking
    // and the same line reaching the window twice reads as a village repeating
    // itself.
    const seen = new Set(state.happenings.map((entry) => entry.text.trim().toLowerCase()));
    const fresh = happenings.filter((entry) => {
      const key = entry.text.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (fresh.length === 0) return;
    state.happenings = prependHappenings(state.happenings, fresh);
    // Direct reactions do not move `simulatedThrough`: that cursor belongs to
    // reconciliation, while this records one player-triggered fact at its exact
    // occurrence time.
  });
}

/**
 * What the village already remembers about one person.
 *
 * Only private memories. The village-scope ones are no longer thrown away —
 * they are fed to the same call as their own section by `sharedMemoryFor` below
 * — but they are still NOT fed back here, because they arrive by that route and
 * feeding the same fortnight in twice would spend the prompt's room on saying it
 * again.
 */
function rememberedFor(chronicle: readonly VillageChronicleEntry[], characterId: string): string[] {
  const lines: string[] = [];
  for (const entry of chronicle) {
    if (entry.scope !== "private" || !entry.actors.some((actor) => actor.id === characterId)) continue;
    lines.push(entry.text);
    if (lines.length >= MAX_CHRONICLE_ABOUT_ONE_VILLAGER) break;
  }
  return lines;
}

/**
 * What the WHOLE village remembers, newest first, as the narrator reads it.
 *
 * Three things are decided here, and each of them is the difference between a
 * prompt that helps and a prompt that lies:
 *
 *   * Private memories are excluded. A memory filed against one villager is
 *     that villager's to know, and handing it to the narrator as village history
 *     would put a confidence in the mouth of the whole square. It reaches the
 *     narrator only as `rememberedFor` on the person it belongs to.
 *   * Anything already in the happenings window is dropped. The window is the
 *     last part of this same record, so it is already in the prompt above and a
 *     memory that repeated it would read as the village saying everything twice.
 *   * It is capped, and the cap is a cap on ENTRIES rather than characters,
 *     because the old end of this list is the part that can afford to be
 *     forgotten — the window above is what proves what happened most recently.
 */
function sharedMemoryFor(
  chronicle: readonly VillageChronicleEntry[],
  alreadySaid: readonly string[],
): VillageChronicleEntry[] {
  const seen = new Set(alreadySaid.map((line) => line.trim().toLowerCase()));
  const memory: VillageChronicleEntry[] = [];
  for (const entry of chronicle) {
    if (entry.scope !== "village") continue;
    const key = entry.text.trim().toLowerCase();
    if (key.length === 0 || seen.has(key)) continue;
    seen.add(key);
    memory.push(entry);
    if (memory.length >= MAX_CHRONICLE_IN_PROMPT) break;
  }
  return memory;
}

/**
 * The whole of what the village remembers, newest first, as the story tab draws
 * it.
 *
 * Read on its own route rather than folded into the snapshot, for the same
 * reason the town map is: the snapshot is read on every chat send and on every
 * pulse, and a story that grows forever has no business being re-sent with it.
 *
 * Two things are resolved here and nowhere else. The calendar date is derived
 * from `foundedAt` so the tab never does clock arithmetic, and each actor's name
 * is read back off the live card, falling back to the name the village wrote
 * down — the same rule `projectVillager` and `projectHomes` follow, so a
 * villager's own memory does not go nameless when their card is deleted.
 *
 * `at` travels untouched. It is shown and never read; see `VillageChronicleEntry`.
 */
export async function buildVillageStory(): Promise<VillageChronicleEntryView[]> {
  const [village, cards] = await Promise.all([readVillageState(), listVillagerCards()]);
  const names = new Map(cards.map((card) => [card.id, card.name]));
  return village.chronicle.map((entry) => ({
    ...entry,
    dateLabel: villageDateLabel(village.foundedAt, entry.dayIndex),
    actors: entry.actors.map((actor) => ({ ...actor, name: names.get(actor.id) ?? actor.name })),
  }));
}

/** A player-facing projection of durable, passing, and archived memory layers. */
export async function buildVillageMemories() {
  const [village, cards] = await Promise.all([readVillageState(), listVillagerCards()]);
  const names = new Map(cards.map((card) => [card.id, card.name]));
  for (const resident of village.villagers) names.set(resident.characterId, resident.cardSnapshot.name);
  const person = (id: string) => ({ id, name: names.get(id) ?? "Former resident" });
  const residents = village.villagers.map((resident) => person(resident.characterId));
  const now = Date.now();
  const durable = village.chronicle
    .filter((entry) => entry.kind !== "tick")
    .map((entry) => {
      const knownByIds =
        entry.scope === "village"
          ? residents.map((resident) => resident.id)
          : (entry.knownByCharacterIds ?? entry.actors.map((actor) => actor.id)).filter(Boolean);
      const subjectIds = (entry.subjectCharacterIds ?? entry.actors.map((actor) => actor.id)).filter(Boolean);
      return {
        ...entry,
        dateLabel: villageDateLabel(village.foundedAt, entry.dayIndex),
        subjects: [...new Set(subjectIds)].map(person),
        knownBy: [...new Set(knownByIds)].map(person),
        evidence: entry.sourceVisitId ? { visitId: entry.sourceVisitId, lineIds: entry.sourceLineIds ?? [] } : null,
        legacy: !entry.sourceVisitId && !entry.memoryCategory,
      };
    });
  const recollections = village.recollections
    .filter((entry) => Date.parse(entry.expiresAt) > now)
    .map((entry) => ({
      ...entry,
      subjects: entry.subjectCharacterIds.map(person),
      knownBy: entry.knownByCharacterIds.map(person),
    }));
  return {
    generatedAt: new Date(now).toISOString(),
    residents,
    durable,
    recollections,
    expiredRecollectionCount: village.recollections.length - recollections.length,
  };
}

/** Resolve owned days and refresh optional local preferences; no paid work is dispatched. */
export async function buildVillageAgendas(): Promise<VillageAgendaView[]> {
  const now = new Date(),
    initial = await readVillageState();
  await refreshVillagerRemaps(initial, now);
  await rollActiveAgendas(now);
  const village = await readVillageState();
  const snapshot = await readNativeScheduleSnapshot(
    now,
    village.villagers.map((resident) => resident.characterId),
  );
  const weeks = new Map(snapshot.schedules.map((schedule) => [schedule.characterId, schedule]));
  const moment = deriveVillageMoment({ foundedAt: village.foundedAt, seed: village.seed, now });
  return village.villagers.map((resident) => ({
    characterId: resident.characterId,
    name: resident.cardSnapshot.name,
    missing: false,
    weekUnreadable: !snapshot.cardsReadable,
    addedAt: resident.addedAt,
    agenda: resident.agenda,
    completedWishes: [],
    ingestSchedule: resident.scheduleInfluence?.enabled === true,
    scheduleInfluence: influenceSettings(resident.scheduleInfluence),
    nativeSchedule: weeks.has(resident.characterId) ? { weekStart: "", days: {} } : null,
    effectiveDays: Object.fromEntries(
      Array.from({ length: 7 }, (_, offset) => {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, 12);
        return [
          VILLAGE_WEEKDAYS[(date.getDay() + 6) % 7]!,
          resident.agenda ? agendaBlocksFor(resident.agenda, false, date) : [],
        ];
      }),
    ),
    wishHistoryCount: resident.wishLifecycle?.outcomeCount ?? 0,
    wishAttempt: resident.wishLifecycle?.attempt,
    remap: null,
    weekStart: "",
    stale: false,
    missingMoves: 0,
    remapFailure: null,
    fallback: "",
    remapPrompt: null,
    signature: "",
    days: Array.from({ length: 7 }, (_, offset) => ({
      weekday: VILLAGE_WEEKDAYS[(((now.getDay() + 6) % 7) + offset) % 7]!,
      dateLabel: villageDateLabel(village.foundedAt, moment.dayIndex + offset),
      isToday: offset === 0,
      blocks: [],
    })),
  }));
}

/** Record a deliberate agenda revision before queuing it; repeated action IDs reuse the intent. */
export async function clearVillagerAgenda(characterId: string, actionId = randomVillageSeed()): Promise<void> {
  const village = await readVillageState();
  const resident = village.villagers.find((entry) => entry.characterId === characterId);
  if (!resident) throw notFound("That villager does not live here.");
  if (resident.agendaGeneration === actionId) return;
  await mutateVillageState((state) => {
    const entry = state.villagers.find((entry) => entry.characterId === characterId);
    if (!entry || entry.agendaGeneration === actionId) return;
    entry.agendaGeneration = actionId;
    if (entry.agenda) {
      entry.agenda.personalizationPending = true;
      entry.agenda.personalizationFailure = "";
    }
  });
  await queueVillagerAgenda(characterId);
}

/** Correct a false wish verdict without changing any separately confirmed world state. */
export async function correctCompletedWish(characterId: string, wishId: string): Promise<void> {
  await correctResidentWish(characterId, wishId);
}

/** Deprecated ingestion alias; no generation side effects. */
export async function setVillagerScheduleIngestion(characterId: string, enabled: boolean): Promise<void> {
  await setVillagerScheduleInfluence(characterId, { enabled });
}
export async function setVillagerScheduleInfluence(characterId: string, value: unknown): Promise<void> {
  const raw = value as { enabled?: unknown; categories?: Record<string, unknown> };
  if (
    !raw ||
    typeof raw !== "object" ||
    (raw.enabled !== undefined && typeof raw.enabled !== "boolean") ||
    (raw.categories !== undefined &&
      (!raw.categories ||
        typeof raw.categories !== "object" ||
        Object.entries(raw.categories).some(
          ([key, value]) =>
            !INFLUENCE_CATEGORIES.includes(key as (typeof INFLUENCE_CATEGORIES)[number]) || typeof value !== "boolean",
        )))
  )
    throw badRequest("Choose valid schedule influence settings.");
  await mutateVillageState((state) => {
    const resident = state.villagers.find((entry) => entry.characterId === characterId);
    if (!resident) throw notFound("That villager does not live here.");
    const previous = influenceSettings(resident.scheduleInfluence);
    resident.scheduleInfluence = influenceSettings({
      ...previous,
      ...raw,
      categories: { ...previous.categories, ...raw.categories },
    });
    resident.ingestSchedule = resident.scheduleInfluence.enabled;
  });
  await refreshVillagerRemaps(await readVillageState(), new Date(), characterId);
}
/** Deprecated no-op for old clients. */
export async function clearVillagerRemap(characterId: string): Promise<void> {
  if (!(await readVillageState()).villagers.some((entry) => entry.characterId === characterId))
    throw notFound("That villager does not live here.");
}

/**
 * Forget one thing.
 *
 * Removed by id rather than by position, unlike a notice: the story tab shows
 * the list in the order the record holds it, but it is a long list a player
 * scrolls, and a delete press that landed against a stale render would take out
 * whichever memory had drifted into that row. The id is what the press was
 * aimed at.
 *
 * Throwing when nothing matched is deliberate — it is how the route answers 404
 * for a memory that was already removed in another tab, rather than reporting a
 * success that did nothing.
 */
export async function removeChronicleEntry(id: unknown): Promise<void> {
  const entryId = asTrimmedString(id);
  if (entryId.length === 0) throw badRequest("That is not a memory of this village.");
  await mutateVillageState((state) => {
    const next = state.chronicle.filter((entry) => entry.id !== entryId);
    if (next.length === state.chronicle.length) throw notFound("That memory is no longer kept here.");
    state.chronicle = next;
  });
}

export async function removeVillageRecollection(id: unknown): Promise<void> {
  const entryId = asTrimmedString(id);
  if (!entryId) throw badRequest("That is not a passing recollection of this village.");
  await mutateVillageState((state) => {
    const next = state.recollections.filter((entry) => entry.id !== entryId);
    if (next.length === state.recollections.length) throw notFound("That recollection is no longer active.");
    state.recollections = next;
  });
}

export async function addNotice(value: unknown): Promise<VillageSnapshot> {
  const notice = boundText(value, MAX_NOTICE_LENGTH);
  if (notice.length === 0) throw badRequest("Write something before pinning it up.");
  // Read the length inside the mutation so a concurrent change is respected
  // rather than overwritten by a count taken before the retry loop.
  await mutateVillageState((state) => {
    if (state.noticeboard.length >= MAX_NOTICEBOARD_NOTES) {
      throw badRequest(`The noticeboard holds at most ${MAX_NOTICEBOARD_NOTES} notices.`);
    }
    // Unsigned, because that is what a note you tack up yourself looks like.
    // The villagers' notes carry their names; yours does not need one, since
    // everyone here already knows who you are.
    state.noticeboard.push({ author: "", text: notice });
  });
  return buildVillageSnapshot();
}

/** Take one notice down. Removed by position, so identical notices are separable. */
export async function removeNoticeAt(index: unknown): Promise<VillageSnapshot> {
  const position = Number(index);
  if (!Number.isInteger(position) || position < 0) throw badRequest("That is not a notice on the board.");
  await mutateVillageState((state) => {
    if (position >= state.noticeboard.length) throw notFound("That notice is no longer on the board.");
    state.noticeboard.splice(position, 1);
  });
  return buildVillageSnapshot();
}

function readBool(value: unknown): boolean {
  if (typeof value !== "boolean") throw badRequest("Image context controls must be on or off.");
  return value;
}
export function readVenueImageContext(value: unknown) {
  const row = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    useAssignedVillagerContext:
      row.useAssignedVillagerContext === undefined ? true : readBool(row.useAssignedVillagerContext),
    useVisualLore: row.useVisualLore === undefined ? true : readBool(row.useVisualLore),
  };
}
export async function setScenerySettings(value: {
  sceneryArtStyle?: unknown;
  personalizeVenueImagesByDefault?: unknown;
  useVisualLoreByDefault?: unknown;
}): Promise<VillageSnapshot> {
  await mutateVillageState((state) => {
    if (value.sceneryArtStyle !== undefined) state.sceneryArtStyle = readSceneryStyle(value.sceneryArtStyle);
    if (value.personalizeVenueImagesByDefault !== undefined)
      state.personalizeVenueImagesByDefault = readBool(value.personalizeVenueImagesByDefault);
    if (value.useVisualLoreByDefault !== undefined)
      state.useVisualLoreByDefault = readBool(value.useVisualLoreByDefault);
  });
  return buildVillageSnapshot();
}
export function readCreationPrivateZones(
  value: unknown,
  classes: VillageVenueClass[],
): NonNullable<VillageVenue["zones"]> {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 12) throw badRequest("Choose at most twelve private spaces.");
  const ids = new Set<string>();
  return value
    .filter((raw) => raw && typeof raw === "object" && raw.ownerId !== "player")
    .map((raw) => {
      const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
      const id = asTrimmedString(row.id),
        name = boundText(row.name, 100).trim(),
        purpose = boundText(row.purpose, 240).trim();
      if (!id || ids.has(id) || !id.startsWith("restricted:"))
        throw badRequest("Private space IDs must be unique restricted room IDs.");
      ids.add(id);
      if (!name || !purpose) throw badRequest("Give each private space a name and purpose.");
      const controllerIds = Array.isArray(row.controllerIds)
        ? [...new Set(row.controllerIds.filter((id): id is string => typeof id === "string" && !!id))]
        : [];
      if (!classes.includes("workplace") && !controllerIds.length)
        throw badRequest("Assign a controller to this private space.");
      return {
        ...defaultVenueSpace(
          classes.includes("workplace") ? "workplace" : (classes[0] ?? "other"),
          boundText(row.description, 1000),
        ),
        id,
        name,
        purpose,
        controllerIds,
        kind: classes.includes("workplace") ? ("staff" as const) : ("restricted" as const),
        seen: false,
        preparation: { status: "pending" as const },
      };
    });
}
