import { captureZoneObservation } from "../rules/zone-observation.js";
import { readResidenceAgreement } from "../rules/residence-agreement.js";
import { readLoreUse } from "../../../shared/helpers/lore.js";
import { emptyPlaceRegistry, readPlaceRegistry } from "../rules/places.js";
import { MAX_IDENTITY_DESCRIPTION_LENGTH } from "../../../shared/contracts/resident-description.js";
import { MAX_PHYSICAL_DESIGN_LENGTH } from "../../../shared/helpers/project-design.js";
import {
  EMPTY_RESIDENT_ADMISSION,
  readResidentAdmission,
  readWorldName,
} from "../../../shared/helpers/resident-admission.js";
import { connectionProblem } from "../../../shared/helpers/zone-contact.js";
import { readZoneLayout } from "../../../shared/helpers/zone-layout.js";
import { validTimeZone } from "../../../shared/helpers/zoned-date.js";
import { RETURN_CATCHUP_HISTORY_LIMIT } from "../models/world.js";
import { cloneReturnCapture, copyExchangeReceipts } from "../rules/world-context-copy.js";
import { readEstablishment } from "../rules/establishment.js";
import type {
  VillageAgenda,
  VillageBackgroundPace,
  VillagePendingDecision,
  VillageProject,
  VillageResidence,
  VillageState,
  VillageTownMapView,
  VillageVenue,
  VillageVenueClass,
  VillageVenueEvent,
  VillageVenueImage,
  VillageVenueZone,
  VillageVillager,
  VillageVillagerCardSnapshot,
  VillageZoneDraft,
} from "../models/world.js";
import { completeAgendaWeek, workingAgendaWeek } from "../rules/agenda-week.js";
import { projectAgendaReservations, readProjectFocus } from "../rules/project-focus.js";
import { decodeVillageClock } from "../rules/clock-state.js";
import { asFraction, asIsoString, asRecord, asString, asStringArray, asTrimmedString } from "../rules/coerce.js";
import { coerceFoundingTasks } from "../rules/founding-tasks.js";
import { coerceLoreTokenBudget, coerceSelectedLorebookIds, DEFAULT_LORE_TOKEN_BUDGET } from "../rules/lore-policy.js";
import { memoryRequire } from "../rules/memory-integrity.js";
import { readContinuity } from "./continuity-codec.js";
import { readEpisodes } from "./episode-codec.js";
import { emptyContinuity } from "../rules/continuity.js";
import { emptyEpisodes } from "../rules/episodes.js";
import { readPlaceContinuity, readPlaceDescription } from "../rules/zone-continuity.js";
import { coerceVillageNarrationStyle, defaultVillageNarrationStyle } from "../rules/narration-style.js";
import { readOpening } from "../rules/opening-project.js";
import { coerceRoutineProfile, influenceSettings } from "../rules/owned-routine.js";
import { coercePlayerBackground } from "../rules/player-background.js";
import { coerceProgressTasks } from "../rules/progress-engine.js";
import { readProjectPlan } from "../rules/project-completion.js";
import {
  boundText,
  DEFAULT_TOWN_MAP_VIEW,
  GLOBAL_GALLERY_REF_PREFIX,
  HOME_BUILDINGS,
  isGlobalGalleryRef,
  isHomeBuildingKind,
  isTownMapFit,
  MAX_REQUESTER_NAME_LENGTH,
  MAX_EVENT_TEXT_LENGTH,
  MAX_PHYSICAL_NARRATION_LENGTH,
  MAX_PLACES,
  MAX_PLAYER_PERSONA_ID_LENGTH,
  MAX_PLAYER_PERSONA_IDENTITY_LENGTH,
  MAX_PLAYER_PERSONA_NAME_LENGTH,
  MAX_AGENDA_ACTIVITY_LENGTH,
  MAX_ROUTINE_SUMMARY_LENGTH,
  MAX_SETTING_LENGTH,
  MAX_VENUE_DESCRIPTION_LENGTH,
  MAX_VENUE_EVENTS,
  MAX_VENUE_IMAGE_ID_LENGTH,
  MAX_VENUE_IMAGE_URL_LENGTH,
  MAX_VENUE_NAME_LENGTH,
  MAX_VENUE_NOTE_LENGTH,
  TOWN_MAP_FOCUS_MAX,
  TOWN_MAP_FOCUS_MIN,
  TOWN_MAP_ZOOM_MAX,
  TOWN_MAP_ZOOM_MIN,
} from "../rules/prompt-preset.js";

import { coerceSocialActivities } from "../rules/social-activity.js";
import { copySocialWishes } from "../rules/social-wishes.js";
import { coerceSpriteManager, managerResidentSprite } from "../rules/sprite-manager-model.js";
import { readVenueAccess, readZonePolicy } from "../rules/venue-access.js";
import { readNarrativeState } from "./narrative-codec.js";
import { defaultVenueSpace, validVenueClasses, venueResidentIds } from "../rules/venue-model.js";
import { chooseAgendaZone, synchronizeVenueZones, ZONE_KINDS } from "../rules/venue-zones.js";
import { randomVillageSeed, VILLAGE_WEEKDAYS } from "../rules/village-clock.js";
import { zonePictureBaseline, zonePicturePhysicalRecord } from "../rules/zone-picture.js";
import { emptyStartingHistory } from "../rules/starting-history.js";
import { readStartingHistory } from "./starting-history-codec.js";

export function defaultVillageState(): VillageState {
  return {
    worldPlaces: emptyPlaceRegistry(),
    version: 18,
    continuity: emptyContinuity(),
    episodes: emptyEpisodes(),
    startingHistory: emptyStartingHistory(),
    backgroundReceipts: {},
    exchangeReceipts: {},
    noticeSequence: 0,
    dismissedNoticeIds: [],
    socialContractVersion: 2,
    progressEngineVersion: 1,
    name: "",
    narrationStyle: defaultVillageNarrationStyle(),
    characterSpeechColors: true,
    sendOnEnter: false,
    spriteCardFlipEnabled: true,
    spriteVariantsEnabled: true,
    // An empty setting means "no place yet": the venue and routine blocks render
    // nothing, and the village behaves exactly as it did before they existed.
    setting: "",
    worldRules: "",
    worldName: "",
    communityVenueId: "",
    playerBackground: "",
    selectedLorebookIds: [],
    sceneryArtStyle: "",
    personalizeVenueImagesByDefault: true,
    useVisualLoreByDefault: true,
    loreTokenBudget: DEFAULT_LORE_TOKEN_BUDGET,
    // No place in the village yet, and no home on the map: the founding flow
    // writes the homes the player placed, and a village that predates places
    // simply has none, so the place and home blocks render nothing.
    venues: [],
    homeBuildingNames: {
      "small-home": HOME_BUILDINGS["small-home"].name,
      "medium-home": HOME_BUILDINGS["medium-home"].name,
      "large-home": HOME_BUILDINGS["large-home"].name,
      "huge-home": HOME_BUILDINGS["huge-home"].name,
    },
    venueEvents: [],
    visitRetention: { mode: "forever", value: 0 },
    residences: [],
    // Empty means "not founded yet", which is what opens the setup wizard. It
    // is stamped only by the setup route, never by `mutateVillageState`, so a
    // village cannot become "founded" as a side effect of some other write.
    setupAt: "",
    foundingPreparation: null,
    // Both are filled in by `mutateDocument` on the village's first write, so a
    // player who only ever looks at the tab never gets a record created for them.
    foundedAt: "",
    seed: "",
    simulatedThrough: "",
    lastKnownTimeZone: "",
    timeZone: "",
    clock: null,
    backgroundPace: "balanced",
    narrativeConsequence: "gentle",
    lastPlanningDate: "",
    planningUsage: { dateKey: "", count: 0 },
    processedActionIds: [],
    projects: [],
    progressTasks: [],
    pendingDecisions: [],
    villagers: [],
    // Empty rather than the default text: the default lives in `prompt-preset.ts`
    // and is applied at render time, so improving it reaches villages that never
    // touched the setting. An empty box is what the renderer reads as "this
    // village has written nothing" and answers with the shipped text.
    // The resolved pair: written by nothing here, filled from the Persona's
    // cached copy by whatever code is about to build a prompt. Empty is a
    // village with nothing linked, and the renderer answers it with "the
    // player".
    playerName: "",
    playerDescription: "",
    // No Persona until the player picks one. A village founded before Personas
    // existed reads exactly like this, which is what makes the upgrade silent.
    playerPersonaId: "",
    // The copy of that Persona, kept so a chat turn never reads the Engine's
    // Persona library. Empty beside an empty id, and empty for a Persona that
    // says nothing about itself.
    playerPersonaName: "",
    playerPersonaIdentity: "",
    playerPersonaMissing: false,
    // No map until the player adds one. The image is a data URL so it is carried
    // with the record rather than sitting somewhere the village cannot back up.
    maps: [],
  };
}
function coerceVillager(value: unknown): VillageVillager | null {
  const raw = asRecord(value);
  if (Object.hasOwn(raw, "wishHead")) throw new Error("Wish history was not loaded for this operation.");
  const characterId = asTrimmedString(raw.characterId);
  if (characterId.length === 0) return null;
  memoryRequire(
    typeof raw.incarnation === "string" && raw.incarnation.length > 0 && raw.incarnation.length <= 160,
    "missing resident incarnation",
  );
  const cardSnapshot = coerceVillagerCardSnapshot(raw.cardSnapshot);
  if (!cardSnapshot || cardSnapshot.id !== characterId) return null;
  if (typeof raw.letterFontId !== "string" || raw.letterFontId.length > 120)
    throw new Error("This saved resident needs a current writing-style assignment.");
  return {
    incarnation: raw.incarnation,
    characterId,
    letterFontId: raw.letterFontId,
    agendaGeneration: asString(raw.agendaGeneration),
    cardSnapshot,
    ...(typeof asRecord(raw.identityDescription).revision === "string"
      ? {
          identityDescription: {
            text: boundText(asRecord(raw.identityDescription).text, MAX_IDENTITY_DESCRIPTION_LENGTH),
            revision: asRecord(raw.identityDescription).revision as string,
            initialGenerationComplete: asRecord(raw.identityDescription).initialGenerationComplete !== false,
          },
        }
      : {}),
    ...(coerceResidentSignature(raw.signature) ? { signature: coerceResidentSignature(raw.signature)! } : {}),
    admission: readResidentAdmission(raw.admission) ?? { ...EMPTY_RESIDENT_ADMISSION },
    spriteManager: coerceSpriteManager(raw.spriteManager),
    sprite: managerResidentSprite(coerceSpriteManager(raw.spriteManager)),
    addedAt: asIsoString(raw.addedAt) ?? new Date().toISOString(),
    // Absent reads as null rather than as an empty agenda, and the difference
    // matters: null means "not written for yet", which is what makes the
    // village write one. An empty agenda is a positive statement that asking
    // produced nothing, and it must only ever come from actually asking.
    agenda: coerceAgenda(raw.agenda),
    wishes: copySocialWishes(raw.wishes),
    scheduleInfluence: influenceSettings(raw.scheduleInfluence),
  };
}
function coerceVillagerCardSnapshot(value: unknown): VillageVillagerCardSnapshot | null {
  const raw = asRecord(value);
  const id = asTrimmedString(raw.id);
  const revision =
    typeof raw.revision === "number" && Number.isInteger(raw.revision) && raw.revision > 0 ? raw.revision : null;
  const sourceStatus = raw.sourceStatus === "available" || raw.sourceStatus === "missing" ? raw.sourceStatus : null;
  const name = asTrimmedString(raw.name);
  const capturedAt = asIsoString(raw.capturedAt);
  if (!id || revision === null || sourceStatus === null || !name || !capturedAt) return null;
  return {
    id,
    revision,
    sourceStatus,
    name,
    comment: asTrimmedString(raw.comment),
    summary: asString(raw.summary),
    tags: asStringArray(raw.tags),
    systemPrompt: asString(raw.systemPrompt),
    postHistoryInstructions: asString(raw.postHistoryInstructions),
    description: asString(raw.description),
    personality: asString(raw.personality),
    scenario: asString(raw.scenario),
    backstory: asString(raw.backstory),
    appearance: asString(raw.appearance),
    exampleDialogue: asString(raw.exampleDialogue),
    ...(typeof raw.nameColor === "string" ? { nameColor: asTrimmedString(raw.nameColor) } : {}),
    ...(typeof raw.dialogueColor === "string" ? { dialogueColor: asTrimmedString(raw.dialogueColor) } : {}),
    capturedAt,
  };
}
function coerceAgenda(value: unknown): VillageAgenda | null {
  if (value === null || value === undefined) return null;
  const raw = asRecord(value);
  if (Object.keys(raw).length === 0) return null;
  const agenda: VillageAgenda = {
    socialActivities: coerceSocialActivities(raw.socialActivities),
    routineSummary: boundText(raw.routineSummary, MAX_ROUTINE_SUMMARY_LENGTH),
    day: Array.isArray(raw.day)
      ? raw.day.flatMap((entry) => {
          const item = asRecord(entry);
          const startMinute =
            typeof item.startMinute === "number" && Number.isInteger(item.startMinute)
              ? Math.max(0, Math.min(1439, item.startMinute))
              : undefined;
          const endMinute =
            typeof item.endMinute === "number" && Number.isInteger(item.endMinute)
              ? Math.max(1, Math.min(1440, item.endMinute))
              : undefined;
          if (startMinute === undefined || endMinute === undefined || endMinute <= startMinute) return [];
          return [
            {
              startMinute,
              endMinute,
              venueId: asTrimmedString(item.venueId),
              zoneId: asTrimmedString(item.zoneId) || undefined,
              activity: boundText(item.activity, MAX_AGENDA_ACTIVITY_LENGTH),
            },
          ];
        })
      : [],
    // Left empty rather than stamped with "now": a record that predates agendas
    // has no answer to when this was written, and inventing one would put a
    // time on it that the debug tab would then show as fact.
    generatedAt: asIsoString(raw.generatedAt) ?? "",
  };
  const fallback = workingAgendaWeek();
  agenda.week = completeAgendaWeek(raw.week, fallback);
  agenda.plannedDays = Object.fromEntries(
    Object.entries(asRecord(raw.plannedDays))
      .filter(([key]) => /^\d{4}-\d{2}-\d{2}$/.test(key))
      .slice(-14)
      .map(([key, blocks]) => [key, completeAgendaWeek({ Monday: blocks }, agenda.week!).Monday!]),
  );
  const active = asRecord(raw.activeDay);
  if (
    typeof active.dateKey === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(active.dateKey) &&
    typeof active.weekday === "string"
  ) {
    const rows = completeAgendaWeek({ [active.weekday]: active.blocks }, agenda.week)[active.weekday];
    if (rows)
      agenda.activeDay = {
        dateKey: active.dateKey,
        weekday: active.weekday,
        blocks: rows,
        scheduleInformed: active.scheduleInformed === true,
      };
  }
  agenda.routineProfile = coerceRoutineProfile(raw.routineProfile);
  if (!agenda.routineProfile) throw new Error("Invalid saved routine profile. Start a fresh Village.");
  if (asRecord(raw.routineProfile).baseWeek)
    agenda.routineProfile.baseWeek = completeAgendaWeek(asRecord(raw.routineProfile).baseWeek, agenda.week!);
  agenda.personalizationPending = raw.personalizationPending === true;
  const influence = asRecord(raw.scheduleInfluenceSnapshot);
  if (
    influence.version === 1 &&
    typeof influence.signature === "string" &&
    ["rhythms", "busy", "interests", "entities", "adopted", "unresolved"].every((key) =>
      Array.isArray(influence[key]),
    ) &&
    (influence.rhythms as unknown[]).every((value) => {
      const row = asRecord(value);
      return (
        VILLAGE_WEEKDAYS.includes(row.weekday as (typeof VILLAGE_WEEKDAYS)[number]) &&
        Number.isInteger(row.startMinute) &&
        Number.isInteger(row.endMinute) &&
        (row.startMinute as number) >= 0 &&
        (row.startMinute as number) < 1440 &&
        (row.endMinute as number) >= 0 &&
        (row.endMinute as number) <= 1440 &&
        row.startMinute !== row.endMinute
      );
    }) &&
    (influence.busy as unknown[]).every((value) => {
      const row = asRecord(value);
      return (
        VILLAGE_WEEKDAYS.includes(row.weekday as (typeof VILLAGE_WEEKDAYS)[number]) &&
        Number.isInteger(row.part) &&
        (row.part as number) >= 0 &&
        (row.part as number) <= 3
      );
    }) &&
    ["interests", "entities", "adopted", "unresolved"].every((key) =>
      (influence[key] as unknown[]).every((value) => typeof value === "string"),
    ) &&
    (influence.patterns === undefined ||
      (Array.isArray(influence.patterns) &&
        influence.patterns.every(
          (value) => typeof asRecord(value).weekend === "boolean" && typeof asRecord(value).busy === "boolean",
        )))
  )
    agenda.scheduleInfluenceSnapshot = influence as unknown as NonNullable<VillageAgenda["scheduleInfluenceSnapshot"]>;
  agenda.personalizationFailure = boundText(raw.personalizationFailure, 300);
  agenda.personalizationAttemptDate = /^\d{4}-\d{2}-\d{2}$/.test(asString(raw.personalizationAttemptDate))
    ? asString(raw.personalizationAttemptDate)
    : undefined;
  return agenda;
}
function coerceVenue(value: unknown): VillageVenue | null {
  const original = asRecord(value);
  if (Array.isArray(original.zones) && original.zones.filter((value) => asRecord(value).id !== "exterior").length > 6)
    throw new Error("A Venue may have at most six Zones besides Entrance.");
  const raw = original;
  if (
    raw.layoutVersion !== 1 ||
    !Array.isArray(raw.zones) ||
    !Array.isArray(raw.residentIds) ||
    !validVenueClasses(raw.classes) ||
    !raw.access
  )
    throw new Error("Saved Venues need explicit fresh-format Zones, classes, residents and access policies.");
  const name = boundText(raw.name, MAX_VENUE_NAME_LENGTH);
  const description = readPlaceDescription(raw.description);
  const category = boundText(raw.category, MAX_VENUE_NOTE_LENGTH);
  const presentation = asRecord(raw.presentation);
  const occupancy = asRecord(raw.occupancy);
  const capabilities = Array.isArray(raw.capabilities)
    ? raw.capabilities
        .filter((entry): entry is string => typeof entry === "string")
        .map((entry) => entry.trim())
        .filter(Boolean)
    : [];
  const x = asFraction(presentation.x);
  const y = asFraction(presentation.y);
  const playerHome = occupancy.playerHome === true;
  const homeKind = isHomeBuildingKind(occupancy.homeKind) ? occupancy.homeKind : null;
  const classes: VillageVenueClass[] = raw.classes as VillageVenueClass[];
  const residentIds = coerceVenueIds(raw.residentIds);
  if (residentIds.length !== raw.residentIds.length || residentIds.includes("player"))
    throw new Error("Saved resident IDs must be distinct non-player people.");
  if (
    !Number.isInteger(raw.residenceCapacity) ||
    Number(raw.residenceCapacity) < 1 ||
    Number(raw.residenceCapacity) > 4 ||
    residentIds.length + Number(playerHome) > Number(raw.residenceCapacity)
  )
    throw new Error("Saved household membership must fit explicit residential capacity.");
  const coerceSpaceState = readPlaceContinuity;
  const privateSpaceFor = (ownerId: string, value: unknown) => {
    const row = asRecord(value);
    return {
      ...defaultVenueSpace("residence", `A private space for this resident at ${name}.`),
      id: `private:${ownerId}`,
      preparation: value
        ? ["pending", "ready", "failed"].includes(String(asRecord(row.preparation).status))
          ? (row.preparation as { status: "pending" | "ready" | "failed"; error?: string })
          : undefined
        : ownerId === "player"
          ? undefined
          : { status: "pending" as const },
      ownerId,
      ...(typeof row.roomSpecification === "string"
        ? { roomSpecification: readPlaceDescription(row.roomSpecification) }
        : {}),
      description: value
        ? readPlaceDescription(row.description) || `A private space for this resident at ${name}.`
        : "",
      image: coerceVenueImage(row.image),
      state: coerceSpaceState(row.state),
      dayNight: row.dayNightManual === false ? row.dayNight !== false : true,
      dayNightManual: false,
      freezePicture: row.freezePicture === true,
      pictureRevision: Number.isSafeInteger(row.pictureRevision) ? Number(row.pictureRevision) : 0,
      picture: {
        base: coerceVenueImage(asRecord(row.picture).base) ?? coerceVenueImage(row.image),
        reference: coerceVenueImage(asRecord(row.picture).reference) ?? undefined,
        referenceAppliedId: boundText(asRecord(row.picture).referenceAppliedId, MAX_VENUE_IMAGE_ID_LENGTH) || undefined,
        removed: asRecord(row.picture).removed === true,
        failed: asRecord(row.picture).failed === true,
        dirty: asRecord(row.picture).dirty === true,
        daylight: asRecord(row.picture).daylight === true,
        night: (() => {
          const night = asRecord(asRecord(row.picture).night);
          const image = coerceVenueImage(night.image);
          return image && typeof night.sourceId === "string" ? { sourceId: night.sourceId, image } : undefined;
        })(),
        operation:
          asRecord(row.picture).operation === "night"
            ? ("night" as const)
            : asRecord(row.picture).operation === "replace"
              ? ("replace" as const)
              : ("update" as const),
        problem: boundText(asRecord(row.picture).problem, 300) || undefined,
        lastAutomaticAt: asIsoString(asRecord(row.picture).lastAutomaticAt) ?? undefined,
        context: boundText(asRecord(row.picture).context, 24000) || undefined,
        baseline: boundText(asRecord(row.picture).baseline, 24000) || undefined,
        attempted: boundText(asRecord(row.picture).attempted, 128) || undefined,
        claim: boundText(asRecord(row.picture).claim, 128) || undefined,
      },
      initialImageAttemptedAt: asIsoString(row.initialImageAttemptedAt) ?? "",
    };
  };
  const privateSpaces: VillageVenue["privateSpaces"] = [];
  const spaces: VillageVenue["spaces"] = [];

  if (asTrimmedString(raw.id).length === 0 || name.length === 0) {
    return null;
  }
  const venue: VillageVenue = {
    access: readVenueAccess(raw.access),
    venueType: boundText(raw.venueType, 100),
    destinations: Object.fromEntries(
      Object.entries(asRecord(raw.destinations)).map(([actor, value]) => [
        actor,
        {
          home: asTrimmedString(asRecord(value).home) || undefined,
          sleep: asTrimmedString(asRecord(value).sleep) || undefined,
          work: asTrimmedString(asRecord(value).work) || undefined,
        },
      ]),
    ),
    imageContext: {
      useAssignedVillagerContext: asRecord(raw.imageContext).useAssignedVillagerContext !== false,
      useVisualLore: asRecord(raw.imageContext).useVisualLore !== false,
    },
    id: asTrimmedString(raw.id),
    buildProjectId: asTrimmedString(raw.buildProjectId) || undefined,
    constructionStatus:
      raw.constructionStatus === "worksite" || raw.constructionStatus === "complete"
        ? raw.constructionStatus
        : undefined,
    name,
    form: boundText(raw.form, MAX_PHYSICAL_DESIGN_LENGTH),
    classes,
    discovered: raw.discovered === true,
    layoutVersion: 1,
    spaces,
    residenceCapacity:
      Number.isInteger(raw.residenceCapacity) &&
      Number(raw.residenceCapacity) >= 1 &&
      Number(raw.residenceCapacity) <= 4
        ? Number(raw.residenceCapacity)
        : 1,
    residentIds,
    exteriorState: coerceSpaceState(raw.exteriorState),
    privateSpaces,
    playerSeenShared: raw.playerSeenShared === true,
    playerSeenPublic: raw.playerSeenPublic === true,
    playerSeenPrivateIds: coerceVenueIds(raw.playerSeenPrivateIds).filter((id) => residentIds.includes(id)),
    archivedPrivateSpaces: Array.isArray(raw.archivedPrivateSpaces)
      ? raw.archivedPrivateSpaces
          .map((value) => {
            const entry = asRecord(value);
            const ownerId = asTrimmedString(entry.ownerId);
            const archivedAt = asIsoString(entry.archivedAt);
            return ownerId && archivedAt ? { ownerId, archivedAt, space: privateSpaceFor(ownerId, entry.space) } : null;
          })
          .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
          .slice(-32)
      : [],
    description,
    category,
    presentation: {
      mapId: asTrimmedString(presentation.mapId),
      image: coerceVenueImage(presentation.image),
      x: x !== null && y !== null ? x : null,
      y: x !== null && y !== null ? y : null,
    },
    occupancy: {
      playerHome,
      residentCharacterId: residentIds[0] ?? null,
      homeKind,
    },
    capabilities,
    workerIds: coerceVenueIds(raw.workerIds),
    state: readPlaceContinuity(raw.state),
  };
  const readZone = (value: unknown, archived = false): VillageVenueZone | null => {
    const row = asRecord(value);
    const id = asTrimmedString(row.id);
    if (!id || !ZONE_KINDS.includes(row.kind as VillageVenueZone["kind"])) return null;
    if (!archived && (!Array.isArray(row.connectedTo) || (row.kind !== "exterior" && row.access === undefined)))
      throw new Error("Saved Zones need explicit connections and access policies.");
    const ownerId = asTrimmedString(row.ownerId);
    if (
      !archived &&
      row.kind === "private-residence" &&
      !!ownerId &&
      !(residentIds.includes(ownerId) || (ownerId === "player" && playerHome))
    )
      return null;
    const zone: VillageVenueZone = {
      id,
      connectedTo: Array.isArray(row.connectedTo) ? (row.connectedTo as string[]) : undefined,
      name: boundText(row.name, MAX_VENUE_NAME_LENGTH) || "Zone",
      kind: row.kind as VillageVenueZone["kind"],
      venueClass: validVenueClasses([row.venueClass]) ? (row.venueClass as VillageVenueClass) : "other",
      description: readPlaceDescription(row.description),
      ...(typeof row.roomSpecification === "string"
        ? { roomSpecification: readPlaceDescription(row.roomSpecification) }
        : {}),
      image: coerceVenueImage(row.image),
      state: coerceSpaceState(row.state),
      ownerId: ownerId || undefined,
      purpose: boundText(row.purpose, 240),
      ...(row.access === undefined ? {} : { access: readZonePolicy(row.access) }),
      controllerIds: coerceVenueIds(row.controllerIds),
      preparation: ["pending", "ready", "failed"].includes(String(asRecord(row.preparation).status))
        ? {
            status: asRecord(row.preparation).status as "pending" | "ready" | "failed",
            ...(asRecord(row.preparation).lore !== undefined
              ? { lore: readLoreUse(asRecord(row.preparation).lore) }
              : {}),
            ...(asRecord(row.preparation).mode === "renovation" ? { mode: "renovation" as const } : {}),
            error: boundText(asRecord(row.preparation).error, 300),
            ...(asTrimmedString(asRecord(row.preparation).claimId)
              ? { claimId: asTrimmedString(asRecord(row.preparation).claimId).slice(0, 100) }
              : {}),
            ...(asIsoString(asRecord(row.preparation).startedAt)
              ? { startedAt: asIsoString(asRecord(row.preparation).startedAt)! }
              : {}),
            ...(typeof asRecord(row.preparation).attempt === "number" &&
            Number.isFinite(asRecord(row.preparation).attempt)
              ? { attempt: Math.max(0, Math.floor(asRecord(row.preparation).attempt as number)) }
              : {}),
          }
        : undefined,
      seen: row.seen === true,
      observed: readZoneObservation(row.observed, row.image, row.picture),
      dayNight: row.dayNightManual === false ? row.dayNight !== false : true,
      dayNightManual: false,
      freezePicture: row.freezePicture === true,
      pictureRevision: Number.isSafeInteger(row.pictureRevision) ? Number(row.pictureRevision) : 0,
      picture: {
        base: coerceVenueImage(asRecord(row.picture).base) ?? coerceVenueImage(row.image),
        reference: coerceVenueImage(asRecord(row.picture).reference) ?? undefined,
        referenceAppliedId: boundText(asRecord(row.picture).referenceAppliedId, MAX_VENUE_IMAGE_ID_LENGTH) || undefined,
        removed: asRecord(row.picture).removed === true,
        failed: asRecord(row.picture).failed === true,
        dirty: asRecord(row.picture).dirty === true,
        daylight: asRecord(row.picture).daylight === true,
        night: (() => {
          const night = asRecord(asRecord(row.picture).night);
          const image = coerceVenueImage(night.image);
          return image && typeof night.sourceId === "string" ? { sourceId: night.sourceId, image } : undefined;
        })(),
        operation:
          asRecord(row.picture).operation === "night"
            ? ("night" as const)
            : asRecord(row.picture).operation === "replace"
              ? ("replace" as const)
              : ("update" as const),
        problem: boundText(asRecord(row.picture).problem, 300) || undefined,
        lastAutomaticAt: asIsoString(asRecord(row.picture).lastAutomaticAt) ?? undefined,
        context: boundText(asRecord(row.picture).context, 24000) || undefined,
        baseline: boundText(asRecord(row.picture).baseline, 24000) || undefined,
        attempted: boundText(asRecord(row.picture).attempted, 128) || undefined,
        claim: boundText(asRecord(row.picture).claim, 128) || undefined,
      },
      initialImageAttemptedAt: asIsoString(row.initialImageAttemptedAt) ?? "",
    };
    if (zone.image && !zone.picture?.baseline) {
      zone.picture = {
        ...zone.picture,
        base: zone.picture?.base ?? zone.image,
        baseline: zone.picture?.context ?? zonePictureBaseline(JSON.stringify(zonePicturePhysicalRecord(zone))),
      };
    }
    return zone;
  };
  if (Array.isArray(raw.zones)) {
    const ids = new Set<string>();
    venue.zones = raw.zones.flatMap((value) => {
      const zone = readZone(value);
      if (!zone || ids.has(zone.id)) throw new Error("Saved Zone identities must be valid and unique.");
      ids.add(zone.id);
      return [zone];
    });
    for (const [index, zone] of venue.zones.entries()) {
      if (zone.observed) continue;
      if (!zone.seen) {
        // Only persisted artwork context proves an older unvisited appearance; readZone may synthesize a live baseline.
        const picture = asRecord(asRecord(raw.zones[index]).picture);
        const baseline =
          zonePictureBaseline(boundText(picture.context, 24000)) ||
          zonePictureBaseline(boundText(picture.baseline, 24000));
        const physical = baseline ? JSON.parse(baseline) : { description: "" };
        const form = physical.form ?? venue.zones.find((row) => row.kind === "exterior")?.observed?.form;
        zone.observed = readZoneObservation({
          context: JSON.stringify({ description: physical.description, ...(form ? { form } : {}) }),
          name: zone.name,
          description: physical.description,
          form,
          image: baseline ? zone.image : null,
          dayNight: true,
          daylight: !!baseline && zone.picture?.daylight,
          night: baseline ? zone.picture?.night : undefined,
          pictureContext: baseline || undefined,
        });
        continue;
      }
      const observed = captureZoneObservation(venue, zone);
      try {
        const prior = JSON.parse(zone.picture?.context ?? zone.picture?.baseline ?? "{}");
        if (typeof prior.description === "string") observed.description = prior.description;
        if (typeof prior.form === "string") observed.form = prior.form;
        observed.context = JSON.stringify({
          description: observed.description,
          ...(observed.form ? { form: observed.form } : {}),
        });
      } catch {
        /* Unusable artwork context leaves the captured physical account intact. */
      }
      zone.observed = observed;
    }
    if (!venue.zones.some((zone) => zone.id === "exterior" && zone.kind === "exterior"))
      throw new Error("A saved Venue needs its Entrance.");
    const exterior = venue.zones.find((zone) => zone.kind === "exterior");
    if (exterior) {
      venue.exteriorState = exterior.state;
      venue.presentation.image = exterior.image;
      venue.description = exterior.description;
    }
    venue.spaces = venue.zones.filter((zone) => ["public", "shared-residence"].includes(zone.kind));
    venue.privateSpaces = venue.zones
      .filter((zone) => zone.kind === "private-residence")
      .map((zone) => ({ ...zone, ownerId: zone.ownerId! }));
  }
  if (raw.zoneLayout !== undefined) {
    const ids = (venue.zones ?? []).map((zone) => zone.id);
    venue.zoneLayout =
      readZoneLayout(
        Object.fromEntries(Object.entries(asRecord(raw.zoneLayout)).filter(([id]) => ids.includes(id))),
        ids,
      ) ?? undefined;
  }
  // Archive entries retain the state of removed Zones.
  venue.archivedZones = Array.isArray(raw.archivedZones)
    ? raw.archivedZones
        .flatMap((value) => {
          const row = asRecord(value),
            zone = asRecord(row.zone),
            archivedAt = asIsoString(row.archivedAt);
          const parsed = readZone(zone, true);
          return parsed && archivedAt ? [{ zone: parsed, archivedAt }] : [];
        })
        .slice(-64)
    : [];
  const graphProblem = connectionProblem(venue.zones ?? []);
  if (graphProblem) throw new Error(graphProblem);
  synchronizeVenueZones(venue, structuredClone(venue));
  return venue;
}
function coerceZoneDrafts(value: unknown): VillageZoneDraft[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.flatMap((entry) => {
    const row = asRecord(entry),
      id = asTrimmedString(row.id),
      name = boundText(row.name, MAX_VENUE_NAME_LENGTH),
      description = readPlaceDescription(row.description);
    if (
      !id ||
      !name ||
      (!description &&
        !row.preserveDescription &&
        !["private-residence", "staff", "restricted"].includes(String(row.kind))) ||
      !["public", "shared-residence", "private-residence", "staff", "restricted"].includes(String(row.kind))
    )
      return [];
    return [
      {
        id,
        name,
        description,
        ...(typeof row.roomSpecification === "string"
          ? { roomSpecification: readPlaceDescription(row.roomSpecification) }
          : {}),
        purpose: boundText(row.purpose, 240),
        controllerIds: coerceVenueIds(row.controllerIds),
        ownerId: asTrimmedString(row.ownerId) || undefined,
        connectedTo: Array.isArray(row.connectedTo)
          ? row.connectedTo.filter((id): id is string => typeof id === "string")
          : undefined,
        preserveDescription: row.preserveDescription === true,
        kind: row.kind as VillageZoneDraft["kind"],
        venueClass: validVenueClasses([row.venueClass]) ? (row.venueClass as VillageVenueClass) : "other",
      },
    ];
  });
}
function coerceVenueIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id): id is string => typeof id === "string" && id.length > 0))].slice(0, 60);
}
function coerceResidentSignature(value: unknown) {
  const raw = asRecord(value);
  const image = coerceVenueImage(raw.image),
    original = coerceVenueImage(raw.original);
  const name = asTrimmedString(raw.name),
    generatedAt = asIsoString(raw.generatedAt);
  return image && original && name && generatedAt ? { image, original, name, generatedAt } : null;
}
function coerceVenueImage(value: unknown): VillageVenueImage | null {
  const raw = asRecord(value);
  const ref = asTrimmedString(raw.ref);
  if (!isGlobalGalleryRef(ref)) return null;
  const url = asTrimmedString(raw.url);
  if (url.length === 0 || url.length > MAX_VENUE_IMAGE_URL_LENGTH) return null;
  return {
    ref,
    url,
    id: asTrimmedString(raw.id) || ref.slice(GLOBAL_GALLERY_REF_PREFIX.length),
    ...(raw.lore !== undefined ? { lore: readLoreUse(raw.lore) } : {}),
  };
}
function coerceVenues(value: unknown): VillageVenue[] {
  if (!Array.isArray(value)) return [];
  const venues: VillageVenue[] = [];
  const seenIds = new Set<string>();
  const seenOccupants = new Set<string>();
  let sawPlayerHome = false;
  for (const entry of value) {
    const venue = coerceVenue(entry);
    if (!venue || seenIds.has(venue.id) || venues.length >= MAX_PLACES)
      throw new Error("Saved Venues must have distinct valid identities within the Village limit.");
    if (venue.occupancy.playerHome) {
      if (sawPlayerHome) throw new Error("The player cannot have two homes.");
      sawPlayerHome = true;
    }
    for (const id of venue.residentIds ?? []) {
      if (seenOccupants.has(id)) throw new Error("A resident cannot have two homes.");
      seenOccupants.add(id);
    }
    seenIds.add(venue.id);
    venues.push(venue);
  }
  return venues;
}
function coerceVenueEvent(value: unknown): VillageVenueEvent | null {
  const raw = asRecord(value),
    receipt = asRecord(raw.actionReceipt),
    after = asRecord(receipt.after);
  const venueId = asTrimmedString(raw.venueId),
    text = boundText(raw.text, MAX_EVENT_TEXT_LENGTH);
  if (!venueId || !text) return null;
  let actionReceipt: VillageVenueEvent["actionReceipt"];
  if (raw.actionReceipt !== undefined) {
    const state = readPlaceContinuity(after.state);
    if (
      typeof after.description !== "string" ||
      after.description.length > MAX_VENUE_DESCRIPTION_LENGTH ||
      !Number.isSafeInteger(receipt.expectedRevision) ||
      Number(receipt.expectedRevision) < 0 ||
      state.revision !== Number(receipt.expectedRevision) + 1 ||
      receipt.happened !== true ||
      !asTrimmedString(receipt.submissionId)
    )
      throw new Error("Invalid saved physical outcome; its bytes are preserved.");
    actionReceipt = {
      submissionId: asTrimmedString(receipt.submissionId),
      happened: true,
      expectedRevision: Number(receipt.expectedRevision),
      narration: boundText(receipt.narration, MAX_PHYSICAL_NARRATION_LENGTH),
      witnessIds: coerceVenueIds(receipt.witnessIds),
      after: { description: after.description, state },
    };
  }
  return {
    id: asTrimmedString(raw.id) || randomVillageSeed(),
    venueId,
    text,
    venueName: boundText(raw.venueName, MAX_VENUE_NAME_LENGTH),
    zoneId: asTrimmedString(raw.zoneId) || undefined,
    at: asIsoString(raw.at) ?? "",
    ...(actionReceipt ? { actionReceipt } : {}),
  };
}
function coerceVenueEvents(value: unknown): VillageVenueEvent[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(coerceVenueEvent)
    .filter((entry): entry is VillageVenueEvent => entry !== null)
    .slice(0, MAX_VENUE_EVENTS);
}
function coerceResidence(value: unknown): VillageResidence | null {
  const raw = asRecord(value);
  const venueId = asTrimmedString(raw.venueId);
  const characterId = asTrimmedString(raw.characterId);
  if (characterId.length === 0) throw new Error("A saved move needs its incoming person.");
  const status = raw.status === "pending" || raw.status === "moving" ? raw.status : "current";
  return {
    ...(status !== "current"
      ? { agreement: readResidenceAgreement(raw.agreement), holdReason: boundText(raw.holdReason, 600) }
      : {}),
    venueId,
    characterId,
    status,
    proposedVenueId: status !== "current" ? asTrimmedString(raw.proposedVenueId) : "",
    proposedPrivateZoneId: status !== "current" ? asTrimmedString(raw.proposedPrivateZoneId) : "",
    requestedAt: asIsoString(raw.requestedAt) ?? "",
    requestedBy: raw.requestedBy === "player" ? "player" : "villager",
    villagerDecision:
      raw.villagerDecision === "approved" || raw.villagerDecision === "denied" ? raw.villagerDecision : "pending",
    approvedAt: asIsoString(raw.approvedAt) ?? "",
    completesAt: asIsoString(raw.completesAt) ?? "",
  };
}
function coerceResidences(value: unknown): VillageResidence[] {
  if (!Array.isArray(value)) return [];
  const residences: VillageResidence[] = [];
  const seenCharacters = new Set<string>();
  for (const entry of value) {
    const residence = coerceResidence(entry);
    if (!residence || seenCharacters.has(residence.characterId)) continue;
    seenCharacters.add(residence.characterId);
    residences.push(residence);
  }
  return residences.slice(0, MAX_PLACES);
}
function asFocus(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value >= TOWN_MAP_FOCUS_MIN && value <= TOWN_MAP_FOCUS_MAX ? value : null;
}
function asZoom(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value >= TOWN_MAP_ZOOM_MIN && value <= TOWN_MAP_ZOOM_MAX ? value : null;
}
export function coerceTownMapView(value: unknown): VillageTownMapView {
  const raw = asRecord(value);
  return {
    fit: isTownMapFit(raw.fit) ? raw.fit : DEFAULT_TOWN_MAP_VIEW.fit,
    focusX: asFocus(raw.focusX) ?? DEFAULT_TOWN_MAP_VIEW.focusX,
    focusY: asFocus(raw.focusY) ?? DEFAULT_TOWN_MAP_VIEW.focusY,
    zoom: asZoom(raw.zoom) ?? DEFAULT_TOWN_MAP_VIEW.zoom,
  };
}
const BACKGROUND_PACES: readonly VillageBackgroundPace[] = ["off", "quiet", "balanced", "lively"];
const MAX_SIMULATION_RECORDS = 256;
function coerceBackgroundPace(raw: Record<string, unknown>): VillageBackgroundPace {
  const pace = raw.backgroundPace;
  return typeof pace === "string" && BACKGROUND_PACES.includes(pace as VillageBackgroundPace)
    ? (pace as VillageBackgroundPace)
    : "balanced";
}
function coercePlanningUsage(value: unknown): VillageState["planningUsage"] {
  if (value === undefined) return { dateKey: "", count: 0 };
  const usage = asRecord(value);
  if (
    typeof usage.dateKey !== "string" ||
    (usage.dateKey !== "" && !/^\d{4}-\d{2}-\d{2}$/.test(usage.dateKey)) ||
    typeof usage.count !== "number" ||
    !Number.isSafeInteger(usage.count) ||
    usage.count < 0
  )
    throw new Error("Invalid saved planning allowance.");
  return { dateKey: usage.dateKey, count: usage.count };
}
function coerceProjects(value: unknown): VillageProject[] {
  if (!Array.isArray(value)) throw new Error("Invalid Project records.");
  return value.map((value) => {
    const raw = asRecord(value),
      flow = asRecord(raw.lifecycle),
      draft = asRecord(raw.venueDraft);
    if (
      !asTrimmedString(raw.id) ||
      !asTrimmedString(raw.title) ||
      !["new-venue", "renovation", "establishment"].includes(String(raw.kind)) ||
      !["planning", "working", "paused", "complete", "cancelled"].includes(String(raw.status)) ||
      flow.phase !== raw.status ||
      !Number.isInteger(flow.revision) ||
      Number(flow.revision) < 1 ||
      !Array.isArray(flow.approvals) ||
      !Array.isArray(flow.candidates) ||
      !Array.isArray(flow.spokenProofs) ||
      !Array.isArray(flow.evidenceIds)
    )
      throw new Error("Invalid Project record.");
    const approvals = flow.approvals.filter((value) => asRecord(value).source !== "mailbox");
    const rows = [...approvals, ...flow.candidates];
    if (
      rows.some((value) => {
        const row = asRecord(value);
        return (
          !asTrimmedString(row.residentId) ||
          !asTrimmedString(row.evidenceId) ||
          typeof row.scope !== "string" ||
          !asIsoString(row.at)
        );
      }) ||
      approvals.some((value) => asRecord(value).source !== "conversation") ||
      flow.spokenProofs.some((value) => {
        const row = asRecord(value);
        return (
          !asTrimmedString(row.lineId) ||
          !asTrimmedString(row.sessionId) ||
          !asTrimmedString(row.submissionId) ||
          !asTrimmedString(row.speakerId) ||
          !asIsoString(row.at)
        );
      })
    )
      throw new Error("Invalid Project agreement records.");
    const order = flow.workOrder === null ? null : asRecord(flow.workOrder);
    if (
      order &&
      (!asIsoString(order.startsAt) ||
        !asIsoString(order.completesAt) ||
        !Number.isFinite(order.remainingMs) ||
        Number(order.remainingMs) < 0)
    )
      throw new Error("Invalid Project deadline.");
    if (
      ["working", "paused"].includes(String(raw.status)) &&
      !order &&
      !(raw.kind === "establishment" && asRecord(raw.establishment).physical === false)
    )
      throw new Error("Missing Project deadline.");
    const position = asRecord(draft.position);
    if (raw.kind === "new-venue" && (!validVenueClasses(draft.classes) || !asTrimmedString(draft.name)))
      throw new Error("Invalid Project Venue.");
    const change = asRecord(flow.change),
      zones = flow.change === null ? undefined : coerceZoneDrafts(change.zones);
    if (
      ["renovation", "establishment"].includes(String(raw.kind)) &&
      (!validVenueClasses(change.classes) ||
        (change.form !== undefined && (typeof change.form !== "string" || change.form.length > 2000)) ||
        (change.exteriorDescription !== undefined &&
          (typeof change.exteriorDescription !== "string" ||
            !change.exteriorDescription.trim() ||
            change.exteriorDescription.length > 4000)) ||
        !Number.isInteger(change.capacity) ||
        Number(change.capacity) < 1 ||
        Number(change.capacity) > 4 ||
        !Array.isArray(change.zones) ||
        !zones ||
        zones.length !== change.zones.length ||
        zones.length > 6 ||
        new Set(zones.map((zone) => zone.id)).size !== zones.length ||
        typeof flow.baseDesignHash !== "string" ||
        !/^[a-f0-9]{64}$/.test(flow.baseDesignHash))
    )
      throw new Error("Invalid Renovation design.");
    const opening = asRecord(raw.opening);
    const project: VillageProject = {
      id: String(raw.id),
      title: String(raw.title),
      kind: raw.kind as VillageProject["kind"],
      ...(raw.kind === "establishment" ? { establishment: readEstablishment(raw.establishment) } : {}),
      venueId: asTrimmedString(raw.venueId),
      participantIds: asStringArray(raw.participantIds),
      status: raw.status as VillageProject["status"],
      progress: raw.status === "complete" ? 100 : 0,
      updatedAt: asIsoString(raw.updatedAt) ?? "",
      requesterCharacterId: asTrimmedString(raw.requesterCharacterId),
      ...(raw.kind === "new-venue"
        ? {
            venueDraft: {
              name: String(draft.name),
              classes: draft.classes as VillageVenueClass[],
              description: asTrimmedString(draft.description),
              position: {
                ...(asTrimmedString(asRecord(draft.position).mapId)
                  ? { mapId: asTrimmedString(asRecord(draft.position).mapId) }
                  : {}),
                x: typeof position.x === "number" ? position.x : null,
                y: typeof position.y === "number" ? position.y : null,
              },
            },
          }
        : {}),
      ...(raw.opening
        ? {
            opening: {
              established: opening.established === true,
              provenance: asTrimmedString(opening.provenance),
              work: asTrimmedString(opening.work),
              firstUse: asTrimmedString(opening.firstUse),
            },
          }
        : {}),
    };
    project.lifecycle = {
      phase: raw.status as NonNullable<VillageProject["lifecycle"]>["phase"],
      revision: Number(flow.revision),
      targetVenueId: asTrimmedString(flow.targetVenueId),
      change:
        flow.change === null
          ? null
          : {
              classes: validVenueClasses(asRecord(flow.change).classes)
                ? (asRecord(flow.change).classes as VillageVenue["classes"])
                : undefined,
              capacity: Number(asRecord(flow.change).capacity),
              zones,
              detail: asTrimmedString(asRecord(flow.change).detail),
              ...(asRecord(flow.change).form !== undefined
                ? { form: asTrimmedString(asRecord(flow.change).form) }
                : {}),
              ...(asRecord(flow.change).exteriorDescription !== undefined
                ? { exteriorDescription: asTrimmedString(asRecord(flow.change).exteriorDescription) }
                : {}),
            },
      affectedIds: asStringArray(flow.affectedIds),
      approvals: structuredClone(approvals) as NonNullable<VillageProject["lifecycle"]>["approvals"],
      candidates: structuredClone(flow.candidates) as NonNullable<VillageProject["lifecycle"]>["candidates"],
      baseDesignHash: asTrimmedString(flow.baseDesignHash),
      changedZoneIds: asStringArray(flow.changedZoneIds),
      builderId: asTrimmedString(flow.builderId),
      spokenProofs: structuredClone(flow.spokenProofs) as NonNullable<VillageProject["lifecycle"]>["spokenProofs"],
      evidenceIds: asStringArray(flow.evidenceIds),
      commandReceipts: Object.fromEntries(
        Object.entries(asRecord(flow.commandReceipts)).filter(
          (row): row is [string, string] => typeof row[1] === "string",
        ),
      ),
      workOrder: order
        ? {
            startsAt: String(order.startsAt),
            completesAt: String(order.completesAt),
            remainingMs: Number(order.remainingMs),
            pausedAt: asTrimmedString(order.pausedAt),
            ...(order.focus !== undefined ? { focus: readProjectFocus(order.focus) } : {}),
          }
        : null,
      blockedReason: asTrimmedString(flow.blockedReason),
      completedAt: asTrimmedString(flow.completedAt),
    };
    if (raw.plan) {
      const plan = asRecord(raw.plan);
      const interiors = [
        ...(Array.isArray(plan.spaces) ? plan.spaces : []),
        ...(Array.isArray(plan.privateSpaces) ? plan.privateSpaces : []),
      ].map((entry) => {
        const zone = asRecord(entry);
        if (typeof zone.id !== "string" || !zone.id || zone.id !== zone.id.trim() || zone.id === "exterior")
          throw new Error("The saved Project plan needs explicit Zone identities.");
        return { id: zone.id, connectedTo: zone.connectedTo as string[] };
      });
      const problem = connectionProblem([{ id: "exterior", connectedTo: [] }, ...interiors]);
      if (problem) throw new Error(`The saved Project plan needs explicit connections: ${problem}`);
      project.plan = readProjectPlan(raw.plan, {
        classes: validVenueClasses(draft.classes) ? draft.classes : ["other"],
      } as VillageVenue);
    }
    return project;
  });
}

function coercePendingDecisions(value: unknown): VillagePendingDecision[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((entry) => {
      const raw = asRecord(entry);
      const id = asTrimmedString(raw.id);
      const title = boundText(raw.title, MAX_EVENT_TEXT_LENGTH);
      const proposedAt = asIsoString(raw.proposedAt);
      if (!id || !title || !proposedAt) return [];
      const kinds = ["residence", "project", "venue", "departure", "other"] as const;
      const draft = asRecord(raw.venueDraft);
      const requestName = boundText(draft.name, MAX_VENUE_NAME_LENGTH);
      const requestClasses = validVenueClasses(draft.classes) ? draft.classes : [];
      return [
        {
          id,
          kind: kinds.includes(raw.kind as (typeof kinds)[number])
            ? (raw.kind as VillagePendingDecision["kind"])
            : "other",
          title,
          detail: boundText(raw.detail, MAX_PHYSICAL_NARRATION_LENGTH),
          proposedAt,
          sourceOpportunityId: asTrimmedString(raw.sourceOpportunityId),
          status:
            raw.status === "approved" || raw.status === "denied" || raw.status === "countered"
              ? raw.status
              : ("pending" as const),
          ...(requestName && requestClasses.length
            ? {
                venueDraft: {
                  name: requestName,
                  classes: requestClasses,
                  description: readPlaceDescription(draft.description),
                  category: "",
                  position: { x: null, y: null },
                  occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
                  capabilities: [],
                  state: readPlaceContinuity(draft.state),
                },
              }
            : {}),
          requesterCharacterId: asTrimmedString(raw.requesterCharacterId),
          venueId: asTrimmedString(raw.venueId),
          requesterName: boundText(raw.requesterName, MAX_REQUESTER_NAME_LENGTH),
          requestQuote: boundText(raw.requestQuote, MAX_VENUE_NOTE_LENGTH),
          source: raw.source === "chat" ? ("chat" as const) : ("background" as const),
          sourceKey: asTrimmedString(raw.sourceKey),
        } satisfies VillagePendingDecision,
      ];
    })
    .slice(-MAX_SIMULATION_RECORDS);
}
function decodeReturnCatchup(value: unknown): VillageState["returnCatchup"] {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "object" || Array.isArray(value))
    throw new Error("The saved Village catch-up could not be read.");
  const record = value as Record<string, unknown>;
  if (record.capture !== undefined) {
    if (!record.capture || typeof record.capture !== "object" || Array.isArray(record.capture))
      throw new Error("The saved Village departure capture could not be read.");
    const capture = record.capture as Record<string, unknown>;
    if (!capture.world || typeof capture.world !== "object" || Array.isArray(capture.world))
      throw new Error("The saved Village departure capture could not be read.");
    const world = capture.world as Record<string, unknown>;
    if (Object.hasOwn(world, "relationshipHead"))
      throw new Error("Departure history was not loaded for this operation.");
    if (
      typeof capture.at !== "string" ||
      !Number.isFinite(Date.parse(capture.at)) ||
      !Number.isSafeInteger(capture.memoryRevision) ||
      Number(capture.memoryRevision) < 0 ||
      ![
        "seed",
        "setupAt",
        "foundedAt",
        "timeZone",
        "name",
        "setting",
        "worldName",
        "playerPersonaId",
        "playerPersonaName",
        "playerPersonaIdentity",
      ].every((key) => typeof world[key] === "string") ||
      typeof world.playerPersonaMissing !== "boolean" ||
      !["villagers", "venues", "residences", "projects"].every((key) => Array.isArray(world[key])) ||
      (world.timeZone !== "" && !validTimeZone(world.timeZone)) ||
      !(world.villagers as unknown[]).every((value) => {
        const resident = asRecord(value),
          card = asRecord(resident.cardSnapshot);
        return (
          typeof resident.characterId === "string" &&
          typeof resident.addedAt === "string" &&
          typeof card.capturedAt === "string" &&
          (resident.agenda == null || (typeof resident.agenda === "object" && !Array.isArray(resident.agenda)))
        );
      }) ||
      !(world.venues as unknown[]).every((value) => {
        const venue = asRecord(value);
        return (
          typeof venue.id === "string" &&
          !!venue.occupancy &&
          typeof venue.occupancy === "object" &&
          !!venue.state &&
          typeof venue.state === "object" &&
          (venue.zones === undefined || Array.isArray(venue.zones))
        );
      }) ||
      (world.opening !== undefined &&
        world.opening !== null &&
        (typeof world.opening !== "object" ||
          Array.isArray(world.opening) ||
          (asRecord(world.opening).stage === "conversations" &&
            (!Array.isArray(asRecord(world.opening).residentIds) || !Array.isArray(asRecord(world.opening).reveals)))))
    )
      throw new Error("The saved Village departure capture could not be read.");
  }
  function validateBatch(value: unknown, historical = false) {
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error("The saved Village catch-up batch could not be read.");
    const batch = value as Record<string, unknown>;
    if (
      typeof batch.id !== "string" ||
      !/^[a-zA-Z0-9-]{1,100}$/.test(batch.id) ||
      !["queued", "running", "failed", "recovering", "completed", "cancelled"].includes(String(batch.status))
    )
      throw new Error("The saved Village catch-up batch could not be read.");
    if (historical && !["completed", "cancelled"].includes(String(batch.status)))
      throw new Error("The saved Village catch-up history contains unfinished work.");
    if (
      typeof batch.budgetDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(batch.budgetDate) ||
      !Number.isSafeInteger(batch.opportunityLimit) ||
      Number(batch.opportunityLimit) < 0 ||
      Number(batch.opportunityLimit) > 6
    )
      throw new Error("The saved Village catch-up allowance could not be read.");
    if (batch.labels !== undefined) {
      const labels = asRecord(batch.labels);
      if (
        !["residents", "venues", "zones"].every((key) => {
          const values = labels[key];
          return (
            !!values &&
            typeof values === "object" &&
            !Array.isArray(values) &&
            Object.values(values).every((entry) => typeof entry === "string")
          );
        })
      )
        throw new Error("The saved Village catch-up labels could not be read.");
    }
    if (
      (batch.from !== undefined && (typeof batch.from !== "string" || !Number.isFinite(Date.parse(batch.from)))) ||
      (batch.until !== undefined && (typeof batch.until !== "string" || !Number.isFinite(Date.parse(batch.until)))) ||
      (typeof batch.from === "string" &&
        typeof batch.until === "string" &&
        Date.parse(batch.until) < Date.parse(batch.from))
    )
      throw new Error("The saved Village catch-up interval could not be read.");
    if (batch.opportunities !== undefined) {
      if (
        !Array.isArray(batch.opportunities) ||
        batch.opportunities.length > 6 ||
        batch.opportunities.length > Number(batch.opportunityLimit) ||
        typeof batch.from !== "string" ||
        typeof batch.until !== "string"
      )
        throw new Error("The saved Village catch-up opportunities could not be read.");
      for (const value of batch.opportunities) {
        const row = asRecord(value);
        if (
          typeof row.id !== "string" ||
          !/^[a-zA-Z0-9-]{1,100}$/.test(row.id) ||
          !["encounter", "routine", "world"].includes(String(row.kind)) ||
          typeof row.startsAt !== "string" ||
          !Number.isFinite(Date.parse(row.startsAt)) ||
          row.endsAt !== row.startsAt ||
          Date.parse(row.startsAt) < Date.parse(batch.from) ||
          Date.parse(row.startsAt) > Date.parse(batch.until) ||
          !Array.isArray(row.actorIds) ||
          (row.kind === "world" ? row.actorIds.length !== 0 : row.actorIds.length < 1) ||
          row.actorIds.length > 4 ||
          row.actorIds.some((id) => typeof id !== "string" || !id || id === "player") ||
          new Set(row.actorIds).size !== row.actorIds.length ||
          typeof row.venueId !== "string" ||
          (row.kind === "encounter" &&
            (row.actorIds.length < 2 || !row.venueId || typeof row.zoneId !== "string" || !row.zoneId)) ||
          (row.kind === "routine" && (row.actorIds.length !== 1 || !!row.venueId)) ||
          (row.kind === "world" && (!row.venueId || typeof row.zoneId !== "string" || !row.zoneId)) ||
          !Array.isArray(row.facts) ||
          row.facts.some((fact) => typeof fact !== "string")
        )
          throw new Error("The saved Village catch-up opportunities could not be read.");
      }
    }
    if (batch.records !== undefined) {
      if (
        !Array.isArray(batch.records) ||
        !Array.isArray(batch.opportunities) ||
        batch.records.length !== batch.opportunities.length
      )
        throw new Error("The saved Village catch-up records could not be read.");
      const ids = new Set((batch.opportunities as Record<string, unknown>[]).map((row) => row.id));
      const recorded = new Set<string>();
      for (const value of batch.records) {
        const row = asRecord(value);
        if (
          typeof row.opportunityId !== "string" ||
          !ids.has(row.opportunityId) ||
          recorded.has(row.opportunityId) ||
          !["pending", "queued", "settling", "settled", "rejected", "held"].includes(String(row.status)) ||
          (row.heldStage !== undefined && !["queued", "settling"].includes(String(row.heldStage))) ||
          (row.automaticRetryUsed !== undefined && row.automaticRetryUsed !== true) ||
          (row.error !== undefined && typeof row.error !== "string")
        )
          throw new Error("The saved Village catch-up records could not be read.");
        recorded.add(row.opportunityId);
      }
    }
  }
  if (record.batch !== undefined) validateBatch(record.batch);
  if (record.history !== undefined) {
    if (!Array.isArray(record.history) || record.history.length > RETURN_CATCHUP_HISTORY_LIMIT)
      throw new Error("The saved Village catch-up history could not be read.");
    const ids = new Set<string>();
    if (record.batch) ids.add(String(asRecord(record.batch).id));
    for (const entry of record.history) {
      validateBatch(entry, true);
      const id = String(asRecord(entry).id);
      if (ids.has(id)) throw new Error("The saved Village catch-up history contains a duplicate period.");
      ids.add(id);
    }
  }
  const { capture, ...tracking } = record;
  const result = structuredClone(tracking) as NonNullable<VillageState["returnCatchup"]>;
  if (capture) result.capture = cloneReturnCapture(capture as import("../models/world.js").ReturnCatchupCapture);
  return result;
}
function readZoneObservation(
  value: unknown,
  sourceImage?: unknown,
  picture?: unknown,
): import("../models/world.js").ZoneObservation | undefined {
  const row = asRecord(value);
  if (typeof row.context !== "string" || typeof row.description !== "string") return undefined;
  const night = asRecord(row.night),
    image = coerceVenueImage(night.image);
  return {
    context: boundText(row.context, 24000),
    name: boundText(row.name, 100),
    description: readPlaceDescription(row.description),
    purpose: boundText(row.purpose, 240),
    roomSpecification:
      typeof row.roomSpecification === "string" ? readPlaceDescription(row.roomSpecification) : undefined,
    form: typeof row.form === "string" ? boundText(row.form, 4000) : undefined,
    state: readPlaceContinuity(row.state),
    image: coerceVenueImage(row.image),
    dayNight: row.dayNight !== false,
    daylight: row.daylight === true,
    pictureContext:
      boundText(row.pictureContext, 24000) ||
      (coerceVenueImage(row.image)?.id && coerceVenueImage(row.image)?.id === coerceVenueImage(sourceImage)?.id
        ? zonePictureBaseline(boundText(asRecord(picture).context || asRecord(picture).baseline, 24000)) || undefined
        : undefined),
    night: image && typeof night.sourceId === "string" ? { sourceId: night.sourceId, image } : undefined,
  };
}

export function coerceVillageState(value: unknown): VillageState {
  const raw = asRecord(value);
  if (value != null && raw.version !== 18) throw new Error("Unsupported Village format. Start a fresh Village.");
  if (value != null)
    memoryRequire(raw.continuity && raw.episodes && raw.startingHistory, "current Village continuity data is missing");
  const fallback = defaultVillageState();
  const venues = coerceVenues(raw.venues);
  const villagers = Array.isArray(raw.villagers)
    ? raw.villagers.map((entry) => coerceVillager(entry)).filter((entry): entry is VillageVillager => entry !== null)
    : [];
  const seen = new Set<string>();

  const foundedAt = asIsoString(raw.foundedAt) ?? "";
  const continuity = readContinuity(raw.continuity ?? fallback.continuity, asString(raw.seed));
  const episodes = readEpisodes(raw.episodes ?? fallback.episodes, asString(raw.seed));
  const exchangeReceipts = copyExchangeReceipts(asRecord(raw.exchangeReceipts) as VillageState["exchangeReceipts"]);
  for (const [id, receipt] of Object.entries(exchangeReceipts)) {
    if (receipt?.domain !== "physical") continue;
    if (
      receipt.id !== id ||
      !receipt.sceneId ||
      !receipt.submissionId ||
      !["applied", "rejected"].includes(String(receipt.status)) ||
      !asIsoString(receipt.at) ||
      !asIsoString(receipt.committedAt)
    )
      throw new Error("Invalid saved physical receipt; its bytes are preserved.");
    if (receipt.physicalOutcome !== undefined) {
      if (receipt.status !== "applied")
        throw new Error("Rejected physical outcome cannot carry applied proof; its bytes are preserved.");
      const outcome = coerceVenueEvent(receipt.physicalOutcome);
      if (!outcome?.actionReceipt || outcome.id !== id || outcome.actionReceipt.submissionId !== receipt.submissionId)
        throw new Error("Invalid saved physical proof; its bytes are preserved.");
      receipt.physicalOutcome = outcome;
    }
  }
  const state: VillageState = {
    worldPlaces: readPlaceRegistry(raw.worldPlaces),
    version: 18,
    continuity,
    episodes,
    startingHistory: value == null ? fallback.startingHistory : readStartingHistory(raw.startingHistory),
    backgroundReceipts: Object.fromEntries(
      Object.entries(asRecord(raw.backgroundReceipts)).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    ),
    exchangeReceipts,
    noticeSequence: Math.max(0, Math.floor(Number(raw.noticeSequence) || 0)),
    dismissedNoticeIds: [...new Set(asStringArray(raw.dismissedNoticeIds))],
    socialContractVersion: 2,
    socialMailOutbox: Array.isArray(raw.socialMailOutbox)
      ? (structuredClone(raw.socialMailOutbox) as VillageState["socialMailOutbox"])
      : [],
    socialPublications: raw.socialPublications
      ? (structuredClone(raw.socialPublications) as VillageState["socialPublications"])
      : {},
    eventAttempts: raw.eventAttempts
      ? (structuredClone(raw.eventAttempts) as VillageState["eventAttempts"])
      : undefined,
    returnCatchup: decodeReturnCatchup(raw.returnCatchup),
    narrative: readNarrativeState(raw.narrative),
    progressEngineVersion: 1,
    name: asTrimmedString(raw.name) || fallback.name,
    narrationStyle: coerceVillageNarrationStyle(raw.narrationStyle),
    characterSpeechColors: raw.characterSpeechColors !== false,
    sendOnEnter: raw.sendOnEnter === true,
    spriteCardFlipEnabled: raw.spriteCardFlipEnabled !== false,
    spriteVariantsEnabled: raw.spriteVariantsEnabled !== false,
    setting: boundText(raw.setting, MAX_SETTING_LENGTH),
    worldRules: boundText(raw.worldRules, MAX_SETTING_LENGTH),
    worldName: readWorldName(raw.worldName) ?? "",
    communityVenueId: asTrimmedString(raw.communityVenueId),
    playerBackground: coercePlayerBackground(raw.playerBackground),
    selectedLorebookIds: coerceSelectedLorebookIds(raw.selectedLorebookIds),
    sceneryArtStyle: boundText(raw.sceneryArtStyle, 600),
    sceneryStyleProfileId:
      typeof raw.sceneryStyleProfileId === "string" && /^[a-zA-Z0-9_-]{0,80}$/.test(raw.sceneryStyleProfileId)
        ? raw.sceneryStyleProfileId
        : null,
    automaticZonePictures: raw.automaticZonePictures !== false,
    zonePictureBudget: {
      startedAt: asIsoString(asRecord(raw.zonePictureBudget).startedAt) ?? "",
      used: Math.max(0, Math.min(6, Math.floor(Number(asRecord(raw.zonePictureBudget).used) || 0))),
    },
    zonePictureEpoch: Number.isSafeInteger(raw.zonePictureEpoch) ? Number(raw.zonePictureEpoch) : 0,
    personalizeVenueImagesByDefault: raw.personalizeVenueImagesByDefault !== false,
    useVisualLoreByDefault: raw.useVisualLoreByDefault !== false,
    loreTokenBudget: coerceLoreTokenBudget(raw.loreTokenBudget),
    venues,
    homeBuildingNames: Object.fromEntries(
      Object.entries(HOME_BUILDINGS).map(([kind, building]) => [
        kind,
        boundText(asRecord(raw.homeBuildingNames)[kind], 60) || building.name,
      ]),
    ) as VillageState["homeBuildingNames"],
    venueEvents: coerceVenueEvents(raw.venueEvents),
    visitRetention: (() => {
      const retention = asRecord(raw.visitRetention);
      const value = Number(retention.value);
      if (retention.mode === "count" && Number.isInteger(value) && value >= 1 && value <= 1_000)
        return {
          mode: "count" as const,
          value,
        };
      if (retention.mode === "days" && Number.isInteger(value) && value >= 30 && value <= 3_650)
        return { mode: "days" as const, value };
      return { mode: "forever" as const, value: 0 };
    })(),
    residences: coerceResidences(raw.residences),
    // Left empty rather than stamped with "now": a record that predates the
    // setup flow should open the wizard, not claim it has been set up.
    opening: readOpening(raw.opening),
    setupAt: asIsoString(raw.setupAt) ?? "",
    foundingPreparation: (() => {
      const preparation = asRecord(raw.foundingPreparation);
      if (preparation.status !== "pending" && preparation.status !== "failed" && preparation.status !== "ready")
        return null;
      return {
        status: preparation.status,
        ...(preparation.tasksVersion === 1
          ? {
              tasksVersion: 1 as const,
              tasks: coerceFoundingTasks(preparation.tasks),
              retryActions: asStringArray(preparation.retryActions).slice(-32),
              selectedTasks: asStringArray(preparation.selectedTasks),
              ...(preparation.currentTask === "routine" || preparation.currentTask === "wish"
                ? { currentTask: preparation.currentTask }
                : {}),
            }
          : {}),
        completedIds: asStringArray(preparation.completedIds).slice(0, 12),
        currentId: asTrimmedString(preparation.currentId),
        error: boundText(preparation.error, 300),
        ...(["venues", "private-spaces", "residents"].includes(String(preparation.phase))
          ? { phase: preparation.phase as "venues" | "private-spaces" | "residents" }
          : {}),
        ...(typeof preparation.currentVenueId === "string"
          ? { currentVenueId: preparation.currentVenueId.slice(0, 100) }
          : {}),
        ...(typeof preparation.currentZoneId === "string"
          ? { currentZoneId: preparation.currentZoneId.slice(0, 100) }
          : {}),
        ...(preparation.stage === "reading" ||
        preparation.stage === "lore" ||
        preparation.stage === "resolving" ||
        preparation.stage === "queued" ||
        preparation.stage === "model" ||
        preparation.stage === "validating" ||
        preparation.stage === "applying" ||
        preparation.stage === "saving"
          ? { stage: preparation.stage }
          : {}),
        ...(asIsoString(preparation.stageStartedAt)
          ? { stageStartedAt: asIsoString(preparation.stageStartedAt)! }
          : {}),
        ...(typeof preparation.attempt === "number" && Number.isFinite(preparation.attempt)
          ? { attempt: Math.max(0, Math.floor(preparation.attempt)) }
          : {}),
        ...(typeof preparation.loreEntryCount === "number"
          ? { loreEntryCount: Math.max(0, Math.floor(preparation.loreEntryCount)) }
          : {}),
        ...(typeof preparation.modelName === "string" ? { modelName: preparation.modelName.slice(0, 120) } : {}),
      };
    })(),
    // Left empty rather than stamped with "now": a record that predates the
    // village clock should start keeping time when it is next written, not
    // pretend it has been running since the upgrade.
    foundedAt,
    seed: asTrimmedString(raw.seed),
    simulatedThrough: asIsoString(raw.simulatedThrough) ?? "",
    lastKnownTimeZone: boundText(raw.lastKnownTimeZone, 100),
    timeZone: validTimeZone(raw.timeZone) ? raw.timeZone : "",
    clock: decodeVillageClock(raw.clock),
    backgroundPace: coerceBackgroundPace(raw),
    narrativeConsequence: ["gentle", "moderate", "dramatic"].includes(String(raw.narrativeConsequence))
      ? (raw.narrativeConsequence as "gentle" | "moderate" | "dramatic")
      : "gentle",
    lastPlanningDate: boundText(raw.lastPlanningDate, 10),
    planningUsage: coercePlanningUsage(raw.planningUsage),
    processedActionIds: asStringArray(raw.processedActionIds)
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(-MAX_SIMULATION_RECORDS),
    ...(raw.semanticRequestReceipts
      ? {
          semanticRequestReceipts: Object.fromEntries(
            Object.entries(asRecord(raw.semanticRequestReceipts)).filter(([, value]) => typeof value === "string"),
          ) as Record<string, string>,
        }
      : {}),
    ...(raw.semanticContinuations
      ? {
          semanticContinuations: Object.fromEntries(
            Object.entries(asRecord(raw.semanticContinuations)).filter(
              ([, value]) =>
                Array.isArray(value) &&
                value.every((domain) => ["memories", "relationships", "wishes", "projects"].includes(String(domain))),
            ),
          ) as VillageState["semanticContinuations"],
        }
      : {}),
    socialOutbox: Array.isArray(raw.socialOutbox)
      ? (structuredClone(raw.socialOutbox) as VillageState["socialOutbox"])
      : [],
    projects: coerceProjects(raw.projects ?? []),
    wishFollowing: Object.fromEntries(
      Object.entries(asRecord(raw.wishFollowing)).filter(([, v]) => typeof v === "boolean"),
    ) as Record<string, boolean>,
    progressTasks: coerceProgressTasks(raw.progressTasks),
    pendingDecisions: coercePendingDecisions(raw.pendingDecisions),
    ...(raw.formerLetterFonts
      ? {
          formerLetterFonts: Object.fromEntries(
            Object.entries(asRecord(raw.formerLetterFonts)).filter(
              (entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length <= 120,
            ),
          ),
        }
      : {}),
    villagers: villagers.filter((entry) => {
      if (seen.has(entry.characterId)) return false;
      seen.add(entry.characterId);
      return true;
    }),
    // A stored box keeps its internal formatting, so it is bounded but not
    // trimmed to nothing; an empty box means "this village wrote nothing", which
    // is what the renderer answers with the shipped text.
    //
    // The old `promptVoice` and `promptPreset` keys remain unread. Live venue
    // writing now reads the per-village narrationStyle above.
    // Read as empty, always. These two used to be the player's own typed name and
    // description, and a record that still carries them keeps them as unread
    // keys until its next write drops them: the coercer returns a fresh object,
    // and reading them back would be the package still answering "who is the
    // player" with something other than the Persona.
    playerName: "",
    playerDescription: "",
    // Bounded but never validated here: whether the Persona still exists is a
    // question about the library, which storage cannot answer. An id into a
    // deleted Persona is kept and its copy survives it, so a library that is
    // briefly unreadable costs the player nothing.
    playerPersonaId: boundText(raw.playerPersonaId, MAX_PLAYER_PERSONA_ID_LENGTH),
    // The copy follows its id: a record with no id has nothing to be a copy of,
    // so the two are read together rather than trusted to agree on disk.
    playerPersonaName:
      asString(raw.playerPersonaId).length > 0 ? boundText(raw.playerPersonaName, MAX_PLAYER_PERSONA_NAME_LENGTH) : "",
    playerPersonaIdentity:
      asString(raw.playerPersonaId).length > 0
        ? boundText(raw.playerPersonaIdentity, MAX_PLAYER_PERSONA_IDENTITY_LENGTH)
        : "",
    // Only meaningful beside an id, and never trusted on its own: a flag saying
    // "the link is broken" with no link to break would put a notice in front of
    // a player who has not chosen anyone yet.
    playerPersonaMissing:
      boundText(raw.playerPersonaId, MAX_PLAYER_PERSONA_ID_LENGTH).length > 0
        ? raw.playerPersonaMissing === true
        : false,
    maps: Array.isArray(raw.maps)
      ? raw.maps.map((entry) => {
          const map = asRecord(entry);
          const artwork = coerceVenueImage(map.artwork);
          if (!asTrimmedString(map.id) || !asTrimmedString(map.name) || !artwork)
            throw new Error("A saved map is incomplete.");
          return {
            id: asTrimmedString(map.id),
            name: asTrimmedString(map.name),
            artwork,
            width: Number(map.width),
            height: Number(map.height),
            view: coerceTownMapView(map.view),
            revision: Number(map.revision),
          };
        })
      : [],
  };
  for (const villager of state.villagers) {
    const agenda = villager.agenda;
    if (!agenda) continue;
    const blocks = [...agenda.day, ...Object.values(agenda.week ?? {}).flat(), ...(agenda.activeDay?.blocks ?? [])];
    for (const block of blocks) {
      const venue =
        state.venues.find((entry) => entry.id === block.venueId) ??
        state.venues.find((entry) => venueResidentIds(entry).includes(villager.characterId));
      if (venue && !venue.access)
        block.zoneId = chooseAgendaZone(venue, villager.characterId, block.activity, block.zoneId, state).id;
    }
  }

  projectAgendaReservations(state);
  return state;
}
