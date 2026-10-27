import { readWishGoalJournal } from "../rules/wish-journal.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { readMemoryCollection, memoryObject, memoryRequire } from "../rules/memory-integrity.js";
import { readMemorySceneStates } from "../rules/village-memories.js";
import { localDateKey } from "../rules/resident-planning.js";
import { readDevelopment } from "../rules/development-codec.js";
import { MAX_PHYSICAL_DESIGN_LENGTH } from "../../../shared/helpers/project-design.js";
import { readProjectPlan } from "../rules/project-completion.js";
import { MAX_IDENTITY_DESCRIPTION_LENGTH } from "../../../shared/contracts/resident-description.js";
import { readOpening } from "../rules/opening-project.js";
import { coerceFoundingTasks } from "../rules/founding-tasks.js";
import { materializeConnections } from "../../../shared/helpers/zone-contact.js";
import { validTimeZone } from "../../../shared/helpers/zoned-date.js";
import { decodeVillageClock } from "../rules/clock-recovery.js";
import { readSceneWishProtections } from "../rules/scene-wish-protection.js";
import { savedVenueClassRecord } from "./venue-class-compat.js";
import {
  readResidentAdmission,
  readWorldName,
  EMPTY_RESIDENT_ADMISSION,
} from "../../../shared/helpers/resident-admission.js";
import { isPrivateInterior, observePrivateInterior, privateInteriorKey } from "../rules/private-interior.js";
import { zonePictureBaseline, zonePicturePhysicalRecord } from "../rules/zone-picture.js";
import type {
  VillageAgenda,
  VillageCompletedWish,
  VillageNotice,
  VillagePendingDecision,
  VillageProject,
  VillageRemap,
  VillageRemapFailure,
  VillageRemapMove,
  VillageResidence,
  VillageState,
  VillageBackgroundPace,
  VillageTownMapView,
  VillageVenue,
  VillageVenueClass,
  VillageVenueEvent,
  VillageVenueFeature,
  VillageVenueImage,
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
import { coerceVillageNarrationStyle, defaultVillageNarrationStyle } from "../rules/narration-style.js";
import { MAX_REMAP_ATTEMPTS, MAX_REMAP_FAILURE_LENGTH, remapBlockKey } from "../rules/native-remap.js";
import { adoptedProfile, coerceRoutineProfile, influenceSettings } from "../rules/owned-routine.js";
import { coercePlayerBackground } from "../rules/player-background.js";
import { coerceProgressTasks } from "../rules/progress-engine.js";
import {
  boundText,
  DEFAULT_TOWN_MAP_VIEW,
  GLOBAL_GALLERY_REF_PREFIX,
  HOME_BUILDINGS,
  isGlobalGalleryRef,
  isHomeBuildingKind,
  isTownMapFit,
  MAX_PHYSICAL_NARRATION_LENGTH,
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
  MAX_VENUE_DESCRIPTION_LENGTH,
  MAX_VENUE_EVENTS,
  MAX_VENUE_IMAGE_URL_LENGTH,
  MAX_VENUE_NAME_LENGTH,
  MAX_VENUE_NOTE_LENGTH,
  MAX_VILLAGER_WISHES,
  MAX_WISH_LENGTH,
  MAX_WISH_TELL_LENGTH,
  TOWN_MAP_FOCUS_MAX,
  TOWN_MAP_FOCUS_MIN,
  TOWN_MAP_ZOOM_MAX,
  TOWN_MAP_ZOOM_MIN,
  VILLAGES_PROMPT_BOX_MAX_LENGTH,
} from "../rules/prompt-preset.js";
import { coerceScenarioImprint, coerceWorldFacts } from "../rules/scenario-rules.js";
import { coerceSpriteManager, managerResidentSprite } from "../rules/sprite-manager-model.js";
import { readVenueAccess, readZonePolicy } from "../rules/venue-access.js";
import { defaultVenueSpace, validVenueClasses, venueResidentIds } from "../rules/venue-model.js";
import {
  canInviteToZone,
  chooseAgendaZone,
  legacyVenueZones,
  synchronizeVenueZones,
  ZONE_KINDS,
} from "../rules/venue-zones.js";
import { randomVillageSeed, VILLAGE_CLOCKS, VILLAGE_WEEKDAYS, villageClockIndex } from "../rules/village-clock.js";
import { coerceWishActivities, coerceWishLifecycle } from "../rules/wish-coercion.js";
import { wishSize } from "../rules/wish-definition.js";
import { readSemanticWishCriteria } from "../rules/wish-criteria.js";

import { shortWishText, wishPolicy, routineRevision } from "../rules/wish-policy.js";

export function defaultVillageState(): VillageState {
  return {
    version: 5,
    memories: { format: 1, revision: 0, records: [] },
    memoryScenes: {},
    memoryReceipts: {},
    backgroundReceipts: {},
    exchangeReceipts: {},
    noticeSequence: 0,
    dismissedNoticeIds: [],
    socialContractVersion: 2,
    projectWishOutbox: [],
    wishRefillIntents: {},
    progressEngineVersion: 1,
    name: "",
    narrationStyle: defaultVillageNarrationStyle(),
    characterSpeechColors: true,
    sendOnEnter: false,
    spriteCardFlipEnabled: true,
    // An empty setting means "no place yet": the venue and routine blocks render
    // nothing, and the village behaves exactly as it did before they existed.
    setting: "",
    foundingReason: "",
    worldName: "",
    foundingDetails: "",
    foundingGuidance: "",
    playerBackground: "",
    scenarioImprint: null,
    worldFacts: [],
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
    // Memories begin with witnessed experiences and explicit domain outcomes.
    sceneWishProtections: {},
    simulatedThrough: "",
    lastKnownTimeZone: "",
    timeZone: "",
    clock: null,
    backgroundPace: "balanced",
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
    maps: [],
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
    ...(asRecord(raw.semanticCriteria).semanticVersion === 2 && asRecord(raw.semanticCriteria).goal === wish
      ? { semanticCriteria: readSemanticWishCriteria(raw.semanticCriteria, wish) }
      : {}),
    // Clamped rather than dropped. The number only decides how loudly a wish is
    // written and in what order, so a model that answers with 0 or 9 has said
    // something usable badly, not something unusable.
    intensity: Math.min(3, Math.max(1, intensity)),
    tell: boundText(raw.tell, MAX_WISH_TELL_LENGTH),
    addedAt: asInstant(raw.addedAt),
    expiresAt: asInstant(raw.expiresAt),
    goalJournal: readWishGoalJournal(raw.goalJournal),
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
  // Keep one exact compatibility digest; never bless an already stale continuation.
  const current = routineRevision(agenda);
  const previous = routineRevision({ week: raw.week, scheduleWeek: raw.scheduleWeek } as VillageAgenda);
  const alias = asRecord(raw.legacyRoutineRevision);
  const hasObsoleteFields = /"(?:status|reason)"\s*:/.test(JSON.stringify([raw.week, raw.scheduleWeek]));
  if (hasObsoleteFields && previous !== current) agenda.legacyRoutineRevision = { previous, current };
  else if (alias.current === current && typeof alias.previous === "string" && /^[a-f0-9]{64}$/.test(alias.previous))
    agenda.legacyRoutineRevision = { previous: alias.previous, current };
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
  const original = asRecord(value);
  if (Array.isArray(original.zones) && original.zones.filter((value) => asRecord(value).id !== "exterior").length > 6)
    throw new Error("A Venue may have at most six Zones besides Entrance.");
  const legacyCommunity = [original.classes].some((classes) => Array.isArray(classes) && classes.includes("gathering"));
  const raw = savedVenueClassRecord(value);
  if (Array.isArray(raw.spaces)) raw.spaces = raw.spaces.map(savedVenueClassRecord);
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
      ...(typeof row.roomSpecification === "string"
        ? { roomSpecification: boundText(row.roomSpecification, MAX_VENUE_DESCRIPTION_LENGTH) }
        : {}),
      ...(asIsoString(asRecord(row.lastObserved).observedAt)
        ? {
            lastObserved: {
              description: boundText(asRecord(row.lastObserved).description, MAX_VENUE_DESCRIPTION_LENGTH),
              state: coerceSpaceState(asRecord(row.lastObserved).state),
              observedAt: asIsoString(asRecord(row.lastObserved).observedAt)!,
            },
          }
        : {}),
      ...(typeof row.imageInteriorKey === "string" ? { imageInteriorKey: row.imageInteriorKey.slice(0, 20000) } : {}),
      description: value
        ? boundText(row.description, MAX_VENUE_DESCRIPTION_LENGTH) || `A private space for this resident at ${name}.`
        : "",
      image: coerceVenueImage(row.image),
      state: coerceSpaceState(row.state),
      freezePicture: row.freezePicture === true,
      pictureRevision: Number.isSafeInteger(row.pictureRevision) ? Number(row.pictureRevision) : 0,
      picture: {
        base: coerceVenueImage(asRecord(row.picture).base) ?? coerceVenueImage(row.image),
        removed: asRecord(row.picture).removed === true,
        failed: asRecord(row.picture).failed === true,
        context: boundText(asRecord(row.picture).context, 24000) || undefined,
        baseline: boundText(asRecord(row.picture).baseline, 24000) || undefined,
        attempted: boundText(asRecord(row.picture).attempted, 128) || undefined,
        claim: boundText(asRecord(row.picture).claim, 128) || undefined,
      },
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
      id: asTrimmedString(row.id) || (legacyCommunity && venueClass === "community" ? "gathering" : venueClass),
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
    form: boundText(raw.form, MAX_PHYSICAL_DESIGN_LENGTH),
    classes,
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
    state: {
      condition: boundText(state.condition, MAX_VENUE_NOTE_LENGTH),
      furniture: coerceVenueStringList(state.furniture),
      publicFacts: coerceVenueStringList(state.publicFacts),
      features: coerceVenueFeatures(state.features),
      traces: coerceVenueTraces(state.traces),
      updatedAt: asIsoString(state.updatedAt) ?? "",
    },
  };
  const readZone = (value: unknown, archived = false): VillageVenueZone | null => {
    const row = savedVenueClassRecord(value);
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
    const zone: VillageVenueZone = {
      id,
      connectedTo: Array.isArray(row.connectedTo)
        ? row.connectedTo.filter((id): id is string => typeof id === "string")
        : undefined,
      name: boundText(row.name, MAX_VENUE_NAME_LENGTH) || "Zone",
      kind: row.kind as VillageVenueZone["kind"],
      venueClass: validVenueClasses([row.venueClass]) ? (row.venueClass as VillageVenueClass) : "other",
      description: boundText(row.description, MAX_VENUE_DESCRIPTION_LENGTH),
      ...(typeof row.roomSpecification === "string"
        ? { roomSpecification: boundText(row.roomSpecification, MAX_VENUE_DESCRIPTION_LENGTH) }
        : {}),
      ...(asIsoString(asRecord(row.lastObserved).observedAt)
        ? {
            lastObserved: {
              description: boundText(asRecord(row.lastObserved).description, MAX_VENUE_DESCRIPTION_LENGTH),
              state: coerceSpaceState(asRecord(row.lastObserved).state),
              observedAt: asIsoString(asRecord(row.lastObserved).observedAt)!,
            },
          }
        : {}),
      ...(typeof row.imageInteriorKey === "string" ? { imageInteriorKey: row.imageInteriorKey.slice(0, 20000) } : {}),
      image: coerceVenueImage(row.image),
      state: coerceSpaceState(row.state),
      ownerId: ownerId || undefined,
      purpose: boundText(row.purpose, 240),
      ...(row.access === undefined ? {} : { access: readZonePolicy(row.access) }),
      controllerIds: coerceVenueIds(row.controllerIds),
      preparation: ["pending", "ready", "failed"].includes(String(asRecord(row.preparation).status))
        ? {
            status: asRecord(row.preparation).status as "pending" | "ready" | "failed",
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
      freezePicture: row.freezePicture === true,
      pictureRevision: Number.isSafeInteger(row.pictureRevision) ? Number(row.pictureRevision) : 0,
      picture: {
        base: coerceVenueImage(asRecord(row.picture).base) ?? coerceVenueImage(row.image),
        removed: asRecord(row.picture).removed === true,
        failed: asRecord(row.picture).failed === true,
        context: boundText(asRecord(row.picture).context, 24000) || undefined,
        baseline: boundText(asRecord(row.picture).baseline, 24000) || undefined,
        attempted: boundText(asRecord(row.picture).attempted, 128) || undefined,
        claim: boundText(asRecord(row.picture).claim, 128) || undefined,
      },
      initialImageAttemptedAt: asIsoString(row.initialImageAttemptedAt) ?? "",
      adaptationPending: row.adaptationPending === true,
      adaptationSourceArchiveAt: asIsoString(row.adaptationSourceArchiveAt) ?? "",
    };
    if (zone.image && !zone.picture?.baseline) {
      zone.picture = {
        ...zone.picture,
        base: zone.picture?.base ?? zone.image,
        baseline: zone.picture?.context ?? zonePictureBaseline(JSON.stringify(zonePicturePhysicalRecord(zone))),
      };
    }
    if (isPrivateInterior(zone) && zone.seen) {
      if (!zone.lastObserved) observePrivateInterior(zone, zone.state.updatedAt || "1970-01-01T00:00:00.000Z");
      if (zone.image && !zone.imageInteriorKey) zone.imageInteriorKey = privateInteriorKey(zone.lastObserved!);
    }
    return zone;
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
    venue.spaces = venue.zones.filter((zone) => ["public", "shared-residence"].includes(zone.kind));
    venue.privateSpaces = venue.zones
      .filter((zone) => zone.kind === "private-residence")
      .map((zone) => ({ ...zone, ownerId: zone.ownerId! }));
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
  venue.zones = (venue.zones ?? legacyVenueZones(venue)).flatMap((zone) => {
    const parsed = readZone(zone);
    return parsed ? [parsed] : [];
  });
  synchronizeVenueZones(venue, structuredClone(venue));
  venue.zones = materializeConnections(venue.zones ?? legacyVenueZones(venue)).flatMap((zone) => {
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
    const row = savedVenueClassRecord(entry),
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
        ...(typeof row.roomSpecification === "string"
          ? { roomSpecification: boundText(row.roomSpecification, MAX_VENUE_DESCRIPTION_LENGTH) }
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
            narration: boundText(receipt.narration, MAX_PHYSICAL_NARRATION_LENGTH),
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
const BACKGROUND_PACES: readonly VillageBackgroundPace[] = ["off", "quiet", "balanced", "lively"];
const MAX_SIMULATION_RECORDS = 256;
function coerceBackgroundPace(raw: Record<string, unknown>): VillageBackgroundPace {
  const pace = raw.backgroundPace ?? raw.storyPace;
  if (typeof pace === "string" && BACKGROUND_PACES.includes(pace as VillageBackgroundPace))
    return pace as VillageBackgroundPace;
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
/** Preserve the spent daily allowance when removing the legacy visual feed. */
function coercePlanningUsage(raw: Record<string, unknown>): VillageState["planningUsage"] {
  const usage = asRecord(raw.planningUsage),
    dateKey = boundText(usage.dateKey ?? raw.lastPlanningDate ?? raw.lastCreativeDate, 10);
  if (raw.planningUsage && typeof usage.count === "number" && Number.isSafeInteger(usage.count) && usage.count >= 0)
    return { dateKey, count: usage.count };
  const timeZone = validTimeZone(raw.timeZone)
    ? raw.timeZone
    : validTimeZone(raw.lastKnownTimeZone)
      ? raw.lastKnownTimeZone
      : Intl.DateTimeFormat().resolvedOptions().timeZone;
  const count = (Array.isArray(raw.happenings) ? raw.happenings : []).filter((row) => {
    const at = asIsoString(asRecord(row).occurredAt);
    return !!at && localDateKey(new ZonedDate(at, timeZone)) === dateKey;
  }).length;
  return { dateKey, count: dateKey ? Math.max(1, count) : 0 };
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
      !["new-venue", "renovation"].includes(String(raw.kind)) ||
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
    if (["working", "paused"].includes(String(raw.status)) && !order) throw new Error("Missing Project deadline.");
    const position = asRecord(draft.position);
    if (raw.kind === "new-venue" && (!validVenueClasses(draft.classes) || !asTrimmedString(draft.name)))
      throw new Error("Invalid Project Venue.");
    const change = asRecord(flow.change),
      zones = flow.change === null ? undefined : coerceZoneDrafts(change.zones);
    if (
      raw.kind === "renovation" &&
      (!validVenueClasses(change.classes) ||
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
          }
        : null,
      blockedReason: asTrimmedString(flow.blockedReason),
      completedAt: asTrimmedString(flow.completedAt),
    };
    if (raw.plan)
      project.plan = readProjectPlan(raw.plan, {
        classes: validVenueClasses(draft.classes) ? draft.classes : ["other"],
      } as VillageVenue);
    return project;
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
      const kinds = ["residence", "project", "venue", "departure", "other"] as const;
      const draft = savedVenueClassRecord(raw.venueDraft);
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
                  description: boundText(draft.description, MAX_VENUE_DESCRIPTION_LENGTH),
                  category: "",
                  position: { x: null, y: null },
                  occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
                  capabilities: [],
                  state: {
                    condition: boundText(draftState.condition, MAX_VENUE_NOTE_LENGTH),
                    furniture: coerceVenueStringList(draftState.furniture),
                    publicFacts: coerceVenueStringList(draftState.publicFacts),
                    updatedAt: asIsoString(draftState.updatedAt) ?? "",
                  },
                },
              }
            : {}),
          requesterCharacterId: asTrimmedString(raw.requesterCharacterId),
          venueId: asTrimmedString(raw.venueId),
          requesterName: boundText(raw.requesterName, MAX_NOTICE_AUTHOR_LENGTH),
          requestQuote: boundText(raw.requestQuote, MAX_VENUE_NOTE_LENGTH),
          source: raw.source === "chat" ? ("chat" as const) : ("background" as const),
          sourceKey: asTrimmedString(raw.sourceKey),
        } satisfies VillagePendingDecision,
      ];
    })
    .slice(-MAX_SIMULATION_RECORDS);
}
/** Native runtime values and their exact JSON storage representation share one strict schema. */
function memoryField(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    throw new Error("Invalid saved Memories JSON.");
  }
}
export function coerceVillageState(value: unknown): VillageState {
  const raw = asRecord(value);
  if (value != null && raw.version !== 5) throw new Error("Unsupported Village format. Start a fresh Village.");
  if (value != null) memoryRequire(raw.memories && raw.memoryScenes, "current Village memory data is missing");
  if (raw.foundedAt && raw.socialContractVersion !== 2)
    throw new Error(
      "This Village uses an unsupported relationship contract. Create an independent new Village; its saved data has not been changed.",
    );
  const fallback = defaultVillageState();
  const venues = coerceVenues(raw.venues);
  const villagers = Array.isArray(raw.villagers)
    ? raw.villagers
        .map((entry) => coerceVillager(entry, venues))
        .filter((entry): entry is VillageVillager => entry !== null)
    : [];
  const seen = new Set<string>();

  const foundedAt = asIsoString(raw.foundedAt) ?? "";
  const memories = readMemoryCollection(memoryField(raw.memories ?? fallback.memories));
  const memoryReceipts = raw.memoryReceipts === undefined ? {} : memoryField(raw.memoryReceipts);
  memoryObject(memoryReceipts);
  for (const [id, receipt] of Object.entries(memoryReceipts)) {
    memoryObject(receipt);
    memoryRequire(receipt.id === id && receipt.domain === "memories", "invalid encoded memory receipt");
    memoryRequire(!Object.hasOwn(asRecord(raw.exchangeReceipts), id), "duplicate memory receipt");
  }
  const state: VillageState = {
    version: 5,
    memories,
    memoryScenes: readMemorySceneStates(memoryField(raw.memoryScenes ?? {}), memories),
    backgroundReceipts: Object.fromEntries(
      Object.entries(asRecord(raw.backgroundReceipts)).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    ),
    memoryReceipts: structuredClone(memoryReceipts) as VillageState["memoryReceipts"],
    exchangeReceipts: structuredClone(asRecord(raw.exchangeReceipts)) as VillageState["exchangeReceipts"],
    noticeSequence: Math.max(0, Math.floor(Number(raw.noticeSequence) || 0)),
    dismissedNoticeIds: [...new Set(asStringArray(raw.dismissedNoticeIds))],
    socialContractVersion: 2,
    socialMailOutbox: Array.isArray(raw.socialMailOutbox)
      ? (structuredClone(raw.socialMailOutbox) as VillageState["socialMailOutbox"])
      : [],
    socialClarifications: Array.isArray(raw.socialClarifications)
      ? (raw.socialClarifications as VillageState["socialClarifications"])
      : [],
    socialPublications: raw.socialPublications
      ? (structuredClone(raw.socialPublications) as VillageState["socialPublications"])
      : {},
    eventAttempts: raw.eventAttempts
      ? (structuredClone(raw.eventAttempts) as VillageState["eventAttempts"])
      : undefined,
    projectWishOutbox: Array.isArray(raw.projectWishOutbox)
      ? (raw.projectWishOutbox as VillageState["projectWishOutbox"])
      : [],
    sceneWishProtections: readSceneWishProtections(raw.sceneWishProtections),
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
    worldName: readWorldName(raw.worldName) ?? "",
    foundingDetails: boundText(raw.foundingDetails, 2_000),
    foundingGuidance: boundText(raw.foundingGuidance, 500),
    playerBackground: coercePlayerBackground(raw.playerBackground),
    scenarioImprint: coerceScenarioImprint(raw.scenarioImprint),
    worldFacts: coerceWorldFacts(raw.worldFacts),
    selectedLorebookIds: coerceSelectedLorebookIds(raw.selectedLorebookIds),
    sceneryArtStyle: boundText(raw.sceneryArtStyle, 600),
    sceneryStyleProfileId:
      typeof raw.sceneryStyleProfileId === "string" && /^[a-zA-Z0-9_-]{0,80}$/.test(raw.sceneryStyleProfileId)
        ? raw.sceneryStyleProfileId
        : null,
    automaticZonePictures: raw.automaticZonePictures !== false,
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
    development: readDevelopment(raw.development),
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
    simulatedThrough: asIsoString(raw.simulatedThrough) ?? legacySimulatedThrough(foundedAt, raw.lastHappeningKey),
    lastKnownTimeZone: boundText(raw.lastKnownTimeZone, 100),
    timeZone: validTimeZone(raw.timeZone) ? raw.timeZone : "",
    clock: decodeVillageClock(raw.clock),
    backgroundPace: coerceBackgroundPace(raw),
    lastPlanningDate: boundText(raw.lastPlanningDate ?? raw.lastCreativeDate, 10),
    planningUsage: coercePlanningUsage(raw),
    processedActionIds: asStringArray(raw.processedActionIds ?? raw.processedOpportunityIds)
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
    ...(asRecord(raw.semanticStartingTies).sourceHash
      ? { semanticStartingTies: structuredClone(raw.semanticStartingTies) as VillageState["semanticStartingTies"] }
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
    progressTasks: coerceProgressTasks(raw.progressTasks),
    pendingDecisions: coercePendingDecisions(raw.pendingDecisions),
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

  return state;
}
