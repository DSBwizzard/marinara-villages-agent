// Villages — the village record and shared document store helpers.
//
// Both live in the Engine's package document store as JSON, which means a write
// is a read-modify-write against an `expectedRevision`. `mutate*` below loops
// on that: a mismatch means somebody else wrote first, so re-read and re-apply
// rather than clobbering. The updater is caller-supplied and runs once per
// attempt, so it must be pure with respect to the state it is handed.
import { unwrittenVillageAgenda, VILLAGE_AGENDA_WINDOWS } from "./agenda-plan.js";
import { completeAgendaWeek, legacyAgendaWeek, workingAgendaWeek } from "./agenda-week.js";
import { asFraction, asInstant, asIsoString, asRecord, asString, asStringArray, asTrimmedString } from "./coerce.js";
import { coerceLoreTokenBudget, coerceSelectedLorebookIds, DEFAULT_LORE_TOKEN_BUDGET } from "./lorebooks.js";
import { coerceVillageNarrationStyle, defaultVillageNarrationStyle } from "./narration-style.js";
import { MAX_REMAP_ATTEMPTS, MAX_REMAP_FAILURE_LENGTH, remapBlockKey } from "./native-remap.js";
import { VILLAGES_PACKAGE_ID, villagesDocuments } from "./package-runtime.js";
import { defaultVenueSpace, validVenueClasses, validVenueImprovements } from "./venue-model.js";
import {
  boundText,
  DEFAULT_TOWN_MAP_VIEW,
  GLOBAL_GALLERY_REF_PREFIX,
  HOME_BUILDINGS,
  isGlobalGalleryRef,
  isHomeBuildingKind,
  isTownMapFit,
  isTownMapImage,
  MAX_VENUE_EVENTS,
  MAX_CHRONICLE_LENGTH,
  MAX_ENGINE_ID_LENGTH,
  MAX_HAPPENINGS,
  MAX_HAPPENING_LENGTH,
  MAX_NOTICE_AUTHOR_LENGTH,
  MAX_NOTICE_LENGTH,
  MAX_NOTICEBOARD_NOTES,
  MAX_PLAYER_PERSONA_ID_LENGTH,
  MAX_PLAYER_PERSONA_IDENTITY_LENGTH,
  MAX_PLAYER_PERSONA_NAME_LENGTH,
  MAX_PLACES,
  MAX_REMAP_ACTIVITY_LENGTH,
  MAX_REMAP_HERE_LENGTH,
  MAX_REMAP_MOVES,
  MAX_REMAP_SLOT_LENGTH,
  MAX_ROUTINE_SUMMARY_LENGTH,
  MAX_SPINOFF_NAME_LENGTH,
  MAX_SETTING_LENGTH,
  MAX_TOWN_MAP_IMAGE_LENGTH,
  LEGACY_TOWN_MAP_WIDTH,
  LEGACY_TOWN_MAP_HEIGHT,
  TOWN_MAP_EXPECTED_WIDTH,
  TOWN_MAP_EXPECTED_HEIGHT,
  MAX_VENUE_IMAGE_URL_LENGTH,
  MAX_VENUE_NAME_LENGTH,
  MAX_VENUE_NOTE_LENGTH,
  MAX_VENUE_DESCRIPTION_LENGTH,
  MAX_VILLAGER_WISHES,
  MAX_WISH_LENGTH,
  MAX_WISH_TELL_LENGTH,
  TOWN_MAP_FOCUS_MAX,
  TOWN_MAP_FOCUS_MIN,
  TOWN_MAP_ZOOM_MAX,
  TOWN_MAP_ZOOM_MIN,
  VILLAGES_PROMPT_BOX_MAX_LENGTH,
} from "./prompt-preset.js";
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
  VillageScheduledEvent,
  VillageStoryPace,
  VillageRemap,
  VillageRemapFailure,
  VillageRemapMove,
  VillageResidence,
  VillageScene,
  VillageState,
  VillageTownMapView,
  VillageVenue,
  VillageVenueClass,
  VillageVenueMail,
  VillageVenueFeature,
  VillageVenueTrace,
  VillageVenueEvent,
  VillageVenueImage,
  VillageVillager,
  VillageVillagerCardSnapshot,
  VillageWish,
} from "./types.js";
import { randomVillageSeed, VILLAGE_CLOCKS, villageClockIndex } from "./village-clock.js";

const VILLAGE_DOC_ID = "villages-village";
const VILLAGE_DOC_KIND = "village";
const VILLAGE_DOC_NAME = "Village record";
// RETIRED 0.4.43 — the scene lane's return path. Kept, not called.
//
// 0.4.43 made a spin-off ONE WAY: the package takes a snapshot of the village as
// it stands, builds an ordinary Engine roleplay out of it, and then stops caring.
// There is no longer any fact about a spin-off for the village to hold, so nothing
// in this package reads or writes the documents below any more. They are left in
// the code — and the kind below is deliberately left with its old value — so that
// the shape is on hand if a use for it turns up, and so that a village upgrading
// from 0.4.42 does not have to have its old `villager-scene` documents migrated,
// deleted, or even acknowledged. A document nobody reads is a document nobody has
// to trust; the files stay on disk, untouched and unread, and this package no
// longer has an operation that could write one.
const SCENE_DOC_KIND = "villager-scene";
const MAX_WRITE_ATTEMPTS = 3;

/**
 * Document ids are a global primary key shared by every package, so the
 * transcript id embeds the village's own package prefix.
 */
/** The same rule for the player's own copy of the conversation. */
export function chatLogDocumentId(characterId: string): string {
  return `villages-chatlog-${characterId}`;
}

/**
 * The same rule again for the link to a villager's Engine spin-off.
 *
 * RETIRED 0.4.43 — the scene lane's return path. Kept, not called.
 *
 * One document per villager rather than one list, because a link is a fact about
 * a villager: it has to be readable when that villager's row is drawn, and a list
 * would be a single document every spawn rewrites, which is a document two spawns
 * can lose each other's writes on for no reason.
 */
export function sceneDocumentId(characterId: string): string {
  return `villages-scene-${characterId}`;
}

export function defaultVillageState(): VillageState {
  return {
    version: 2,
    name: "Willowbrook",
    narrationStyle: defaultVillageNarrationStyle(),
    // An empty setting means "no place yet": the venue and routine blocks render
    // nothing, and the village behaves exactly as it did before they existed.
    setting: "",
    foundingReason: "",
    foundingDetails: "",
    foundingGuidance: "",
    selectedLorebookIds: [],
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
    visitMemoryBackfilled: false,
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

// ── Coercion ─────────────────────────────────────────────────────────────────
// Stored JSON is untrusted. Only the current schema is accepted; obsolete venue
// records are discarded because pre-0.5 villages are intentionally not migrated.

function coerceVillager(value: unknown, venues: readonly VillageVenue[]): VillageVillager | null {
  const raw = asRecord(value);
  const characterId = asTrimmedString(raw.characterId);
  if (characterId.length === 0) return null;
  const cardSnapshot = coerceVillagerCardSnapshot(raw.cardSnapshot);
  if (!cardSnapshot || cardSnapshot.id !== characterId) return null;
  return {
    characterId,
    cardSnapshot,
    sprite: coerceResidentSprite(raw.sprite),
    addedAt: asIsoString(raw.addedAt) ?? new Date().toISOString(),
    // Absent reads as null rather than as an empty agenda, and the difference
    // matters: null means "not written for yet", which is what makes the
    // village write one. An empty agenda is a positive statement that asking
    // produced nothing, and it must only ever come from actually asking.
    agenda: coerceAgenda(raw.agenda, venues, cardSnapshot.name),
    completedWishes: coerceCompletedWishes(raw.completedWishes),
    ingestSchedule: raw.ingestSchedule !== false,
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

function coerceResidentSprite(value: unknown): VillageVillager["sprite"] {
  const raw = asRecord(value);
  const assetId = asString(raw.assetId);
  if (!/^villages-[a-f0-9-]{36}$/i.test(assetId)) return null;
  const sideAssetId =
    /^villages-[a-f0-9-]{36}$/i.test(asString(raw.sideAssetId)) && asString(raw.sideAssetId) !== assetId
      ? asString(raw.sideAssetId)
      : undefined;
  const seen = new Set<string>();
  const counts = { front: 0, side: 0 };
  const expressions = (Array.isArray(raw.expressions) ? raw.expressions : [])
    .map((value) => {
      const entry = asRecord(value);
      const view = entry.view === "side" ? "side" : "front";
      const label = asString(entry.label);
      const filename = asString(entry.filename);
      if (
        !/^[a-z0-9_-]{1,40}$/.test(label) ||
        !/^[a-z0-9_-]{1,40}\.(?:png|jpg|jpeg|webp|avif)$/.test(filename) ||
        seen.has(`${view}:${label}`)
      )
        return null;
      seen.add(`${view}:${label}`);
      const revision =
        typeof entry.revision === "number" && Number.isSafeInteger(entry.revision) && entry.revision > 0
          ? entry.revision
          : undefined;
      return { view, label, filename, ...(revision ? { revision } : {}) };
    })
    .filter(
      (entry): entry is { view: "front" | "side"; label: string; filename: string; revision?: number } =>
        entry !== null,
    )
    .filter((entry) => (entry.view === "front" || sideAssetId !== undefined) && ++counts[entry.view] <= 24);
  if (expressions.length === 0) return null;
  const framing = asRecord(raw.framing);
  const cropPercent =
    typeof framing.cropPercent === "number" && Number.isFinite(framing.cropPercent)
      ? Math.min(85, Math.max(40, framing.cropPercent))
      : 58;
  return {
    assetId,
    ...(sideAssetId ? { sideAssetId } : {}),
    expressions,
    framing: { mode: framing.mode === "half" ? "half" : "full", cropPercent },
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
    description: asString(raw.description),
    personality: asString(raw.personality),
    scenario: asString(raw.scenario),
    backstory: asString(raw.backstory),
    appearance: asString(raw.appearance),
    exampleDialogue: asString(raw.exampleDialogue),
    capturedAt,
  };
}

/**
 * The last refused translation attempt, or null when there is not enough of it to
 * be one.
 *
 * Both halves are required, for the reason a venue needs a name: a failure with no
 * time on it cannot be read as recent or as stale, and a failure with no sentence
 * on it is a badge with nothing behind it. A record that half-parses is dropped
 * rather than completed with a guess, and dropping it costs only the explanation —
 * the translation it explains was never written either way, so nothing on the
 * villager is left claiming a state it cannot support.
 *
 * Read through the same trust boundary as everything else here even though the
 * village wrote it, because the document is on disk and a player can edit it.
 */
function coerceRemapFailure(value: unknown): VillageRemapFailure | null {
  const raw = asRecord(value);
  const at = asIsoString(raw.at);
  const message = boundText(raw.message, MAX_REMAP_FAILURE_LENGTH);
  if (!at || message.length === 0) return null;
  return { at, message };
}

/**
 * One thing a villager wishes for, or null when there is not enough of it to be one.
 *
 * A wish with no `wish` in it is dropped rather than kept as a blank line, which
 * is the same rule a venue follows. The tell is allowed to be empty: a wish the
 * village could not think of a surface for is still a wish, and it still colours
 * the villager's own voice.
 *
 * Neither date is repaired, and that is the one thing this reader does
 * differently from the rest of the file. Everywhere else a missing field is
 * filled with a safe default, but a wish's two dates are the only record of when
 * it was written and when it dies, and inventing either would put a date in the
 * debug tab that nobody ever chose. Both go through `asInstant`, so an empty one
 * and an unreadable one arrive downstream as the same "": an empty `expiresAt`
 * means the wish does not age, which is the right answer for everything written
 * before the field existed — such a wish can still be fulfilled or judged to
 * have lapsed, and arithmetic it never agreed to can never delete it.
 */
function coerceWish(value: unknown): VillageWish | null {
  const raw = asRecord(value);
  const wish = boundText(raw.wish, MAX_WISH_LENGTH);
  if (wish.length === 0) return null;
  const intensity = typeof raw.intensity === "number" && Number.isFinite(raw.intensity) ? Math.round(raw.intensity) : 2;
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

/**
 * What a villager wishes for, or null when they have not been written for.
 *
 * Null is returned for anything that is not a record at all, so a hand-edited
 * document, a null, a string and a missing field all land on "ask the model
 * again" rather than on a villager who stands there wishing for nothing.
 *
 * A record with a title but no wishes is kept as an empty agenda instead. That is
 * the one case where asking genuinely produced nothing, and re-asking on every
 * part of every day would be the village spending a model call to learn the same
 * nothing.
 */
function coerceAgenda(value: unknown, venues: readonly VillageVenue[], name: string): VillageAgenda | null {
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
  agenda.personalizationPending = raw.personalizationPending === true || !agenda.generatedAt || !raw.week;
  agenda.personalizationFailure = boundText(raw.personalizationFailure, 300);
  agenda.personalizationAttemptDate = /^\d{4}-\d{2}-\d{2}$/.test(asString(raw.personalizationAttemptDate))
    ? asString(raw.personalizationAttemptDate)
    : undefined;
  return agenda;
}

/** * How this villager's week happens here, or null when there is not enough of it
 * to be a translation.
 *
 * The null rule is the agenda's rule with one more condition, and the extra
 * condition is the whole point of the record. A translation with no `weekStart`
 * cannot be compared against the Engine's week, so it can never be recognised as
 * stale — it would be a cache entry with no key, retranslated never and replaced
 * never. Such a record is dropped here rather than stored, and the villager
 * reads the Engine's own sentence until the Engine hands the village a week to
 * key on.
 *
 * A `signature` is NOT required, and it is the one field of this record that is
 * allowed to be missing. A document written before signatures existed holds the
 * week and the moves and not the digest, and there is no way to recompute it
 * here — the places and the setting that went into it are not in this function's
 * hands, and a digest invented from what IS here would either match forever or
 * never, depending on whether the guess agreed with the writer. So a missing one
 * is stored as an EMPTY string, which reads as a record that no signature can be
 * compared against, and `remapNeedsWriting` treats that as owed-a-translation
 * rather than as up to date. One wasted call, once, per villager, and then the
 * village is on the new scheme for good.
 *
 * `attempts` is bounded rather than trusted. It is the count that decides when
 * the village stops asking about a move a model will not copy back, so a
 * hand-edited document that set it to a thousand would silence a villager's week
 * forever. It is clamped to `MAX_REMAP_ATTEMPTS`, which is the highest value
 * that means anything.
 *
 * Everything else about it is total in both directions. A move with no key or no
 * sentence is dropped, a duplicate key keeps the first, and the caps are the same
 * ones the writer used — a hand-edited document is bounded exactly as a model's
 * answer is. An EMPTY move list is kept, and that is deliberate: a week the
 * village asked about and was told nothing worth saying is a week it must not ask
 * about again on every part of every day.
 *
 * Exported because it is a trust boundary rather than because the package calls
 * it from elsewhere: it is the one place a stored translation is bounded, those
 * bounds decide whether a villager is translated again at all, and a reader that
 * can only be exercised through a live document store is a reader whose clamping
 * has never been looked at.
 */
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
    attempts: Math.max(0, Math.min(MAX_REMAP_ATTEMPTS, Math.floor(attempts))),
    // Left empty rather than stamped with "now", exactly as the agenda is: a
    // record read off disk has no answer to when it was written.
    generatedAt: asIsoString(raw.generatedAt) ?? "",
  };
}

/**
 * One move, with the key the list is de-duplicated by handed back alongside it.
 *
 * The pair is returned rather than the move alone because the key is built out of
 * the day and the hour range by the lookup's own rule and building it a second
 * time at the call site is how the two get out of step. Both halves are required:
 * a key with no sentence would render as an empty "Right now you are ." and a
 * sentence with no key can never be found, so either alone is a row the village
 * would carry and never read.
 *
 * The key is `day|hour range`, NOT the activity sentence, and that is the whole
 * shape change of this release. A sentence is not a slot in a week: a villager
 * who sleeps at eleven every night has ONE sentence and SEVEN hours, and keyed by
 * sentence the seventh night could never be told from the first. Keyed by slot,
 * every hour of the week gets its own entry, which is what lets the tab print the
 * Engine's event and the village's event side by side for any hour of the day.
 *
 * An entry written under the OLD scheme therefore has no usable day or time and
 * is dropped, which makes the whole record read as incomplete and re-asks for the
 * week. That is the intended cost and it is paid once: a half-readable record
 * would be worse — the entries that happened to carry a plausible `day` field
 * would resolve, the rest would quietly render as the village's default, and the
 * result would look like a translation that had forgotten most of the week.
 *
 * The place rides along and is NOT validated against the venues here, which is
 * deliberate and is the whole reason the writer stored an id instead of a name:
 * a place that has since been renamed, or deleted, or belongs to a week written
 * before the village had any places at all is a miss at READ time, and a miss
 * draws exactly what no place draws. Filtering here would be a second opinion
 * about what a valid place is, held in the reader, disagreeing with the writer
 * the first time either changed.
 *
 * The wish rides along beside it and is not validated either, for the same reason
 * and with one extra turn of the screw: a wish is REPLACED when it is answered, so
 * an id that no longer appears anywhere in the villager's agenda is the ordinary
 * outcome of a wish having been fulfilled rather than a sign of damage. Nothing
 * looks it up — the influence it records is already inside the `here` phrase — so
 * the worst a stale id can do is read as a name the debug tab cannot resolve,
 * which is exactly what it is. A reader that pruned it would be deleting the
 * record of which wish bent which hour on nothing but the news that the wish had
 * been answered.
 */
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
      wishId: asTrimmedString(raw.wishId),
    },
  };
}

/**
 * A place that is not a house needs a name to be a place at all, because the
 * name is the whole of what the translation list says about it; the note is what
 * a character's own verb gets translated into, so an unnamed place that is not a
 * house is dropped rather than kept as a blank row in the player's editor. A
 * HOUSE is allowed to be nameless, because the village has no name for one — it
 * knows "Bram's house", which is a sentence about Bram. An id is minted when one
 * is missing so the tab always has a stable key, even against a hand-edited
 * document.
 *
 * Everything else is optional, and each absence reads as a real state rather
 * than as damage. A place with no picture is ordinary. A place with no position
 * is one the village knows about and cannot point at — see `asFraction` for why
 * a position is not clamped, and note that the two coordinates are read together
 * and dropped together, because half a position is not a position. A place with
 * no building is a place rather than a house, which is the ordinary state for
 * most of them — only a building this village does not know falls back to the
 * one kind there is, rather than costing the player the place.
 *
 * The player's home never holds a villager (it is their house, not a
 * resident's), so any occupant recorded against it is discarded rather than
 * trusted, and a place that is not a home holds nobody at all.
 */
function coerceVenue(value: unknown): VillageVenue | null {
  const raw = asRecord(value);
  const name = boundText(raw.name, MAX_VENUE_NAME_LENGTH);
  const purpose = boundText(raw.purpose, MAX_VENUE_NOTE_LENGTH);
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
      ownerId,
      description:
        boundText(row.description, MAX_VENUE_DESCRIPTION_LENGTH) || `A private space for this resident at ${name}.`,
      image: coerceVenueImage(row.image),
      state: coerceSpaceState(row.state),
      initialImageAttemptedAt: asIsoString(row.initialImageAttemptedAt) ?? "",
      adaptationPending: row.adaptationPending === true,
      adaptationSourceArchiveAt: asIsoString(row.adaptationSourceArchiveAt) ?? "",
    };
  };
  const privateSpaces = classes.includes("residence")
    ? residentIds.map((ownerId) =>
        privateSpaceFor(
          ownerId,
          Array.isArray(raw.privateSpaces)
            ? raw.privateSpaces.find((entry) => asTrimmedString(asRecord(entry).ownerId) === ownerId)
            : null,
        ),
      )
    : [];
  const spaces = classes.map((venueClass) => {
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
  const improvements = validVenueImprovements(raw.improvements)
    ? raw.improvements.map((entry) =>
        entry
          ? {
              id: entry.id,
              title: boundText(entry.title, MAX_VENUE_NOTE_LENGTH),
              description: boundText(entry.description, MAX_VENUE_DESCRIPTION_LENGTH),
              spaceId: asTrimmedString(entry.spaceId) || null,
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
  return {
    id: asTrimmedString(raw.id),
    name,
    form: boundText(raw.form, MAX_VENUE_NOTE_LENGTH),
    classes,
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
            if (!id || !requiredIds.length || (target === "private" && ownerId !== requiredIds[0])) return [];
            const current =
              target === "private"
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
                ownerId,
                baseUpdatedAt: asIsoString(entry.baseUpdatedAt) ?? "",
                proposed: {
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
    playerInvitations: Array.isArray(raw.playerInvitations)
      ? raw.playerInvitations
          .map((entry) => ({
            residentId: asTrimmedString(asRecord(entry).residentId),
            recordedAt: asIsoString(asRecord(entry).recordedAt) ?? "",
            scope: asRecord(entry).scope === "private" ? ("private" as const) : ("shared" as const),
            ownerId: asTrimmedString(asRecord(entry).ownerId),
            sourceLineId: asTrimmedString(asRecord(entry).sourceLineId),
            quote: boundText(asRecord(entry).quote, MAX_VENUE_NOTE_LENGTH),
          }))
          .filter(
            (entry) =>
              residentIds.includes(entry.residentId) &&
              (entry.scope === "shared" || entry.ownerId === entry.residentId),
          )
          .slice(-16)
      : [],
    improvements,
    purpose,
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

/**
 * The picture a place is drawn with, as it comes back out of a document.
 *
 * A reference is only worth keeping if all of it is well formed, so anything
 * less is dropped to null rather than half-kept. A ref with no url cannot be
 * drawn, and a url with no ref is a picture nothing protects from deletion —
 * and a village that stored the second would show art that could vanish the
 * moment the player tidied their gallery. Both failures read as "no picture",
 * which costs the player a gradient rather than a broken image.
 *
 * A missing id is DERIVED from the ref rather than treated as a failure: the
 * two name the same picture, which is the only thing the id is for here, so a
 * document that lost one still resolves.
 */
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

/**
 * Every place the village holds, with the two rules no single place can check
 * for itself: only one of them is the player's, and a character lives in one
 * place at a time.
 *
 * Both are enforced here rather than trusted, because a duplicate would
 * otherwise make every reader of `venues` disagree about where someone lives.
 * Duplicates are dropped rather than merged: which one the player meant cannot
 * be guessed from here, and keeping both would make "your home" ambiguous
 * everywhere it is read.
 *
 * The cap is `MAX_PLACES` rather than `MAX_VENUES`: this list holds the houses
 * too, and the translator's smaller budget is applied where it belongs — see
 * `remapVenues`.
 */
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
    text,
    at: asIsoString(raw.at) ?? "",
    ...(asTrimmedString(receipt.submissionId)
      ? {
          actionReceipt: {
            submissionId: asTrimmedString(receipt.submissionId),
            happened: receipt.happened === true,
            narration: boundText(receipt.narration, MAX_HAPPENING_LENGTH),
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

/**
 * One notice off the board.
 *
 * Boards written before a note carried an author are plain strings, and those
 * are READ rather than discarded: every one of them is a note the player typed
 * themselves, so dropping them on upgrade would be throwing away their writing
 * to make a schema tidy. An unsigned note is also an ordinary thing to find on
 * a real board, so the same shape serves both.
 */
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

/**
 * One happening.
 *
 * A part of day this village does not know is kept as an empty string rather
 * than repaired to something nearby: it still says what happened, and only the
 * filing of it is lost. The day it is filed under is what the writing key is
 * compared against, so an unfilable entry can never make the village think it
 * has already written for the part of day it is actually in.
 */
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

/**
 * One person a memory is about.
 *
 * A bare string is accepted as well as an object, because the actor list is
 * written by a model and by the chat path and both are untrusted; a name is
 * worth keeping even when nothing else about the entry is joinable. A name is
 * what the line renders with, so an actor without one is dropped rather than
 * kept as an anonymous entry that would render as nothing.
 */
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

/**
 * One memory.
 *
 * The rules here all point the same way: an entry that says something is kept,
 * and only the parts that cannot be read are lost. A scope nobody recognises
 * reads as the SHARED one, because that is the answer that tells every villager
 * something true rather than nothing at all — a private memory filed as shared
 * is a rumour, and a shared memory filed as private is a fact only one person
 * knows, which is the more expensive mistake.
 *
 * `dayIndex` mirrors `coerceHappening` exactly, including the fallback to 0:
 * an unreadable day reads as the OLDEST thing the village knows, never as
 * today. Filing a corruption as "now" would make a villager announce it as
 * current, which is the one direction that invents an event.
 *
 * `at` is read for display only and never repaired to "now" when it is
 * unreadable — a stamp nobody wrote is worse than no stamp, because it looks
 * like evidence.
 *
 * `kind` falls back to "tick" and `weight` to absent, which are both the
 * ordinary case: a memory of an afternoon is what this record is mostly made of,
 * and an entry written before weight existed trims as if it were weight 1. The
 * fallback for `kind` is deliberately not "favour" — a favour outranks every
 * ordinary memory when the chronicle is full, so an unreadable entry has to land
 * on the side that can be forgotten rather than on the side that cannot.
 */
function coerceChronicleEntry(value: unknown, foundedAt: string): VillageChronicleEntry | null {
  const raw = asRecord(value);
  const text = boundText(raw.text, MAX_CHRONICLE_LENGTH);
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
      const text = boundText(raw.text, MAX_CHRONICLE_LENGTH);
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

/**
 * A stored map is only usable if it is a base64 image data URL inside the cap,
 * so anything else — a hand-edited record, a half-finished write, a picture
 * saved when the limit was larger — reads as "no map yet" instead of reaching
 * an `<img src>` as a broken image. Deliberately not truncated to fit: half a
 * base64 payload is a corrupt picture, not a smaller one.
 */
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

/**
 * Which parts of the day the village may be written for automatically.
 *
 * The absent case and the empty case are deliberately different answers, and
 * this is the one place that distinction is drawn. An absent list is a record
 * written before this preference existed, and reads as all four, so upgrading
 * changes nothing about a village that was already updating itself. An empty
 * list is a player who switched every part of day off, and has to survive the
 * round trip: reading it as "no preference" and refilling it would silently
 * undo the only way to say "only when I am watching".
 *
 * Unknown entries are dropped rather than repaired. A part of day this version
 * does not know is not one of these four, so keeping it would put a switch in
 * the settings panel that cannot be turned off.
 */
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

/** A 0..100 position in the picture, or null when the value is not one. */
function asFocus(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value >= TOWN_MAP_FOCUS_MIN && value <= TOWN_MAP_FOCUS_MAX ? value : null;
}

/** How far the picture is magnified, or null when the value is not a usable one. */
function asZoom(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value >= TOWN_MAP_ZOOM_MIN && value <= TOWN_MAP_ZOOM_MAX ? value : null;
}

/**
 * How the stored picture is framed, from either a record or a request.
 *
 * Exported because a submitted framing means the same thing as a stored one:
 * "this is how the picture should sit in the frame". Each field falls back on
 * its own rather than the whole view being thrown away — these are four
 * independent readings of one picture, and a view with a good focus and a
 * nonsense zoom still says where the picture was pointed. Nothing is REPAIRED,
 * though: an out-of-range number takes the shipped default rather than being
 * clamped to the nearest edge, because a player who typed 500 asked for
 * nothing, and silently handing them the far edge would look like it worked.
 */
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
  return value
    .flatMap((entry) => {
      const raw = asRecord(entry);
      const id = asTrimmedString(raw.id);
      const title = boundText(raw.title, MAX_NOTICE_LENGTH);
      if (!id || !title) return [];
      const progress =
        typeof raw.progress === "number" && Number.isFinite(raw.progress)
          ? Math.max(0, Math.min(100, Math.trunc(raw.progress)))
          : 0;
      return [
        {
          id,
          title,
          venueId: asTrimmedString(raw.venueId),
          participantIds: asStringArray(raw.participantIds)
            .map((actor) => actor.trim())
            .filter(Boolean)
            .slice(0, 16),
          progress,
          status:
            raw.status === "blocked" ? "blocked" : raw.status === "complete" || progress >= 100 ? "complete" : "active",
          updatedAt: asIsoString(raw.updatedAt) ?? "",
        },
      ];
    })
    .slice(0, MAX_SIMULATION_RECORDS);
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
      const requestPurpose = boundText(draft.purpose, MAX_VENUE_NOTE_LENGTH);
      const requestCategory = boundText(draft.category, MAX_VENUE_NOTE_LENGTH);
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
          ...(requestName && requestPurpose
            ? {
                venueDraft: {
                  name: requestName,
                  purpose: requestPurpose,
                  description: boundText(draft.description, MAX_VENUE_DESCRIPTION_LENGTH),
                  category: requestCategory,
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
        row.kind !== "villager-move"
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
          status:
            row.status === "approved" || row.status === "declined" || row.status === "pending-player"
              ? row.status
              : "awaiting-villagers",
          createdAt: asIsoString(row.createdAt) ?? "",
          dueAt: asIsoString(row.dueAt) ?? "",
          resolvedAt: asIsoString(row.resolvedAt) ?? "",
          requesterCharacterId: asTrimmedString(row.requesterCharacterId),
          movingCharacterId: asTrimmedString(row.movingCharacterId) || undefined,
          counterofferRequestId: asTrimmedString(row.counterofferRequestId) || undefined,
          counterofferDraft: (() => {
            const draft = asRecord(row.counterofferDraft);
            return asTrimmedString(draft.name) && asTrimmedString(draft.description)
              ? {
                  name: boundText(draft.name, MAX_VENUE_NAME_LENGTH),
                  purpose: boundText(draft.purpose, MAX_VENUE_NOTE_LENGTH),
                  category: boundText(draft.category, MAX_VENUE_NOTE_LENGTH),
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
  return {
    version: 2,
    name: asTrimmedString(raw.name) || fallback.name,
    narrationStyle: coerceVillageNarrationStyle(raw.narrationStyle),
    setting: boundText(raw.setting, MAX_SETTING_LENGTH),
    foundingReason: boundText(raw.foundingReason, 40),
    foundingDetails: boundText(raw.foundingDetails, 500),
    foundingGuidance: boundText(raw.foundingGuidance, 500),
    selectedLorebookIds: coerceSelectedLorebookIds(raw.selectedLorebookIds),
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
        return { mode: "count" as const, value };
      if (retention.mode === "days" && Number.isInteger(value) && value >= 30 && value <= 3_650)
        return { mode: "days" as const, value };
      return { mode: "forever" as const, value: 0 };
    })(),
    visitMemoryBackfilled: raw.visitMemoryBackfilled === true,
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
        currentId: asTrimmedString(preparation.currentId),
        error: boundText(preparation.error, 300),
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
    projects: coerceProjects(raw.projects),
    pendingDecisions: coercePendingDecisions(raw.pendingDecisions),
    venueMail: coerceVenueMail(raw.venueMail),
    villagers: villagers
      .filter((entry) => {
        if (seen.has(entry.characterId)) return false;
        seen.add(entry.characterId);
        return true;
      })
      .map((entry) =>
        entry.agenda ? entry : { ...entry, agenda: unwrittenVillageAgenda(venues, entry.cardSnapshot.name) },
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
}

// ── Shared read/write plumbing ───────────────────────────────────────────────

/**
 * Everything the store needs to know about one document: what it is called in
 * the panel, and how to make a stored blob safe to read.
 *
 * `label` is deliberately given the coerced state rather than the raw record,
 * so a document can name itself after its own contents ("Willowbrook") instead
 * of carrying a name nobody reads.
 */
export type DocumentSlot<T> = {
  kind: string;
  name: string;
  description: string;
  coerce(data: unknown): T;
  label(state: T): string;
};

/**
 * Read-modify-write one document. `mutate` receives the coerced value and
 * returns whatever the caller wants back; returning normally means "the
 * mutation should be committed", so an updater that decides nothing changed
 * still writes — callers that care exit before the call.
 */
export async function mutateDocument<T>(
  documentId: string,
  slot: DocumentSlot<T>,
  mutate: (state: T) => void,
): Promise<void> {
  const documents = villagesDocuments();
  for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt += 1) {
    const record = await documents.getById(VILLAGES_PACKAGE_ID, documentId);
    const state = slot.coerce(record?.data);
    mutate(state);
    const stamp = new Date().toISOString();
    try {
      if (!record) {
        await documents.create({
          id: documentId,
          packageId: VILLAGES_PACKAGE_ID,
          kind: slot.kind,
          name: slot.label(state) || slot.name,
          description: slot.description,
          data: state,
          createdAt: stamp,
          updatedAt: stamp,
        });
        return;
      }
      const updated = await documents.update({
        id: documentId,
        packageId: VILLAGES_PACKAGE_ID,
        expectedRevision: record.revision,
        name: slot.label(state) || slot.name,
        description: slot.description,
        data: state,
        updatedAt: stamp,
      });
      if (updated) return;
    } catch {
      // Most likely a concurrent create claimed the id between our read and our
      // write. Re-read and try the whole mutation again.
    }
  }
  throw new Error("The village kept changing while it was being saved. Please try again.");
}

const villageSlot: DocumentSlot<VillageState> = {
  kind: VILLAGE_DOC_KIND,
  name: VILLAGE_DOC_NAME,
  description: "The village's own record of itself, kept by the Villages package.",
  coerce: coerceVillageState,
  label: (state) => state.name,
};

// ── Village record ───────────────────────────────────────────────────────────

export async function readVillageState(): Promise<VillageState> {
  const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, VILLAGE_DOC_ID);
  return coerceVillageState(record?.data);
}

/**
 * Apply a change to the village and persist it, retrying on a revision conflict.
 *
 * The founding stamp is applied here rather than inside each mutation so it
 * cannot be forgotten: the village starts keeping its own time at the first
 * write that creates or touches it, and every later write leaves the stamp
 * alone. That is what makes the derived clock stable — `foundedAt` is written
 * once and never recomputed.
 */
export async function mutateVillageState(mutate: (state: VillageState) => void): Promise<VillageState> {
  let next = defaultVillageState();
  await mutateDocument(VILLAGE_DOC_ID, villageSlot, (state) => {
    mutate(state);
    if (state.foundedAt.length === 0) state.foundedAt = new Date().toISOString();
    if (state.seed.length === 0) state.seed = randomVillageSeed();
    next = state;
  });
  return next;
}

// ── Scenes ───────────────────────────────────────────────────────────────────
//
// RETIRED 0.4.43 — the scene lane's return path. Kept, not called.
//
// Everything below this line stored a LINK between a villager and an Engine chat,
// and the whole point of 0.4.43 is that the package no longer keeps one. A
// spin-off is written once into the chat's own metadata and then forgotten about,
// so no function here is reachable from any route, any service or any cell in the
// tab. They are exported and they are correct and they are unused, which is
// deliberate: the shape is worth keeping on hand, they cost a player nothing by
// existing, and deleting them would delete the only written record of how a link
// was shaped. `SCENE_DOC_KIND` above is left with its 0.4.42 value for the same
// reason, so that documents a 0.4.42 village left on disk stay readable by the
// code that could read them, and stay unread by the code that actually runs.

/**
 * Read one villager's link to their Engine scene, or the BLANK scene.
 *
 * A blank scene — every field empty — is this record's way of saying "there is
 * no link", and the reason it is expressed as an empty record rather than as
 * `null` is `mutateDocument`: the write path coerces whatever is on disk, hands
 * the result to the caller's updater and commits it, so a coercer that answered
 * `null` would give the spawn path nothing it could fill in and a scene could
 * never be created in the first place. Every other slot in this file has the
 * same shape for the same reason.
 *
 * What the blank scene means is therefore a question for the READER, and
 * `readVillageScene` is where it is answered: an empty `chatId` is not a scene,
 * and every caller that wants that distinction asks there. This is the one
 * record in the file whose emptiness is a real state rather than a corruption,
 * because `chatId` is not a property of the record — it IS the record. There is
 * no safe way to repair a missing one: inventing an id binds the villager to some
 * chat that is not theirs, and looking one up by guessed criteria is the village
 * claiming to know something it does not.
 *
 * Everything that is genuinely optional is repaired the usual way, and
 * `characterId` is taken from the DOCUMENT ID rather than from the body. The
 * document id is the one thing that cannot disagree with the villager it is
 * filed under, so reading the body's copy would be reading a second opinion on a
 * question that has already been answered.
 */
export function coerceVillageScene(characterId: string, value: unknown): VillageScene {
  const raw = asRecord(value);
  return {
    version: 1,
    characterId,
    chatId: boundText(raw.chatId, MAX_ENGINE_ID_LENGTH),
    // The stored name is a display convenience, so a missing one is repaired
    // with a blank and the row falls back to the villager's own name. The Engine
    // is the authority on what the chat is called and is asked on every listing.
    chatName: boundText(raw.chatName, MAX_SPINOFF_NAME_LENGTH),
    presetId: boundText(raw.presetId, MAX_ENGINE_ID_LENGTH),
    personaId: boundText(raw.personaId, MAX_ENGINE_ID_LENGTH),
    // Stamped rather than left empty when absent: this is when the LINK began,
    // and a link that exists was made at some point. An empty one would sort
    // every upgraded record to the bottom of a list ordered by age.
    spawnedAt: asIsoString(raw.spawnedAt) ?? new Date().toISOString(),
    // These three are deliberately left empty rather than stamped. Each is a
    // positive statement — a line was written, the scene was read, the scene was
    // filed — and an invented timestamp would claim the player had done
    // something they had not, on a row whose whole job is to offer the action.
    beatAt: asIsoString(raw.beatAt) ?? "",
    lastImportedAt: asIsoString(raw.lastImportedAt) ?? "",
    endedAt: asIsoString(raw.endedAt) ?? "",
  };
}

function sceneSlot(characterId: string): DocumentSlot<VillageScene> {
  return {
    kind: SCENE_DOC_KIND,
    name: "Villager scene",
    description: "A link to the Engine roleplay chat one villager's scene lives in.",
    coerce: (data) => coerceVillageScene(characterId, data),
    label: (scene) => scene.chatName,
  };
}

/**
 * Read the link for one villager, or null when they have no scene.
 *
 * The `null` here is the whole of the distinction between "this villager has a
 * scene" and "this villager does not", and it is derived rather than stored:
 * see `coerceVillageScene` for why the record cannot carry it directly.
 */
export async function readVillageScene(characterId: string): Promise<VillageScene | null> {
  const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, sceneDocumentId(characterId));
  const scene = coerceVillageScene(characterId, record?.data);
  return scene.chatId.length > 0 ? scene : null;
}

/**
 * Every scene in the village, keyed by character id.
 *
 * One list call rather than one read per villager, because this is what the
 * listing route opens with and a villager with no scene should cost nothing to
 * skip. The kind is filed under the package's own id, so this cannot see another
 * package's documents.
 */
export async function listVillageScenes(): Promise<Map<string, VillageScene>> {
  const records = await villagesDocuments().list(VILLAGES_PACKAGE_ID, SCENE_DOC_KIND);
  const scenes = new Map<string, VillageScene>();
  for (const record of records) {
    if (!record.id.startsWith("villages-scene-")) continue;
    const characterId = record.id.slice("villages-scene-".length);
    if (characterId.length === 0) continue;
    const scene = coerceVillageScene(characterId, record.data);
    if (scene.chatId.length > 0) scenes.set(characterId, scene);
  }
  return scenes;
}

/**
 * Apply a change to one villager's scene and persist it.
 *
 * Written through `mutateDocument` like everything else, so the retry on a
 * revision conflict is the shared one. The updater is handed the BLANK scene when
 * there is no link yet and is expected to fill it in — the same contract the
 * village record and the transcripts have, and the reason the slot is not
 * nullable. "Spawn a scene for a villager who already has one" is a real case
 * that has to be able to reuse the existing link rather than making a second
 * chat, so the updater is also allowed to see a populated scene and do nothing.
 */
export async function mutateVillageScene(characterId: string, mutate: (scene: VillageScene) => void): Promise<void> {
  await mutateDocument(sceneDocumentId(characterId), sceneSlot(characterId), mutate);
}

/**
 * Forget the link to a villager's scene. Never the Engine chat it pointed at.
 *
 * The counterpart of `removeChatLog`, and for the same reason: the package may
 * only ever delete things it owns. Dropping the link is the whole of "forget the
 * scene", and the chat stays in the Engine with every message in it, exactly as
 * it would if the player had deleted the package.
 */
export async function removeVillageScene(characterId: string): Promise<void> {
  const documents = villagesDocuments();
  const documentId = sceneDocumentId(characterId);
  const record = await documents.getById(VILLAGES_PACKAGE_ID, documentId);
  if (!record) return;
  await documents.remove(VILLAGES_PACKAGE_ID, documentId, record.revision);
}
