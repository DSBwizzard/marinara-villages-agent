import type { SpriteManagerState } from "../../../shared/contracts/sprites.js";
import type { VillageSettings } from "../../../shared/contracts/village.js";
import type { VillageNarrationStyle } from "../rules/narration-style.js";
import type { ProgressTask } from "../rules/progress-engine.js";
import type { HomeBuildingKind } from "../rules/prompt-preset.js";
import type { VillagesTurnBeat } from "../rules/turn-beats.js";

// Villages — the shapes the server half of the package trades in.
//
// Everything the village remembers lives in Engine-owned `capability_documents`
// rows, so these types are the only contract between the store, the routes and
// the tab. Stored `data` always comes back as `unknown`, so every read runs
// through the coercion helpers before it reaches these shapes.
//
// Three layers meet in this package, and keeping them apart is what lets one
// village hold an anime ninja and a Brooklyn cop at the same time:
//
//   * the Person — the card. Portable. Owns temperament, voice, skills, values.
//   * the World  — this record. Local. Owns the setting and which venues exist.
//   * the Agenda — the derived join, Phase B.
//
// The move that makes the join work is "translate the activity, not the place":
// the card supplies the verb and the village supplies the noun. So the village
// stores the world and nothing about any particular character — the card is
// authoritative for who a villager IS, and the village caches only a name.

/** One stable desired outcome. Size controls scope/lifetime; intensity remains emotional attention.
 * Legacy tells stay readable but are excluded from Scene writing. Essential conditions are
 * separately versioned, explicitly witnessed journal facts, not generated solution steps. */
export type VillageWish = import("../../../shared/contracts/wishes.js").SocialWish;

/**
 * What a villager is after, written once when they move in and then kept.
 *
 * This is the third grounded input of a village's news, after the residents
 * themselves and the village's history: without it the writer can only say what
 * happens TO people, and with it it can say what they do about it.
 *
 * It is cached rather than derived per call for two reasons. A wish that
 * changed every part of the day would not be a wish, it would be weather; and
 * one model call at move-in is a cost the player pays once per villager instead
 * of once per part of day, forever.
 *
 * `source` records where `routineSummary` came from and nothing else reads it.
 * The Engine's own schedule wins when a character has one — it was generated
 * for that exact character and is keyed to real weekdays — so a villager who
 * already has a life in Conversation mode keeps it, and `routineSummary` here
 * is the village's own fallback for the ones who do not.
 */
export type VillageAgenda = {
  /** Exact legacy digest accepted only while the normalized routine is unchanged. */
  legacyRoutineRevision?: { previous: string; current: string };
  plannedDays?: Record<string, VillageAgendaBlock[]>;
  routineProfile?: import("../rules/owned-routine.js").RoutineProfile;
  scheduleInfluenceSnapshot?: import("../rules/owned-routine.js").InfluenceSnapshot;
  socialActivities?: import("./social-activity.js").SocialActivity[];
  /** One line about an ordinary day for them, here. */
  routineSummary: string;
  /** The village's repeating exact-time day when the Engine has no weekly schedule. */
  day: { startMinute: number; endMinute: number; venueId: string; zoneId?: string; activity: string }[];
  /** Villages' own complete weekly plan, independent of Marinara schedules. */
  week?: Record<string, VillageAgendaBlock[]>;
  /** @deprecated Legacy translation data is adopted locally and has no runtime authority. */
  scheduleWeek?: Record<string, VillageAgendaBlock[]> | null;
  /** The day already in progress never changes when a week is rewritten. */
  activeDay?: { dateKey: string; weekday: string; blocks: VillageAgendaBlock[]; scheduleInformed: boolean };
  /** A single agreed construction shift overrides the ordinary plan while it runs. */
  /** Failed generation keeps the owned routine; only deliberate retry can spend again. */
  personalizationPending?: boolean;
  /** Latest actionable generation failure; empty while work is queued or successful. */
  personalizationFailure?: string;
  /** Display-only date of the latest personalization attempt. */
  personalizationAttemptDate?: string;
  source: "native" | "village";
  /** Display-only, Read by nothing. */
  generatedAt: string;
};

export type VillageAgendaBlock = {
  essential?: boolean;
  commitmentId?: string;
  flexible?: boolean;
  startMinute: number;
  endMinute: number;
  venueId: string;
  zoneId?: string;
  activity: string;
  /** The original schedule slot, when this block was informed by one. */
  sourceTime?: string;
};

/**
 * One BLOCK of the Engine's week, translated into this village's own terms.
 *
 * One entry per block rather than one per distinct phrase, and that is the
 * whole of the fidelity rule: the Engine's week is a TIMETABLE — an hour range
 * with a sentence in it — and a translation that collapsed its five "sleeping"
 * blocks into one entry called "sleeping, 50 hours a week" has thrown the
 * timetable away. What the player asked to see is the same week, hour for hour,
 * translated into the village's own nouns.
 *
 * So the key is the SLOT, not the sentence. `day` and `time` are a COPY of the
 * Engine's own weekday and hour range, kept verbatim because they are what this
 * entry is found by — see `lookupRemap`. Neither is ever shown to anybody: they
 * exist so that the same slot in the week the schedule wrote is the slot the
 * lookup finds, and normalising them at write time would be the village editing
 * the Engine's own bookkeeping to make its own matching easier.
 *
 * `activity` is carried for the same reason and one more. It is the Engine's
 * sentence for the slot, copied exactly, and it is the only record of what the
 * village was translating — a translation read back off disk is otherwise a
 * list of empty slots with village nouns in them. It also feeds the staleness
 * digest, so an Engine week regenerated under the same Monday with different
 * hours in it re-asks rather than serving yesterday's timetable.
 *
 * `here` is the point of the whole record. The Engine writes a schedule from
 * the CARD alone and has never heard of this village, so a pilot's week says
 * "flying the Halcyon on a supply run" in a village that has no spaceship. The
 * village cannot change that — the schedule is the Engine's and is shared
 * across every chat the character appears in — so it supplies the NOUN
 * instead: same slot, same length, same status, happening here. That is the
 * "translate the verb, keep the shape" rule, made into a stored fact.
 */
export type VillageRemapMove = {
  flexible?: boolean;
  /** The Engine's weekday this block falls on, copied exactly. Half of the lookup key. */
  day: string;
  /**
   * The block's own hour range, exactly as the Engine wrote it, and the other
   * half of the lookup key.
   *
   * Matched with its whitespace removed rather than character for character, so
   * a model that copies "18:00 - 20:00" out of "18:00-20:00" still lands on the
   * block it meant. See `remapBlockKey`.
   */
  time: string;
  /** The Engine's activity for this block, copied exactly. */
  activity: string;
  /** What that same thing is, here, written to read after "Right now you are". */
  here: string;
  /**
   * Which place that happens at, as the venue's own `id`, or "" for none.
   *
   * The whole reason the translation is a record rather than a sentence. The
   * `here` phrase names the place in prose — "mending the fence down at the
   * allotments" — which is exactly what a prompt wants and exactly useless to a
   * program: nothing can ask a sentence which building it means. So the model is
   * asked for the place a SECOND time, as a number off the list of venues it was
   * given, and the number is resolved to the venue's stable id the moment the
   * answer is read.
   *
   * Resolved at WRITE time rather than resolved by name at read time, and that
   * is the point of storing an id at all: a place can be renamed or added or
   * deleted after a translation is written, and a translation that had stored
   * the NAME would silently re-point at whatever now answers to it. An id that
   * no longer matches anything is a miss, and a miss is the ordinary degrade.
   *
   * "" is a real answer rather than a broken one. A villager whose week has them
   * asleep, or walking, or doing something this village genuinely has no room
   * for has no place to be at, and a translator that was forced to pick one would
   * invent a discrepancy rather than admit to one.
   */
  venueId: string;
  zoneId?: string;
  /**
   * Which of their own wishes coloured this hour, as that wish's own `id`, or ""
   * for none.
   *
   * The same trick as `venueId` and for the same reason. The wishes are handed to
   * the translator as a numbered list beside the places, the answer names one by
   * its NUMBER, and the number is resolved to an id the moment the answer is read
   * — at WRITE time, because a wish's position in that list is not stable. The
   * list is rewritten whenever a wish is replaced, so a stored position would
   * point at whatever wish moved into the slot afterwards, and a stored name
   * would silently re-point at whatever wish later happened to read the same way.
   *
   * "" is the ordinary answer rather than a damaged one: most hours of anybody's
   * week have nothing to do with what they wish for, and the prompt asks for 0
   * rather than an invention for exactly that reason. A wish that has since been
   * fulfilled, or has aged out, leaves this pointing at an id that is no longer
   * on the list, which is an ordinary miss: the one reader this id has is the
   * debug tab naming the wish, and a miss prints nothing there rather than a
   * fault. What that hour READS as is the `here` phrase beside it, and this field
   * is only the record of whose wish bent that phrase.
   */
  wishId: string;
};

/**
 * How this villager's week happens HERE, written once per schedule.
 *
 * This is the join between the two systems made concrete, and it is a separate
 * record from the agenda on purpose. The agenda is about the PERSON — what they
 * wish, in this place — and is written once and kept. This is about the
 * ENGINE'S WEEK, and it is superseded every time that week is: the Engine
 * regenerates a character's schedule when the current Monday passes the one it
 * was generated for, so a translation carries the `weekStart` it was written
 * against and is thrown away the moment the Engine's own changes.
 *
 * `weekStart` is still the week it translates, and it is still the field the tab
 * shows, but it is no longer the key on its own. `signature` is, because a
 * Monday is not enough to notice that the ENGINE replaced the same Monday's
 * contents, or that the player rewrote the village's places or its setting — the
 * two corrections that change what a correct translation of the same week is.
 * `weekStart` is the human-readable half of the same fact; `signature` is the
 * half a string comparison can act on. See `remapSignature`.
 *
 * `routine` replaces the agenda's `routineSummary` at render time rather than
 * overwriting it. Both sentences are true facts about different things: the
 * agenda holds the Engine's own wording, which is what the player generated and
 * may still be reading in Conversation mode, and this holds the village's. Only
 * one of them can be said to a villager, the village's wins, and keeping the
 * Engine's means a village whose translation is thrown away goes straight back
 * to the sentence it had before with nothing to rewrite.
 */
export type VillageRemap = {
  /** The Monday of the week this translates, matching the Engine's own `weekStart`. */
  weekStart: string;
  moves: VillageRemapMove[];
  /** One line about an ordinary day for them here, in this village's words. */
  routine: string;
  /**
   * The digest of the question this answered: the week, its activities and
   * statuses, and the village's own places and setting. "" only when the Engine
   * wrote no `weekStart`, which is the one case the village leaves alone.
   *
   * Stored rather than recomputed because it is the same digest the village will
   * compare against tomorrow, and because a record read off disk has no other way
   * to say which question it was the answer to.
   */
  signature: string;
  /**
   * How many times the village has asked about THIS signature, counting the one
   * that produced this record.
   *
   * It exists so that an incomplete answer terminates. A move the model will
   * never copy back exactly — a phrase it keeps paraphrasing — makes the
   * translation owed again on every read, and without a count the village would
   * spend one model call a day, forever, re-learning the same nothing. Once this
   * reaches `MAX_REMAP_ATTEMPTS` the table is kept as it is, and the hours it
   * cannot explain read as the village's own default.
   *
   * 0 is a record written before this field existed, and reads as "the village
   * has not tried, as far as anyone can tell" — which is exactly the state that
   * should be allowed another try.
   */
  attempts: number;
  /** Display-only, Read by nothing. */
  generatedAt: string;
  /** Present on compact founding translations so later schedule drift can be applied locally. */
  foundingLens?: string;
};

/**
 * One block of the Engine's week, as the translation is asked about it.
 *
 * The INPUT to a translation rather than a part of one, and it lives here rather
 * than beside the translator because the debug view carries it out to the tab:
 * the field is never stored, but it does cross the wire, and everything that
 * crosses the wire is declared in one file.
 *
 * It is `NativeDayBlock` with the day it belongs to attached, and that is the
 * whole difference: the Engine's week is a map of weekday to blocks, and a
 * question about one block has to name which day's copy of it is being asked
 * about. Nothing is grouped and nothing is summed — seven copies of "sleeping"
 * are seven questions here, because they are seven slots in somebody's
 * timetable and the answer is one phrase per slot.
 */
export type RemapBlock = {
  /** The Engine's weekday this block falls on, one of `VILLAGE_WEEKDAYS`. */
  day: string;
  /** The block's hour range, exactly as the Engine wrote it. With the day, the key. */
  time: string;
  /** The Engine's own sentence for the block, verbatim. */
  activity: string;
};

/**
 * One day of somebody's week as the schedules tab draws it.
 *
 * The Engine's week is a weekly PATTERN keyed by weekday name — it holds no
 * dates at all — so a day here is a weekday plus the village's own calendar date
 * for the occurrence of it the tab is showing, and nothing joins the two on the
 * server. Walking forward from today over `VILLAGE_WEEKDAYS` is what makes "their
 * week, starting today" answerable at all: Sunday's tomorrow is Monday, whose
 * blocks are whatever the Engine wrote for a Monday, and the walk wraps so all
 * seven days come back in the only consecutive order the pattern has.
 */
export type VillageDayView = {
  /** The Engine's weekday name, one of `VILLAGE_WEEKDAYS`. */
  weekday: string;
  /** The village's own calendar date for this occurrence, e.g. "12 September". */
  dateLabel: string;
  /** Whether this is the day the listing was built on. Exactly one entry has it. */
  isToday: boolean;
  /**
   * The Engine's blocks for this weekday, joined to the stored translation.
   *
   * Empty when the Engine wrote nothing for this weekday, which is an ordinary
   * answer rather than a fault: a card with no schedule at all has seven empty
   * days, and a day the tab is showing a week ahead of a regenerated one may be
   * empty too. The tab draws an empty day as a day with nothing in it rather
   * than as a missing one.
   */
  blocks: VillageDayBlock[];
};

/**
 * The last time the village tried to translate somebody's week and could not.
 *
 * The record exists because a failed translation and a translation nobody has got
 * round to yet are the SAME record — a `remap` of null — and they are not the same
 * fact. Until 0.4.61 they were also the same SCREEN: the schedules tab said "no
 * translation yet" for both, and the only trace of a model that refused every
 * week was a warn line in a console the player is not reading. A village whose
 * translations had all failed for a week looked exactly like a village that had
 * never been asked.
 *
 * So this is the failure it is possible to act on. `at` is when it was last tried
 * (so a failure from three days ago is distinguishable from one from five minutes
 * ago) and `message` is the model host's own words where it had any, which is
 * what makes the difference between "the model has no room" and "the model
 * answered prose" readable without a log.
 *
 * Cleared by the next write that succeeds, and never cleared by a read: a
 * translation that arrives later is the whole answer to a failure, which is why
 * nothing has to be dismissed by hand.
 */
export type VillageRemapFailure = {
  /** When the village last asked and could not. */
  at: string;
  /** What went wrong, in the model host's own words where it had them. */
  message: string;
};

/** One library card the village has adopted. */
export type VillageVillager = {
  letterFontId?: string;
  identityDescription?: import("../../../shared/contracts/resident-description.js").ResidentIdentityDescription & {
    initialGenerationComplete: boolean;
  };
  signature?: import("../../../shared/helpers/resident-signature.js").ResidentSignatureImage;
  admission: import("../../../shared/helpers/resident-admission.js").ResidentAdmission;
  wishes: VillageWish[];
  agendaGeneration?: string;
  translationGeneration?: string;
  characterId: string;
  /** Card prose captured at move-in; deliberately excludes the Engine-only first message. */
  cardSnapshot: VillageVillagerCardSnapshot;
  /** Approved village-owned art, independent of the source character's sprites. */
  sprite?: VillageResidentSprite | null;
  spriteManager?: SpriteManagerState | null;
  addedAt: string;
  /**
   * What they wish for, or null for a villager who has not been written for yet.
   *
   * Null is a normal state and not a broken one. A villager who moved in while
   * the model was unreachable, and every villager who was already living here
   * when agendas were introduced, sit at null until the village next writes. It
   * is also what "write this one again" does, so the null case is the same code
   * path as the move-in case rather than a second one.
   *
   * A card that has been deleted from the library leaves an EMPTY agenda behind
   * rather than a null one: the village cannot ask a question about a character
   * it can no longer see, and a null that could never be filled would be
   * retried on every part of every day forever.
   */
  agenda: VillageAgenda | null;
  /** Schedule changes influence tomorrow's agenda, never today's. */
  ingestSchedule?: boolean;
  scheduleInfluence?: import("../rules/owned-routine.js").ScheduleInfluence;
  /**
   * How the Engine's week happens here, or null when there is nothing to say.
   *
   * Null is a NORMAL state rather than a pending one, and it means one of two
   * things that the village tells apart by looking at the schedule instead of
   * at this field: the character has no native schedule at all, so there is
   * nothing to translate and the village's own routine stands; or the Engine
   * regenerated their week and this is a week old. Both are read as "use the
   * village's own default", which is now what a villager with no translation
   * reads as — see `VILLAGE_UNTRANSLATED_ACTIVITY` for why the fallback stopped
   * being the Engine's own sentence.
   *
   * Deliberately NOT cleared when the translation is superseded. A stale
   * translation stays on the record until the village next writes, and the
   * superseded moves are simply never looked up, which means a model that is down
   * for a week costs the villagers a plainer sentence and not their day.
   */
  remap: VillageRemap | null;
  /**
   * The last attempt at a translation that came back with nothing usable, or null
   * for a villager the village has never been refused.
   *
   * Kept BESIDE `remap` rather than folded into it, because it is a fact about the
   * last QUESTION and `remap` is the last answer. A villager with a stale
   * translation and a failed rewrite has both: the old table, which is what they
   * are still living by, and the reason the new one is not here.
   */
  remapFailure: VillageRemapFailure | null;
};

export type VillageResidentSprite = {
  assetId: string;
  defaultExpressionId?: string;
  expressions: Array<{
    direction?: import("../../../shared/contracts/sprites.js").SpriteDirection;
    view: "front" | "side";
    label: string;
    filename: string;
    assetId: string;
    expressionId: string;
    name: string;
    useWhen: string;
  }>;
  framing: { mode: "full" | "half" };
};

export type VillageVillagerCardSnapshot = {
  id: string;
  revision: number;
  sourceStatus: "available" | "missing";
  name: string;
  comment: string;
  summary: string;
  tags: string[];
  systemPrompt: string;
  /** Optional for snapshots captured before authored post-history instructions. */
  postHistoryInstructions?: string;
  description: string;
  personality: string;
  scenario: string;
  backstory: string;
  appearance: string;
  exampleDialogue: string;
  /** Absent only on snapshots captured before card colors were supported. */
  nameColor?: string;
  dialogueColor?: string;
  capturedAt: string;
};

export type VillageVillagerRefreshPreview = {
  characterId: string;
  current: VillageVillagerCardSnapshot;
  proposed: VillageVillagerCardSnapshot | null;
  sourceAvailable: boolean;
  changed: boolean;
};

/**
 * The picture a place is drawn with.
 *
 * A reference rather than the bytes, which is the entire point of the shape.
 * The picture itself lives in the Engine's Global Gallery, where the player can
 * find it, tag it, file it and delete it with the same tools they use on every
 * other image the app has made. A village record that carried its own copy
 * would be a second gallery only this package can see, and its size would grow
 * by one picture per place — for a picture the Engine already knows how to
 * serve, cache and clean up.
 *
 * `ref` is the durable half and is the exact string the Engine scans package
 * documents for, so a picture a village is still using cannot be deleted out
 * from under it and a deleted picture cannot leave the village pointing at
 * nothing. `url` is the display half and is the gallery's own, not something
 * invented here. `id` rides along so a re-upload of the same picture is
 * distinguishable from the picture itself without comparing URLs.
 */
export type VillageVenueImage = {
  /** `global-gallery:<id>` — the reference the Engine guards the file by. */
  ref: string;
  /** Where the tab fetches it from. The gallery's own URL. */
  url: string;
  /** The gallery record's own id. */
  id: string;
};

/**
 * A place in the village. The name is the noun the village contributes; the
 * note says what happens there, which is what a character's own verb gets
 * translated into.
 *
 * One record for every place there is, and that is the point rather than a
 * tidiness: a house is somewhere the player and the villagers can be, and there
 * is nothing a house needs that a shop does not. Two records would mean two
 * readers for every question — where is this, can I walk into it, what is it
 * called — and two answers to one question is how a pin on the map stops
 * agreeing with the prompt. What a place IS is `building`; where it stands is
 * `x`/`y`; who is in it is `characterId`; and a place with none of those set is
 * simply somewhere the village knows about and has not drawn yet.
 *
 * A home is a place with `isPlayerHome` or a `characterId` — see `remapVenues`,
 * which is the one place that distinction is drawn, because a home is where
 * somebody is when nothing has sent them anywhere and is therefore never one of
 * the places a villager's week is translated against.
 */
/** A durable place where the player or a villager can literally be. */
export type VillageVenueFeature = {
  id: string;
  text: string;
  sourceCharacterId: string;
  locked: boolean;
  updatedAt: string;
};

export type VillageVenueTrace = {
  id: string;
  /** A short scene label, such as note, stain, open-window, or dropped-object. */
  kind: string;
  text: string;
  recipientId: string;
  createdAt: string;
  seenBy?: string[];
  /** Temporary scene details expire; ordinary unresolved traces do not. */
  expiresAt?: string;
};

export type VillageVenueClass = "residence" | "workplace" | "community" | "other";

/** One class contributes one enterable scene. The venue remains one map place. */
export type ZonePicture = {
  base: VillageVenueImage | null;
  baseline?: string;
  context?: string;
  attempted?: string;
  claim?: string;
  removed?: boolean;
  failed?: boolean;
};
export type VillageVenueSpace = {
  picture?: ZonePicture;
  freezePicture?: boolean;
  pictureRevision?: number;
  connectedTo?: string[];
  id: string;
  venueClass: VillageVenueClass;
  /** Known authored constraints, separate from the prepared interior. */
  roomSpecification?: string;
  description: string;
  image: VillageVenueImage | null;
  state: {
    condition: string;
    items: string[];
    publicFacts: string[];
    features: VillageVenueFeature[];
    traces: VillageVenueTrace[];
    updatedAt: string;
  };
};

export type VillageZoneKind = "exterior" | "public" | "shared-residence" | "private-residence" | "staff" | "restricted";
export type PrivateSpacePreparation = {
  status: "pending" | "ready" | "failed";
  mode?: "renovation";
  error?: string;
  /** Persisted before dispatch. A surviving claim requires deliberate retry. */
  claimId?: string;
  startedAt?: string;
  attempt?: number;
};
export type VillageVenueZone = VillageVenueSpace & {
  lastObserved?: { description: string; state: VillageVenueSpace["state"]; observedAt: string };
  imageInteriorKey?: string;
  access?: import("../../../shared/helpers/venue-access.js").ZoneAccessPolicy;
  accessView?: import("../../../shared/helpers/venue-access.js").ZoneAccessView;
  relationshipAccess?: boolean;
  purpose?: string;
  controllerIds?: string[];
  preparation?: PrivateSpacePreparation;
  closed?: boolean;
  name: string;
  kind: VillageZoneKind;
  ownerId?: string;
  seen?: boolean;
  initialImageAttemptedAt?: string;
  adaptationPending?: boolean;
  adaptationSourceArchiveAt?: string;
};
export type VillageZoneDraft = { preserveDescription?: boolean } & Pick<
  VillageVenueZone,
  | "id"
  | "name"
  | "kind"
  | "description"
  | "roomSpecification"
  | "venueClass"
  | "purpose"
  | "controllerIds"
  | "ownerId"
  | "connectedTo"
>;

export type VillagePrivateSpace = VillageVenueSpace & {
  lastObserved?: VillageVenueZone["lastObserved"];
  imageInteriorKey?: string;
  preparation?: PrivateSpacePreparation;
  ownerId: string;
  /** A first-entry picture is attempted once; later drawing is player controlled. */
  initialImageAttemptedAt?: string;
  adaptationPending?: boolean;
  adaptationSourceArchiveAt?: string;
};

export type VillageVenueEditProposal = {
  id: string;
  target: "shared" | "private";
  privateSpaceId?: string;
  zoneId?: string;
  ownerId: string;
  baseUpdatedAt: string;
  proposed: VillageVenueSpace & { name?: string; purpose?: string };
  requiredIds: string[];
  approvedIds: string[];
  declined: boolean;
  createdAt: string;
};

/** An active structural change occupies one of the venue's two slots. */
export type VillageVenue = {
  venueType?: string;
  access?: import("../../../shared/helpers/venue-access.js").VenueAccessState;
  accessView?: import("../../../shared/helpers/venue-access.js").VenueAccessView;
  destinations?: Record<string, { home?: string; sleep?: string; work?: string }>;
  /** Explicit layouts never synthesize absent interiors. */
  layoutVersion?: 1;
  imageContext?: { useAssignedVillagerContext: boolean; useVisualLore: boolean };
  /** Stable within one village; every literal location reference uses this id. */
  id: string;
  /** Only a completed project may expose this venue's interior and capabilities. */
  buildProjectId?: string;
  constructionStatus?: "worksite" | "complete";
  name: string;
  /** The literal form of this unique place, such as sleeping pod or converted diner. */
  form?: string;
  /** One or two mechanical roles. There is no shared venue-type catalogue. */
  classes?: VillageVenueClass[];
  spaces?: VillageVenueSpace[];
  zones?: VillageVenueZone[];
  archivedZones?: { zone: VillageVenueZone; archivedAt: string }[];
  /** Direct residence capacity, up to four people. */
  residenceCapacity?: number;
  /** The complete resident roster. The older occupancy field remains a read projection. */
  residentIds?: string[];
  /** One-use invitations backed by resident speech; older manual entries remain shared invitations. */
  usedInvitationIds?: string[];
  playerInvitations?: {
    residentId: string;
    privateSpaceId?: string;
    zoneId?: string;
    recordedAt: string;
    scope?: "shared" | "private";
    ownerId?: string;
    sourceLineId?: string;
    quote?: string;
  }[];
  /** The approach is distinct from both shared and private Residence state. */
  exteriorState?: VillageVenueSpace["state"];
  privateSpaces?: VillagePrivateSpace[];
  playerSeenShared?: boolean;
  playerSeenPublic?: boolean;
  playerSeenPrivateIds?: string[];
  archivedPrivateSpaces?: { ownerId: string; archivedAt: string; space: VillagePrivateSpace }[];
  editProposals?: VillageVenueEditProposal[];
  /** Player-approved exterior description. */
  description: string;
  category: string;
  /** Presentation data is separate from physical venue state. */
  presentation: {
    mapId: string;
    image: VillageVenueImage | null;
    x: number | null;
    y: number | null;
  };
  /** A venue may house the player or one villager, but never both. */
  occupancy: {
    playerHome: boolean;
    residentCharacterId: string | null;
    homeKind: HomeBuildingKind | null;
  };
  /** Future job integrations can add capabilities without inventing locations. */
  capabilities: string[];
  /** Only assigned workers, or the resident of a home, may edit unlocked features. */
  workerIds?: string[];
  /** Durable physical state visible to the village by default. */
  state: {
    condition: string;
    furniture: string[];
    publicFacts: string[];
    features?: VillageVenueFeature[];
    traces?: VillageVenueTrace[];
    updatedAt: string;
  };
};

/** A compact reference used anywhere a current literal location is required. */
export type VillageVenueReference = {
  venueId: string;
  zoneId?: string;
  detail: string;
};

/** A committed physical change and its evidence, attached to a Venue. */
export type VillageVenueEvent = {
  id: string;
  venueId: string;
  venueName: string;
  zoneId?: string;
  text: string;
  at: string;
  actionReceipt?: {
    submissionId: string;
    happened: boolean;
    narration: string;
    addItem?: string;
    removeItem?: string;
    traceKind?: string;
    traceText?: string;
    recipientId?: string;
    resolveTraceId?: string;
    conditionBefore?: string;
    conditionAfter?: string;
    featureId?: string;
    featureText?: string;
    publicFactBefore?: string;
    publicFactAfter?: string;
    sceneNote?: string;
    witnessIds?: string[];
    transferTo?: string;
    itemTransfer?: { itemName: string; recipientId: string };
  };
};

/** Coordinates remain fractions of the town map, never pixels. */
export type VillageVenuePosition = {
  x: number | null;
  y: number | null;
};

/** Read-only view used by the conversation drawer and map pins. */
export type VillageVenueView = {
  id: string;
  name: string;
  image: VillageVenueImage | null;
  position: VillageVenuePosition;
  condition: string;
  residentCharacterId: string | null;
  playerHome: boolean;
  homeKind: HomeBuildingKind | null;
};

/**
 * The old flat fields intentionally do not exist here. Callers must choose the
 * explicit presentation, occupancy, capability, or state boundary they need.
 */
export type VillageVenueDraft = {
  name: string;
  classes: VillageVenueClass[];
  description: string;
  category: string;
  position: VillageVenuePosition & { mapId?: string };
  occupancy: VillageVenue["occupancy"];
  capabilities: string[];
  state: VillageVenue["state"];
};

/** A home is now an occupancy fact on a venue, never a second place system. */
export type VillageResidence = {
  proposedPrivateZoneId?: string;
  venueId: string;
  characterId: string;
  status: "current" | "pending" | "moving";
  proposedVenueId: string;
  requestedAt: string;
  /** The villager can request a move, or answer the player's request. */
  requestedBy?: "player" | "villager";
  villagerDecision?: "pending" | "approved" | "denied";
  approvedAt?: string;
  completesAt?: string;
};

/** The only legal way to resolve a current literal location. */
export function isCurrentVenueId(venues: readonly VillageVenue[], venueId: unknown): venueId is string {
  return typeof venueId === "string" && venues.some((venue) => venue.id === venueId);
}

/** Resolve a current venue without rebinding by name, index, or prose. */
export function resolveCurrentVenue(venues: readonly VillageVenue[], venueId: unknown): VillageVenue | null {
  if (!isCurrentVenueId(venues, venueId)) return null;
  return venues.find((venue) => venue.id === venueId) ?? null;
}

/**
 * Someone the village's memory is about.
 *
 * Name AND id, unlike every other name the village holds, because the two do
 * different jobs and neither can be derived from the other later: the id is
 * what a private memory is matched against when a villager's prompt is built,
 * and the name is what the line says when the card behind it has been deleted.
 * An actor with a name but no id is kept rather than dropped — a deleted card
 * costs the player the join, not the memory.
 */
export type VillageBackgroundPace = "off" | "quiet" | "balanced" | "lively";

export type ResidentPlanningOpportunity = {
  id: string;
  kind: "encounter" | "routine";
  startsAt: string;
  endsAt: string;
  actorIds: string[];
  venueId: string;
  zoneId?: string;
  facts: string[];
};

export type VillageProjectPhase = "planning" | "working" | "paused" | "complete" | "cancelled";
export type VillageProjectChange = {
  classes?: VillageVenueClass[];
  capacity?: number;
  zones?: VillageZoneDraft[];
  detail: string;
};
export type VillageProjectLifecycle = {
  phase: VillageProjectPhase;
  revision: number;
  targetVenueId: string;
  change: VillageProjectChange | null;
  affectedIds: string[];
  approvals: {
    residentId: string;
    source: "conversation";
    evidenceId: string;
    scope: string;
    at: string;
  }[];
  candidates: { residentId: string; evidenceId: string; scope: string; at: string }[];
  builderId: string;
  spokenProofs: {
    lineId: string;
    sessionId: string;
    submissionId: string;
    speakerId: string;
    venueId: string;
    zoneId?: string;
    quote: string;
    at: string;
    grade?: "cited-interpretation";
    interpretationVersion?: number;
    citations?: { lineId: string; quote: string }[];
  }[];
  evidenceIds: string[];
  commandReceipts: Record<string, string>;
  baseDesignHash: string;
  changedZoneIds: string[];
  workOrder: { startsAt: string; completesAt: string; pausedAt: string; remainingMs: number } | null;
  blockedReason: string;
  completedAt: string;
};

export type VillageProject = {
  plan?: {
    capacity: number;
    form: string;
    venueType: string;
    exteriorDescription: string;
    imageContext?: { useAssignedVillagerContext: boolean; useVisualLore: boolean };
    layoutVersion: 1;
    layout: "exterior" | "common" | "private" | "both";
    spaces: VillageVenueZone[];
    privateSpaces: VillageVenueZone[];
    exteriorImage: VillageVenueImage | null;
  };

  opening?: {
    established: boolean;
    provenance: string;
    work: string;
    firstUse: string;
  };
  id: string;
  title: string;
  venueId: string;
  participantIds: string[];
  progress: number;
  status: VillageProjectPhase;
  updatedAt: string;
  kind: "new-venue" | "renovation";
  venueDraft?: {
    name: string;
    classes: VillageVenueClass[];
    description: string;
    position: { mapId?: string; x: number | null; y: number | null };
  };
  requesterCharacterId?: string;
  lifecycle?: VillageProjectLifecycle;
};

export type VillagePendingDecision = {
  id: string;
  kind: "residence" | "project" | "venue" | "departure" | "other";
  title: string;
  detail: string;
  proposedAt: string;
  sourceOpportunityId: string;
  status?: "pending" | "approved" | "denied" | "countered";
  venueDraft?: VillageVenueDraft;
  venueId?: string;
  requesterCharacterId?: string;
  requesterName?: string;
  requestQuote?: string;
  source?: "chat" | "background";
  sourceKey?: string;
};

/**
 * A memory as a reader draws it: the stored entry plus the calendar date its
 * `dayIndex` falls on.
 *
 * The date is derived rather than stored for the same reason the whole clock
 * is: the day number is the fact and the date is one of the things it means, so
 * a village whose founding stamp is restored from a backup gets its dates back
 * without a migration. Nothing is derived from `at` here either.
 */
export type VillageScenarioImprint = {
  /** A past event, if the scenario actually describes one. */
  origin: string;
  /** Stable facts approved for the present world at founding. */
  worldFacts: string[];
  /** Conditions offered to founding drafts and initial agendas only. */
  openingConditions: string[];
  /** Visual guidance for founding map and venue art only. */
  visualCues: string[];
};

export type ReturnCatchupCapture = {
  at: string;
  memoryRevision: number;
  world: Pick<
    VillageState,
    | "seed"
    | "setupAt"
    | "foundedAt"
    | "timeZone"
    | "name"
    | "setting"
    | "worldName"
    | "worldFacts"
    | "playerBackground"
    | "playerPersonaId"
    | "playerPersonaName"
    | "playerPersonaIdentity"
    | "playerPersonaMissing"
    | "villagers"
    | "venues"
    | "residences"
    | "projects"
    | "relationshipContext"
    | "opening"
  >;
};

export type VillageState = {
  memories: import("./memories.js").MemoryCollection;
  memoryScenes: Record<string, import("./memories.js").MemorySceneState>;
  memoryReceipts: Record<string, import("./wish-check-model.js").ExchangeEffectReceipt>;
  socialContractVersion: 2;
  socialMailOutbox?: import("./social-mail.js").SocialMailOutbox[];
  socialPublications?: Record<string, true>;
  eventAttempts?: import("../rules/event-attempts.js").EventAttemptLedger;
  /** Optional return batch authority; old worlds start without an active batch. */
  returnCatchup?: {
    capture?: ReturnCatchupCapture;
    batch?: {
      id: string;
      status: "queued" | "running" | "failed" | "recovering" | "completed" | "cancelled";
      from?: string;
      until?: string;
      reason?: string;
      opportunities?: ResidentPlanningOpportunity[];
      records?: {
        opportunityId: string;
        status: "pending" | "queued" | "settling" | "settled" | "rejected";
        outcome?: unknown;
        error?: string;
      }[];
    };
  };
  socialClarifications?: { id: string; actorIds: string[]; text: string; at: string }[];
  opening?: import("../rules/opening-project.js").OpeningRecord;
  semanticRequestReceipts?: Record<string, string>;
  semanticContinuations?: Record<string, import("./exchange-model.js").ExchangeDomain[]>;
  semanticStartingTies?: {
    preparedAt?: string;
    sourceHash: string;
    stateHash?: string;
    ties: import("./relationship-types.js").StartingTie[];
    conflicts?: { actorIds: string[]; question: string; sourceIds: string[] }[];
    sources?: import("./relationship-types.js").SocialEvidence[];
  };
  /** Prepared residents awaiting their one-time, finite post-reset Wish attempt. */
  exchangeReceipts: Record<string, import("./wish-check-model.js").ExchangeEffectReceipt>;
  noticeSequence: number;
  dismissedNoticeIds: string[];
  relationshipContext?: import("./relationship-types.js").RelationshipState;
  socialOutbox?: import("./social-outbox-model.js").SocialOutboxEntry[];
  backgroundReceipts: Record<string, string>;
  /** Private expiry holds owned by unfinished Scenes or their retained final effects. */
  version: 6;
  /** Shared evidence engine used by Wishes. */
  progressEngineVersion: 1;
  name: string;
  /** Per-village writing choices for live Scenes. */
  narrationStyle: VillageNarrationStyle;
  characterSpeechColors: boolean;
  sendOnEnter: boolean;
  spriteCardFlipEnabled: boolean;
  /**
   * The one line of world the player wrote, e.g. "a rain-soaked harbour town".
   * Empty means the village has no place yet, and the setting and venue blocks
   * in the prompt render nothing at all.
   */
  setting: string;
  /** The player's reason for starting this village, kept apart from its visual setting. */
  foundingReason: string;
  worldName: string;
  foundingDetails: string;
  foundingGuidance: string;
  /** Founding-only narrative role; null preserves legacy framing. */
  playerBackground: VillagePlayerBackground | null;
  /** The reviewed starting point. Historical after setup; never a live plot instruction. */
  scenarioImprint: VillageScenarioImprint | null;
  /** Editable facts that still hold in the present village. */
  worldFacts: string[];
  /** Internal admission policy; older founded saves retain their original limits. */
  /** Engine lorebook links; entry content is always read live. */
  selectedLorebookIds: string[];
  sceneryArtStyle: string;
  sceneryStyleProfileId?: string | null;
  automaticZonePictures?: boolean;
  zonePictureEpoch?: number;
  personalizeVenueImagesByDefault: boolean;
  useVisualLoreByDefault: boolean;
  loreTokenBudget: number;
  /**
   * Every place the village has: the houses people live in, the player's own
   * home, and everywhere anyone goes.
   *
   * One list rather than two. There used to be a `homes` array beside this one,
   * and the two were the same thing with different fields — which is what made
   * "can I walk into it?" a question with two answers. A house answers yes, and
   * so does a mill.
   */
  venues: VillageVenue[];
  /** Stable building kinds have labels the player can adapt to the village's world. */
  homeBuildingNames: Record<HomeBuildingKind, string>;
  /** Physical-change receipts retain the Venue name even after deletion. */
  venueEvents: VillageVenueEvent[];
  /** Exact completed visit transcript retention. Missing older settings mean forever. */
  visitRetention: { mode: "forever" | "count" | "days"; value: number };
  /** One-time archive migration marker, so a player-deleted memory stays deleted. */
  /** A pending residence move is explicit and requires player approval. */
  residences: VillageResidence[];
  /**
   * When the village finished being set up by the founding flow. Empty means
   * "not founded yet", which is what makes the tab open the wizard.
   *
   * Deliberately NOT called `foundedAt`: that field is the derived clock's
   * origin and is stamped by the first write of any kind, including one the
   * player never made deliberately. This one is stamped only by the setup
   * route, so it answers "did the player finish setting this village up?" — a
   * different question with a different answer.
   */
  setupAt: string;
  /** Only first founding waits for this durable preparation marker; absent legacy villages are ready. */
  foundingPreparation?: {
    status: "pending" | "failed" | "ready";
    completedIds: string[];
    tasksVersion?: 1;
    tasks?: import("../../../shared/contracts/founding-tasks.js").FoundingResidentTasks;
    retryActions?: string[];
    selectedTasks?: string[];
    currentTask?: "routine" | "wish";
    venueDetailsSeeded?: boolean;
    currentId: string;
    error: string;
    phase?: "venues" | "private-spaces" | "residents";
    currentVenueId?: string;
    currentZoneId?: string;
    privateSpacesReady?: number;
    privateSpacesTotal?: number;
    stage?: "reading" | "lore" | "resolving" | "queued" | "model" | "validating" | "applying" | "saving";
    stageStartedAt?: string;
    attempt?: number;
    loreEntryCount?: number;
    modelName?: string;
  } | null;
  /**
   * When the village began keeping its own time. Empty until the first write,
   * because merely opening the tab must not create a document.
   */
  foundedAt: string;
  /** Weather flavour. Random at founding so two villages of the same age differ. */
  seed: string;
  /** Durable high-water mark for deterministic reconciliation. */
  simulatedThrough: string;
  /** Device timezone observed by the last reconciliation. */
  lastKnownTimeZone: string;
  /** Calendar authority selected once at founding. */
  timeZone: string;
  clock: import("../../../shared/contracts/clock.js").VillageClockRecord | null;
  /** Optional resident planning and Wish pace; deterministic life always advances. */
  backgroundPace: VillageBackgroundPace;
  /** Last local calendar day on which resident planning committed. */
  lastPlanningDate: string;
  planningUsage: { dateKey: string; count: number };
  processedActionIds: string[];
  projects: VillageProject[];
  /** Versioned evidence-backed task records; empty for villages that have not adopted the Progress Engine. */
  wishFollowing?: Record<string, boolean>;
  progressTasks: ProgressTask[];
  /** Ordinary scene props are visible but cannot become project stock. */
  /** Finite resident source yields already transferred into a project. */
  pendingDecisions: VillagePendingDecision[];
  villagers: VillageVillager[];
  /** Writing styles retained when residents leave, keyed by character ID. */
  formerLetterFonts?: Record<string, string>;
  /**
   * The village's one prompt box: what a villager here knows.
   *
   * Where the village is, who lives here and what has been happening lately,
   * written as the macros that render those blocks. Editable — a village may want
   * its context in a different order, or not at all — and
   * empty means "use the shipped default", so a stored value is never mistaken
   * for "they know nothing".
   *
   * It used to be the second of two boxes. The first, "how everyone talks", is
   * gone: HOW a villager talks is the player's own Engine preset, chosen in the
   * narration settings, and a package that also kept a paragraph of rules about
   * register had two answers to one question and no way to say which won. What a
   * villager KNOWS is not in any preset and cannot be, which is why this one
   * stayed.
   */
  promptKnowledge: string;
  /**
   * Who the player is, as the prompt layer consumes it: the resolved pair.
   *
   * These two stopped being a box the player types into. A village no longer
   * keeps its own answer to "who are you" — it keeps a Persona, and these are
   * filled from that Persona's cached copy at the moment the village writes it.
   * They are empty together, which is a village with nothing linked, and the
   * renderer answers an empty pair with "the player". Nothing persists them, so
   * a hand-edited record cannot smuggle a name past the Persona's own.
   */
  playerName: string;
  playerDescription: string;
  /**
   * The Persona the player chose as who they are here, or "" for none.
   *
   * An id, and the only part of the identity that is a link rather than a copy.
   * The three cached fields below exist so that a chat turn never has to read the
   * Engine's Persona library — that read used to happen on every single turn —
   * and so that a Persona deleted out of the library costs the player its prose
   * and not its name. The copy is refreshed by `refreshPlayerPersona`, which the
   * tab asks for when it opens and when settings open, never on a chat send.
   */
  playerPersonaId: string;
  /** The Persona's cached name. Empty only when nothing is linked. */
  playerPersonaName: string;
  /** The Persona's cached prose, as prompt text. Empty when it says nothing. */
  playerPersonaIdentity: string;
  /**
   * True when the id above no longer resolves in the Engine's library.
   *
   * The cached name and prose are deliberately KEPT when this flips true: the
   * villagers go on believing what they were told about the player, which is
   * what the person they have been chatting with all week has earned. Only the
   * id is broken, and only the tab has to say so.
   */
  playerPersonaMissing: boolean;
  maps: VillageMap[];
};

/**
 * How a picture that is not the map's shape is made to fit it, named after the
 * CSS `object-fit` keyword it is drawn with so the tab renders the choice
 * instead of translating it.
 */
export type TownMapFit = "cover" | "stretch" | "contain";

/**
 * Where the map frame is looking.
 *
 * The frame is a fixed shape and a picture the player picked is very unlikely
 * to be that shape, so the picture is not resized to fit — the frame is moved
 * over the picture instead. The framing is STORED rather than baked in: the
 * picture itself is kept whole, so a crop can be redone later without going
 * back to the file, and a village backup carries four numbers rather than a
 * second copy of the image.
 */
export type VillageTownMapView = {
  fit: TownMapFit;
  /** 0..100, left to right: the point of the picture held still in the frame. */
  focusX: number;
  /** 0..100, top to bottom. */
  focusY: number;
  /** How far the picture is magnified inside the frame. Never below 1. */
  zoom: number;
};

/**
 * Where a villager is standing, as the conversation drawer draws it.
 *
 * The resolved end of the join the translation only half makes: the remap says
 * which venue id an activity belongs to, and this is that id turned back into a
 * place with a picture. A copy rather than the venue itself because the drawer
 * reads it and never writes it, and because a conversation is answered on every
 * turn — carrying the venue's `note` out on each of those would be carrying the
 * prompt's business into the view.
 *
 * Null means "not anywhere in particular", which is the ordinary state rather
 * than an error: a villager with no week, or a week the village has not
 * translated since it learned about places, or an hour that happens nowhere this
 * village has a name for. All three draw the same thing, and none of them is
 * worth telling the player apart.
 */
export type VillagePlaceView = {
  id: string;
  zoneId?: string;
  zoneName?: string;
  name: string;
  /** Null until somebody gives that place a picture. A place with no picture is ordinary. */
  image: VillageVenueImage | null;
  /**
   * Whether this place is one of the village's own venues or somebody's home.
   *
   * Carried rather than inferred from the id, because the two are drawn
   * differently and only the server can see the ids they came from. A venue is a
   * destination — somewhere a villager goes and the player can point at — and a
   * home is where somebody is when they are nowhere else, which is the default
   * every untranslated hour lands on. The label a reader sees is chosen in the
   * tab from this, so the wording lives beside the drawing rather than here.
   *
   * Both are places, and both can be walked into; this says which of the two
   * SENTENCES to print, not which of two kinds of thing this is.
   */
  kind: "venue" | "home";
};

export type VillageChatRole = "user" | "assistant";

/**
 * How the player uses a speech turn within a Scene. The mode changes
 * the framing of this turn while preserving the same session and history.
 *
 * What differs is what the villager has been asked to do with this one turn.
 * `chat` is an ordinary exchange, where a villager may volunteer something, may
 * let a wish show as its tell, and may change the subject. `ask` is a question
 * being put to them, which they answer directly and briefly. `fulfill` is the
 * player saying they have done something for them, which the villager values
 * rather than judges.
 *
 * Venue submissions store the mode for replay. Fulfill can be requested by
 * the player, but the server judges the claim before generating the reply.
 */
export type VillageChatMode = "chat" | "ask" | "fulfill";

export type VillageChatMessage = {
  role: VillageChatRole;
  content: string;
  at: string;
  id?: string;
  /**
   * The registers of this message's own paragraphs, when it has any.
   *
   * Absent on every ordinary turn and absent on everything already stored, and
   * that absence is meaningful rather than lazy: a message with no beats is read
   * by SHAPE, which is what the tab has always done, so the field only appears
   * on an answer that said something the shape cannot describe — a remark out of
   * the side of somebody's mouth, or something said to one person only.
   *
   * It is presentation and never content. `content` is the same words with the
   * tags taken off, so the six other readers of a transcript are reading prose,
   * and a reader that has never heard of this field loses nothing but the
   * register.
   */
  beats?: VillagesTurnBeat[];
  /**
   * Who said it, when it was not the villager whose transcript this is.
   *
   * A transcript is one villager and the player, so `role` is enough to say who
   * a line belongs to and this is absent on every line already stored. A ROOM is
   * three or more people, and the same room is written into every one of their
   * transcripts — so a line of Anton's has to keep saying it was Anton's when it
   * is read out of Mari's copy, or the village would hand Mari her own words
   * back in a neighbour's voice.
   *
   * A character id, and never `""`: the player's own lines are already `role:
   * "user"`, and an id that meant "not this villager" as well as "not a villager"
   * would be two answers spelled the same way.
   */
  speakerId?: string;
  /**
   * What that speaker is called, for the prompts that print a line as prose.
   *
   * Carried rather than looked up, for the same reason a room line carries its
   * name: a villager who has since been evicted from the village still has to be
   * nameable in a conversation they were part of, and a transcript is read on
   * turns where nothing has gone to the library to ask.
   */
  speakerName?: string;
};

/** A card the picker offers, flattened for the tab. */
export type VillageCatalogEntry = {
  id: string;
  name: string;
  comment: string;
  summary: string;
  tags: string[];
  inVillage: boolean;
};

/**
 * One Persona, as the village reads it.
 *
 * `identity` is the whole of what the Persona says about the player, already
 * assembled into the text a villager is handed: the description, then whatever
 * else the Persona carries. The catalog sends only names, portraits, and blurbs;
 * the Founding preview reads the chosen Persona's authored fields separately.
 *
 * The picture does travel, and costs nothing to read: the Engine hands this row
 * over already decoded, so the avatar is sitting in the same object the name came
 * out of. Taking it here is what lets the picker draw a face without one request
 * per Persona.
 */
export type VillagePersona = {
  id: string;
  /** What the villagers call them: the Conversation display name when set, else the Persona's name. */
  name: string;
  /** One line for the picker. */
  summary: string;
  /** Authored fields for the selected Persona preview. */
  description: string;
  appearance: string;
  personality: string;
  backstory: string;
  /** Everything the Persona says about itself, as prompt text. Empty when it says nothing. */
  identity: string;
  /** True for the Persona the Engine itself has selected, which the picker offers first. */
  isActive: boolean;
  /** The Persona's portrait, or null when it has none. */
  avatarPath: string | null;
  /** The portrait's framing, in the Engine's own shape, or null. Passed through untouched. */
  avatarCrop: unknown;
};

/** A Persona as the picker shows it: enough to choose by, and nothing else. */
export type VillagePersonaEntry = Pick<
  VillagePersona,
  "id" | "name" | "summary" | "isActive" | "avatarPath" | "avatarCrop"
>;

/** Structured fields read only for the selected Persona. */
export type VillagePersonaPreview = Pick<
  VillagePersona,
  "id" | "name" | "description" | "appearance" | "personality" | "backstory" | "avatarPath" | "avatarCrop"
>;

/** Community framing chosen at founding, separate from Persona identity. */
export type VillagePlayerBackground = string;

/**
 * Who the player is: the Persona's cached name and prose, read straight off the
 * village record.
 *
 * Nothing is fetched to build this, and that is the whole point of the cache
 * behind it — this is read on every chat turn, and a version that went to the
 * Engine's Persona library each time put a library read in front of every
 * message the player sent.
 */
export type VillagePlayerIdentity = {
  /** The name the villagers use. Empty means the village says "the player". */
  name: string;
  description: string;
  /** The Persona this came from, or "" when none is linked. */
  personaId: string;
  /** True when the id is linked but no longer resolves. The name and prose above survive it. */
  missing: boolean;
};

/** A villager as the tab renders it: live card fields where they exist, cached name otherwise. */
export type VillageVillagerView = {
  letterFontId?: string;
  identityDescription?: import("../../../shared/contracts/resident-description.js").ResidentIdentityDescription;
  signature?: import("../../../shared/helpers/resident-signature.js").ResidentSignatureImage;
  signatureFallback?: import("../../../shared/helpers/resident-signature.js").ResidentSignature;
  characterId: string;
  nameColor: string;
  dialogueColor: string;
  sprite:
    | (VillageResidentSprite & {
        images: Array<{
          view: "front" | "side";
          label: string;
          url: string;
          expressionId?: string;
          isDefault?: boolean;
        }>;
      })
    | null;
  name: string;
  summary: string;
  tags: string[];
  /** True when the card behind this villager is gone from the library. */
  missing: boolean;
  /**
   * Where this villager is standing right now, or null when the village cannot
   * place them.
   *
   * The same join the drawer's own plate draws, read off the same one schedule
   * read the poll already performs, so the pin on the map and the name over the
   * conversation are one answer rather than two that agree by luck. Null is
   * ordinary: a villager with no translated week and no home on the map has
   * nowhere to be pointed at, and draws no pin.
   *
   * The position that goes with it is NOT carried here. The tab already holds
   * every place and its coordinates in `settings.venues`, so the pin is drawn by
   * looking this up in a list it has — see `MapPin` in the tab.
   */
  place: VillagePlaceView | null;
};

/**
 * Everything the tab needs to edit the village's prompt behaviour: the value of
 * the prompt box, the shipped default to compare against and reset to, and the
 * limits and macro list so the tab never has to restate a number the server
 * owns.
 *
 * The box and its own default travel together because they are only meaningful
 * together: a restore button whose target belonged to another box is how a player
 * loses a paragraph of their own writing.
 *
 * Venue writing style lives on the village record and travels on `/narration`.
 * This snapshot view stays focused on the village's world context and knowledge.
 */
export type VillageSettingsView = VillageSettings;

/**
 * The village as the tab draws it. Every field here except `name` and `setting`
 * is derived at read time and never stored, so the moment cannot drift out of
 * step with the clock.
 */
export type VillageMomentView = {
  name: string;
  setting: string;
  /** e.g. "11 September". */
  dateLabel: string;
  /** Real weekday name — also the key a native character schedule is looked up by. */
  weekday: string;
  season: string;
  /** Atmospheric day phase, never a simulation or persistence key. */
  dayPhase: string;
  instant: string;
  localTime: string;
  minuteOfDay: number;
  timeZone: string;
  hour: number;
  minute: number;
  weather: string;
  /** Whole days since the village was founded; 0 on the founding day. */
  dayIndex: number;
  nextTransitionAt: string;
};

type ClientVisibleSnapshot<T extends import("../../../shared/contracts/village.js").VillageSnapshot> = T;

export type VillageSnapshot = ClientVisibleSnapshot<{
  sceneChanges?: { sceneId: string; revision: string };
  sceneVenue?: { sceneId: string; venue: VillageSettingsView["venues"][number] };
  opening?: import("../../../shared/contracts/opening.js").OpeningView;
  clock?: import("../../../shared/contracts/clock.js").VillageClockView;
  relationshipStartingPending?: boolean;
  backgroundWork: import("./background-model.js").BackgroundSummary[];
  status: "ready";
  progressEngineVersion: 1;
  foundingPreparation: NonNullable<VillageState["foundingPreparation"]> | null;
  village: VillageMomentView;
  venueRequests: VillagePendingDecision[];
  projects: import("../../../shared/contracts/village.js").BuildProject[];
  residences: VillageResidence[];
  /** Newest first, so the window on the map opens on what just happened. */
  villagers: VillageVillagerView[];
  /**
   * True once the village has been founded, which is what tells the tab to draw
   * the village rather than the setup wizard. Derived, never stored directly: a
   * village that already has places or villagers counts as founded, so an
   * install made before this field existed is not dropped into a wizard.
   */
  isFounded: boolean;
  settings: VillageSettingsView;
}>;

/**
 * One villager's wishes, as the debug listing draws them.
 *
 * A separate view rather than a field on `VillageVillagerView`, for the reason
 * the story is a separate route rather than a field on the snapshot: an agenda
 * is a model answer the player can delete, and nothing in the village acts on it
 * between the moment it is written and the next part of the day.
 *
 * `agenda` is null exactly when the villager has not been written for yet, which
 * is what makes the debug list able to say "not yet" rather than showing a
 * villager who simply wants nothing.
 *
 * The translation travels on this view rather than on a route of its own, which
 * is a deliberate exception to "one route per thing". A translation is not
 * interesting by itself: it is interesting against the week it was written from,
 * and the two together are the whole answer to "why does this villager's prompt
 * say that". Every field below exists so a human can see the join.
 */
export type VillageAgendaView = {
  canInterpretSchedule?: boolean;
  effectiveDays?: Record<string, VillageAgendaBlock[]>;
  characterId: string;
  name: string;
  /**
   * Whether this villager's card is gone from the library.
   *
   * Always false when the library could not be read at all — see
   * `weekUnreadable`. "Missing" is a claim about the player's cards, and a
   * reader that never saw them is not entitled to make it.
   */
  missing: boolean;
  /**
   * Whether the character library could not be read, so this villager's week is
   * UNKNOWN rather than absent.
   *
   * This field exists because the schedules listing used to have one way to say
   * "there is nothing here for this villager", and it said it in the player's own
   * terms: your card has no week on it, go and set one on the Engine's schedule
   * screen. That is the right sentence for a card that genuinely has no week, and
   * it was being shown to a player whose cards were fully scheduled — because the
   * reader was calling a parser the runtime host does not offer and catching its
   * own TypeError as "this card has no schedule". A week that could not be read
   * and a week that does not exist need different sentences, because only one of
   * them is the player's to fix.
   */
  weekUnreadable: boolean;
  addedAt: string;
  agenda: VillageAgenda | null;
  ingestSchedule: boolean;
  scheduleInfluence?: import("../rules/owned-routine.js").ScheduleInfluence;
  nativeSchedule: {
    weekStart: string;
    days: Record<string, { time: string; activity: string }[]>;
  } | null;
  /**
   * How this villager's week happens here, or null when the village has not
   * translated it — no native schedule, or the Engine has regenerated the week
   * and the village has not caught up yet.
   */
  remap: VillageRemap | null;
  /**
   * The Engine's whole week in order from today, each day of it joined to the
   * stored translation.
   *
   * Always seven entries, always in order, always with today first — a listing
   * whose length depends on whether the Engine has written a week is a listing
   * the tab has to reason about, and the question this answers is "what does their
   * week look like from here". Seven rather than a few days ahead because the
   * Engine's week is a pattern rather than a calendar: a window was this listing
   * deciding which of somebody's days were worth printing, and a card whose only
   * hours were at the weekend then read as an empty card. A villager with no week
   * at all gets seven days with no blocks in them, which the tab draws as seven
   * empty days rather than as anything missing: there is nothing to show, and
   * showing nothing is the honest render of that.
   */
  days: VillageDayView[];
  /**
   * The Engine's `weekStart` for the week these days come from, which is also
   * half the key the translation is invalidated by. Shown so "this translation
   * is a week old" is visible rather than inferred from a pair of dates. Empty
   * when the Engine is keeping no week for this character.
   */
  weekStart: string;
  /**
   * Whether the village still wants to write this translation again.
   *
   * The same answer `remapNeedsWriting` gives the backfill, so the tab cannot
   * disagree with the code about whether a translation is due. False when the
   * Engine is keeping no week at all, which is not a translation being out of
   * date — it is nothing to translate.
   */
  stale: boolean;
  /**
   * How many of the hours the translation was ASKED about have no move of their
   * own.
   *
   * The number the tab needs to tell a whole translation from a half one. The
   * retry budget is capped, so a week a model answered badly is kept as it is
   * rather than chased forever, and until 0.4.61 that settled-for table was
   * indistinguishable from a good one on screen: `stale` is false once the village
   * has given up, so there was no badge, and the footer under the table is only
   * drawn for a translation with no moves at all. A week missing eleven hours read
   * as a finished translation in which eleven hours happened to be spent at home.
   *
   * Counted over `remapBlockKeys`, which is the capped list the prompt actually
   * asked about, so this can reach zero and mean it. Zero is the ordinary answer.
   */
  missingMoves: number;
  /**
   * The last attempt at this translation that came back with nothing usable, or
   * null when the village has not been refused.
   *
   * Existing so that the two ways a villager can have no translation are
   * distinguishable on the panel: waiting for the next part of the day, and having
   * been turned down by the model on this one and every one before it.
   */
  remapFailure: VillageRemapFailure | null;
  /**
   * What an hour with no translation reads as, in the village's own words.
   *
   * It is here because the tab has to be able to finish a sentence the server
   * starts. Every activity the translation missed appears on this listing marked
   * as untouched, and "untouched" on its own does not tell a player what the
   * villager will do with that hour — which is the exact thing this feature
   * exists to change. A player reading a miss has two possibilities in mind and
   * only one of them is true: the villager keeps the Engine's sentence, or the
   * village substitutes its own default. It used to be the first, and it is now
   * the second, and the difference is not one a reader can infer from a list of
   * activities.
   *
   * Sent from the one place that decides it rather than written into the tab,
   * because a copy in the tab would be a second definition of what an
   * untranslated hour means, and the two would drift the first time anybody
   * tuned the wording.
   */
  fallback: string;
  /**
   * The exact messages the translation WOULD BE written from, rebuilt on every
   * read.
   *
   * This is the point of the whole view. The translation prompt is the part of
   * this feature that is a matter of taste rather than of correctness, and the
   * only way to argue with it is to read it. Rebuilt rather than stored, because
   * a stored copy is a copy that can disagree with what was sent, and a debug
   * view showing something other than the prompt is worse than no debug view.
   *
   * It is always rendered from the week the Engine is keeping NOW, so a stored
   * translation older than that was written by a different prompt — which is
   * what `stale` is for, and why both are shown together.
   *
   * null when the villager has no native schedule, since there is then no week
   * to translate and no prompt to show.
   */
  remapPrompt: VillagePromptMessage[] | null;
  /**
   * The signature the village is asking this villager's translation to answer
   * for RIGHT NOW, computed on every read from the live week, the live setting
   * and the live list of places.
   *
   * It is here so that `stale` can be seen rather than trusted. A stale badge is
   * a comparison between a stored signature and a live one, and a comparison a
   * player cannot inspect is a comparison they cannot argue with: a translation
   * that reads as out of date with an unchanged week and unchanged places is
   * either a bug or something the player has forgotten they changed. Empty when
   * there is no week to answer for.
   */
  signature: string;
};

/**
 * One block of somebody's day, said the way it happens here.
 *
 * The whole of the fidelity the weave rests on. A translation is a lookup table
 * keyed by `day|time`, and the hours live only in the Engine's raw week, so a
 * plan is the join of that table back onto one day's blocks. One entry per block
 * the Engine wrote, in the order it wrote them, with the block's own hour range
 * kept as written.
 *
 * Deliberately NOT grouped into mornings and afternoons, and deliberately not a
 * summary. The rule the village works to is that a card with a distinct activity
 * in every hour of the day gives that villager a distinct hour in the village,
 * and any grouping here would be the village deciding which of somebody's hours
 * are the same hour.
 *
 * `activity` is the ENGINE's string and `here` is the village's, carried side by
 * side for the same reason a `VillageRemapMove` carries both: the first is the
 * key the second was found by, and a reader that cannot see the input beside the
 * output has no way to tell a bad translation from a stale schedule.
 */
export type VillageDayBlock = {
  zoneId?: string;
  flexible?: boolean;
  commitmentId?: string;
  /** The block's hour range, exactly as the Engine wrote it: "06:00-08:00". */
  time: string;
  /** The Engine's own activity string, verbatim. Shown to nobody but the schedule tab. */
  activity: string;
  /** What that same block reads as here, or the village's own default. */
  here: string;
  /**
   * Whether the village had words for this block.
   *
   * Carried rather than derived from `here`, because "at home" is a legitimate
   * translation as well as the default, and the two mean opposite things to a
   * reader checking the join: one says the village understood, and the other says
   * it did not.
   */
  translated: boolean;
  /** The place the village puts this block at, as a venue id, or "" for nowhere. */
  venueId: string;
  /**
   * The wish this hour was translated FOR, as the id of a wish on the villager's
   * own agenda, or "" for the ordinary answer.
   *
   * Copied out to the panel rather than left on the move it came from, because
   * the tab draws HOURS and a wish that bent one of them is only checkable
   * beside the hour it bent: a row whose `here` phrase has nothing to do with the
   * wish named on it is the one failure this can catch, and neither half of the
   * pair can show that alone. It is an id and not a name for the reason
   * `VillageRemapMove.wishId` gives — a stored name would be a copy of a wish
   * that may since have been answered and replaced. An id matching nothing on
   * the agenda is an ordinary miss, and the panel then says nothing about a wish
   * rather than printing an id nobody can read.
   */
  wishId: string;
  /** Whether this is the block the hour asked for falls in. */
  current: boolean;
};

/**
 * One message of a prompt, as the debug listing shows it.
 *
 * Only ever produced for display. The real call builds its messages with the
 * Engine's own type, and this exists so that a package type never has to carry
 * that import out to the client.
 */
export type VillagePromptMessage = {
  role: "system" | "user";
  content: string;
};

export type VillageMap = {
  id: string;
  name: string;
  artwork: VillageVenueImage;
  width: number;
  height: number;
  view: VillageTownMapView;
  revision: number;
};
