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
import { agendaAt, agendaDayPlan, villageAgendaDay, unwrittenVillageAgenda } from "./agenda-plan.js";
import {
  agendaBlocksFor,
  agendaDateKey,
  replaceRemainingAgendaDay,
  scheduleInformedWeek,
  workingAgendaWeek,
} from "./agenda-week.js";
import { readVillageConnectionSettings, validateVillageSetupConnections } from "./connections.js";
import { villagesConnectionIdFor } from "./connections.js";
import { badRequest, conflict, notFound, statusCodeOf } from "./errors.js";
import {
  DEFAULT_LORE_TOKEN_BUDGET,
  MAX_LORE_TOKEN_BUDGET,
  MIN_LORE_TOKEN_BUDGET,
  readLoreTokenBudget,
  readSelectedLorebookIds,
  readVillageLore,
} from "./lorebooks.js";
import { completedWishFacts } from "./wish-history.js";
import { selectPromptMemories } from "./memory-selection.js";
import { readScenarioImprint, readWorldFacts } from "./scenario-imprint.js";
import { DEFAULT_TOWN_MAP_LAYOUT_PROMPT, DEFAULT_TOWN_MAP_NEGATIVE_PROMPT } from "./town-map-image.js";
import { inspectVillageImage } from "./image-generation.js";
import {
  buildRemapPrompt,
  dayPlan,
  describeRemap,
  lookupRemap,
  MAX_REMAP_ATTEMPTS,
  proposeRemap,
  remapBlockKeys,
  remapBlocks,
  remapFailureText,
  remapNeedsWriting,
  remapSignature,
  VILLAGE_UNTRANSLATED_ACTIVITY,
  type VillageRemapContext,
} from "./native-remap.js";
import {
  readNativeScheduleSnapshot,
  readNativeWeekSchedules,
  type NativeRoutine,
  type NativeWeekSchedule,
} from "./native-schedules.js";
import {
  completeWithRoom,
  villagesDebugAgentsEnabled,
  villagesLanguageModels,
  villagesLogger,
} from "./package-runtime.js";
import { extractJsonObject } from "./village-bootstrap.js";
import { seedFoundingVenueDetails } from "./founding-drafts.js";
import { draftBuildProject, reconcileBuildProjects } from "./build-projects.js";
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
import { assertVillagePresence } from "./venue-presence.js";
import {
  boundText,
  coerceWish as renewWish,
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
  MAX_VILLAGER_WISHES,
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
  RemapBlock,
  VillageAgenda,
  VillageAgendaView,
  VillageCatalogEntry,
  VillageChronicleEntry,
  VillageChronicleEntryView,
  VillageDayView,
  VillageMomentView,
  VillageOpportunity,
  VillagePersonaEntry,
  VillagePersonaPreview,
  VillagePlaceView,
  VillagePlayerIdentity,
  VillageRecap,
  VillageRemap,
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
  VillageWish,
} from "./types.js";
import { readVenueRequestCore, venueRequestDraft, type VenueRequestCore } from "./venue-requests.js";
import { proposeCompactFounding, rebaseFoundingRemap } from "./founding-compact.js";
import {
  proposeAgenda,
  proposeHappenings,
  proposeNextWish,
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
          images: villager.sprite.expressions.map(({ view, label, filename, revision }) => ({
            view,
            label,
            url: `/api/sprites/${view === "side" ? villager.sprite!.sideAssetId : villager.sprite!.assetId}/file/${encodeURIComponent(filename)}${revision ? `?v=${revision}` : ""}`,
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
function villageSettings(
  village: VillageState,
  player: VillagePlayerIdentity,
  residenceAccess: {
    placeId: string;
    area: "outside" | "shared" | "private" | "public";
    privateOwnerId: string;
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
    scenarioImprint: village.scenarioImprint,
    worldFacts: village.worldFacts,
    selectedLorebookIds: village.selectedLorebookIds,
    loreTokenBudget: village.loreTokenBudget,
    loreTokenBudgetMin: MIN_LORE_TOKEN_BUDGET,
    loreTokenBudgetMax: MAX_LORE_TOKEN_BUDGET,
    foundingDetailsMaxLength: 2_000,
    foundingGuidanceMaxLength: 500,
    townMapLayoutPrompt: DEFAULT_TOWN_MAP_LAYOUT_PROMPT,
    townMapNegativePrompt: DEFAULT_TOWN_MAP_NEGATIVE_PROMPT,
    settingMaxLength: MAX_SETTING_LENGTH,
    venues: village.venues.map((venue) => {
      if (!hasVenueClass(venue, "residence")) {
        if (venue.playerSeenPublic) return venue;
        const blankState = { condition: "", items: [], publicFacts: [], features: [], traces: [], updatedAt: "" };
        return {
          ...venue,
          state: { ...venue.state, condition: "", furniture: [], publicFacts: [], features: [], traces: [] },
          spaces: venueSpaces(venue).map((space) => ({ ...space, state: blankState })),
        };
      }
      const inside =
        venue.occupancy.playerHome ||
        venue.playerSeenShared === true ||
        (residenceAccess?.placeId === venue.id && residenceAccess.area !== "outside");
      const privateOwnerId =
        residenceAccess?.placeId === venue.id && residenceAccess.area === "private"
          ? residenceAccess.privateOwnerId
          : "";
      const blankState = { condition: "", items: [], publicFacts: [], features: [], traces: [], updatedAt: "" };
      return {
        ...venue,
        description: venue.description,
        state: inside
          ? venue.state
          : { ...venue.state, condition: "", furniture: [], publicFacts: [], features: [], traces: [] },
        spaces: venueSpaces(venue).map((space) =>
          space.venueClass === "residence" && !inside
            ? { ...space, description: "", image: null, state: blankState }
            : space,
        ),
        privateSpaces: (venue.privateSpaces ?? []).map((space) =>
          space.ownerId === privateOwnerId || venue.playerSeenPrivateIds?.includes(space.ownerId)
            ? space
            : { ...space, description: "", image: null, state: blankState },
        ),
        archivedPrivateSpaces: [],
        editProposals: inside
          ? (venue.editProposals ?? []).filter(
              (proposal) => proposal.target === "shared" || proposal.ownerId === privateOwnerId,
            )
          : [],
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
    const { backfillVenueMemories } = await import("./venue-session.js");
    await backfillVenueMemories();
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
    return projectVillager(
      villager,
      card?.name ?? null,
      card?.summary ?? "",
      card?.tags ?? [],
      villager.cardSnapshot.nameColor ?? "",
      villager.cardSnapshot.dialogueColor ?? "",
      villagerPlaceView(village, villager, null, minuteOfDay, now),
    );
  });
  return {
    status: "ready",
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
    projects: village.projects,
    villageCapabilities: village.villageCapabilities,
    upgradeRequests: village.pendingDecisions.filter(
      (decision) => decision.kind === "venue-upgrade" && decision.status === "pending",
    ),
    residences: village.residences,
    venueMail: village.venueMail,
    noticeboard: village.noticeboard,
    happenings: village.happenings,
    villagers,
    isFounded: isVillageFounded(village),
    settings: villageSettings(village, player, residenceAccess),
    recap: null,
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
async function writeVillagerAgenda(characterId: string): Promise<VillageAgenda | null> {
  let village = await readVillageState();
  let villager = village.villagers.find((entry) => entry.characterId === characterId);
  if (!villager) return null;

  const effectiveCard = await readEffectiveVillagerCard(villager);
  if (!effectiveCard) {
    const empty: VillageAgenda = {
      wishes: [],
      routineSummary: "",
      day: villageAgendaDay(null, remapVenues(village.venues), villager.cardSnapshot.name),
      source: "village",
      generatedAt: new Date().toISOString(),
    };
    await storeAgenda(characterId, empty);
    return empty;
  }

  // The Engine's own weekly summary when it has one, so the wishes are written
  // against the life the character already lives rather than a life the village
  // invents beside it. `proposeAgenda` keeps this sentence in preference to its
  // own and marks the agenda `native`, which is the precedence the package
  // states everywhere else: the Engine is the authority on a character's time.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const agendaSetting =
        village.foundingPreparation?.status === "pending"
          ? villageFoundingSetting(village)
          : villageCurrentSetting(village);
      const agenda = await proposeAgenda({
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
      });
      await storeAgenda(
        characterId,
        agenda,
        villager.completedWishes.map((entry) => entry.wish.id),
        villager.agenda?.wishes.map((entry) => entry.id) ?? [],
      );
      return agenda;
    } catch (error) {
      if (statusCodeOf(error) === 409 && attempt < 2) {
        village = await readVillageState();
        villager = village.villagers.find((entry) => entry.characterId === characterId);
        if (!villager) return null;
        continue;
      }
      await mutateVillageState((state) => {
        const resident = state.villagers.find((entry) => entry.characterId === characterId);
        if (resident?.agenda) {
          resident.agenda.personalizationPending = true;
          resident.agenda.personalizationFailure = boundText(
            error instanceof Error ? error.message : String(error),
            300,
          );
          resident.agenda.personalizationAttemptDate = agendaDateKey(new Date());
        }
      });
      throw error;
    }
  }
  return null;
}

/**
 * Put one agenda on one villager's record.
 *
 * Re-checked inside the mutation for the reason every other write here is: a
 * model call takes time, and a villager who was moved out while it was in flight
 * must not be written back onto a roster they have left. Silently doing nothing
 * is right in that case — the call was made for a villager who no longer
 * exists, and there is no error a player could act on.
 */
async function storeAgenda(
  characterId: string,
  agenda: VillageAgenda,
  knownCompletedIds?: readonly string[],
  knownActiveIds?: readonly string[],
): Promise<void> {
  await mutateVillageState((state) => {
    const villager = state.villagers.find((entry) => entry.characterId === characterId);
    if (!villager) return;
    if (
      knownCompletedIds &&
      knownCompletedIds.join("\u0000") !== villager.completedWishes.map((entry) => entry.wish.id).join("\u0000")
    )
      throw conflict("A wish was fulfilled while this agenda was being written.");
    if (
      knownActiveIds &&
      knownActiveIds.join("\u0000") !== (villager.agenda?.wishes ?? []).map((entry) => entry.id).join("\u0000")
    )
      throw conflict("The villager's wishes changed while this agenda was being written.");
    const previous = villager.agenda;
    const now = new Date();
    const weekday = VILLAGE_WEEKDAYS[(now.getDay() + 6) % 7]!;
    const nextDay = agenda.week?.[weekday] ?? workingAgendaWeek(state.venues, villager.cardSnapshot.name)[weekday]!;
    villager.agenda = {
      ...agenda,
      wishes: [...(previous?.wishes ?? []), ...agenda.wishes]
        .filter((wish) => !villager.completedWishes.some((entry) => entry.wish.id === wish.id))
        .filter((wish, index, all) => all.findIndex((entry) => entry.id === wish.id) === index)
        .slice(0, MAX_VILLAGER_WISHES),
      activeDay: {
        dateKey: agendaDateKey(now),
        weekday,
        blocks:
          previous?.activeDay?.dateKey === agendaDateKey(now)
            ? replaceRemainingAgendaDay(previous.activeDay.blocks, nextDay, now.getHours() * 60 + now.getMinutes())
            : nextDay,
        scheduleInformed: false,
      },
      personalizationAttemptDate: agendaDateKey(now),
    };
    assertVillagePresence(state);
  });
}

const agendaWork = new Set<string>();

/** Persist the pending state before starting work; a later tick can resume it after a process exit. */
async function queueVillagerAgenda(characterId: string): Promise<void> {
  if (agendaWork.has(characterId)) return;
  await mutateVillageState((state) => {
    const agenda = state.villagers.find((entry) => entry.characterId === characterId)?.agenda;
    if (agenda) {
      agenda.personalizationPending = true;
      agenda.personalizationFailure = "";
    }
  });
  agendaWork.add(characterId);
  queueMicrotask(() => {
    void (async () => {
      try {
        await writeVillagerAgenda(characterId);
      } catch (error) {
        villagesLogger().warn("[villages] could not work out %s's agenda: %s", characterId, String(error));
      } finally {
        try {
          await translateVillagerWeek(characterId);
        } finally {
          agendaWork.delete(characterId);
        }
      }
    })();
  });
}

function activateVillagerDay(villager: VillageVillager, now: Date): void {
  const agenda = villager.agenda;
  if (!agenda) return;
  const weekday = VILLAGE_WEEKDAYS[(now.getDay() + 6) % 7]!;
  const informed = villager.ingestSchedule !== false && !!agenda.scheduleWeek?.[weekday];
  agenda.activeDay = {
    dateKey: agendaDateKey(now),
    weekday,
    blocks: informed ? agenda.scheduleWeek![weekday]! : (agenda.week?.[weekday] ?? agendaBlocksFor(agenda, false, now)),
    scheduleInformed: informed,
  };
}

export async function rollActiveAgendas(now: Date, known?: VillageState): Promise<boolean> {
  const village = known ?? (await readVillageState());
  if (village.villagers.every((villager) => villager.agenda?.activeDay?.dateKey === agendaDateKey(now))) return false;
  await mutateVillageState((state) => {
    for (const villager of state.villagers) {
      if (villager.agenda?.activeDay?.dateKey !== agendaDateKey(now)) activateVillagerDay(villager, now);
    }
  });
  return true;
}

/**
 * Write an agenda for every villager who has not got one, and answer with the
 * village as it now stands.
 *
 * Called from the tick, on the same part of the day the village writes its news,
 * so a "write it again" press or an upgrade from a version without agendas
 * settles itself without a button of its own. It is deliberately ALL of them
 * rather than one per part of day: a village whose people have no wishes is a
 * village whose news cannot come from them yet, and spreading the catch-up over
 * two real days would spread the interesting part of this feature over two real
 * days with it.
 *
 * It stops at the first refusal rather than working through the rest. A failure
 * here is nearly always the model being unreachable, and a model that just
 * refused the first villager is not going to answer for the next nine — walking
 * the whole roster would turn one connection problem into sixty failed calls
 * every time the day turned over.
 */
async function backfillAgendas(village: VillageState, now: Date): Promise<VillageState> {
  const missing = village.villagers.filter(
    (villager) =>
      villager.agenda === null ||
      ((villager.agenda.generatedAt === "" ||
        villager.agenda.personalizationPending === true ||
        VILLAGE_WEEKDAYS.some((day) => (villager.agenda?.week?.[day]?.length ?? 0) <= 5)) &&
        (!villager.agenda.personalizationFailure || villager.agenda.personalizationAttemptDate !== agendaDateKey(now))),
  );
  if (missing.length === 0) return village;
  await mutateVillageState((state) => {
    for (const villager of state.villagers) {
      if (villager.agenda) continue;
      villager.agenda = unwrittenVillageAgenda(state.venues, villager.cardSnapshot.name);
    }
  });
  for (const villager of missing) {
    await queueVillagerAgenda(villager.characterId);
  }
  return readVillageState();
}

/** A wish that has just died of age, and whose it was. */
type ExpiredWish = { characterId: string; wish: VillageWish };

/**
 * Whether this wish has died of age at this instant.
 *
 * A deadline that cannot be read is not a deadline, which is the whole of the
 * reason this is a function rather than a comparison written at the loop: every
 * wish that predates the field, and every wish in a document somebody has edited
 * by hand, carries nothing parseable here and must keep behaving exactly as it
 * did. Deleting somebody's wish is the one thing this package may not do on the
 * strength of arithmetic it did not agree to.
 *
 * The instant is compared as an instant, so a wish written for nine in the
 * morning dies at nine in the morning rather than at the midnight of some
 * calendar the village does not keep.
 */
function wishHasExpired(wish: VillageWish, at: number): boolean {
  const expiry = Date.parse(wish.expiresAt);
  return !Number.isNaN(expiry) && expiry <= at;
}

/**
 * Drop every wish that has died of age, and answer with what was dropped.
 *
 * The third way a wish leaves the list, after being answered and after the
 * village deciding the world has made it impossible, and the only one that costs
 * nothing: a comparison against the clock and one write, with no model call
 * anywhere near it. That is what makes it affordable to give a wish a lifetime
 * at all — see `wishLifetimeDays`.
 *
 * It is handed the state and answers with the state to carry on with, rather
 * than reading the store itself, because the caller then translates the week
 * FROM what it answers: a caller that dropped a wish and translated from the
 * list it dropped it from would bend hours around something nobody is carrying
 * any more, and would store that translation at a signature the very next part
 * of the day disagrees with.
 *
 * The villagers who lost one come back with it because the tick asks them for a
 * new wish, and this walk is the only place that knows who they were.
 */
async function dropExpiredWishes(
  village: VillageState,
  now: Date,
): Promise<{ state: VillageState; expired: ExpiredWish[] }> {
  const at = now.getTime();
  const expired: ExpiredWish[] = [];
  for (const villager of village.villagers) {
    for (const wish of villager.agenda?.wishes ?? []) {
      if (wishHasExpired(wish, at)) expired.push({ characterId: villager.characterId, wish });
    }
  }
  // Nothing to do is the ordinary case, and it leaves no write behind at all —
  // the same early answer `backfillAgendas` takes, for the same reason: this runs
  // on every part of every day of a village's life.
  if (expired.length === 0) return { state: village, expired };
  // Kept per villager rather than as one set of ids, so that a document carrying
  // the same id twice cannot take a wish off the wrong person.
  const dead = new Map<string, Set<string>>();
  for (const entry of expired) {
    const ids = dead.get(entry.characterId) ?? new Set<string>();
    ids.add(entry.wish.id);
    dead.set(entry.characterId, ids);
  }
  const state = await mutateVillageState((next) => {
    for (const villager of next.villagers) {
      const ids = dead.get(villager.characterId);
      if (!villager.agenda || !ids) continue;
      const kept = villager.agenda.wishes.filter((wish) => !ids.has(wish.id));
      if (kept.length !== villager.agenda.wishes.length) villager.agenda = { ...villager.agenda, wishes: kept };
    }
  });
  return { state, expired };
}

// ── Saying the Engine's week in this village's terms ────────────────────────
//
// The second derived record, and the one that makes autonomy mean something. The
// Engine writes a character's week from the card alone, so a pilot's mornings say
// "in the cockpit of the Halcyon" in a village with no spaceship; the village
// cannot edit that, because it is a character-level fact shared across every chat
// the character appears in and writing it would be a whole-blob replace with no
// optimistic lock. So the village keeps its own reading of the same week.
//
// What supersedes that reading is the QUESTION rather than the calendar. The
// Engine can regenerate the same Monday with different activities in it, and the
// player can rewrite the places or the setting the week is read through, and a
// translation that survived any of those would go on saying a week that no longer
// happens through words the village no longer uses. `remapSignature` digests all
// of it; `remapNeedsWriting` is the comparison. See `native-remap.ts` for the
// rule, and for what an hour with no translation reads as — it is the village's
// own default and NOT the Engine's sentence, which is the bug that clause used to
// be on the wrong side of.

/**
 * Everything one translation is written from.
 *
 * Pure and shared, because the debug tab has to rebuild this same context on
 * every read in order to show the prompt that WAS sent. A second assembly for
 * display would drift from the first and the tab would then be showing the user
 * a prompt they cannot actually reproduce.
 *
 * The wishes are passed in rather than looked up from the villager here, for the
 * reason the week is: what goes into the prompt and what goes into the digest
 * that invalidates it are the same list, and a function that helped itself to the
 * list would let a caller translate from one version of somebody's wishes and
 * judge the answer against another.
 */
function remapLoreKey(village: VillageState, characterId: string): string {
  const completed = village.villagers.find((entry) => entry.characterId === characterId)?.completedWishes ?? [];
  return JSON.stringify([
    village.selectedLorebookIds,
    village.loreTokenBudget,
    completed.map((entry) => [entry.wish.id, entry.wish.wish]),
  ]);
}

async function remapContextFor(
  village: VillageState,
  card: VillagerCard,
  schedule: NativeWeekSchedule,
  wishes: readonly VillageWish[],
): Promise<VillageRemapContext> {
  const blocks = remapBlocks(schedule);
  const lore = await readVillageLore(
    village.selectedLorebookIds,
    [
      villageCurrentSetting(village),
      card.name,
      card.summary,
      card.description,
      ...blocks.map((entry) => entry.activity),
      ...wishes.map((entry) => entry.wish),
    ].join("\n"),
    undefined,
    Math.max(200, Math.min(village.loreTokenBudget, 2_400 - blocks.length * 25)),
  );
  const completed = village.villagers.find((entry) => entry.characterId === card.id)?.completedWishes ?? [];
  return {
    village: village.name,
    setting: villageCurrentSetting(village),
    lore,
    completedWishes: completedWishFacts(completed, lore),
    loreKey: remapLoreKey(village, card.id),
    // The SENDABLE places, not every place — see `remapVenues`. The context is
    // both the digest and the numbered list, so filtering here rather than in
    // either of them is what keeps the question and its signature one thing.
    venues: remapVenues(village.venues),
    wishes,
    name: card.name,
    summary: card.summary,
    tags: card.tags,
    description: card.description,
    weekStart: schedule.weekStart,
    blocks,
  };
}

/**
 * What this villager wishes for, as the village holds it.
 *
 * The one read of a villager's wishes, and every caller that needs one goes
 * through it — the write, the walk that decides who owes a translation, the tab
 * that shows the decision, and the tick that keeps the list to its ceiling. It is
 * a function rather than a line repeated at each of them because all of them have
 * to be asking the same question. A translation written from one list and
 * measured against another is a villager re-translated on every part of every day
 * for ever, which is the most expensive way this package can fail and one of the
 * quietest.
 *
 * Empty is ordinary rather than a fault: a villager whose agenda has not been
 * written yet, one who genuinely wishes for nothing, and every villager in a
 * village whose save predates the feature all read as empty, and all of them
 * still translate.
 */
function wishesFor(village: VillageState, characterId: string): readonly VillageWish[] {
  return village.villagers.find((entry) => entry.characterId === characterId)?.agenda?.wishes ?? [];
}

/**
 * The digest of the question a translation of this week would answer, here.
 *
 * Assembled from the week and the village alone, and that is the point of it
 * being a function rather than a line inside `remapContextFor`: the one villager
 * this matters most for has no card left to build a context from. A character
 * deleted from the library gets an EMPTY translation — see `writeVillagerRemap`
 * — and an empty translation stored at NO signature would be owed again on every
 * part of every day for the rest of the village's life, which is the exact
 * failure the empty agenda exists to avoid on the other record.
 *
 * `blocks` is passed in rather than recomputed from the schedule because both
 * callers already need it: the gate needs the keys and this needs the digest, and
 * a week's worth of blocks is not worth walking twice per villager per part of
 * day.
 *
 * Nothing from the card reaches this digest. Editing a summary or a tag mid-week
 * must not re-translate a whole village over something that says nothing about
 * what anybody is doing. See `remapSignature` for the rest.
 *
 * The villager's own WISHES do reach it, and that is the one thing about a person
 * that gets to invalidate a translation. The difference from a card field is the
 * whole of the reason: a summary is what the player typed about who somebody is
 * and changes nothing about what they do, while a wish is a thing they are
 * carrying this week, it is quoted in the prompt, and an answer that mentions one
 * is not interchangeable with an answer that does not. The price is named where
 * the cost is paid — see `remapSignature` — and it is one model call for that
 * villager, not one for the village.
 */
function remapSignatureFor(
  village: VillageState,
  characterId: string,
  weekStart: string,
  blocks: readonly RemapBlock[],
  wishes: readonly VillageWish[],
): string {
  return remapSignature({
    setting: villageCurrentSetting(village),
    loreKey: remapLoreKey(village, characterId),
    venues: remapVenues(village.venues),
    wishes,
    weekStart,
    blocks,
  });
}

/**
 * Translate one villager's week into this village's own terms.
 *
 * The record is written LAST, for exactly the reason the agenda is: a model that
 * is unreachable costs the villager their translation and nothing else, and the
 * null it leaves is the state that asks for another try.
 *
 * A card that has gone from the library gets an EMPTY translation rather than a
 * failed one, and it is stored at the CURRENT signature with the retry budget
 * already spent. That pair is what makes it final rather than pending: there is
 * nothing left to ask about a card that no longer exists, so a record that could
 * still be recognised as incomplete would be asked about again on every part of
 * every day for the rest of the village's life. Moving the card back and pressing
 * "Forget this translation" is the way out — the press only deletes what is
 * stored, and the next part of the day asks again with the card back in place.
 */
async function writeVillagerRemap(
  characterId: string,
  village: VillageState,
  schedule: NativeWeekSchedule,
): Promise<VillageRemap | null> {
  const card = await readEffectiveVillagerCard(village.villagers.find((entry) => entry.characterId === characterId)!);
  const wishes = wishesFor(village, characterId);
  if (!card) {
    const empty: VillageRemap = {
      weekStart: schedule.weekStart,
      moves: [],
      routine: "",
      signature: remapSignatureFor(village, characterId, schedule.weekStart, remapBlocks(schedule), wishes),
      attempts: MAX_REMAP_ATTEMPTS,
      generatedAt: new Date().toISOString(),
    };
    await storeRemap(characterId, empty, schedule);
    return empty;
  }
  const context = await remapContextFor(village, card, schedule, wishes);
  // The count is about the QUESTION, not about this call: an attempt at a new
  // signature starts again at one, because what the retry budget protects against
  // is asking the same thing forever, not asking about a village that has changed.
  const previous = village.villagers.find((entry) => entry.characterId === characterId)?.remap ?? null;
  const signature = remapSignature(context);
  const attempts = previous && previous.signature === signature ? previous.attempts + 1 : 1;
  const { remap, failure } = await proposeRemap(context, { attempts });
  remap.foundingLens = remapSignatureFor(village, characterId, "founding", [], wishes);
  await storeRemap(characterId, remap, schedule);
  if (failure) {
    await mutateVillageState((state) => {
      const resident = state.villagers.find((entry) => entry.characterId === characterId);
      if (resident) resident.remapFailure = { at: new Date().toISOString(), message: remapFailureText(failure) };
    });
  }
  villagesLogger().debugOverride(
    villagesDebugAgentsEnabled(),
    "[villages] %s's translated week (%s): %s",
    card.name,
    remap.weekStart,
    describeRemap(remap),
  );
  return remap;
}

/**
 * Put one translation on one villager's record.
 *
 * Re-checked inside the mutation like every other write here: a model call takes
 * time, and a villager who left while it was in flight must not be written back
 * onto a roster they are no longer on.
 *
 * The failure is cleared in the SAME mutation rather than in one of its own, and
 * that is the whole reason this is a single store call: a translation and the
 * record of the attempt that failed to produce it are one fact about one villager,
 * and two writes would leave a window where the roster holds both the new table
 * and the old refusal — a villager reading as translated and refused at once.
 */
async function storeRemap(characterId: string, remap: VillageRemap, schedule: NativeWeekSchedule): Promise<void> {
  await mutateVillageState((state) => {
    const villager = state.villagers.find((entry) => entry.characterId === characterId);
    if (!villager) return;
    if (
      remap.signature !==
      remapSignatureFor(state, characterId, schedule.weekStart, remapBlocks(schedule), wishesFor(state, characterId))
    )
      return;
    villager.remap = remap;
    villager.remapFailure = null;
    if (villager.agenda) {
      const base = villager.agenda.week ?? workingAgendaWeek(state.venues, villager.cardSnapshot.name);
      villager.agenda.scheduleWeek = scheduleInformedWeek(base, schedule, remap);
      assertVillagePresence(state);
      if (villager.ingestSchedule !== false) updateTodayFromWeek(villager, new Date());
    }
  });
}

/**
 * Write down that this villager's translation was asked for and refused.
 *
 * The one place a failed translation leaves a mark, and the reason it exists at
 * all: a villager with no translation because the village has not got round to
 * them and a villager with no translation because the model refused them are the
 * same record and used to be the same screen. The schedules tab could say "no
 * translation yet" for a village whose model had been refusing every week for
 * days, which is a player looking at a broken feature and a working one and having
 * no way to tell.
 *
 * A refusal does NOT clear the stored translation. A stale table is what those
 * villagers are still living by, and replacing it with nothing because a rewrite
 * failed would be the model's outage changing somebody's day.
 *
 * Re-checked inside the mutation for the reason every write here is: the model call
 * that failed took time, and a villager who left while it was in flight must not
 * be written back onto a roster they are no longer on.
 */
async function storeRemapFailure(characterId: string, message: string, schedule: NativeWeekSchedule): Promise<void> {
  const at = new Date().toISOString();
  await mutateVillageState((state) => {
    const villager = state.villagers.find((entry) => entry.characterId === characterId);
    if (!villager) return;
    villager.remapFailure = { at, message };
    if (villager.agenda) {
      villager.agenda.scheduleWeek = scheduleInformedWeek(
        villager.agenda.week ?? workingAgendaWeek(state.venues, villager.cardSnapshot.name),
        schedule,
        null,
      );
      assertVillagePresence(state);
      if (villager.ingestSchedule !== false) updateTodayFromWeek(villager, new Date());
    }
  });
}

function updateTodayFromWeek(villager: VillageVillager, now: Date): void {
  const agenda = villager.agenda;
  if (!agenda) return;
  const weekday = VILLAGE_WEEKDAYS[(now.getDay() + 6) % 7]!;
  const informed = villager.ingestSchedule !== false && !!agenda.scheduleWeek?.[weekday];
  const next = (informed ? agenda.scheduleWeek?.[weekday] : agenda.week?.[weekday]) ?? [];
  agenda.activeDay = {
    dateKey: agendaDateKey(now),
    weekday,
    blocks:
      agenda.activeDay?.dateKey === agendaDateKey(now)
        ? replaceRemainingAgendaDay(agenda.activeDay.blocks, next, now.getHours() * 60 + now.getMinutes())
        : next,
    scheduleInformed: informed,
  };
}

/**
 * How many translations one pass will lose before it stops asking anybody else.
 *
 * The bound on a village-wide walk that can now survive a refusal — see
 * `refreshVillagerRemaps` for what the walk did before 0.4.61 and what that cost.
 * Two, because that is the smallest number that can tell the two kinds of failure
 * apart: a SAVE now writes down WHY each villager was refused, and one refusal
 * read on its own cannot be told from a connection that is down and will refuse
 * the next villager too. At two, the second refusal stops the pass and the two
 * records on the roster say whether the reason was the same one twice.
 *
 * Everything the walk skipped is picked up on the next part of the day, because
 * the gate it asks again through is the same list comparison it has always been:
 * skipping a villager costs them hours, not their translation.
 */
const REMAP_REFUSALS_PER_PASS = 2;

/**
 * Translate the week of every villager whose translation no longer matches the
 * question, and answer with nothing.
 *
 * It reads the week ONCE for the whole village rather than once per villager,
 * because a translation needs the whole week and the village was already paying
 * for a listing apiece. It also checks BEFORE it calls anything — the ordinary
 * case, once the village has caught up, is that every villager's translation
 * matches and the whole function is a map lookup and a string comparison per
 * person, which is why it can afford to run on every part of every day.
 *
 * `only` narrows the walk to one villager and exists for the move-in path: a
 * villager who has just arrived owes a translation immediately, and the rule
 * about WHICH villagers owe one must not be written a second time somewhere else.
 * The loop is a filter over one person in that case, so nothing about the
 * failure behaviour changes.
 *
 * A REFUSAL COSTS THE VILLAGER WHO WAS REFUSED AND NOBODY ELSE. Until 0.4.61 this
 * walked out of the whole loop at the first failure, on the reasoning that a
 * failure here is nearly always the model being unreachable and a model that just
 * refused one villager will not answer for the next fifty-nine. The second half of
 * that is true and the first half is not: the failures that actually happen are
 * per-villager — one week the model cannot finish, one answer nothing can parse —
 * and the villagers behind it in the roster were never asked at all. The roster
 * order is the order people moved in, so what that looked like in practice was the
 * first scheduled villager in a village silently blocking every translation for
 * every villager who arrived after them, forever, because a failed write leaves
 * the same null that asks for another try.
 *
 * `REMAP_REFUSALS_PER_PASS` is what keeps the unreachable-model case cheap: the
 * walk gives up after that many refusals in one pass, so a connection that is down
 * costs two calls and not one per resident, and the whole thing is a listing
 * again on the next part of the day. Two rather than one because a SAVE now
 * distinguishes "this villager's week is impossible" from "nothing is answering",
 * and one refusal is not enough to tell those apart.
 *
 * The failure is written onto the villager's own record, because this is the only
 * place that knows it: see `storeRemapFailure`.
 *
 * It returns nothing rather than the state, unlike `backfillAgendas`, because
 * nothing downstream reads a translation off the state it is handed — the tick
 * reads the translations later, off a second read, deliberately after this has
 * finished writing them.
 */
async function refreshVillagerRemaps(village: VillageState, now: Date, only?: string): Promise<void> {
  const weeks = await readNativeWeekSchedules(
    now,
    village.villagers.map((villager) => villager.characterId),
  );
  let refusals = 0;
  for (const villager of village.villagers) {
    if (only !== undefined && villager.characterId !== only) continue;
    const schedule = weeks.get(villager.characterId);
    // No schedule is not a failure and not a thing to write: there is no week to
    // translate, and the village's own routine stands.
    if (!schedule) {
      if (villager.agenda?.scheduleWeek)
        await mutateVillageState((state) => {
          const resident = state.villagers.find((entry) => entry.characterId === villager.characterId);
          if (resident?.agenda) {
            resident.agenda.scheduleWeek = null;
            updateTodayFromWeek(resident, now);
          }
        });
      continue;
    }
    if (villager.ingestSchedule === false) continue;
    const blocks = remapBlocks(schedule);
    const signature = remapSignatureFor(
      village,
      villager.characterId,
      schedule.weekStart,
      blocks,
      wishesFor(village, villager.characterId),
    );
    if (villager.remap?.signature !== signature && villager.agenda?.scheduleWeek)
      await mutateVillageState((state) => {
        const resident = state.villagers.find((entry) => entry.characterId === villager.characterId);
        if (resident?.agenda) resident.agenda.scheduleWeek = null;
      });
    if (!remapNeedsWriting(villager.remap, signature, remapBlockKeys(blocks))) {
      if (villager.agenda && !villager.agenda.scheduleWeek) {
        await mutateVillageState((state) => {
          const resident = state.villagers.find((entry) => entry.characterId === villager.characterId);
          if (resident?.agenda)
            resident.agenda.scheduleWeek = scheduleInformedWeek(
              resident.agenda.week ?? workingAgendaWeek(state.venues, resident.cardSnapshot.name),
              schedule,
              resident.remap,
            );
          assertVillagePresence(state);
        });
      }
      continue;
    }
    // A founding translation already chose village terms for each distinct native
    // activity. New weekly slots can reuse those terms without another model walk.
    const lens = remapSignatureFor(
      village,
      villager.characterId,
      "founding",
      [],
      wishesFor(village, villager.characterId),
    );
    if (villager.remap?.foundingLens === lens && villager.remap.signature !== signature) {
      await storeRemap(villager.characterId, rebaseFoundingRemap(villager.remap, schedule, signature), schedule);
      continue;
    }
    try {
      await writeVillagerRemap(villager.characterId, village, schedule);
    } catch (error) {
      refusals += 1;
      await storeRemapFailure(villager.characterId, remapFailureText(error), schedule);
      villagesLogger().warn(
        "[villages] could not translate %s's week for this village: %s",
        villager.cardSnapshot.name,
        String(error),
      );
      if (refusals >= REMAP_REFUSALS_PER_PASS) return;
    }
  }
}

/**
 * Translate one villager's week in the background, right after they move in.
 *
 * Not awaited by the move-in route and never rejects, for the reason
 * `topUpVillagerWishes` is shaped that way: the player has just pressed a button
 * and is about to look at the villager. The translation is the second model call
 * on that path, and putting it in front of the response would make the button
 * wait on a week the player cannot see yet, so it runs behind the agenda instead
 * of beside it.
 *
 * It is worth doing at all because the alternative is up to a whole part of the
 * day of a villager reading as the village's own default. The tick would have
 * caught them, but the tick runs on the clock and a player who has just added
 * somebody is about to talk to them.
 *
 * The whole body is inside one try, including the reads, and that is the point:
 * this runs after the response has gone and nothing is left to catch a rejection.
 * A failure leaves the null that the tick's own pass is looking for, so the only
 * cost is that this villager waits for the next part of the day after all.
 */
async function translateVillagerWeek(characterId: string): Promise<void> {
  try {
    const village = await readVillageState();
    if (!village.villagers.some((villager) => villager.characterId === characterId)) return;
    await refreshVillagerRemaps(village, new Date(), characterId);
  } catch (error) {
    villagesLogger().warn("[villages] could not translate %s's week for this village: %s", characterId, String(error));
  }
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
          nameColor: card.nameColor,
          dialogueColor: card.dialogueColor,
          capturedAt: addedAt,
        },
        addedAt,
        agenda: unwrittenVillageAgenda(state.venues, card.name),
        completedWishes: [],
        ingestSchedule: true,
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
    resident.cardSnapshot = proposed;
    if (proseChanged) {
      resident.agenda = unwrittenVillageAgenda(state.venues, card.name);
      resident.remap = null;
      resident.remapFailure = null;
    }
  });
  return buildVillageSnapshot();
}

/**
 * Give somebody something to wish for again, after something they wished for has been
 * settled.
 *
 * Called from the route that answers a wish, and deliberately NOT awaited by it:
 * the player is waiting on a reply, not on a list being rewritten, and a
 * villager who is momentarily short of a wish is not a broken villager.
 *
 * It never rejects. That is not tidiness — this runs after the response has gone
 * and nothing is left to catch a failure, so a rejection here would be an
 * unhandled one on a background task for the sake of a wish nobody asked for.
 * The whole thing is inside the try for that reason, including the reads.
 *
 * A failure is not repaired later and is not meant to be: the tick's
 * `backfillAgendas` only fills a NULL agenda, and this villager has a real one
 * with fewer things in it. What is left behind is a villager with a shorter
 * list, which is a smaller fault than the list being rewritten wrongly.
 */
export async function topUpVillagerWishes(characterId: string, settled: string): Promise<void> {
  try {
    const village = await readVillageState();
    const resident = village.villagers.find((villager) => villager.characterId === characterId);
    if (!resident) return;
    const remaining = resident.agenda?.wishes ?? [];
    const knownCompletedIds = resident.completedWishes.map((entry) => entry.wish.id).join("\u0000");
    if (remaining.length >= MAX_VILLAGER_WISHES) return;
    const card = await readEffectiveVillagerCard(resident);
    if (!card) return;

    const wish = await proposeNextWish({
      village: village.name,
      setting: villageCurrentSetting(village),
      name: card.name,
      summary: card.summary,
      tags: card.tags,
      personality: card.personality,
      routineSummary: resident.agenda?.routineSummary ?? "",
      remaining,
      completedWishes: resident.completedWishes,
      lore: await readVillageLore(
        village.selectedLorebookIds,
        [
          villageCurrentSetting(village),
          card.name,
          card.summary,
          card.personality,
          card.description,
          ...remaining.map((entry) => entry.wish),
          settled,
        ].join("\n"),
        undefined,
        village.loreTokenBudget,
      ),
      settled,
    });
    if (!wish) return;

    // Applied inside the write and checked against the live list, because a
    // second wish may have been answered while this was being written — the
    // list that was read at the top is a copy, and a write replaces the row.
    await mutateVillageState((state) => {
      const entry = state.villagers.find((villager) => villager.characterId === characterId);
      if (!entry?.agenda) return;
      if (entry.completedWishes.map((completed) => completed.wish.id).join("\u0000") !== knownCompletedIds) return;
      if (entry.agenda.wishes.length >= MAX_VILLAGER_WISHES) return;
      if (entry.agenda.wishes.some((existing) => existing.wish === wish.wish)) return;
      entry.agenda = { ...entry.agenda, wishes: [...entry.agenda.wishes, wish] };
    });
  } catch (error) {
    villagesLogger().warn("[villages] could not work out what %s wishes for next: %s", characterId, String(error));
  }
}

/**
 * How many villagers one part of the day will find a new wish for, after a wish
 * of theirs has died of age.
 *
 * Two, for the reason `REMAP_REFUSALS_PER_PASS` is two: a village whose wishes
 * were all written on the same day loses a whole roster's worth on the same day,
 * and one part of the day is not allowed to answer that with sixty model calls
 * for wishes nobody is waiting on. What is left over is picked up on the next
 * part of the day, and a villager who is one wish short in the meantime is not a
 * broken villager — they still speak, and they still have a week.
 */
const WISH_REFILLS_PER_PASS = 2;

/**
 * Find a new wish for everybody who has just lost one to age.
 *
 * The other two ways a wish leaves the list replace themselves where they
 * happen: answering one asks for the next on the route that answered it, and the
 * village deciding a wish is impossible has just been told why, in the same
 * reply. Ageing has nowhere to happen but the clock, so this is the pass that
 * notices it, and it is a pass of its own rather than a line inside
 * `dropExpiredWishes` because that one is a filter on the record while this one
 * spends a model call.
 *
 * `topUpVillagerWishes` does the work, and it is the very same helper the route
 * uses: one new wish rather than a whole agenda, so the routine and the wishes
 * nobody answered survive untouched. It refuses when the list is already full —
 * which, after a loss, it cannot be — and it never rejects.
 *
 * `settled` is the dead wish's own words. That prompt has one slot for "the
 * thing not to write again", and it is the slot that matters here: without it
 * the model's most obvious answer is the thing that has just stopped being on
 * somebody's mind. It arrives through a line that talks about a wish being
 * settled, which is a small untruth — nobody settled this one — and the smallest
 * one available. A wish that has run out of time has finished with either way,
 * and the alternative is a second prompt for the same question, which is two
 * prompts to keep in step instead of one.
 *
 * The wish written here bends hours from the NEXT part of the day, which is
 * deliberate. This runs after the translations, and the alternative is a second
 * translation call for the same villager in the same tick, to rewrite a week it
 * has just been handed. One part of a day is also how long a wish ANSWERED
 * mid-week already takes to reach an hour: the route that settles one cannot
 * translate either.
 *
 * It runs BEFORE the tick's two switches, which is not where a pass that spends
 * a model call belongs at first reading, and it is forced by the pass above it:
 * `dropExpiredWishes` takes the dead wish off the record, so this list is the
 * only copy that will ever exist, and both switches below are early returns that
 * would throw it away unanswered. Whichever of them returned first, a villager
 * whose wish had just died would keep the shorter list for good — the list that
 * shrinks and never refills is the whole of what this pass is for — and nothing
 * later could notice, because there is nothing left to compare against. So what
 * a switched-off part of day buys is one part of the day's news and not a wish,
 * which is the same call the translations above make and for the same reason: a
 * wish is what the villager is being asked to live this week by. It costs
 * nothing at all on a tick where nothing has died — the list is empty, so the
 * loop never starts — and what a switch costs on the rare tick it does not is
 * bounded at `WISH_REFILLS_PER_PASS` calls.
 */
async function refillAgedWishes(expired: readonly ExpiredWish[]): Promise<void> {
  const asked = new Set<string>();
  for (const entry of expired) {
    if (asked.has(entry.characterId)) continue;
    if (asked.size >= WISH_REFILLS_PER_PASS) return;
    asked.add(entry.characterId);
    await topUpVillagerWishes(entry.characterId, entry.wish.wish);
  }
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
  const venueId = agendaAt(villager.agenda, minuteOfDay, at, villager.ingestSchedule !== false)?.venueId ?? "";
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
    return { id: venue.id, name: venue.name, image: venue.presentation.image, kind: "venue" };
  }
  // Where they are when nothing has sent them anywhere: their own house. Named
  // after the BUILDING rather than after whoever lives there, because the name
  // of the person is already on the plate in front of them and the tab reads
  // that one — what this answers is only what kind of house it is.
  const home = village.venues.find((entry) => venueResidentIds(entry).includes(villager.characterId));
  if (!home) return null;
  const building = homeBuildingOptions().find((option) => option.kind === home.occupancy.homeKind);
  return { id: home.id, name: building?.name ?? home.name, image: home.presentation.image, kind: "home" };
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
    throw badRequest("Story pace must be off, quiet, balanced or lively.");
  }
  await mutateVillageState((state) => {
    state.storyPace = value as VillageStoryPace;
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
async function readLinkedPersona(personaId: unknown): Promise<{ id: string; name: string; identity: string }> {
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
): Promise<VillageSnapshot> {
  await assertVenueImageAccess(venueId, spaceClass, privateOwnerId);
  await mutateVillageState((state) => {
    const venue = state.venues.find((entry) => entry.id === venueId);
    if (!venue) throw notFound("That place is no longer in the village.");
    if (privateOwnerId) {
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
): Promise<void> {
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
  const postedSpaces = record.spaces;
  if (postedSpaces !== undefined && (!Array.isArray(postedSpaces) || postedSpaces.length !== classes.length))
    throw badRequest("Provide one scene for each Venue Class.");
  const spaces = classes.map((venueClass) => {
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
        project.kind === "build-venue" &&
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
      venue.occupancy.homeKind = next;
      venue.state.upgrades.push(state.homeBuildingNames[next]);
      venue.state.updatedAt = new Date().toISOString();
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
    draftBuildProject(
      state,
      { ...core, description, requestQuote: decision.requestQuote },
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
    const disallowed = Object.keys(posted).filter((key) => !["id", "name", "description"].includes(key));
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
          project.kind === "build-venue" &&
          project.status !== "complete" &&
          project.venueDraft?.name.toLowerCase() === name.toLowerCase(),
      )
    )
      throw conflict("That name is reserved by a build project.");
    current.name = name;
    current.description = description;
  });
  return buildVillageSnapshot();
}

/** Keep a proposed Residence edit exact until the affected residents approve it aloud. */
export async function proposeResidenceSpaceEdit(venueId: string, value: unknown): Promise<VillageSnapshot> {
  const row = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const target: "shared" | "private" = row.target === "private" ? "private" : "shared";
  const ownerId = asTrimmedString(row.ownerId);
  const { activeVenueSession } = await import("./venue-session.js");
  const session = await activeVenueSession();
  if (
    !session ||
    session.placeId !== venueId ||
    (target === "shared"
      ? session.area !== "shared" && session.area !== "private"
      : session.area !== "private" || session.privateOwnerId !== ownerId)
  )
    throw conflict("Enter the space with its resident's invitation before proposing a change.");
  await mutateVillageState((state) => {
    const venue = state.venues.find((entry) => entry.id === venueId);
    if (!venue || !hasVenueClass(venue, "residence")) throw notFound("That Residence is no longer here.");
    const current =
      target === "shared"
        ? venueSpaces(venue).find((space) => space.venueClass === "residence")
        : venue.privateSpaces?.find((space) => space.ownerId === ownerId);
    if (!current) throw notFound("That Residence space is no longer here.");
    const requiredIds = target === "shared" ? venueResidentIds(venue) : [ownerId];
    if (!requiredIds.length || requiredIds.some((id) => !venueResidentIds(venue).includes(id)))
      throw conflict("The space has no current resident who can approve this edit.");
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
        ownerId: target === "private" ? ownerId : "",
        baseUpdatedAt: current.state.updatedAt,
        proposed,
        requiredIds,
        approvedIds: [],
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
    const current =
      proposal.target === "shared"
        ? venueSpaces(venue).find((space) => space.venueClass === "residence")
        : venue.privateSpaces?.find((space) => space.ownerId === proposal.ownerId);
    const currentResidents = proposal.target === "shared" ? venueResidentIds(venue) : [proposal.ownerId];
    if (
      !current ||
      current.state.updatedAt !== proposal.baseUpdatedAt ||
      JSON.stringify(currentResidents) !== JSON.stringify(proposal.requiredIds)
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
    if (proposal.target === "shared") {
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
  if (dependencies.roomPresent) throw conflict("End the active visit before deleting this venue.");
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
    const next: VillageResidence = {
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
    const old = state.venues.find((venue) => venueResidentIds(venue).includes(characterId));
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
          { ownerId: characterId, archivedAt, space: oldPrivate },
        ].slice(-32);
        old.privateSpaces = (old.privateSpaces ?? []).filter((space) => space.ownerId !== characterId);
      }
      old.residentIds = venueResidentIds(old).filter((id) => id !== characterId);
      old.playerSeenPrivateIds = (old.playerSeenPrivateIds ?? []).filter((id) => id !== characterId);
      old.occupancy.residentCharacterId = old.residentIds[0] ?? null;
    }
    destination.residentIds = [...venueResidentIds(destination), characterId];
    destination.playerSeenPrivateIds = (destination.playerSeenPrivateIds ?? []).filter((id) => id !== characterId);
    destination.privateSpaces = [
      ...(destination.privateSpaces ?? []).filter((space) => space.ownerId !== characterId),
      {
        ...defaultVenueSpace("residence", `A private space for this resident at ${destination.name}.`),
        id: `private:${characterId}`,
        ownerId: characterId,
        adaptationPending: needsAdaptation,
        adaptationSourceArchiveAt: needsAdaptation ? archivedAt : "",
      },
    ];
    destination.occupancy.residentCharacterId = destination.residentIds[0] ?? null;
    residence.venueId = destination.id;
    residence.proposedVenueId = "";
    residence.status = "current";
    residence.completesAt = "";
    keepAgendaPlaces(state);
    moved = true;
  });
  if (moved) await retryResidencePrivateSpaceAdaptation(characterId);
  return buildVillageSnapshot(now);
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
  try {
    const model = await villagesLanguageModels().resolveForRequest({
      connectionId: await villagesConnectionIdFor("system"),
    });
    const messages = [
      {
        role: "system" as const,
        content: `Choose portable personal elements from the archived private room and adapt its description to the new Residence form. Never copy shared furnishings or invent possessions. Return JSON only: {"description":"brief room description","items":["exact portable item from input"],"featureIds":["exact portable feature id from input"]}. Keep the result grounded and concise.`,
      },
      {
        role: "user" as const,
        content: JSON.stringify({
          resident: characterId,
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
    await mutateVillageState((state) => {
      const currentVenue = state.venues.find((venue) => venue.id === destination.id);
      const current = currentVenue?.privateSpaces?.find((space) => space.ownerId === characterId);
      if (!current?.adaptationPending || current.adaptationSourceArchiveAt !== archive.archivedAt) return;
      current.description = description;
      current.state.items = items;
      current.state.features = features;
      current.state.updatedAt = new Date().toISOString();
      current.adaptationPending = false;
    });
  } catch (error) {
    villagesLogger().warn("[villages] private space adaptation remains retryable: %s", String(error));
  }
  return buildVillageSnapshot();
}

// ── Places: the village's one list ───────────────────────────────────────────
// A place is somewhere the player or a villager can BE, whether that is a shop
// on the map or the house they sleep in. Both are written through
// `setVillageVenues`; what is here is the reading of a request body, which
// refuses rather than repairs because the player typed it and can still see it.

/** A place as it comes out of a request body, once it has been checked over. */
type ParsedPlace = {
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
  return {
    id: asTrimmedString(record.id) || randomVillageSeed(),
    name,
    form,
    classes,
    spaces: classes.map((venueClass) => {
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
    residenceCapacity: capacity,
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

/** Existing villages keep their locked beginning, including older records without a first-day account. */
export function validateFirstDayDescription(description: string, founding: boolean): void {
  if (founding && !description.trim()) throw badRequest("Describe the village's first day.");
}

export async function runVillageSetup(input: {
  name?: unknown;
  setting?: unknown;
  foundingReason?: unknown;
  foundingDetails?: unknown;
  foundingGuidance?: unknown;
  scenarioImprint?: unknown;
  worldFacts?: unknown;
  selectedLorebookIds?: unknown;
  loreTokenBudget?: unknown;
  playerPersonaId?: unknown;
  venues?: unknown;
  townMapImage?: unknown;
  townMapView?: unknown;
  homeBuildingNames?: unknown;
}): Promise<VillageSnapshot> {
  const name = readVillageName(input.name);
  const setting = readVillageSetting(input.setting);
  if (setting.length === 0) throw badRequest("Say what the village is like before founding it.");
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
    throw badRequest("The first-day description must be text of at most 2,000 characters.");
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
    throw badRequest("Open beginning does not use a separate narrative direction.");
  }
  const village = await readVillageState();
  const founding = !isVillageFounded(village);
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
  const initialResidentIds = [
    ...new Set(places.flatMap((place) => [place.occupancy.residentCharacterId]).filter(Boolean)),
  ];
  const cardsById = new Map(cards.map((card) => [card.id, card]));
  const initialResidents = initialResidentIds.map((characterId) => cardsById.get(characterId)!);
  // The wizard's step is the map, and the map it draws is the village's houses.
  // The places the model proposed are not on it and were never shown on it, so
  // the posted list is taken as the houses and every sendable place already in
  // the village is kept — one record for every place, with the houses written
  // whole and the rest left exactly as they were. A re-run to move a single pin
  // therefore cannot quietly delete the places the player was last sent to.
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
      ...place,
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
    if (!founding)
      assertFoundingScenarioLocked(state, { foundingReason, foundingDetails, foundingGuidance, scenarioImprint });
    state.name = name;
    state.setting = setting;
    state.foundingReason = foundingReason;
    state.foundingDetails = foundingDetails;
    state.foundingGuidance = foundingGuidance;
    state.scenarioImprint = scenarioImprint;
    state.worldFacts = worldFacts;
    state.selectedLorebookIds = selectedLorebookIds;
    state.loreTokenBudget = loreTokenBudget;
    state.townMapImage = townMap.image;
    if (!townMap.image || townMap.image !== village.townMapImage) {
      state.townMapCanvasWidth = townMap.size?.width ?? TOWN_MAP_EXPECTED_WIDTH;
      state.townMapCanvasHeight = townMap.size?.height ?? TOWN_MAP_EXPECTED_HEIGHT;
    }
    state.townMapImageSetAt = townMap.image.length > 0 ? new Date().toISOString() : "";
    state.townMapView = townMap.view;
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
    state.homeBuildingNames = readHomeBuildingNames(input.homeBuildingNames ?? state.homeBuildingNames);
    // The stamp that closes the wizard. Written here and nowhere else, so a
    // village can only become founded by coming through this flow.
    state.setupAt = new Date().toISOString();
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
        cardSnapshot: snapshotFromCard(card, 1),
        addedAt: new Date().toISOString(),
        agenda: unwrittenVillageAgenda(state.venues, card.name),
        completedWishes: [],
        ingestSchedule: true,
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

function foundedVillagerPrepared(village: VillageState, id: string, schedule: NativeWeekSchedule | null): boolean {
  const resident = village.villagers.find((entry) => entry.characterId === id);
  return !!(
    resident?.agenda?.generatedAt &&
    !resident.agenda.personalizationPending &&
    (!schedule ||
      resident.ingestSchedule === false ||
      resident.remap?.signature ===
        remapSignatureFor(village, id, schedule.weekStart, remapBlocks(schedule), wishesFor(village, id)))
  );
}

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
            const space = venue.spaces?.[0];
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
    let weeks: Map<string, NativeWeekSchedule> | null = null;
    for (const villager of initial.villagers) {
      const id = villager.characterId;
      const latest = await readVillageState();
      if (latest.foundingPreparation?.status !== "pending") return;
      if (latest.foundingPreparation.completedIds.includes(id)) continue;
      const stage = async (
        next: NonNullable<VillageState["foundingPreparation"]>["stage"],
        attempt: number,
        loreEntryCount?: number,
        modelName?: string,
      ) =>
        mutateVillageState((state) => {
          const marker = state.foundingPreparation;
          if (marker?.status !== "pending") return;
          marker.currentId = id;
          marker.stage = next;
          marker.stageStartedAt = new Date().toISOString();
          marker.attempt = attempt;
          if (loreEntryCount !== undefined) marker.loreEntryCount = loreEntryCount;
          marker.modelName = modelName ?? "";
        });
      const previousAttempt =
        latest.foundingPreparation.currentId === id ? (latest.foundingPreparation.attempt ?? 0) : 0;
      if (previousAttempt >= 3) {
        const snapshot = await readNativeScheduleSnapshot(new Date());
        if (
          snapshot.cardsReadable &&
          foundedVillagerPrepared(
            latest,
            id,
            snapshot.schedules.find((schedule) => schedule.characterId === id) ?? null,
          )
        ) {
          weeks = new Map(snapshot.schedules.map((schedule) => [schedule.characterId, schedule]));
          await mutateVillageState((state) => {
            const marker = state.foundingPreparation;
            if (marker?.status === "pending" && !marker.completedIds.includes(id)) marker.completedIds.push(id);
          });
          continue;
        }
      }
      let done = false;
      for (let attempt = previousAttempt + 1; attempt <= 3; attempt += 1) {
        try {
          await stage("reading", attempt, 0);
          if (!weeks) {
            const snapshot = await readNativeScheduleSnapshot(new Date());
            if (!snapshot.cardsReadable)
              throw new Error(
                "The character library could not be read, so the villagers' schedules could not be checked.",
              );
            weeks = new Map(snapshot.schedules.map((schedule) => [schedule.characterId, schedule]));
          }
          const currentState = await readVillageState();
          const current = currentState.villagers.find((entry) => entry.characterId === id);
          if (!current) throw new Error("This villager is no longer in the founding roster.");
          const schedule = weeks.get(id) ?? null;
          if (foundedVillagerPrepared(currentState, id, schedule)) {
            await mutateVillageState((state) => {
              const marker = state.foundingPreparation;
              if (marker?.status === "pending" && !marker.completedIds.includes(id)) marker.completedIds.push(id);
            });
            done = true;
            break;
          }
          const card = await readEffectiveVillagerCard(current);
          if (!card) throw new Error(`The character card for ${current.cardSnapshot.name} could not be read.`);
          const setting = villageFoundingSetting(currentState);
          const venues = remapVenues(currentState.venues);
          await stage("lore", attempt);
          const lore = await readVillageLore(
            currentState.selectedLorebookIds,
            [
              setting,
              card.name,
              card.summary,
              card.personality,
              card.description,
              ...venues.map((venue) => venue.name),
              ...(schedule ? remapBlocks(schedule).map((block) => block.activity) : []),
            ].join("\n"),
            undefined,
            currentState.loreTokenBudget,
            true,
          );
          await stage("resolving", attempt, lore.length);
          const result = await proposeCompactFounding(
            {
              village: currentState.name,
              setting,
              card,
              venues,
              lore,
              home: (() => {
                const home = currentState.venues.find((venue) => venue.occupancy.residentCharacterId === id);
                return home ? [home.name, home.form, home.state.condition].filter(Boolean).join("; ") : "";
              })(),
              completedWishes: current.completedWishes,
              activeWishes: current.agenda?.generatedAt ? current.agenda.wishes : [],
              schedule,
            },
            async (modelName) => {
              await stage("model", attempt, lore.length, modelName);
            },
            attempt === 1,
          );
          await stage("saving", attempt);
          await storeAgenda(
            id,
            result.agenda,
            current.completedWishes.map((entry) => entry.wish.id),
            current.agenda?.wishes.map((entry) => entry.id) ?? [],
          );
          if (schedule && current.ingestSchedule !== false) {
            await stage("applying", attempt);
            const withAgenda = await readVillageState();
            const remap: VillageRemap = {
              weekStart: schedule.weekStart,
              moves: result.moves,
              routine: result.agenda.routineSummary,
              signature: remapSignatureFor(
                withAgenda,
                id,
                schedule.weekStart,
                remapBlocks(schedule),
                wishesFor(withAgenda, id),
              ),
              foundingLens: remapSignatureFor(withAgenda, id, "founding", [], wishesFor(withAgenda, id)),
              attempts: 1,
              generatedAt: new Date().toISOString(),
            };
            await storeRemap(id, remap, schedule);
            if (
              (await readVillageState()).villagers.find((entry) => entry.characterId === id)?.remap?.signature !==
              remap.signature
            )
              throw new Error("The native schedule changed while its village translation was being saved.");
          }
          await stage("saving", attempt);
          await mutateVillageState((state) => {
            const marker = state.foundingPreparation;
            if (marker?.status === "pending" && !marker.completedIds.includes(id)) marker.completedIds.push(id);
            if (marker) marker.error = "";
          });
          done = true;
          break;
        } catch (error) {
          await mutateVillageState((state) => {
            const marker = state.foundingPreparation;
            if (marker?.status !== "pending") return;
            marker.error = boundText(error instanceof Error ? error.message : String(error), 300);
            if (attempt === 3) marker.status = "failed";
          });
        }
      }
      if (!done) {
        await mutateVillageState((state) => {
          if (state.foundingPreparation?.status === "pending") {
            state.foundingPreparation.status = "failed";
            state.foundingPreparation.error ||= "Preparation stopped after three attempts. Retry this villager.";
          }
        });
        return;
      }
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
  await mutateVillageState((state) => {
    const marker = state.foundingPreparation;
    if (!marker || marker.status !== "failed") return;
    marker.status = "pending";
    marker.error = "";
    marker.attempt = 0;
    marker.stage = undefined;
  });
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

/**
 * Store the town map the homepage draws, or clear it by passing "".
 *
 * The picture is kept exactly as it was picked. Re-encoding it to fit a smaller
 * budget would be the same class of mistake as truncating an over-long prompt
 * preset: the player chose that image because they could see it. Anything too
 * big is refused instead, and the message names the size so they can act on it.
 *
 * ponytail: debug-level control. A base64 image on the village record is the
 * ceiling here — it needs no new storage and travels with a backup — but the
 * whole payload is re-sent on every change. A finished town map belongs on a
 * package asset or its own file, which is the upgrade path.
 */
export async function setVillageTownMapImage(value: unknown, view?: unknown): Promise<VillageSnapshot> {
  const submitted = await readTownMapSubmission(value, view);
  const { image } = submitted;
  // Stamped only while there is a map, so the tab can tell "no map" apart from
  // "same map" when it decides whether to refetch.
  const setAt = image.length > 0 ? new Date().toISOString() : "";
  // The framing arrives WITH the picture rather than after it: a crop means
  // nothing without the picture it is a crop of, and applying the two in two
  // writes would draw the new picture framed by the old numbers for a beat.
  // An absent or unusable framing takes the shipped default rather than being
  // rejected, because the picture is the part the player chose deliberately.
  const next = submitted.view;
  await mutateVillageState((state) => {
    if (!image || image !== state.townMapImage) {
      state.townMapCanvasWidth = submitted.size?.width ?? TOWN_MAP_EXPECTED_WIDTH;
      state.townMapCanvasHeight = submitted.size?.height ?? TOWN_MAP_EXPECTED_HEIGHT;
    }
    state.townMapImage = image;
    state.townMapImageSetAt = setAt;
    state.townMapView = next;
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
    currentPlaces.set(place.id, [...(currentPlaces.get(place.id) ?? []), villager.characterId]);
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
  const venueId =
    overlap?.[0] ??
    activeProject?.venueId ??
    (wishing ? currentPlaces.entries().find(([, ids]) => ids.includes(wishing.characterId))?.[0] : undefined) ??
    publicVenue?.id ??
    "";
  if (actorIds.length === 0 && venueId.length === 0) return null;
  const facts = [
    `${moment.localTime} local time`,
    `${moment.weather} weather`,
    overlap ? `${actorIds.length} residents share this venue` : "",
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
export async function reconcileVillage(options: { forceStory?: boolean; now?: Date } = {}): Promise<VillageSnapshot> {
  const forced = options.forceStory === true;
  const now = options.now ?? new Date();
  let recorded = await readVillageState();
  if (!isVillageFounded(recorded)) return buildVillageSnapshot(now);
  if (recorded.foundingPreparation && recorded.foundingPreparation.status !== "ready") return buildVillageSnapshot(now);
  let completedMove = false;
  for (const residence of recorded.residences) {
    if (residence.status !== "moving" || Date.parse(residence.completesAt ?? "") > now.getTime()) continue;
    try {
      await completeVillageResidence(residence.characterId, false, now);
      completedMove = true;
    } catch (error) {
      villagesLogger().warn("[villages] pending move could not complete: %s", String(error));
    }
  }
  if (completedMove) recorded = await readVillageState();
  await mutateVillageState((state) => reconcileBuildProjects(state, now));
  await respondDueVenueMail(now);
  recorded = await readVillageState();
  const moment = deriveVillageMoment({ foundedAt: recorded.foundedAt, seed: recorded.seed, now });
  const previousThrough = recorded.simulatedThrough || recorded.foundedAt || moment.instant;
  const previousMs = Date.parse(previousThrough);
  const currentMs = Date.parse(moment.instant);
  const elapsedMs = Number.isFinite(previousMs) && Number.isFinite(currentMs) ? Math.max(0, currentMs - previousMs) : 0;

  // These are deterministic reconciliation rules. They run for both the live
  // timer and restart catch-up, irrespective of story pace.
  const aged = await dropExpiredWishes(recorded, now);
  const withAgendas = await backfillAgendas(aged.state, now);
  await refreshVillagerRemaps(withAgendas, now);
  await rollActiveAgendas(now);
  await refillAgedWishes(aged.expired);
  await mutateVillageState((state) => {
    const storedMs = Date.parse(state.simulatedThrough);
    if (!Number.isFinite(storedMs) || currentMs > storedMs) state.simulatedThrough = moment.instant;
    state.lastKnownTimeZone = moment.timeZone;
    const discoveries: VillageChronicleEntry[] = [];
    for (const venue of state.venues) {
      const remaining = [] as NonNullable<VillageVenue["state"]["traces"]>;
      for (const trace of venue.state.traces ?? []) {
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
        const present = state.villagers.filter(
          (villager) => villagerPlaceView(state, villager, null, moment.minuteOfDay, now)?.id === venue.id,
        );
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
      venue.state.traces = remaining;
    }
    if (discoveries.length) state.chronicle = [...discoveries, ...state.chronicle];
  });

  const village = await readVillageState();
  const dateKey = localDateKey(now);
  const shouldCreateStory = forced || (village.storyPace !== "off" && village.lastCreativeDate !== dateKey);
  if (!shouldCreateStory) {
    const snapshot = await buildVillageSnapshot(now);
    return { ...snapshot, recap: buildReturnRecap(village, previousThrough, moment.instant, elapsedMs) };
  }

  const routines = new Map<string, NativeRoutine>();
  const opportunity = creativeOpportunity(village, routines, moment, previousThrough);
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
    opportunities: [opportunity],
    lastSimulatedAt: previousThrough,
    forced,
  };
  try {
    const proposal = await proposeHappenings(context);
    await mutateVillageState((state) => {
      if (!forced && (state.storyPace === "off" || state.lastCreativeDate === dateKey)) return;
      const allowance = forced ? 3 : storyAllowance(state.storyPace, state.seed, dateKey);
      const opportunityId = opportunity.id;
      if (state.processedOpportunityIds.includes(opportunityId)) return;
      const happenings = proposal.happenings.slice(0, allowance);
      state.happenings = [...happenings, ...state.happenings].slice(0, MAX_HAPPENINGS);
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
              (entry) =>
                entry.proposedVenueId === venue.id && (entry.status === "pending" || entry.status === "moving"),
            )
          )
            continue;
          const currentVenueId =
            state.venues.find((entry) => entry.occupancy.residentCharacterId === request.characterId)?.id ?? "";
          const next: VillageResidence = {
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
          queueVillageVenueRequest(
            state,
            request.core,
            request.characterId,
            "background",
            opportunityId,
            moment.instant,
          );
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
      state.lastCreativeDate = dateKey;
      if (!state.processedOpportunityIds.includes(opportunityId)) {
        state.processedOpportunityIds = [...state.processedOpportunityIds, opportunityId].slice(-256);
      }
    });
  } catch (error) {
    villagesLogger().warn("[villages] could not write down what has been happening: %s", String(error));
  }
  const reconciled = await readVillageState();
  const snapshot = await buildVillageSnapshot(now);
  return { ...snapshot, recap: buildReturnRecap(reconciled, previousThrough, moment.instant, elapsedMs) };
}

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

/**
 * What every villager is after, as the debug tab draws it.
 *
 * Read on its own route rather than folded into the snapshot, for the same
 * reason the story and the chat logs are: it is one model call's worth of text
 * per villager, the snapshot is re-sent on every keystroke of every chat, and
 * nothing a villager decides, says or is prompted with is read from here.
 *
 * `missing` is the card being gone from the library, resolved the same way and
 * for the same reason as everywhere else. It is worth showing on this tab in
 * particular, because it is the one case where an empty agenda is the end of the
 * story rather than a villager waiting to be written for.
 *
 * It also carries the translation of the Engine's week, and that is the one part
 * of this listing the village itself reads. Those fields are for a person: the
 * week the Engine is keeping, the moves the village made from it, and the prompt
 * the whole thing was written from, rebuilt here so the wording can be read and
 * argued with instead of guessed at from the output. They are on this view
 * rather than a route of their own because a translation means nothing on its
 * own — it is only readable against the week it came from, and the two belong
 * side by side.
 *
 * The week read is the same 30-second cached listing the tick takes, so opening
 * this tab repeatedly costs nothing and showing the prompt does not add a
 * database read per villager. It is taken as the whole SNAPSHOT rather than as
 * the week map, because this is the one caller that goes on to make a claim to
 * the player about what it found: a listing that cannot tell "the Engine is
 * keeping no week for this villager" from "this reader never saw the cards" can
 * only report the first, and it reported it for a village whose cards were all
 * scheduled.
 */
export async function buildVillageAgendas(): Promise<VillageAgendaView[]> {
  const now = new Date();
  const [initialVillage, read, cards] = await Promise.all([
    readVillageState(),
    readNativeScheduleSnapshot(now),
    // A library that does not answer is answered with nothing here rather than
    // with an error. This listing is a read-only question, and every claim it
    // makes on the strength of a card is already covered by `weekUnreadable`
    // below, so failing the whole request would only mean the player is shown a
    // stack of nothing instead of the sentence that says nobody looked. Names
    // fall back to the village's own cache of them.
    listVillagerCards().catch((error: unknown) => {
      villagesLogger().warn(
        "[villages] the character library could not be read while listing weeks: %s",
        String(error),
      );
      return [];
    }),
  ]);
  let village = initialVillage;
  if (await rollActiveAgendas(now, village)) village = await readVillageState();
  const live = new Map(cards.map((card) => [card.id, card]));
  const weeks = new Map(read.schedules.map((schedule) => [schedule.characterId, schedule]));
  // The village's own clock, so the listing can say which day is today
  // and put a date beside each weekday. Derived once for the whole listing, for
  // the reason the tick derives it once: every row has to be about the same
  // moment, and a clock read per villager would eventually straddle midnight.
  const moment = deriveVillageMoment({ foundedAt: village.foundedAt, seed: village.seed, now });
  return Promise.all(
    village.villagers.map(async (villager) => {
      const card = live.get(villager.characterId) ?? null;
      const schedule = weeks.get(villager.characterId) ?? null;
      const blocks = schedule ? remapBlocks(schedule) : [];
      // The question the village is asking this villager's translation to answer
      // for right now, built once and read twice: it is what `stale` compares the
      // stored signature against, and it is what the tab shows a player so the
      // badge can be argued with instead of trusted.
      const signature = remapSignatureFor(
        village,
        villager.characterId,
        schedule?.weekStart ?? "",
        blocks,
        wishesFor(village, villager.characterId),
      );
      return {
        characterId: villager.characterId,
        name: card?.name ?? villager.cardSnapshot.name,
        // Gated on the read, so a villager is never called missing by a reader
        // that could not open the library in the first place.
        missing: !card && read.cardsReadable,
        weekUnreadable: !read.cardsReadable,
        addedAt: villager.addedAt,
        agenda: villager.agenda,
        completedWishes: villager.completedWishes,
        ingestSchedule: villager.ingestSchedule !== false,
        nativeSchedule: schedule ? { weekStart: schedule.weekStart, days: schedule.days } : null,
        remap: villager.remap,
        weekStart: schedule?.weekStart ?? "",
        // The same comparison the tick's own gate makes, built from the same two
        // helpers, so the badge on this tab and the village's decision to write
        // again can never disagree about a villager.
        stale: remapNeedsWriting(villager.remap, signature, remapBlockKeys(blocks)),
        // How much of the week the stored translation cannot explain, counted over
        // the SAME capped key list the prompt asked about and the gate above judged.
        // A whole translation leaves this at zero; a week the model answered badly
        // and the retry budget then settled for leaves it at however many hours went
        // missing, which is the number that makes "the village gave up on this week"
        // visible instead of inferred from rows of `at home`.
        missingMoves: remapBlockKeys(blocks).filter((key) => lookupRemap(villager.remap, key).length === 0).length,
        remapFailure: villager.remapFailure,
        fallback: VILLAGE_UNTRANSLATED_ACTIVITY,
        remapPrompt:
          card && schedule
            ? buildRemapPrompt(await remapContextFor(village, card, schedule, wishesFor(village, villager.characterId)))
            : null,
        signature,
        // The whole week in order from today, Engine blocks on the left and the
        // village's reading of them on the right. A villager with no week gets
        // seven days of nothing, which the tab draws as an absence rather than as a
        // busy day.
        days: villageDayViews(village.foundedAt, now, moment.dayIndex, schedule, villager.remap),
      };
    }),
  );
}

/**
 * The whole week, each block by block, in the village's own words.
 *
 * It is the WHOLE week rather than a window because the Engine's week is a weekly
 * PATTERN keyed by weekday NAME, holds no dates at all, and every day in it is
 * simultaneous — so there is no such thing as "the days that matter" inside it,
 * only the seven the card actually answered with. Showing three of them was this
 * function choosing which of somebody's days were worth the tab's height, and a
 * debug panel that shortens a week is one a reader has to trust rather than
 * check: a block on Saturday could not be seen at all when the clock said
 * Wednesday, and a card whose only hours are at the weekend read as an empty card.
 *
 * The week is still ROTATED to start at the weekday the given clock is on and
 * walked forward with a wrap, because the Engine's pattern has no first day and a
 * reader arriving on a Thursday wants their Thursday first. Each day is labelled
 * with the village's own date so the wrapping week and the calendar the player is
 * living in cannot be confused for each other.
 *
 * A day with no blocks is answered with an empty list rather than with an invented
 * day. A villager whose card carries no schedule at all has no hours on any of the
 * seven, and a caller that wants to draw that absence draws it; a placeholder row
 * minted here would be the village inventing a schedule, which is the leak this
 * package spends its time refusing.
 *
 * The plan join is `dayPlan`, once per day, on the SAME clock reading for all
 * seven: one hour and minute go in and one `current` flag comes out, and it is
 * cleared by hand on the days that are not today. A plan for Wednesday built at
 * eight on Monday would otherwise mark Wednesday's eight-o'clock block as
 * happening, which is a claim a reader would act on.
 */
function villageDayViews(
  foundedAt: string,
  now: Date,
  dayIndex: number,
  schedule: NativeWeekSchedule | null,
  remap: VillageRemap | null,
): VillageDayView[] {
  const at = { hour: now.getHours(), minute: now.getMinutes() };
  const start = (now.getDay() + 6) % 7;
  const days: VillageDayView[] = [];
  for (let offset = 0; offset < VILLAGE_WEEKDAYS.length; offset += 1) {
    const weekday = VILLAGE_WEEKDAYS[(start + offset) % VILLAGE_WEEKDAYS.length]!;
    const blocks = dayPlan(weekday, schedule?.days[weekday] ?? [], remap, at);
    days.push({
      weekday,
      dateLabel: villageDateLabel(foundedAt, dayIndex + offset),
      isToday: offset === 0,
      blocks: offset === 0 ? blocks : blocks.map((block) => ({ ...block, current: false })),
    });
  }
  return days;
}

/**
 * Throw away one villager's wishes so the village works them out again.
 *
 * The agenda is cleared and that is all this does — no model call, no waiting.
 * The write happens on the next part of the day the tick already runs on, which
 * means the press is instant and a player who presses it twice costs nothing.
 * Anything else would be a second code path that spends a model call, and the
 * tick's backfill is the one place that is allowed to.
 *
 * It is here for two reasons. It is the way to ask again for a villager whose
 * answer was dull, and it is the only way out for a villager whose card was
 * deleted and then restored: their agenda was emptied when the card went
 * missing — see `writeVillagerAgenda` — and an empty agenda is final.
 */
export async function clearVillagerAgenda(characterId: string): Promise<void> {
  const village = await readVillageState();
  if (!village.villagers.some((entry) => entry.characterId === characterId)) {
    throw notFound("That villager does not live here.");
  }
  await queueVillagerAgenda(characterId);
}

/** Correct a false wish verdict without changing any separately confirmed world state. */
export async function correctCompletedWish(characterId: string, wishId: string): Promise<void> {
  await mutateVillageState((state) => {
    const villager = state.villagers.find((entry) => entry.characterId === characterId);
    if (!villager) throw notFound("That villager does not live here.");
    const completed = villager.completedWishes.find((entry) => entry.wish.id === wishId);
    if (!completed) throw notFound("That completed wish is not in this villager's record.");
    villager.completedWishes = villager.completedWishes.filter((entry) => entry.wish.id !== wishId);
    state.correctedWishMemoryIds = [...state.correctedWishMemoryIds, completed.memoryId];
    state.chronicle = state.chronicle.filter((entry) => entry.id !== completed.memoryId);
    if (
      villager.agenda &&
      villager.agenda.wishes.length < MAX_VILLAGER_WISHES &&
      !villager.agenda.wishes.some((entry) => entry.id === wishId)
    ) {
      const restored = renewWish(completed.wish, completed.wish.id, new Date().toISOString());
      if (restored) villager.agenda.wishes = [...villager.agenda.wishes, restored];
    }
  });
  await queueVillagerAgenda(characterId);
}

export async function setVillagerScheduleIngestion(characterId: string, enabled: boolean): Promise<void> {
  await mutateVillageState((state) => {
    const villager = state.villagers.find((entry) => entry.characterId === characterId);
    if (!villager) throw notFound("That villager does not live here.");
    villager.ingestSchedule = enabled;
    updateTodayFromWeek(villager, new Date());
  });
  if (enabled) await translateVillagerWeek(characterId);
}

/**
 * Throw away one villager's translation of the Engine's week, and the record of
 * any attempt to write a new one that failed.
 *
 * The twin of `clearVillagerAgenda`, down to the reason it caches nothing: the
 * next pass writes a translation for any villager whose stored one does not match
 * the question the village is asking, and no translation at all is the most
 * obviously stale thing a record can be. So the press is instant and the model
 * call happens on the tick that was going to run anyway.
 *
 * It exists because a translation is invalidated by things a player cannot press
 * a button for — the week the Engine regenerates, the places and the setting the
 * week is read through — and a wording that can only be tested by waiting for one
 * of those is a wording nobody will test.
 *
 * The refusal goes with the translation, in the same mutation. This is a player
 * saying "I know, try again", and a villager left holding yesterday's complaint
 * about a translation that no longer exists would be the tab reporting a failure
 * for an attempt that has not been made yet.
 */
export async function clearVillagerRemap(characterId: string): Promise<void> {
  const village = await readVillageState();
  if (!village.villagers.some((entry) => entry.characterId === characterId)) {
    throw notFound("That villager does not live here.");
  }
  await mutateVillageState((state) => {
    const villager = state.villagers.find((entry) => entry.characterId === characterId);
    if (!villager) return;
    villager.remap = null;
    villager.remapFailure = null;
  });
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
