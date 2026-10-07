import { readResidentFoundingContext } from "../../../shared/helpers/resident-founding-context.js";
import type {
  VillageAgenda,
  VillageChronicleActor,
  VillageChronicleEntry,
  VillageCompletedWish,
  VillageHappening,
  VillageNotice,
  VillageOpportunity,
  VillagePendingDecision,
  VillageProject,
  VillageRecollection,
  VillageRelationship,
  VillageRemap,
  VillageRemapFailure,
  VillageRemapMove,
  VillageResidence,
  VillageScheduledEvent,
  VillageState,
  VillageStoryPace,
  VillageTownMapView,
  VillageVenue,
  VillageVenueClass,
  VillageVenueEvent,
  VillageVenueFeature,
  VillageVenueImage,
  VillageVenueMail,
  VillageVenueTrace,
  VillageVenueZone,
  VillageVillager,
  VillageVillagerCardSnapshot,
  VillageWish,
  VillageZoneDraft,
} from "../models/world.js";
import { unwrittenVillageAgenda, VILLAGE_AGENDA_WINDOWS } from "../rules/agenda-plan.js";
import { completeAgendaWeek, legacyAgendaWeek, workingAgendaWeek } from "../rules/agenda-week.js";
import {
  asFraction,
  asInstant,
  asIsoString,
  asRecord,
  asString,
  asStringArray,
  asTrimmedString,
} from "../rules/coerce.js";
import { coerceLoreTokenBudget, coerceSelectedLorebookIds, DEFAULT_LORE_TOKEN_BUDGET } from "../rules/lore-policy.js";
import { MAX_MEMORY_LENGTH } from "../rules/memory-policy.js";
import { coerceVillageNarrationStyle, defaultVillageNarrationStyle } from "../rules/narration-style.js";
import { MAX_REMAP_ATTEMPTS, MAX_REMAP_FAILURE_LENGTH, remapBlockKey } from "../rules/native-remap.js";
import { adoptedProfile, coerceRoutineProfile, influenceSettings } from "../rules/owned-routine.js";
import { coercePlayerRole } from "../rules/player-role.js";
import { coerceProgressTasks, readProgressInterpretation } from "../rules/progress-engine.js";
import {
  boundText,
  DEFAULT_TOWN_MAP_VIEW,
  GLOBAL_GALLERY_REF_PREFIX,
  HOME_BUILDINGS,
  isGlobalGalleryRef,
  isHomeBuildingKind,
  isHousePlace,
  isTownMapFit,
  isTownMapImage,
  LEGACY_TOWN_MAP_HEIGHT,
  LEGACY_TOWN_MAP_WIDTH,
  MAX_CHRONICLE_LENGTH,
  MAX_HAPPENING_LENGTH,
  MAX_HAPPENINGS,
  MAX_NOTICE_AUTHOR_LENGTH,
  MAX_NOTICE_LENGTH,
  MAX_NOTICEBOARD_NOTES,
  MAX_PLACES,
  MAX_PLAYER_PERSONA_ID_LENGTH,
  MAX_PLAYER_PERSONA_IDENTITY_LENGTH,
  MAX_PLAYER_PERSONA_NAME_LENGTH,
  MAX_REMAP_ACTIVITY_LENGTH,
  MAX_REMAP_HERE_LENGTH,
  MAX_REMAP_MOVES,
  MAX_REMAP_SLOT_LENGTH,
  MAX_ROUTINE_SUMMARY_LENGTH,
  MAX_SETTING_LENGTH,
  MAX_TOWN_MAP_IMAGE_LENGTH,
  MAX_VENUE_DESCRIPTION_LENGTH,
  MAX_VENUE_EVENTS,
  MAX_VENUE_IMAGE_URL_LENGTH,
  MAX_VENUE_NAME_LENGTH,
  MAX_VENUE_NOTE_LENGTH,
  MAX_VILLAGER_WISHES,
  MAX_WISH_LENGTH,
  MAX_WISH_TELL_LENGTH,
  TOWN_MAP_EXPECTED_HEIGHT,
  TOWN_MAP_EXPECTED_WIDTH,
  TOWN_MAP_FOCUS_MAX,
  TOWN_MAP_FOCUS_MIN,
  TOWN_MAP_ZOOM_MAX,
  TOWN_MAP_ZOOM_MIN,
  VILLAGES_PROMPT_BOX_MAX_LENGTH,
} from "../rules/prompt-preset.js";
import { coerceScenarioImprint, coerceWorldFacts } from "../rules/scenario-rules.js";
import { coerceSpriteManager, managerResidentSprite } from "../rules/sprite-manager-model.js";
import { readVenueAccess, readZonePolicy } from "../rules/venue-access.js";
import {
  defaultVenueSpace,
  validVenueClasses,
  validVenueImprovements,
  venueResidentIds,
} from "../rules/venue-model.js";
import {
  canInviteToZone,
  chooseAgendaZone,
  legacyVenueZones,
  legacyZoneId,
  synchronizeVenueZones,
  ZONE_KINDS,
} from "../rules/venue-zones.js";
import { randomVillageSeed, VILLAGE_CLOCKS, VILLAGE_WEEKDAYS, villageClockIndex } from "../rules/village-clock.js";
import { coerceWishActivities, coerceWishLifecycle } from "../rules/wish-coercion.js";
import { WISH_SYSTEM_VERSION, wishSize } from "../rules/wish-definition.js";
import { coerceWishKnowledge, resetLegacyWishRecords } from "../rules/wish-journal.js";
import { shortWishText, wishPolicy } from "../rules/wish-policy.js";

export function defaultVillageState(): VillageState {
  return {
    version: 2,
    backgroundReceipts: {},
    exchangeReceipts: {},
    noticeSequence: 0,
    dismissedNoticeIds: [],
    wishSystemVersion: WISH_SYSTEM_VERSION,
    wishResetPending: [],
    wishKnowledge: {},
    projectWishOutbox: [],
    wishRefillIntents: {},
    progressEngineVersion: 1,
    name: "Willowbrook",
    narrationStyle: defaultVillageNarrationStyle(),
    characterSpeechColors: true,
    sendOnEnter: false,
    spriteCardFlipEnabled: true,
    // An empty setting means "no place yet": the venue and routine blocks render
    // nothing, and the village behaves exactly as it did before they existed.
    setting: "",
    foundingReason: "",
    foundingDetails: "",
    foundingGuidance: "",
    playerRole: null,
    scenarioImprint: null,
    worldFacts: [],
    venueCapacityPolicy: "sixteen-total-v1",
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
    // A village starts with nothing pinned up. The board is a record of what
    // the people here have said to each other, and on the day it is founded
    // nobody has said anything yet — shipping a few notices to make the panel
    // look occupied would be the village inventing its own history.
    noticeboard: [],
    // Nothing has happened yet either, for the same reason: the founding is not
    // an event, it is the moment the record began.
    happenings: [],
    // And nothing is remembered yet. The chronicle fills in as the village is
    // written up, one batch at a time, from the same call that writes the
    // happenings — a village shipped with a few memories to make the panel look
    // occupied would be inventing a past it never had.
    chronicle: [],
    recollections: [],
    correctedWishMemoryIds: [],
    simulatedThrough: "",
    lastKnownTimeZone: "",
    storyPace: "balanced",
    lastCreativeDate: "",
    processedOpportunityIds: [],
    opportunities: [],
    scheduledEvents: [],
    relationships: [],
    projects: [],
    progressTasks: [],
    narrativeItems: [],
    projectSourceClaims: [],
    villageCapabilities: [],
    pendingDecisions: [],
    venueMail: [],
    villagers: [],
    // Empty rather than the default text: the default lives in `prompt-preset.ts`
    // and is applied at render time, so improving it reaches villages that never
    // touched the setting. An empty box is what the renderer reads as "this
    // village has written nothing" and answers with the shipped text.
    promptKnowledge: "",
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
    townMapImage: "",
    townMapImageSetAt: "",
    townMapCanvasWidth: TOWN_MAP_EXPECTED_WIDTH,
    townMapCanvasHeight: TOWN_MAP_EXPECTED_HEIGHT,
    // A copy rather than the shared object, so a write through one village's
    // state cannot reach the default every other village is given.
    townMapView: { ...DEFAULT_TOWN_MAP_VIEW },
  };
}
function coerceVillager(value: unknown, venues: readonly VillageVenue[]): VillageVillager | null {
  const raw = asRecord(value);
  const characterId = asTrimmedString(raw.characterId);
  if (characterId.length === 0) return null;
  const cardSnapshot = coerceVillagerCardSnapshot(raw.cardSnapshot);
  if (!cardSnapshot || cardSnapshot.id !== characterId) return null;
  return {
    characterId,
    agendaGeneration: asString(raw.agendaGeneration),
    translationGeneration: asString(raw.translationGeneration),
    cardSnapshot,
    ...(coerceResidentSignature(raw.signature) ? { signature: coerceResidentSignature(raw.signature)! } : {}),
    ...(readResidentFoundingContext(raw.foundingContext)
      ? { foundingContext: readResidentFoundingContext(raw.foundingContext)! }
      : {}),
    spriteManager: coerceSpriteManager(raw.spriteManager),
    sprite: managerResidentSprite(coerceSpriteManager(raw.spriteManager)),
    addedAt: asIsoString(raw.addedAt) ?? new Date().toISOString(),
    // Absent reads as null rather than as an empty agenda, and the difference
    // matters: null means "not written for yet", which is what makes the
    // village write one. An empty agenda is a positive statement that asking
    // produced nothing, and it must only ever come from actually asking.
    agenda: coerceAgenda(raw.agenda, venues, cardSnapshot.name, raw.ingestSchedule !== false),
    completedWishes: coerceCompletedWishes(raw.completedWishes),
    wishLifecycle: coerceWishLifecycle(raw.wishLifecycle),
    ingestSchedule: influenceSettings(raw.scheduleInfluence, raw.ingestSchedule !== false).enabled,
    scheduleInfluence: influenceSettings(raw.scheduleInfluence, raw.ingestSchedule !== false),
    // Read on the same terms as the agenda, and for the same reason — but null
    // here is a settled state rather than a pending one. A translation carries
    // the week it was written for, and without that week it cannot be
    // recognised as stale, so it is dropped rather than stored: a record nothing
    // can invalidate is worse than no record. The village reads the Engine's own
    // words until the Engine hands it a week to key on.
    remap: coerceRemap(raw.remap),
    remapFailure: coerceRemapFailure(raw.remapFailure),
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
function coerceRemapFailure(value: unknown): VillageRemapFailure | null {
  const raw = asRecord(value);
  const at = asIsoString(raw.at);
  const message = boundText(raw.message, MAX_REMAP_FAILURE_LENGTH);
  if (!at || message.length === 0) return null;
  return { at, message };
}
function coerceWish(value: unknown): VillageWish | null {
  const raw = asRecord(value);
  const wish = boundText(raw.wish, MAX_WISH_LENGTH);
  if (wish.length === 0) return null;
  const intensity = typeof raw.intensity === "number" && Number.isFinite(raw.intensity) ? Math.round(raw.intensity) : 2;
  const need = asRecord(raw.need);
  return {
    id: asTrimmedString(raw.id) || randomVillageSeed(),
    wish,
    // Clamped rather than dropped. The number only decides how loudly a wish is
    // written and in what order, so a model that answers with 0 or 9 has said
    // something usable badly, not something unusable.
    intensity: Math.min(3, Math.max(1, intensity)),
    tell: boundText(raw.tell, MAX_WISH_TELL_LENGTH),
    addedAt: asInstant(raw.addedAt),
    expiresAt: asInstant(raw.expiresAt),
    size: wishSize(raw.size),
    conditionRevision:
      Number.isSafeInteger(raw.conditionRevision) && (raw.conditionRevision as number) >= 0
        ? (raw.conditionRevision as number)
        : 0,
    ...(asInstant(raw.learnedAt)
      ? {
          learnedAt: asInstant(raw.learnedAt),
          learnedLineIds: Array.isArray(raw.learnedLineIds)
            ? raw.learnedLineIds.filter((id): id is string => typeof id === "string")
            : [],
        }
      : {}),
    ...(shortWishText(need.id)
      ? {
          need: {
            id: shortWishText(need.id),
            subject: shortWishText(need.subject, 80),
            action: shortWishText(need.action, 80),
            policy: wishPolicy(need.policy),
          },
        }
      : {}),
  };
}
function coerceCompletedWishes(value: unknown): VillageCompletedWish[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.flatMap((entry): VillageCompletedWish[] => {
    const raw = asRecord(entry);
    const wish = coerceWish(raw.wish);
    const fulfilledAt = asInstant(raw.fulfilledAt);
    const memoryId = asTrimmedString(raw.memoryId);
    if (!wish || !fulfilledAt || !memoryId || seen.has(wish.id)) return [];
    seen.add(wish.id);
    return [{ wish, fulfilledAt, memoryId }];
  });
}
function coerceAgenda(
  value: unknown,
  venues: readonly VillageVenue[],
  name: string,
  legacyEnabled = false,
): VillageAgenda | null {
  if (value === null || value === undefined) return null;
  const raw = asRecord(value);
  if (Object.keys(raw).length === 0) return null;
  const wishes: VillageWish[] = [];
  const seen = new Set<string>();
  if (Array.isArray(raw.wishes)) {
    for (const entry of raw.wishes) {
      const wish = coerceWish(entry);
      if (!wish || seen.has(wish.id) || wishes.length >= MAX_VILLAGER_WISHES) continue;
      seen.add(wish.id);
      wishes.push(wish);
    }
  }
  const agenda: VillageAgenda = {
    wishActivities: coerceWishActivities(raw.wishActivities),
    socialActivities: coerceWishActivities(raw.socialActivities),
    wishes,
    routineSummary: boundText(raw.routineSummary, MAX_ROUTINE_SUMMARY_LENGTH),
    day: Array.isArray(raw.day)
      ? raw.day.flatMap((entry) => {
          const item = asRecord(entry);
          const legacy =
            typeof item.clock === "string"
              ? VILLAGE_AGENDA_WINDOWS.find((window) => window.legacyClock === item.clock)
              : undefined;
          const startMinute =
            typeof item.startMinute === "number" && Number.isInteger(item.startMinute)
              ? Math.max(0, Math.min(1439, item.startMinute))
              : legacy?.startMinute;
          const endMinute =
            typeof item.endMinute === "number" && Number.isInteger(item.endMinute)
              ? Math.max(1, Math.min(1440, item.endMinute))
              : legacy?.endMinute;
          if (startMinute === undefined || endMinute === undefined || endMinute <= startMinute) return [];
          return [
            {
              startMinute,
              endMinute,
              venueId: asTrimmedString(item.venueId),
              zoneId: asTrimmedString(item.zoneId) || undefined,
              activity: boundText(item.activity, MAX_REMAP_HERE_LENGTH),
            },
          ];
        })
      : [],
    source: raw.source === "native" ? "native" : "village",
    // Left empty rather than stamped with "now": a record that predates agendas
    // has no answer to when this was written, and inventing one would put a
    // time on it that the debug tab would then show as fact.
    generatedAt: asIsoString(raw.generatedAt) ?? "",
  };
  const projectWork = asRecord(raw.projectWork);
  if (
    asTrimmedString(projectWork.projectId) &&
    asTrimmedString(projectWork.venueId) &&
    asIsoString(projectWork.startsAt) &&
    asIsoString(projectWork.endsAt)
  )
    agenda.projectWork = {
      projectId: asTrimmedString(projectWork.projectId),
      venueId: asTrimmedString(projectWork.venueId),
      zoneId: asTrimmedString(projectWork.zoneId) || "exterior",
      startsAt: asIsoString(projectWork.startsAt)!,
      endsAt: asIsoString(projectWork.endsAt)!,
    };
  const fallback = workingAgendaWeek(venues, name);
  agenda.week = legacyAgendaWeek({ ...agenda, week: raw.week as VillageAgenda["week"] }, fallback);
  agenda.scheduleWeek = raw.scheduleWeek ? completeAgendaWeek(raw.scheduleWeek, agenda.week) : null;
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
  if (agenda.routineProfile && asRecord(raw.routineProfile).seedWeek)
    agenda.routineProfile.seedWeek = completeAgendaWeek(asRecord(raw.routineProfile).seedWeek, agenda.week!);
  if (!agenda.routineProfile) {
    if (legacyEnabled && agenda.scheduleWeek) agenda.week = agenda.scheduleWeek;
    agenda.routineProfile = adoptedProfile(agenda.week!);
    agenda.personalizationPending = false;
  } else agenda.personalizationPending = raw.personalizationPending === true;
  agenda.scheduleWeek = null;
  agenda.source = "village";
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
export function coerceRemap(value: unknown): VillageRemap | null {
  if (value === null || value === undefined) return null;
  const raw = asRecord(value);
  if (Object.keys(raw).length === 0) return null;
  const weekStart = asTrimmedString(raw.weekStart);
  if (weekStart.length === 0) return null;
  const moves: VillageRemapMove[] = [];
  const seen = new Set<string>();
  if (Array.isArray(raw.moves)) {
    for (const entry of raw.moves) {
      if (moves.length >= MAX_REMAP_MOVES) break;
      const move = coerceRemapMove(entry);
      if (!move || seen.has(move.key)) continue;
      seen.add(move.key);
      moves.push(move.move);
    }
  }
  const attempts = typeof raw.attempts === "number" && Number.isFinite(raw.attempts) ? raw.attempts : 0;
  return {
    weekStart,
    moves,
    routine: boundText(raw.routine, MAX_ROUTINE_SUMMARY_LENGTH),
    signature: asTrimmedString(raw.signature),
    ...(typeof raw.foundingLens === "string" ? { foundingLens: raw.foundingLens.slice(0, 100) } : {}),
    attempts: Math.max(0, Math.min(MAX_REMAP_ATTEMPTS, Math.floor(attempts))),
    // Left empty rather than stamped with "now", exactly as the agenda is: a
    // record read off disk has no answer to when it was written.
    generatedAt: asIsoString(raw.generatedAt) ?? "",
  };
}
function coerceRemapMove(value: unknown): { key: string; move: VillageRemapMove } | null {
  const raw = asRecord(value);
  const day = boundText(raw.day, MAX_REMAP_SLOT_LENGTH);
  const time = boundText(raw.time, MAX_REMAP_SLOT_LENGTH);
  const activity = boundText(raw.activity, MAX_REMAP_ACTIVITY_LENGTH);
  const here = boundText(raw.here, MAX_REMAP_HERE_LENGTH);
  if (day.length === 0 || time.length === 0 || here.length === 0) return null;
  return {
    key: remapBlockKey(day, time),
    move: {
      day,
      time,
      activity,
      here,
      venueId: asTrimmedString(raw.venueId),
      ...(asTrimmedString(raw.zoneId) ? { zoneId: asTrimmedString(raw.zoneId) } : {}),
      wishId: asTrimmedString(raw.wishId),
      ...(raw.flexible === true ? { flexible: true } : {}),
    },
  };
}
function coerceVenue(value: unknown): VillageVenue | null {
  const raw = asRecord(value);
  const name = boundText(raw.name, MAX_VENUE_NAME_LENGTH);
  const description = boundText(raw.description, MAX_VENUE_DESCRIPTION_LENGTH);
  const category = boundText(raw.category, MAX_VENUE_NOTE_LENGTH);
  const presentation = asRecord(raw.presentation);
  const occupancy = asRecord(raw.occupancy);
  const capabilities = Array.isArray(raw.capabilities)
    ? raw.capabilities
        .filter((entry): entry is string => typeof entry === "string")
        .map((entry) => entry.trim())
        .filter(Boolean)
    : [];
  const state = asRecord(raw.state);
  const x = asFraction(presentation.x);
  const y = asFraction(presentation.y);
  const playerHome = occupancy.playerHome === true;
  const residentCharacterId = asTrimmedString(occupancy.residentCharacterId);
  const homeKind = isHomeBuildingKind(occupancy.homeKind) ? occupancy.homeKind : null;
  const classes: VillageVenueClass[] = validVenueClasses(raw.classes)
    ? raw.classes
    : playerHome || residentCharacterId || homeKind
      ? ["residence"]
      : ["other"];
  const residentIds = coerceVenueIds(raw.residentIds);
  if (!residentIds.length && residentCharacterId && !playerHome) residentIds.push(residentCharacterId);
  const coerceSpaceState = (value: unknown) => {
    const scene = asRecord(value);
    return {
      condition: boundText(scene.condition, MAX_VENUE_NOTE_LENGTH),
      items: coerceVenueStringList(scene.items),
      publicFacts: coerceVenueStringList(scene.publicFacts),
      features: coerceVenueFeatures(scene.features),
      traces: coerceVenueTraces(scene.traces),
      updatedAt: asIsoString(scene.updatedAt) ?? "",
    };
  };
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
      description: value
        ? boundText(row.description, MAX_VENUE_DESCRIPTION_LENGTH) || `A private space for this resident at ${name}.`
        : "",
      image: coerceVenueImage(row.image),
      state: coerceSpaceState(row.state),
      initialImageAttemptedAt: asIsoString(row.initialImageAttemptedAt) ?? "",
      adaptationPending: row.adaptationPending === true,
      adaptationSourceArchiveAt: asIsoString(row.adaptationSourceArchiveAt) ?? "",
    };
  };
  const explicitLayout = raw.layoutVersion === 1;
  const privateSpaces =
    !explicitLayout && classes.includes("residence")
      ? [...residentIds, ...(playerHome ? ["player"] : [])].map((ownerId) =>
          privateSpaceFor(
            ownerId,
            Array.isArray(raw.privateSpaces)
              ? raw.privateSpaces.find((entry) => asTrimmedString(asRecord(entry).ownerId) === ownerId)
              : null,
          ),
        )
      : [];
  const spaceClasses = explicitLayout
    ? Array.isArray(raw.spaces)
      ? raw.spaces
          .map((entry) => asRecord(entry).venueClass)
          .filter((entry): entry is VillageVenueClass => validVenueClasses([entry]))
      : []
    : validVenueClasses(raw.baseClasses)
      ? raw.baseClasses
      : classes;
  const spaces = spaceClasses.map((venueClass) => {
    const row = Array.isArray(raw.spaces)
      ? asRecord(raw.spaces.find((entry) => asRecord(entry).venueClass === venueClass))
      : {};
    const scene = asRecord(row.state);
    const fallback = defaultVenueSpace(venueClass, description);
    const legacyScene: Record<string, unknown> = Array.isArray(raw.spaces) ? {} : state;
    return {
      ...fallback,
      id: asTrimmedString(row.id) || venueClass,
      description: boundText(row.description, MAX_VENUE_DESCRIPTION_LENGTH) || description,
      image:
        coerceVenueImage(row.image) ??
        (Array.isArray(raw.spaces) || venueClass === "residence" ? null : coerceVenueImage(presentation.image)),
      state: {
        condition: boundText(scene.condition ?? legacyScene.condition, MAX_VENUE_NOTE_LENGTH),
        items: coerceVenueStringList(scene.items ?? legacyScene.furniture),
        publicFacts: coerceVenueStringList(scene.publicFacts ?? legacyScene.publicFacts),
        features: coerceVenueFeatures(scene.features ?? legacyScene.features),
        traces: coerceVenueTraces(scene.traces ?? legacyScene.traces),
        updatedAt: asIsoString(scene.updatedAt ?? legacyScene.updatedAt) ?? "",
      },
    };
  });
  if (!Array.isArray(raw.zones)) {
    const primary = spaces.find((space) => space.venueClass !== "residence") ?? spaces[0];
    if (primary) {
      primary.state.condition ||= boundText(state.condition, MAX_VENUE_NOTE_LENGTH);
      primary.state.publicFacts = [
        ...new Set([
          ...primary.state.publicFacts,
          ...coerceVenueStringList(state.publicFacts).filter(
            (fact) =>
              !spaces.some((space) => space.state.publicFacts.includes(fact)) &&
              !privateSpaces.some((space) => space.state.publicFacts.includes(fact)) &&
              !coerceSpaceState(raw.exteriorState).publicFacts.includes(fact),
          ),
        ]),
      ];
      for (const feature of coerceVenueFeatures(state.features))
        if (
          ![...spaces, ...privateSpaces].some((space) => space.state.features.some((item) => item.id === feature.id)) &&
          !coerceSpaceState(raw.exteriorState).features.some((item) => item.id === feature.id)
        )
          primary.state.features.push(feature);
      for (const trace of coerceVenueTraces(state.traces))
        if (
          ![...spaces, ...privateSpaces].some((space) => space.state.traces.some((item) => item.id === trace.id)) &&
          !coerceSpaceState(raw.exteriorState).traces.some((item) => item.id === trace.id)
        )
          primary.state.traces.push(trace);
      const placed = new Set([
        ...spaces.flatMap((space) => space.state.items),
        ...privateSpaces.flatMap((space) => space.state.items),
        ...coerceSpaceState(raw.exteriorState).items,
      ]);
      primary.state.items.push(...coerceVenueStringList(state.furniture).filter((item) => !placed.has(item)));
    }
  }
  const improvements = validVenueImprovements(raw.improvements)
    ? raw.improvements.map((entry) =>
        entry
          ? {
              id: entry.id,
              title: boundText(entry.title, MAX_VENUE_NOTE_LENGTH),
              description: boundText(entry.description, MAX_VENUE_DESCRIPTION_LENGTH),
              spaceId: asTrimmedString(entry.spaceId) || null,
              classContribution: validVenueClasses([entry.classContribution]) ? entry.classContribution : undefined,
              zones: coerceZoneDrafts(entry.zones),
              extraBeds: entry.extraBeds,
              approvedAt: asIsoString(entry.approvedAt) ?? "",
            }
          : null,
      )
    : [null, null];
  if (
    asTrimmedString(raw.id).length === 0 ||
    (name.length === 0 && !playerHome && residentCharacterId.length === 0 && homeKind === null)
  ) {
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
    form: boundText(raw.form, MAX_VENUE_NOTE_LENGTH),
    classes,
    baseClasses: validVenueClasses(raw.baseClasses) ? raw.baseClasses : classes,
    layoutVersion: explicitLayout ? 1 : undefined,
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
    editProposals: Array.isArray(raw.editProposals)
      ? raw.editProposals
          .flatMap((value) => {
            const entry = asRecord(value);
            const id = asTrimmedString(entry.id);
            const target = entry.target === "private" ? ("private" as const) : ("shared" as const);
            const ownerId = asTrimmedString(entry.ownerId);
            const proposed = asRecord(entry.proposed);
            const requiredIds = coerceVenueIds(entry.requiredIds);
            if (
              !id ||
              !requiredIds.length ||
              (target === "private" && !entry.zoneId && !entry.privateSpaceId && ownerId !== requiredIds[0])
            )
              return [];
            const current =
              asTrimmedString(entry.zoneId) && Array.isArray(raw.zones)
                ? raw.zones.map(asRecord).find((zone) => zone.id === entry.zoneId)
                : target === "private"
                  ? privateSpaces.find((space) => space.ownerId === ownerId)
                  : spaces.find((space) => space.venueClass === "residence");
            // Older image-only proposals have no resident decision to make now.
            if (
              current &&
              boundText(proposed.description, MAX_VENUE_DESCRIPTION_LENGTH) === current.description &&
              JSON.stringify(coerceSpaceState(proposed.state)) === JSON.stringify(current.state)
            )
              return [];
            return [
              {
                id,
                target,
                zoneId: asTrimmedString(entry.privateSpaceId ?? entry.zoneId) || undefined,
                privateSpaceId:
                  target === "private" ? asTrimmedString(entry.privateSpaceId ?? entry.zoneId) || undefined : undefined,
                ownerId,
                baseUpdatedAt: asIsoString(entry.baseUpdatedAt) ?? "",
                proposed: {
                  name: boundText(proposed.name, MAX_VENUE_NAME_LENGTH) || undefined,
                  purpose: boundText(proposed.purpose, 240) || undefined,
                  id: asTrimmedString(proposed.id) || (target === "private" ? `private:${ownerId}` : "residence"),
                  venueClass: "residence" as const,
                  description: boundText(proposed.description, MAX_VENUE_DESCRIPTION_LENGTH),
                  image: coerceVenueImage(proposed.image),
                  state: coerceSpaceState(proposed.state),
                },
                requiredIds,
                approvedIds: coerceVenueIds(entry.approvedIds).filter((residentId) => requiredIds.includes(residentId)),
                declined: entry.declined === true,
                createdAt: asIsoString(entry.createdAt) ?? "",
              },
            ];
          })
          .slice(-8)
      : [],
    usedInvitationIds: Array.isArray(raw.usedInvitationIds)
      ? [
          ...new Set(
            raw.usedInvitationIds.filter(
              (id): id is string => typeof id === "string" && id.length > 0 && id.length <= 200,
            ),
          ),
        ]
      : [],
    playerInvitations: Array.isArray(raw.playerInvitations)
      ? raw.playerInvitations
          .map((entry) => ({
            residentId: asTrimmedString(asRecord(entry).residentId),
            zoneId: asTrimmedString(asRecord(entry).privateSpaceId ?? asRecord(entry).zoneId) || undefined,
            privateSpaceId: asTrimmedString(asRecord(entry).privateSpaceId) || undefined,
            recordedAt: asIsoString(asRecord(entry).recordedAt) ?? "",
            scope: asRecord(entry).scope === "private" ? ("private" as const) : ("shared" as const),
            ownerId: asTrimmedString(asRecord(entry).ownerId),
            sourceLineId: asTrimmedString(asRecord(entry).sourceLineId),
            quote: boundText(asRecord(entry).quote, MAX_VENUE_NOTE_LENGTH),
          }))
          .filter(
            (entry) =>
              (!!entry.zoneId || residentIds.includes(entry.residentId)) &&
              (entry.scope === "shared" || entry.ownerId === entry.residentId),
          )
          .slice(-16)
      : [],
    improvements,
    description,
    category,
    presentation: {
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
    state: {
      condition: boundText(state.condition, MAX_VENUE_NOTE_LENGTH),
      upgrades: coerceVenueStringList(state.upgrades),
      furniture: coerceVenueStringList(state.furniture),
      publicFacts: coerceVenueStringList(state.publicFacts),
      features: coerceVenueFeatures(state.features),
      traces: coerceVenueTraces(state.traces),
      updatedAt: asIsoString(state.updatedAt) ?? "",
    },
  };
  const readZone = (value: unknown, archived = false): VillageVenueZone | null => {
    const row = asRecord(value);
    const id = asTrimmedString(row.id);
    if (!id || !ZONE_KINDS.includes(row.kind as VillageVenueZone["kind"])) return null;
    const ownerId = asTrimmedString(row.ownerId);
    if (
      !archived &&
      row.kind === "private-residence" &&
      !(explicitLayout && !ownerId) &&
      !(residentIds.includes(ownerId) || (ownerId === "player" && playerHome))
    )
      return null;
    const upgradeId = asTrimmedString(row.upgradeId);
    if (upgradeId && !improvements.some((upgrade) => upgrade?.id === upgradeId)) return null;
    return {
      id,
      name: boundText(row.name, MAX_VENUE_NAME_LENGTH) || "Zone",
      kind: row.kind as VillageVenueZone["kind"],
      venueClass: validVenueClasses([row.venueClass]) ? (row.venueClass as VillageVenueClass) : "other",
      description: boundText(row.description, MAX_VENUE_DESCRIPTION_LENGTH),
      image: coerceVenueImage(row.image),
      state: coerceSpaceState(row.state),
      ownerId: ownerId || undefined,
      purpose: boundText(row.purpose, 240),
      ...(row.access === undefined ? {} : { access: readZonePolicy(row.access) }),
      controllerIds: coerceVenueIds(row.controllerIds),
      preparation: ["pending", "ready", "failed"].includes(String(asRecord(row.preparation).status))
        ? {
            status: asRecord(row.preparation).status as "pending" | "ready" | "failed",
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
      upgradeId: upgradeId || undefined,
      seen: row.seen === true,
      initialImageAttemptedAt: asIsoString(row.initialImageAttemptedAt) ?? "",
      adaptationPending: row.adaptationPending === true,
      adaptationSourceArchiveAt: asIsoString(row.adaptationSourceArchiveAt) ?? "",
    };
  };
  if (Array.isArray(raw.zones)) {
    const ids = new Set<string>();
    venue.zones = raw.zones.flatMap((value) => {
      const zone = readZone(value);
      if (!zone || ids.has(zone.id)) return [];
      ids.add(zone.id);
      return [zone];
    });
    for (const legacy of explicitLayout ? [] : legacyVenueZones(venue))
      if (!venue.zones.some((zone) => zone.id === legacy.id)) venue.zones.push(legacy);
    const exterior = venue.zones.find((zone) => zone.kind === "exterior");
    if (exterior) {
      venue.exteriorState = exterior.state;
      venue.presentation.image = exterior.image;
      venue.description = exterior.description;
    }
    venue.spaces = venue.zones.filter((zone) => !zone.upgradeId && ["public", "shared-residence"].includes(zone.kind));
    venue.privateSpaces = venue.zones
      .filter((zone) => zone.kind === "private-residence")
      .map((zone) => ({ ...zone, ownerId: zone.ownerId! }));
  }
  // Archive entries retain their state even after their owner Upgrade is removed.
  venue.archivedZones = Array.isArray(raw.archivedZones)
    ? raw.archivedZones
        .flatMap((value) => {
          const row = asRecord(value),
            zone = asRecord(row.zone),
            archivedAt = asIsoString(row.archivedAt);
          const parsed = readZone({ ...zone, upgradeId: undefined }, true);
          return parsed && archivedAt
            ? [{ zone: { ...parsed, upgradeId: asTrimmedString(zone.upgradeId) || undefined }, archivedAt }]
            : [];
        })
        .slice(-64)
    : [];
  venue.zones = (venue.zones ?? legacyVenueZones(venue)).flatMap((zone) => {
    const parsed = readZone(zone);
    return parsed ? [parsed] : [];
  });
  synchronizeVenueZones(venue, structuredClone(venue));
  venue.playerInvitations = venue.playerInvitations?.filter((invitation) => {
    invitation.zoneId ??=
      invitation.scope === "private"
        ? (venue.zones?.find((zone) => zone.kind === "private-residence" && zone.ownerId === invitation.ownerId)?.id ??
          "private:" + invitation.ownerId)
        : venue.zones?.find((zone) => zone.kind === "shared-residence")?.id;
    const zone = venue.zones?.find((zone) => zone.id === invitation.zoneId);
    return (
      !!zone &&
      !venue.usedInvitationIds?.includes(invitation.sourceLineId) &&
      canInviteToZone(venue, zone, invitation.residentId)
    );
  });
  return venue;
}
function coerceZoneDrafts(value: unknown): VillageZoneDraft[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.flatMap((entry) => {
    const row = asRecord(entry),
      id = asTrimmedString(row.id),
      name = boundText(row.name, MAX_VENUE_NAME_LENGTH),
      description = boundText(row.description, MAX_VENUE_DESCRIPTION_LENGTH);
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
        purpose: boundText(row.purpose, 240),
        controllerIds: coerceVenueIds(row.controllerIds),
        ownerId: asTrimmedString(row.ownerId) || undefined,
        preserveDescription: row.preserveDescription === true,
        kind: row.kind as VillageZoneDraft["kind"],
        venueClass: validVenueClasses([row.venueClass]) ? (row.venueClass as VillageVenueClass) : "other",
      },
    ];
  });
}
function coerceVenueStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => boundText(entry, MAX_VENUE_NOTE_LENGTH))
    .filter(Boolean)
    .slice(0, 24);
}
function coerceVenueIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id): id is string => typeof id === "string" && id.length > 0))].slice(0, 60);
}
function coerceVenueFeatures(value: unknown): VillageVenueFeature[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value
    .flatMap((entry) => {
      const row = asRecord(entry);
      const id = asTrimmedString(row.id);
      const text = boundText(row.text, MAX_VENUE_NOTE_LENGTH);
      if (!id || !text || seen.has(id)) return [];
      seen.add(id);
      return [
        {
          id,
          text,
          sourceCharacterId: asTrimmedString(row.sourceCharacterId),
          locked: row.locked === true,
          updatedAt: asIsoString(row.updatedAt) ?? "",
        },
      ];
    })
    .slice(0, 5);
}
function coerceVenueTraces(value: unknown): VillageVenueTrace[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value
    .flatMap((entry) => {
      const row = asRecord(entry);
      const id = asTrimmedString(row.id);
      const text = boundText(row.text, MAX_VENUE_NOTE_LENGTH);
      if (!id || !text || seen.has(id)) return [];
      seen.add(id);
      return [
        {
          id,
          kind: typeof row.kind === "string" && /^[a-z][a-z0-9-]{0,39}$/u.test(row.kind) ? row.kind : "other",
          text,
          recipientId: asTrimmedString(row.recipientId),
          createdAt: asIsoString(row.createdAt) ?? "",
          seenBy: coerceVenueIds(row.seenBy),
          ...(asIsoString(row.expiresAt) ? { expiresAt: asIsoString(row.expiresAt)! } : {}),
        } satisfies VillageVenueTrace,
      ];
    })
    .slice(0, 16);
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
    if (!venue || seenIds.has(venue.id) || venues.length >= MAX_PLACES) continue;
    if (venue.occupancy.playerHome) {
      if (sawPlayerHome) continue;
      sawPlayerHome = true;
    } else if (venue.occupancy.residentCharacterId !== null) {
      if (seenOccupants.has(venue.occupancy.residentCharacterId)) continue;
      seenOccupants.add(venue.occupancy.residentCharacterId);
    }
    seenIds.add(venue.id);
    venues.push(venue);
  }
  return venues;
}
function coerceVenueEvent(value: unknown): VillageVenueEvent | null {
  const raw = asRecord(value);
  const receipt = asRecord(raw.actionReceipt);
  const id = asTrimmedString(raw.id) || randomVillageSeed();
  const venueId = asTrimmedString(raw.venueId);
  const text = boundText(raw.text, MAX_NOTICE_LENGTH);
  if (venueId.length === 0 || text.length === 0) return null;
  return {
    id,
    venueId,
    venueName: boundText(raw.venueName, MAX_VENUE_NAME_LENGTH),
    zoneId: asTrimmedString(raw.zoneId) || undefined,
    text,
    at: asIsoString(raw.at) ?? "",
    ...(asTrimmedString(receipt.submissionId)
      ? {
          actionReceipt: {
            submissionId: asTrimmedString(receipt.submissionId),
            happened: receipt.happened === true,
            narration: boundText(receipt.narration, MAX_HAPPENING_LENGTH),
            ...Object.fromEntries(
              [
                "conditionBefore",
                "conditionAfter",
                "featureId",
                "featureText",
                "publicFactBefore",
                "publicFactAfter",
                "sceneNote",
              ].flatMap((key) =>
                typeof receipt[key] === "string" ? [[key, boundText(receipt[key], MAX_VENUE_NOTE_LENGTH)]] : [],
              ),
            ),
            ...(Array.isArray(receipt.witnessIds)
              ? { witnessIds: receipt.witnessIds.filter((id): id is string => typeof id === "string").slice(0, 100) }
              : {}),
            ...(asTrimmedString(receipt.transferTo) ? { transferTo: asTrimmedString(receipt.transferTo) } : {}),
            ...(asTrimmedString(asRecord(receipt.itemTransfer).itemName) &&
            asRecord(receipt.itemTransfer).itemName === receipt.removeItem &&
            asRecord(receipt.itemTransfer).recipientId === receipt.transferTo
              ? {
                  itemTransfer: {
                    itemName: asTrimmedString(asRecord(receipt.itemTransfer).itemName),
                    recipientId: asTrimmedString(asRecord(receipt.itemTransfer).recipientId),
                  },
                }
              : {}),
            ...(asTrimmedString(receipt.addItem) ? { addItem: boundText(receipt.addItem, MAX_VENUE_NOTE_LENGTH) } : {}),
            ...(asTrimmedString(receipt.removeItem)
              ? { removeItem: boundText(receipt.removeItem, MAX_VENUE_NOTE_LENGTH) }
              : {}),
            ...(typeof receipt.traceKind === "string" && /^[a-z][a-z0-9-]{0,39}$/u.test(receipt.traceKind)
              ? { traceKind: receipt.traceKind }
              : {}),
            ...(asTrimmedString(receipt.traceText)
              ? { traceText: boundText(receipt.traceText, MAX_VENUE_NOTE_LENGTH) }
              : {}),
            ...(asTrimmedString(receipt.recipientId) ? { recipientId: asTrimmedString(receipt.recipientId) } : {}),
            ...(asTrimmedString(receipt.resolveTraceId)
              ? { resolveTraceId: asTrimmedString(receipt.resolveTraceId) }
              : {}),
          },
        }
      : {}),
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
  if (venueId.length === 0 || characterId.length === 0) return null;
  const status = raw.status === "pending" || raw.status === "moving" ? raw.status : "current";
  return {
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
function coerceNotice(value: unknown): VillageNotice | null {
  if (typeof value === "string") {
    const text = boundText(value, MAX_NOTICE_LENGTH);
    return text.length > 0 ? { author: "", text } : null;
  }
  const raw = asRecord(value);
  const text = boundText(raw.text, MAX_NOTICE_LENGTH);
  if (text.length === 0) return null;
  return { author: boundText(raw.author, MAX_NOTICE_AUTHOR_LENGTH), text };
}
function coerceNotices(value: unknown): VillageNotice[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(coerceNotice)
    .filter((entry): entry is VillageNotice => entry !== null)
    .slice(0, MAX_NOTICEBOARD_NOTES);
}
function legacyOccurrence(
  foundedAt: string,
  dayIndex: number,
  clock: string,
  exact: unknown,
): { occurredAt: string; timePrecision: "exact" | "phase" } {
  const stored = asIsoString(exact);
  if (stored) return { occurredAt: stored, timePrecision: "exact" };
  const parsed = new Date(foundedAt);
  const founded = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const midpointHour = clock === "night" ? 2 : clock === "morning" ? 8 : clock === "afternoon" ? 14 : 20;
  const migrated = new Date(
    founded.getFullYear(),
    founded.getMonth(),
    founded.getDate() + dayIndex,
    midpointHour,
    0,
    0,
    0,
  );
  return { occurredAt: migrated.toISOString(), timePrecision: "phase" };
}
function coerceHappening(value: unknown, foundedAt: string): VillageHappening | null {
  const raw = asRecord(value);
  const text = boundText(raw.narration, MAX_HAPPENING_LENGTH) || boundText(raw.text, MAX_HAPPENING_LENGTH);
  if (text.length === 0) return null;
  const dayIndex =
    typeof raw.dayIndex === "number" && Number.isFinite(raw.dayIndex) && raw.dayIndex >= 0
      ? Math.floor(raw.dayIndex)
      : 0;
  const clock = asTrimmedString(raw.clock);
  const occurrence = legacyOccurrence(foundedAt, dayIndex, clock, raw.occurredAt ?? raw.at);
  return {
    id: asTrimmedString(raw.id) || randomVillageSeed(),
    kind: boundText(raw.kind, 40) || "observation",
    actorIds: asStringArray(raw.actorIds)
      .map((actor) => actor.trim())
      .filter(Boolean)
      .slice(0, 8),
    venueId: asTrimmedString(raw.venueId),
    dayIndex,
    clock: villageClockIndex(clock) >= 0 ? clock : "",
    ...occurrence,
    sourceOpportunityId: asTrimmedString(raw.sourceOpportunityId),
    narration: boundText(raw.narration, MAX_HAPPENING_LENGTH) || text,
    text,
  };
}
function coerceHappenings(value: unknown, foundedAt: string): VillageHappening[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => coerceHappening(entry, foundedAt))
    .filter((entry): entry is VillageHappening => entry !== null)
    .slice(0, MAX_HAPPENINGS);
}
function coerceChronicleActor(value: unknown): VillageChronicleActor | null {
  if (typeof value === "string") {
    const name = boundText(value, MAX_NOTICE_AUTHOR_LENGTH);
    return name.length > 0 ? { id: "", name } : null;
  }
  const raw = asRecord(value);
  const name = boundText(raw.name, MAX_NOTICE_AUTHOR_LENGTH);
  if (name.length === 0) return null;
  return { id: asTrimmedString(raw.id), name };
}
function coerceChronicleEntry(value: unknown, foundedAt: string): VillageChronicleEntry | null {
  const raw = asRecord(value);
  const text = boundText(raw.text, MAX_MEMORY_LENGTH);
  if (text.length === 0) return null;
  const scope = raw.scope === "private" ? "private" : "village";
  const actors = Array.isArray(raw.actors)
    ? raw.actors.map(coerceChronicleActor).filter((entry): entry is VillageChronicleActor => entry !== null)
    : [];
  // A private memory is FOR someone, so one with nobody to belong to is dropped
  // rather than stored: it would never reach a prompt (no villager is named as
  // its subject) and would only sit in the debug tab looking like a leak.
  if (scope === "private" && actors.length === 0) return null;
  const dayIndex =
    typeof raw.dayIndex === "number" && Number.isFinite(raw.dayIndex) && raw.dayIndex >= 0
      ? Math.floor(raw.dayIndex)
      : 0;
  const clock = asTrimmedString(raw.clock);
  const occurrence = legacyOccurrence(foundedAt, dayIndex, clock, raw.occurredAt ?? raw.at);
  return {
    id: asTrimmedString(raw.id) || randomVillageSeed(),
    dayIndex,
    clock: villageClockIndex(clock) >= 0 ? clock : "",
    ...occurrence,
    scope,
    actors,
    kind: raw.kind === "chat" || raw.kind === "favour" ? raw.kind : "tick",
    weight: typeof raw.weight === "number" && Number.isFinite(raw.weight) ? raw.weight : undefined,
    sourceLineIds: Array.isArray(raw.sourceLineIds)
      ? raw.sourceLineIds.filter((id): id is string => typeof id === "string")
      : undefined,
    memoryCategory:
      raw.memoryCategory === "commitment" ||
      raw.memoryCategory === "personal-fact" ||
      raw.memoryCategory === "preference" ||
      raw.memoryCategory === "relationship" ||
      raw.memoryCategory === "shared-experience"
        ? raw.memoryCategory
        : undefined,
    subjectCharacterIds: Array.isArray(raw.subjectCharacterIds)
      ? [...new Set(raw.subjectCharacterIds.filter((id): id is string => typeof id === "string" && !!id))]
      : undefined,
    knownByCharacterIds: Array.isArray(raw.knownByCharacterIds)
      ? [...new Set(raw.knownByCharacterIds.filter((id): id is string => typeof id === "string" && !!id))]
      : undefined,
    sourceVisitId: asTrimmedString(raw.sourceVisitId) || undefined,
    lastReinforcedAt: asIsoString(raw.lastReinforcedAt) ?? undefined,
    supersededAt: asIsoString(raw.supersededAt) ?? undefined,
    supersededBy: asTrimmedString(raw.supersededBy) || undefined,
    evidenceHistory: Array.isArray(raw.evidenceHistory)
      ? raw.evidenceHistory
          .map((value) => {
            const entry = asRecord(value);
            return {
              visitId: asTrimmedString(entry.visitId),
              submissionId: asTrimmedString(entry.submissionId),
              lineIds: asStringArray(entry.lineIds),
            };
          })
          .filter((entry) => entry.visitId && entry.submissionId && entry.lineIds.length)
      : undefined,
    sourceRecollectionIds: Array.isArray(raw.sourceRecollectionIds)
      ? [...new Set(raw.sourceRecollectionIds.filter((id): id is string => typeof id === "string" && !!id))]
      : undefined,
    text,
  };
}
function coerceChronicle(value: unknown, foundedAt: string): VillageChronicleEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => coerceChronicleEntry(entry, foundedAt))
    .filter((entry): entry is VillageChronicleEntry => entry !== null);
}
function coerceRecollections(value: unknown): VillageRecollection[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((value): VillageRecollection | null => {
      const raw = asRecord(value);
      const id = asTrimmedString(raw.id);
      const visitId = asTrimmedString(raw.visitId);
      const text = boundText(raw.text, MAX_MEMORY_LENGTH);
      const occurredAt = asIsoString(raw.occurredAt) ?? "";
      const expiresAt = asIsoString(raw.expiresAt) ?? "";
      const subjectCharacterIds = [...new Set(asStringArray(raw.subjectCharacterIds).filter(Boolean))];
      const knownByCharacterIds = [...new Set(asStringArray(raw.knownByCharacterIds).filter(Boolean))];
      const sourceLineIds = [...new Set(asStringArray(raw.sourceLineIds).filter(Boolean))];
      const sourceSubmissionIds = [...new Set(asStringArray(raw.sourceSubmissionIds).filter(Boolean))];
      const evidence = Array.isArray(raw.evidence)
        ? raw.evidence
            .map((value) => {
              const row = asRecord(value);
              const sourceVisitId = asTrimmedString(row.visitId);
              const submissionId = asTrimmedString(row.submissionId);
              const lineIds = [...new Set(asStringArray(row.lineIds).filter(Boolean))];
              return sourceVisitId && lineIds.length ? { visitId: sourceVisitId, submissionId, lineIds } : null;
            })
            .filter((entry): entry is { visitId: string; submissionId: string; lineIds: string[] } => entry !== null)
        : [];
      if (!id || !visitId || !text || !occurredAt || !expiresAt || !knownByCharacterIds.length || !sourceLineIds.length)
        return null;
      return {
        id,
        visitId,
        occurredAt,
        expiresAt,
        text,
        subjectCharacterIds,
        knownByCharacterIds,
        sourceLineIds,
        sourceSubmissionIds,
        evidence: evidence.length
          ? evidence
          : [{ visitId, submissionId: sourceSubmissionIds[0] ?? "", lineIds: sourceLineIds }],
        reinforcementCount:
          typeof raw.reinforcementCount === "number" && Number.isFinite(raw.reinforcementCount)
            ? Math.max(0, Math.floor(raw.reinforcementCount))
            : 0,
        lastReinforcedAt: asIsoString(raw.lastReinforcedAt) ?? occurredAt,
      };
    })
    .filter((entry): entry is VillageRecollection => entry !== null);
}
function coerceTownMapImage(value: unknown): string {
  const image = asString(value);
  return image.length <= MAX_TOWN_MAP_IMAGE_LENGTH && isTownMapImage(image) ? image : "";
}
function coerceTownMapCanvas(raw: Record<string, unknown>, legacyCanvas: boolean): { width: number; height: number } {
  if (legacyCanvas) return { width: LEGACY_TOWN_MAP_WIDTH, height: LEGACY_TOWN_MAP_HEIGHT };
  const width = raw.townMapCanvasWidth;
  const height = raw.townMapCanvasHeight;
  if (
    typeof width === "number" &&
    typeof height === "number" &&
    Number.isInteger(width) &&
    Number.isInteger(height) &&
    width > 0 &&
    height > 0 &&
    width <= 8192 &&
    height <= 8192 &&
    width * height <= 16_000_000
  ) {
    return { width, height };
  }
  return { width: TOWN_MAP_EXPECTED_WIDTH, height: TOWN_MAP_EXPECTED_HEIGHT };
}
function coerceRefreshClocks(value: unknown): string[] {
  if (!Array.isArray(value)) return [...VILLAGE_CLOCKS];
  const wanted = new Set<string>();
  for (const entry of value) {
    if (typeof entry === "string" && villageClockIndex(entry) >= 0) wanted.add(entry);
  }
  // Filtered through the canonical list rather than mapped from the input, so
  // the result is deduplicated and always in the order the day runs, whatever
  // order the stored list happened to be in.
  return VILLAGE_CLOCKS.filter((clock) => wanted.has(clock));
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
const STORY_PACES: readonly VillageStoryPace[] = ["off", "quiet", "balanced", "lively"];
const MAX_SIMULATION_RECORDS = 256;
function coerceStoryPace(raw: Record<string, unknown>): VillageStoryPace {
  if (typeof raw.storyPace === "string" && STORY_PACES.includes(raw.storyPace as VillageStoryPace)) {
    return raw.storyPace as VillageStoryPace;
  }
  const clocks = coerceRefreshClocks(raw.refreshClocks);
  if (raw.backgroundRefreshesEnabled === false || clocks.length === 0) return "off";
  return clocks.length === 1 ? "quiet" : "balanced";
}
function legacySimulatedThrough(foundedAt: string, key: unknown): string {
  const [dayText, clock] = asTrimmedString(key).split(":");
  const dayIndex = Number(dayText);
  const window = VILLAGE_AGENDA_WINDOWS.find((entry) => entry.legacyClock === clock);
  const founded = new Date(foundedAt);
  if (!Number.isFinite(dayIndex) || !window || Number.isNaN(founded.getTime())) return "";
  const at = new Date(founded.getFullYear(), founded.getMonth(), founded.getDate() + Math.max(0, dayIndex), 0, 0, 0, 0);
  at.setMinutes(window.endMinute);
  return at.toISOString();
}
function coerceOpportunities(value: unknown): VillageOpportunity[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((entry) => {
      const raw = asRecord(entry);
      const id = asTrimmedString(raw.id);
      const startsAt = asIsoString(raw.startsAt);
      const endsAt = asIsoString(raw.endsAt);
      const kinds = ["encounter", "wish", "weather", "routine", "project"] as const;
      if (!id || !startsAt || !endsAt || !kinds.includes(raw.kind as (typeof kinds)[number])) return [];
      return [
        {
          id,
          kind: raw.kind as VillageOpportunity["kind"],
          startsAt,
          endsAt,
          actorIds: asStringArray(raw.actorIds)
            .map((id) => id.trim())
            .filter(Boolean)
            .slice(0, 8),
          venueId: asTrimmedString(raw.venueId),
          zoneId: asTrimmedString(raw.zoneId) || undefined,
          facts: asStringArray(raw.facts)
            .map((fact) => boundText(fact, MAX_HAPPENING_LENGTH))
            .filter(Boolean)
            .slice(0, 8),
        },
      ];
    })
    .slice(-MAX_SIMULATION_RECORDS);
}
function coerceScheduledEvents(value: unknown): VillageScheduledEvent[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((entry) => {
      const raw = asRecord(entry);
      const id = asTrimmedString(raw.id);
      const opportunityId = asTrimmedString(raw.opportunityId);
      const occursAt = asIsoString(raw.occursAt);
      if (!id || !opportunityId || !occursAt) return [];
      return [
        {
          id,
          opportunityId,
          occursAt,
          kind: boundText(raw.kind, 40),
          actorIds: asStringArray(raw.actorIds)
            .map((actor) => actor.trim())
            .filter(Boolean)
            .slice(0, 8),
          venueId: asTrimmedString(raw.venueId),
          narration: boundText(raw.narration, MAX_HAPPENING_LENGTH),
        },
      ];
    })
    .slice(-MAX_SIMULATION_RECORDS);
}
function coerceRelationships(value: unknown): VillageRelationship[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((entry) => {
      const raw = asRecord(entry);
      const firstCharacterId = asTrimmedString(raw.firstCharacterId);
      const secondCharacterId = asTrimmedString(raw.secondCharacterId);
      if (!firstCharacterId || !secondCharacterId || firstCharacterId === secondCharacterId) return [];
      return [
        {
          firstCharacterId,
          secondCharacterId,
          closeness:
            typeof raw.closeness === "number" && Number.isFinite(raw.closeness)
              ? Math.max(-5, Math.min(5, Math.trunc(raw.closeness)))
              : 0,
          updatedAt: asIsoString(raw.updatedAt) ?? "",
        },
      ];
    })
    .slice(0, MAX_SIMULATION_RECORDS);
}
function coerceProjects(value: unknown): VillageProject[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap<VillageProject>((entry) => {
    const raw = asRecord(entry);
    const id = asTrimmedString(raw.id);
    const title = boundText(raw.title, MAX_NOTICE_LENGTH);
    if (!id || !title) return [];
    if ((raw.kind === "new-venue" || raw.kind === "renovation") && asRecord(raw.lifecycle).version === 2) {
      const flow = asRecord(raw.lifecycle);
      const draft = asRecord(raw.venueDraft);
      const position = asRecord(draft.position);
      const phases = [
        "concept",
        "approval",
        "builder",
        "requirements",
        "materials",
        "construction",
        "finishing",
        "complete",
      ] as const;
      const phase = phases.includes(flow.phase as (typeof phases)[number])
        ? (flow.phase as (typeof phases)[number])
        : "concept";
      const order = asRecord(flow.workOrder);
      const change = asRecord(flow.change);
      const improvement = asRecord(change.improvement);
      return [
        {
          id,
          title,
          kind: raw.kind,
          venueId: asTrimmedString(raw.venueId),
          participantIds: asStringArray(raw.participantIds),
          progress: Number.isFinite(Number(raw.progress)) ? Math.max(0, Math.min(100, Number(raw.progress))) : 0,
          status:
            raw.status === "blocked"
              ? "blocked"
              : phase === "complete"
                ? "complete"
                : phase === "finishing"
                  ? "finishing"
                  : phase === "construction"
                    ? "building"
                    : phase === "concept"
                      ? "draft"
                      : "active",
          updatedAt: asIsoString(raw.updatedAt) ?? "",
          ...(raw.kind === "new-venue"
            ? {
                venueDraft: {
                  name: boundText(draft.name, MAX_VENUE_NAME_LENGTH),
                  classes: validVenueClasses(draft.classes) ? draft.classes : ["other" as const],
                  description: boundText(draft.description, MAX_VENUE_DESCRIPTION_LENGTH),
                  category: "",
                  position: {
                    x: typeof position.x === "number" && position.x >= 0 && position.x <= 1 ? position.x : null,
                    y: typeof position.y === "number" && position.y >= 0 && position.y <= 1 ? position.y : null,
                  },
                  occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
                  capabilities: [],
                  state: { condition: "", upgrades: [], furniture: [], publicFacts: [], updatedAt: "" },
                },
              }
            : {}),
          lifecycle: {
            version: 2 as const,
            phase,
            targetVenueId: asTrimmedString(flow.targetVenueId),
            change:
              flow.change && typeof flow.change === "object"
                ? {
                    ...(validVenueClasses(change.classes) ? { classes: change.classes } : {}),
                    ...(Number.isInteger(change.capacity) ? { capacity: Number(change.capacity) } : {}),
                    ...(Array.isArray(change.baseZones) ? { baseZones: coerceZoneDrafts(change.baseZones) } : {}),
                    ...(isHomeBuildingKind(change.homeKind) ? { homeKind: change.homeKind } : {}),
                    ...(change.slot === 0 || change.slot === 1 ? { slot: change.slot } : {}),
                    ...(change.improvement === null
                      ? { improvement: null }
                      : improvement.title
                        ? {
                            improvement: {
                              id: asTrimmedString(improvement.id),
                              title: boundText(improvement.title, MAX_VENUE_NOTE_LENGTH),
                              description: boundText(improvement.description, MAX_VENUE_DESCRIPTION_LENGTH),
                              spaceId: asTrimmedString(improvement.spaceId) || null,
                              classContribution: validVenueClasses([improvement.classContribution])
                                ? (improvement.classContribution as VillageVenueClass)
                                : undefined,
                              zones: coerceZoneDrafts(improvement.zones),
                              extraBeds: Number(improvement.extraBeds ?? 0),
                              approvedAt: asIsoString(improvement.approvedAt) ?? "",
                            },
                          }
                        : {}),
                    detail: boundText(change.detail, MAX_VENUE_DESCRIPTION_LENGTH),
                  }
                : null,
            affectedIds: asStringArray(flow.affectedIds),
            approvals: Array.isArray(flow.approvals)
              ? flow.approvals.flatMap((item) => {
                  const row = asRecord(item),
                    residentId = asTrimmedString(row.residentId);
                  return residentId
                    ? [
                        {
                          residentId,
                          source: row.source === "mailbox" ? ("mailbox" as const) : ("conversation" as const),
                          evidenceId: asTrimmedString(row.evidenceId),
                          at: asIsoString(row.at) ?? "",
                        },
                      ]
                    : [];
                })
              : [],
            candidates: Array.isArray(flow.candidates)
              ? flow.candidates.flatMap((item) => {
                  const row = asRecord(item),
                    residentId = asTrimmedString(row.residentId);
                  return residentId
                    ? [{ residentId, evidenceId: asTrimmedString(row.evidenceId), at: asIsoString(row.at) ?? "" }]
                    : [];
                })
              : [],
            builderId: asTrimmedString(flow.builderId),
            requirements: Array.isArray(flow.requirements)
              ? flow.requirements.flatMap((item) => {
                  const row = asRecord(item),
                    requirementId = asTrimmedString(row.id);
                  const category = ["structure", "equipment", "finish"].includes(String(row.category))
                    ? row.category
                    : "structure";
                  return requirementId
                    ? [
                        {
                          id: requirementId,
                          category: category as "structure" | "equipment" | "finish",
                          title: boundText(row.title, MAX_VENUE_NOTE_LENGTH),
                          needed: row.needed !== false,
                          carriedAt: asIsoString(row.carriedAt) ?? "",
                          deliveredAt: asIsoString(row.deliveredAt) ?? "",
                        },
                      ]
                    : [];
                })
              : [],
            requirementsEvidenceId: asTrimmedString(flow.requirementsEvidenceId),
            requirementsAcceptedAt: asIsoString(flow.requirementsAcceptedAt) ?? "",
            recordedItems: Array.isArray(flow.recordedItems)
              ? flow.recordedItems.flatMap((entry) => {
                  const item = asRecord(entry);
                  const venueId = asTrimmedString(item.venueId);
                  const itemName = boundText(item.itemName, MAX_VENUE_NOTE_LENGTH);
                  return venueId && itemName
                    ? [{ venueId, zoneId: asTrimmedString(item.zoneId) || undefined, itemName }]
                    : [];
                })
              : [],
            sources: Array.isArray(flow.sources)
              ? flow.sources.flatMap((entry) => {
                  const source = asRecord(entry);
                  const requirementId = asTrimmedString(source.requirementId);
                  const venueId = asTrimmedString(source.venueId);
                  const itemName = boundText(source.itemName, MAX_VENUE_NOTE_LENGTH);
                  const evidenceId = asTrimmedString(source.evidenceId);
                  if (!requirementId || !venueId || !itemName || !evidenceId) return [];
                  return [
                    {
                      requirementId,
                      kind:
                        source.kind === "existing-item"
                          ? ("existing-item" as const)
                          : source.kind === "held-supply"
                            ? ("held-supply" as const)
                            : ("resident-offer" as const),
                      venueId,
                      zoneId: asTrimmedString(source.zoneId) || undefined,
                      itemName,
                      supplierId: asTrimmedString(source.supplierId),
                      evidenceId,
                      at: asIsoString(source.at) ?? "",
                      acquiredAt: asIsoString(source.acquiredAt) ?? "",
                    },
                  ];
                })
              : [],
            heldSupplies: Array.isArray(flow.heldSupplies)
              ? flow.heldSupplies.flatMap((entry) => {
                  const held = asRecord(entry);
                  const id = asTrimmedString(held.id);
                  const itemName = boundText(held.itemName, MAX_VENUE_NOTE_LENGTH);
                  const acquiredAt = asIsoString(held.acquiredAt) ?? "";
                  return id && itemName && acquiredAt
                    ? [
                        {
                          id,
                          itemName,
                          acquiredAt,
                          deliveredAt: asIsoString(held.deliveredAt) ?? "",
                          assignedRequirementId: asTrimmedString(held.assignedRequirementId),
                        },
                      ]
                    : [];
                })
              : [],
            spokenProofs: Array.isArray(flow.spokenProofs)
              ? flow.spokenProofs.flatMap((entry) => {
                  const proof = asRecord(entry);
                  const lineId = asTrimmedString(proof.lineId);
                  const sessionId = asTrimmedString(proof.sessionId);
                  const submissionId = asTrimmedString(proof.submissionId);
                  if (!lineId || !sessionId || !submissionId) return [];
                  return [
                    {
                      lineId,
                      sessionId,
                      submissionId,
                      speakerId: asTrimmedString(proof.speakerId),
                      venueId: asTrimmedString(proof.venueId),
                      zoneId: asTrimmedString(proof.zoneId) || undefined,
                      quote: boundText(proof.quote, 300),
                      at: asIsoString(proof.at) ?? "",
                      ...readProgressInterpretation(proof),
                    },
                  ];
                })
              : [],
            evidenceIds: asStringArray(flow.evidenceIds),
            workOrder:
              asIsoString(order.startsAt) && asIsoString(order.completesAt)
                ? {
                    startsAt: asIsoString(order.startsAt)!,
                    completesAt: asIsoString(order.completesAt)!,
                    pausedAt: asIsoString(order.pausedAt) ?? "",
                    remainingMs: Number.isFinite(Number(order.remainingMs))
                      ? Math.max(0, Number(order.remainingMs))
                      : 0,
                  }
                : null,
            blockedReason: boundText(flow.blockedReason, MAX_VENUE_NOTE_LENGTH),
            completedAt: asIsoString(flow.completedAt) ?? "",
          },
        },
      ];
    }
    return [];
  });
}
function coercePendingDecisions(value: unknown): VillagePendingDecision[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((entry) => {
      const raw = asRecord(entry);
      const id = asTrimmedString(raw.id);
      const title = boundText(raw.title, MAX_NOTICE_LENGTH);
      const proposedAt = asIsoString(raw.proposedAt);
      if (!id || !title || !proposedAt) return [];
      const kinds = ["residence", "project", "venue", "venue-upgrade", "departure", "other"] as const;
      const draft = asRecord(raw.venueDraft);
      const draftState = asRecord(draft.state);
      const requestName = boundText(draft.name, MAX_VENUE_NAME_LENGTH);
      const requestClasses = validVenueClasses(draft.classes) ? draft.classes : [];
      return [
        {
          id,
          kind: kinds.includes(raw.kind as (typeof kinds)[number])
            ? (raw.kind as VillagePendingDecision["kind"])
            : "other",
          title,
          detail: boundText(raw.detail, MAX_CHRONICLE_LENGTH),
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
                  description: boundText(draft.description, MAX_VENUE_DESCRIPTION_LENGTH),
                  category: "",
                  position: { x: null, y: null },
                  occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
                  capabilities: [],
                  state: {
                    condition: boundText(draftState.condition, MAX_VENUE_NOTE_LENGTH),
                    upgrades: coerceVenueStringList(draftState.upgrades),
                    furniture: coerceVenueStringList(draftState.furniture),
                    publicFacts: coerceVenueStringList(draftState.publicFacts),
                    updatedAt: asIsoString(draftState.updatedAt) ?? "",
                  },
                },
              }
            : {}),
          requesterCharacterId: asTrimmedString(raw.requesterCharacterId),
          venueId: asTrimmedString(raw.venueId),
          proposedHomeKind: isHomeBuildingKind(raw.proposedHomeKind) ? raw.proposedHomeKind : undefined,
          requesterName: boundText(raw.requesterName, MAX_NOTICE_AUTHOR_LENGTH),
          requestQuote: boundText(raw.requestQuote, MAX_VENUE_NOTE_LENGTH),
          source: raw.source === "chat" ? ("chat" as const) : ("background" as const),
          sourceKey: asTrimmedString(raw.sourceKey),
        } satisfies VillagePendingDecision,
      ];
    })
    .slice(-MAX_SIMULATION_RECORDS);
}
function coerceVenueMail(value: unknown): VillageVenueMail[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((entry) => {
      const row = asRecord(entry);
      if (!asTrimmedString(row.id) || !asTrimmedString(row.venueId)) return [];
      if (
        row.kind !== "change" &&
        row.kind !== "player-move" &&
        row.kind !== "counteroffer" &&
        row.kind !== "villager-change" &&
        row.kind !== "villager-move" &&
        row.kind !== "project-approval"
      )
        return [];
      const proposedClasses = validVenueClasses(row.proposedClasses) ? row.proposedClasses : undefined;
      const proposedCapacity =
        Number.isInteger(row.proposedCapacity) && Number(row.proposedCapacity) >= 1 && Number(row.proposedCapacity) <= 4
          ? Number(row.proposedCapacity)
          : undefined;
      const proposedImprovement = asRecord(row.improvement);
      const improvement =
        row.improvement === null
          ? null
          : asTrimmedString(proposedImprovement.id)
            ? {
                id: asTrimmedString(proposedImprovement.id),
                title: boundText(proposedImprovement.title, MAX_VENUE_NOTE_LENGTH),
                description: boundText(proposedImprovement.description, MAX_VENUE_DESCRIPTION_LENGTH),
                spaceId: asTrimmedString(proposedImprovement.spaceId) || null,
                extraBeds: Number.isInteger(proposedImprovement.extraBeds)
                  ? Math.max(0, Math.min(3, Number(proposedImprovement.extraBeds)))
                  : 0,
                approvedAt: asIsoString(proposedImprovement.approvedAt) ?? "",
              }
            : undefined;
      return [
        {
          id: asTrimmedString(row.id),
          venueId: asTrimmedString(row.venueId),
          title: boundText(row.title, MAX_VENUE_NOTE_LENGTH),
          detail: boundText(row.detail, MAX_VENUE_DESCRIPTION_LENGTH),
          kind: row.kind,
          projectId: asTrimmedString(row.projectId) || undefined,
          status:
            row.status === "approved" || row.status === "declined" || row.status === "pending-player"
              ? row.status
              : "awaiting-villagers",
          createdAt: asIsoString(row.createdAt) ?? "",
          dueAt: asIsoString(row.dueAt) ?? "",
          resolvedAt: asIsoString(row.resolvedAt) ?? "",
          requesterCharacterId: asTrimmedString(row.requesterCharacterId),
          movingCharacterId: asTrimmedString(row.movingCharacterId) || undefined,
          proposedPrivateZoneId: asTrimmedString(row.proposedPrivateZoneId) || undefined,
          counterofferRequestId: asTrimmedString(row.counterofferRequestId) || undefined,
          counterofferDraft: (() => {
            const draft = asRecord(row.counterofferDraft);
            return asTrimmedString(draft.name) && asTrimmedString(draft.description)
              ? {
                  name: boundText(draft.name, MAX_VENUE_NAME_LENGTH),
                  classes: validVenueClasses(draft.classes) ? draft.classes : ["gathering"],
                  description: boundText(draft.description, MAX_VENUE_DESCRIPTION_LENGTH),
                }
              : undefined;
          })(),
          ...(proposedClasses ? { proposedClasses } : {}),
          ...(proposedCapacity ? { proposedCapacity } : {}),
          improvementSlot: Number.isInteger(row.improvementSlot) ? Number(row.improvementSlot) : undefined,
          improvement,
          affectedIds: coerceVenueIds(row.affectedIds),
          decisions: Array.isArray(row.decisions)
            ? row.decisions
                .map((decision) => ({
                  characterId: asTrimmedString(asRecord(decision).characterId),
                  accepted: asRecord(decision).accepted === true,
                  reply: boundText(asRecord(decision).reply, MAX_VENUE_NOTE_LENGTH),
                }))
                .filter((decision) => decision.characterId)
            : [],
          error: boundText(row.error, MAX_VENUE_NOTE_LENGTH),
        } satisfies VillageVenueMail,
      ];
    })
    .slice(-256);
}
export function coerceVillageState(value: unknown): VillageState {
  const raw = asRecord(value);
  if (raw.progressEngineVersion === 0)
    throw new Error("This Village uses a retired Project engine format. No data was migrated or reset.");
  const fallback = defaultVillageState();
  const venues = coerceVenues(raw.venues);
  const villagers = Array.isArray(raw.villagers)
    ? raw.villagers
        .map((entry) => coerceVillager(entry, venues))
        .filter((entry): entry is VillageVillager => entry !== null)
    : [];
  const seen = new Set<string>();
  const townMapImage = coerceTownMapImage(raw.townMapImage);
  const legacyCanvas =
    raw.townMapCanvasWidth === undefined &&
    (townMapImage.length > 0 || (typeof raw.setupAt === "string" && raw.setupAt.length > 0));
  const townMapCanvas = coerceTownMapCanvas(raw, legacyCanvas);
  const foundedAt = asIsoString(raw.foundedAt) ?? "";
  const state: VillageState = {
    version: 2,
    backgroundReceipts: Object.fromEntries(
      Object.entries(asRecord(raw.backgroundReceipts)).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    ),
    exchangeReceipts: structuredClone(asRecord(raw.exchangeReceipts)) as VillageState["exchangeReceipts"],
    noticeSequence: Math.max(0, Math.floor(Number(raw.noticeSequence) || 0)),
    dismissedNoticeIds: [...new Set(asStringArray(raw.dismissedNoticeIds))],
    wishSystemVersion: raw.wishSystemVersion === WISH_SYSTEM_VERSION ? WISH_SYSTEM_VERSION : 0,
    wishResetPending: [...new Set(asStringArray(raw.wishResetPending))].filter((id) =>
      villagers.some((resident) => resident.characterId === id),
    ),
    wishKnowledge: coerceWishKnowledge(raw.wishKnowledge),
    projectWishOutbox: Array.isArray(raw.projectWishOutbox)
      ? (raw.projectWishOutbox as VillageState["projectWishOutbox"])
      : [],
    wishRefillIntents: Object.fromEntries(
      Object.entries(asRecord(raw.wishRefillIntents)).flatMap(([id, value]) => {
        const row = asRecord(value);
        return typeof row.id === "string" && typeof row.settled === "string"
          ? [[id, { id: row.id, settled: row.settled }]]
          : [];
      }),
    ),
    progressEngineVersion: 1,
    name: asTrimmedString(raw.name) || fallback.name,
    narrationStyle: coerceVillageNarrationStyle(raw.narrationStyle),
    characterSpeechColors: raw.characterSpeechColors !== false,
    sendOnEnter: raw.sendOnEnter === true,
    spriteCardFlipEnabled: raw.spriteCardFlipEnabled !== false,
    setting: boundText(raw.setting, MAX_SETTING_LENGTH),
    foundingReason: boundText(raw.foundingReason, 40),
    foundingDetails: boundText(raw.foundingDetails, 2_000),
    foundingGuidance: boundText(raw.foundingGuidance, 500),
    playerRole: coercePlayerRole(raw.playerRole),
    scenarioImprint: coerceScenarioImprint(raw.scenarioImprint),
    worldFacts: coerceWorldFacts(raw.worldFacts),
    venueCapacityPolicy:
      raw.venueCapacityPolicy === "sixteen-total-v1" || raw.venueCapacityPolicy === "legacy-v1"
        ? raw.venueCapacityPolicy
        : asTrimmedString(raw.setupAt) || villagers.length || venues.some(isHousePlace)
          ? "legacy-v1"
          : "sixteen-total-v1",
    selectedLorebookIds: coerceSelectedLorebookIds(raw.selectedLorebookIds),
    sceneryArtStyle: boundText(raw.sceneryArtStyle, 600),
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
    setupAt: asIsoString(raw.setupAt) ?? "",
    foundingPreparation: (() => {
      const preparation = asRecord(raw.foundingPreparation);
      if (preparation.status !== "pending" && preparation.status !== "failed" && preparation.status !== "ready")
        return null;
      return {
        status: preparation.status,
        completedIds: asStringArray(preparation.completedIds).slice(0, 12),
        venueDetailsSeeded: preparation.venueDetailsSeeded === true,
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
    noticeboard: coerceNotices(raw.noticeboard),
    happenings: coerceHappenings(raw.happenings, foundedAt),
    chronicle: coerceChronicle(raw.chronicle, foundedAt),
    recollections: coerceRecollections(raw.recollections),
    correctedWishMemoryIds: [...new Set(asStringArray(raw.correctedWishMemoryIds).filter(Boolean))],
    simulatedThrough: asIsoString(raw.simulatedThrough) ?? legacySimulatedThrough(foundedAt, raw.lastHappeningKey),
    lastKnownTimeZone: boundText(raw.lastKnownTimeZone, 100),
    storyPace: coerceStoryPace(raw),
    lastCreativeDate: boundText(raw.lastCreativeDate, 10),
    processedOpportunityIds: asStringArray(raw.processedOpportunityIds)
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(-MAX_SIMULATION_RECORDS),
    opportunities: coerceOpportunities(raw.opportunities),
    scheduledEvents: coerceScheduledEvents(raw.scheduledEvents),
    relationships: coerceRelationships(raw.relationships),
    socialOutbox: Array.isArray(raw.socialOutbox)
      ? (structuredClone(raw.socialOutbox) as VillageState["socialOutbox"])
      : [],
    projects: coerceProjects(raw.projects),
    progressTasks: coerceProgressTasks(raw.progressTasks),
    narrativeItems: Array.isArray(raw.narrativeItems)
      ? raw.narrativeItems.flatMap((value) => {
          const item = asRecord(value);
          const venueId = asTrimmedString(item.venueId);
          const itemName = boundText(item.itemName, MAX_VENUE_NOTE_LENGTH);
          return venueId && itemName ? [{ venueId, zoneId: asTrimmedString(item.zoneId) || undefined, itemName }] : [];
        })
      : [],
    projectSourceClaims: Array.isArray(raw.projectSourceClaims)
      ? raw.projectSourceClaims.flatMap((value) => {
          const item = asRecord(value);
          const key = asTrimmedString(item.key);
          const projectId = asTrimmedString(item.projectId);
          const sourceId = asTrimmedString(item.sourceId);
          const submissionId = asTrimmedString(item.submissionId);
          return key && projectId && sourceId && submissionId ? [{ key, projectId, sourceId, submissionId }] : [];
        })
      : [],
    villageCapabilities: [
      ...new Set(
        asStringArray(raw.villageCapabilities)
          .map((item) => boundText(item, MAX_VENUE_NOTE_LENGTH))
          .filter(Boolean),
      ),
    ],
    pendingDecisions: coercePendingDecisions(raw.pendingDecisions),
    venueMail: coerceVenueMail(raw.venueMail),
    villagers: villagers
      .filter((entry) => {
        if (seen.has(entry.characterId)) return false;
        seen.add(entry.characterId);
        return true;
      })
      .map((entry) =>
        entry.agenda
          ? entry
          : {
              ...entry,
              agenda: { ...unwrittenVillageAgenda(venues, entry.cardSnapshot.name), personalizationPending: false },
            },
      ),
    // A stored box keeps its internal formatting, so it is bounded but not
    // trimmed to nothing; an empty box means "this village wrote nothing", which
    // is what the renderer answers with the shipped text.
    //
    // The old `promptVoice` and `promptPreset` keys remain unread. Live venue
    // writing now reads the per-village narrationStyle above.
    promptKnowledge: asString(raw.promptKnowledge).slice(0, VILLAGES_PROMPT_BOX_MAX_LENGTH),
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
    townMapImage,
    townMapCanvasWidth: townMapCanvas.width,
    townMapCanvasHeight: townMapCanvas.height,
    // Dropped along with the image it describes, rather than keeping a stamp
    // that claims a map which is not there.
    townMapImageSetAt: townMapImage.length > 0 ? (asIsoString(raw.townMapImageSetAt) ?? "") : "",
    // Likewise dropped with the picture it frames. A framing is a framing OF
    // something, so a village with no picture of its own must draw the map the
    // package ships the way it was drawn before anyone picked a picture.
    townMapView: coerceTownMapView(townMapImage.length > 0 ? raw.townMapView : {}),
  };
  // Legacy supply and physical-effect records refer to the old primary Class interior.
  for (const item of [
    ...state.narrativeItems,
    ...state.venueEvents,
    ...state.projects.flatMap((project) => [
      ...(project.lifecycle?.recordedItems ?? []),
      ...(project.lifecycle?.sources ?? []),
    ]),
  ]) {
    const venue = state.venues.find((entry) => entry.id === item.venueId);
    if (venue) item.zoneId ??= legacyZoneId(venue, "public");
  }
  // Zone migration retains unfinished Projects, work sites, builder shifts and acquired supply receipts.
  for (const villager of state.villagers) {
    for (const move of villager.remap?.moves ?? []) {
      const venue = state.venues.find((entry) => entry.id === move.venueId);
      if (venue && !venue.access)
        move.zoneId = chooseAgendaZone(venue, villager.characterId, move.here, move.zoneId, state).id;
    }
    const agenda = villager.agenda;
    if (!agenda) continue;
    const blocks = [
      ...agenda.day,
      ...Object.values(agenda.week ?? {}).flat(),
      ...Object.values(agenda.scheduleWeek ?? {}).flat(),
      ...(agenda.activeDay?.blocks ?? []),
    ];
    for (const block of blocks) {
      const venue =
        state.venues.find((entry) => entry.id === block.venueId) ??
        state.venues.find((entry) => venueResidentIds(entry).includes(villager.characterId));
      if (venue && !venue.access)
        block.zoneId = chooseAgendaZone(venue, villager.characterId, block.activity, block.zoneId, state).id;
    }
  }
  resetLegacyWishRecords(state);
  return state;
}
