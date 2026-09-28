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

import type { HomeBuildingKind, VillageBuildingOption, VillagePresetMacro } from "./prompt-preset.js";
import type { VillageNarrationStyle } from "./narration-style.js";
import type { VillagesTurnBeat } from "./turn-beats.js";

/**
 * One thing a villager privately wishes for, and the small way it shows.
 *
 * `wish` is the motivation and `tell` is the surface — the ordinary thing
 * somebody standing nearby would actually notice. Both are needed and they are
 * deliberately different fields: a wish with no tell is invisible and produces
 * nothing the village can write about, and a wish that is only a wish is the
 * shape that turns a villager into somebody handing out tasks.
 *
 * `intensity` is 1-3 and does three jobs that turn out to be the same job. It
 * fixes how much of the day the wish is on the villager's mind, it orders how
 * much of the writing room the wish gets, and it is how much the wish MATTERS —
 * so when a wish is answered, its intensity becomes the weight of the favour the
 * villager remembers. It is a number rather than a word so the renderer never
 * has to interpret prose the model wrote.
 *
 * The first job is the one that was claimed here long before it was true: the
 * number was stored, judged, weighted and then dropped at the last step, so a
 * wish the generator had been told to keep small arrived at the villager as
 * though it were large. See `renderWishesBlock`, which orders by it and says it
 * in words, and `wishWeightWords`, which says the same thing to the narrator.
 */
export type VillageWish = {
  /**
   * Stable within one save, and the handle a wish is answered BY.
   *
   * A wish is matched by id and never by its position, because the list it
   * lives in is rewritten whenever a wish is replaced and a position would
   * silently point at a different wish afterwards. It is also the only thing
   * the villager is allowed to name when they are told which wish a player has
   * satisfied, so the naming cannot drift into prose the village has to read.
   */
  id: string;
  wish: string;
  /** 1-3: how much it is on their mind, and how much it matters when it is answered. */
  intensity: number;
  /** What somebody else could notice without being told. */
  tell: string;
  /**
   * When the village wrote this, ISO, or "" when nothing readable was stored.
   *
   * Stored rather than derived, unlike the village's clock, because a wish's age
   * is the one thing about it that cannot be worked out afterwards: nothing else
   * in the package records when the question was asked, and the answer matters
   * to a player looking at a wish that has been sitting there for days.
   */
  addedAt: string;
  /**
   * The instant this dies of age, ISO, or "" when it never does.
   *
   * Rolled ONCE, from the wish's own id, at the moment the wish is written — see
   * `wishLifetimeDays`. A wish is not a task with a deadline, so the date is
   * never shown to the villager and never mentioned in a prompt: it exists so
   * that a wish can go quiet on its own, and so that the debug tab can say which
   * day the wish it is looking at will be gone.
   *
   * An UNREADABLE one never expires, which is the safe direction in two senses at
   * once: every wish written before this field existed keeps behaving exactly as
   * it did, and a hand-edited document cannot make somebody's wish vanish by
   * accident. An undated wish still leaves the list the other two ways —
   * fulfilled, or judged to have lapsed.
   */
  expiresAt: string;
};

/** A confirmed wish outcome, kept separately from the prose memory about it. */
export type VillageCompletedWish = {
  wish: VillageWish;
  fulfilledAt: string;
  memoryId: string;
};

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
  wishes: VillageWish[];
  /** One line about an ordinary day for them, here. */
  routineSummary: string;
  /** The village's repeating exact-time day when the Engine has no weekly schedule. */
  day: { startMinute: number; endMinute: number; venueId: string; activity: string }[];
  /** Villages' own complete weekly plan, independent of Marinara schedules. */
  week?: Record<string, VillageAgendaBlock[]>;
  /** A village-local interpretation of an optional Marinara schedule. */
  scheduleWeek?: Record<string, VillageAgendaBlock[]> | null;
  /** The day already in progress never changes when a week is rewritten. */
  activeDay?: { dateKey: string; weekday: string; blocks: VillageAgendaBlock[]; scheduleInformed: boolean };
  /** A failed model call leaves the working week in place and retries later. */
  personalizationPending?: boolean;
  /** Latest actionable generation failure; empty while work is queued or successful. */
  personalizationFailure?: string;
  /** Local date of the last model attempt, used to pace automatic retries. */
  personalizationAttemptDate?: string;
  source: "native" | "village";
  /** Display-only, exactly like `VillageChronicleEntry.at`. Read by nothing. */
  generatedAt: string;
};

export type VillageAgendaBlock = {
  startMinute: number;
  endMinute: number;
  venueId: string;
  activity: string;
  reason: string;
  status: "online" | "idle" | "dnd" | "offline";
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
  /** Display-only, exactly like `VillageChronicleEntry.at`. Read by nothing. */
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
  /** The availability the Engine gave this block, or "" when it gave none. */
  status: string;
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
  characterId: string;
  /** Card prose captured at move-in; deliberately excludes the Engine-only first message. */
  cardSnapshot: VillageVillagerCardSnapshot;
  /** Approved village-owned art, independent of the source character's sprites. */
  sprite?: VillageResidentSprite | null;
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
  completedWishes: VillageCompletedWish[];
  /** Schedule changes influence tomorrow's agenda, never today's. */
  ingestSchedule?: boolean;
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
  sideAssetId?: string;
  expressions: Array<{ view: "front" | "side"; label: string; filename: string; revision?: number }>;
  framing: { mode: "full" | "half"; cropPercent: number };
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
  description: string;
  personality: string;
  scenario: string;
  backstory: string;
  appearance: string;
  exampleDialogue: string;
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

export type VillageVenueClass = "residence" | "workplace" | "gathering" | "other";

/** One class contributes one enterable scene. The venue remains one map place. */
export type VillageVenueSpace = {
  id: string;
  venueClass: VillageVenueClass;
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

export type VillagePrivateSpace = VillageVenueSpace & {
  ownerId: string;
  /** A first-entry picture is attempted once; later drawing is player controlled. */
  initialImageAttemptedAt?: string;
  adaptationPending?: boolean;
  adaptationSourceArchiveAt?: string;
};

export type VillageVenueEditProposal = {
  id: string;
  target: "shared" | "private";
  ownerId: string;
  baseUpdatedAt: string;
  proposed: VillageVenueSpace;
  requiredIds: string[];
  approvedIds: string[];
  declined: boolean;
  createdAt: string;
};

/** An active structural change occupies one of the venue's two slots. */
export type VillageVenueImprovement = {
  id: string;
  title: string;
  description: string;
  spaceId: string | null;
  /** Bounded mechanical effect. Other improvements are durable narrative truth. */
  extraBeds: number;
  approvedAt: string;
};

export type VillageVenue = {
  /** Stable within one village; every literal location reference uses this id. */
  id: string;
  name: string;
  /** The literal form of this unique place, such as sleeping pod or converted diner. */
  form?: string;
  /** One or two mechanical roles. There is no shared venue-type catalogue. */
  classes?: VillageVenueClass[];
  spaces?: VillageVenueSpace[];
  /** Starting capacity; active improvements may add beds, up to four total people. */
  residenceCapacity?: number;
  /** The complete resident roster. The older occupancy field remains a read projection. */
  residentIds?: string[];
  /** One-use invitations backed by resident speech; older manual entries remain shared invitations. */
  playerInvitations?: {
    residentId: string;
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
  playerSeenPrivateIds?: string[];
  archivedPrivateSpaces?: { ownerId: string; archivedAt: string; space: VillagePrivateSpace }[];
  editProposals?: VillageVenueEditProposal[];
  improvements?: (VillageVenueImprovement | null)[];
  /** Optional category/purpose metadata; never used as a location identity. */
  purpose: string;
  /** Player-approved visual and spatial description, distinct from the short purpose. */
  description: string;
  category: string;
  /** Presentation data is separate from physical venue state. */
  presentation: {
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
    upgrades: string[];
    furniture: string[];
    publicFacts: string[];
    features?: VillageVenueFeature[];
    traces?: VillageVenueTrace[];
    updatedAt: string;
  };
};

/** A durable Venue decision shown in the player's Mailbox. */
export type VillageVenueMail = {
  id: string;
  venueId: string;
  title: string;
  detail: string;
  kind: "change" | "player-move" | "counteroffer" | "villager-change" | "villager-move";
  status: "pending-player" | "awaiting-villagers" | "approved" | "declined";
  createdAt: string;
  dueAt: string;
  resolvedAt: string;
  requesterCharacterId: string;
  movingCharacterId?: string;
  counterofferRequestId?: string;
  counterofferDraft?: { name: string; purpose: string; category: string; description: string };
  /** Exact reviewed terms; retained alongside the outcome for future relationship use. */
  proposedClasses?: VillageVenueClass[];
  proposedCapacity?: number;
  improvementSlot?: number;
  improvement?: VillageVenueImprovement | null;
  affectedIds: string[];
  decisions: { characterId: string; accepted: boolean; reply: string }[];
  error: string;
};

/** A compact reference used anywhere a current literal location is required. */
export type VillageVenueReference = {
  venueId: string;
  detail: string;
};

/** A public physical event attached to a venue, not a replacement location. */
export type VillageVenueEvent = {
  id: string;
  venueId: string;
  venueName: string;
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
  purpose: string;
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
  purpose: string;
  description: string;
  category: string;
  position: VillageVenuePosition;
  occupancy: VillageVenue["occupancy"];
  capabilities: string[];
  state: VillageVenue["state"];
};

/** A home is now an occupancy fact on a venue, never a second place system. */
export type VillageResidence = {
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
 * One note pinned to the village noticeboard, and who wrote it.
 *
 * An empty author is an unsigned note, which is what the player's own pins are:
 * a real board is mostly handwriting with no name on it. The villagers' notes
 * carry their name, because the whole point of the board is that it is written
 * in someone's voice rather than in the narrator's.
 */
export type VillageNotice = {
  author: string;
  text: string;
};

/**
 * One thing the village did, as the narrator wrote it down.
 *
 * Keyed on the village's own derived clock rather than a wall-clock stamp. A
 * stored timestamp would be the one fact in the record able to disagree with
 * `village-clock.ts` — a happening filed at 09:30 that the clock reads as
 * "afternoon" — so what is kept is which part of which day it belongs to.
 */
export type VillageHappening = {
  id: string;
  kind: string;
  actorIds: string[];
  venueId: string;
  /** Whole days since the village was founded, matching `VillageMoment.dayIndex`. */
  dayIndex: number;
  /** Part of the day: one of `VILLAGE_CLOCKS`. */
  clock: string;
  /** Exact instant when it occurred. This is the temporal source of truth. */
  occurredAt: string;
  /** `exact` for new events; `phase` for records migrated from the old four-window clock. */
  timePrecision: "exact" | "phase";
  /** Stable creative opportunity that produced it, or empty for direct/player events. */
  sourceOpportunityId: string;
  narration: string;
  text: string;
};

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
export type VillageChronicleActor = {
  /** The card id, or "" when the entry names someone the village cannot join to. */
  id: string;
  /** The name as the village spelled it when the entry was written. */
  name: string;
};

/**
 * Who a memory belongs to.
 *
 * `village` is the shared story every villager knows. `private` is one entry
 * about one person that only that person is told — the mechanism behind "Rosa
 * remembers the evening you sat with her", and the reason an event can land on
 * a villager rather than only on the village.
 */
export type VillageChronicleScope = "village" | "private";

/** What wrote a memory down. Kept so the debug tab can say where a line came from. */
export type VillageChronicleKind = "tick" | "chat" | "favour";

/** Why a conversation memory was important enough to survive its visit. */
export type VillageMemoryCategory =
  "commitment" | "personal-fact" | "preference" | "relationship" | "shared-experience";

/**
 * One event the cast may use for continuity during the next 24 real hours.
 *
 * Subjects and knowers are deliberately separate. A promise made to four
 * people is one event about those four people, known by those four people; it
 * is not four copies competing for a per-visit quota.
 */
export type VillageRecollection = {
  id: string;
  visitId: string;
  occurredAt: string;
  expiresAt: string;
  text: string;
  subjectCharacterIds: string[];
  knownByCharacterIds: string[];
  sourceLineIds: string[];
  sourceSubmissionIds: string[];
  /** Exact archive coordinates, including each later repeat that refreshed this recollection. */
  evidence: { visitId: string; submissionId: string; lineIds: string[] }[];
  reinforcementCount: number;
  lastReinforcedAt: string;
};

/**
 * One thing the village remembers.
 *
 * This is the durable story, kept BESIDE `VillageHappening` rather than instead
 * of it: the happenings window is what the map draws and what the prompt calls
 * "lately", and it is trimmed forever at `MAX_HAPPENINGS`. The chronicle is
 * what the village keeps, distilled, attributed and scoped, and it is not
 * trimmed in ordinary play.
 *
 * Two fields describe when it happened and they are NOT interchangeable:
 *
 *   * `dayIndex` and `clock` are the real answer, in the same units the derived
 *     clock speaks, and every piece of logic reads these and only these.
 *   * `at` is a wall-clock stamp kept for ONE reason — showing a player roughly
 *     what time of day something happened in the debug tab. It is DISPLAY ONLY.
 *     Nothing may read it: not the clock, not an age calculation, not a prompt
 *     block. It exists to be a string a person can look at, and the moment
 *     anything derives from it the record gains a second, disagreeable source
 *     of truth about time, which is exactly what `village-clock.ts` exists to
 *     avoid.
 */
export type VillageChronicleEntry = {
  id: string;
  /** Whole days since the village was founded, matching `VillageMoment.dayIndex`. */
  dayIndex: number;
  /** Part of the day: one of `VILLAGE_CLOCKS`, or "" when the stored value named none. */
  clock: string;
  /** Exact instant when it occurred; migrated quadrant-only records use an approximate midpoint. */
  occurredAt: string;
  /** Whether `occurredAt` was known exactly or reconstructed from an old day phase. */
  timePrecision: "exact" | "phase";
  scope: VillageChronicleScope;
  /** Who this is about, empty for a memory of the village as a whole. */
  actors: VillageChronicleActor[];
  kind: VillageChronicleKind;
  /** Importance for bounded prompt selection; stored notes are retained. */
  weight?: number;
  /** Visit line IDs supporting a conversation memory, when available. */
  sourceLineIds?: string[];
  /** Durable conversation-memory classification. Absent on legacy and simulation entries. */
  memoryCategory?: VillageMemoryCategory;
  /** Who the event concerns. Kept apart from the audience that is allowed to recall it. */
  subjectCharacterIds?: string[];
  /** Who directly witnessed every cited line. Absent entries use legacy scope/actors semantics. */
  knownByCharacterIds?: string[];
  /** Exact archived visit and transient recollections that support this durable memory. */
  sourceVisitId?: string;
  sourceRecollectionIds?: string[];
  text: string;
};

export type VillageStoryPace = "off" | "quiet" | "balanced" | "lively";

export type VillageOpportunity = {
  id: string;
  kind: "encounter" | "wish" | "weather" | "routine" | "project";
  startsAt: string;
  endsAt: string;
  actorIds: string[];
  venueId: string;
  facts: string[];
};

export type VillageRelationship = {
  firstCharacterId: string;
  secondCharacterId: string;
  closeness: number;
  updatedAt: string;
};

export type VillageProject = {
  id: string;
  title: string;
  venueId: string;
  participantIds: string[];
  progress: number;
  status: "active" | "blocked" | "complete";
  updatedAt: string;
};

export type VillagePendingDecision = {
  id: string;
  kind: "residence" | "project" | "venue" | "venue-upgrade" | "departure" | "other";
  title: string;
  detail: string;
  proposedAt: string;
  sourceOpportunityId: string;
  status?: "pending" | "approved" | "denied" | "countered";
  venueDraft?: VillageVenueDraft;
  venueId?: string;
  proposedHomeKind?: HomeBuildingKind;
  requesterCharacterId?: string;
  requesterName?: string;
  source?: "chat" | "background";
  sourceKey?: string;
};

export type VillageScheduledEvent = {
  id: string;
  opportunityId: string;
  occursAt: string;
  kind: string;
  actorIds: string[];
  venueId: string;
  narration: string;
};

export type VillageRecap = {
  from: string;
  through: string;
  details: VillageHappening[];
  summaries: string[];
  pendingDecisionCount: number;
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
export type VillageChronicleEntryView = VillageChronicleEntry & {
  /** e.g. "12 September". */
  dateLabel: string;
};

/**
 * The village's own record of itself.
 *
 * There is no stored clock here on purpose. A stored moment would be a moment
 * that can disagree with the wall clock, so what is stored instead are the two
 * facts a clock can be DERIVED from — `foundedAt` and `seed` — and
 * `village-clock.ts` turns those plus the wall clock into a moment on every
 * read. Adding a stored clock would mean migrating it on every upgrade that
 * changed the shape of a day, which is work the derivation never has to do.
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

export type VillageState = {
  version: 2;
  name: string;
  /** Per-village writing choices for live venue visits. */
  narrationStyle: VillageNarrationStyle;
  characterSpeechColors: boolean;
  /**
   * The one line of world the player wrote, e.g. "a rain-soaked harbour town".
   * Empty means the village has no place yet, and the setting and venue blocks
   * in the prompt render nothing at all.
   */
  setting: string;
  /** The player's reason for starting this village, kept apart from its visual setting. */
  foundingReason: string;
  foundingDetails: string;
  foundingGuidance: string;
  /** The reviewed starting point. Historical after setup; never a live plot instruction. */
  scenarioImprint: VillageScenarioImprint | null;
  /** Editable facts that still hold in the present village. */
  worldFacts: string[];
  /** Engine lorebook links; entry content is always read live. */
  selectedLorebookIds: string[];
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
  /** Public venue events retain the venue snapshot even if the venue is later deleted. */
  venueEvents: VillageVenueEvent[];
  /** Exact completed visit transcript retention. Missing older settings mean forever. */
  visitRetention: { mode: "forever" | "count" | "days"; value: number };
  /** One-time archive migration marker, so a player-deleted memory stays deleted. */
  visitMemoryBackfilled: boolean;
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
    currentId: string;
    error: string;
    stage?: "reading" | "lore" | "resolving" | "model" | "applying" | "saving";
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
  /** Pinned by the player and by the villagers, oldest first. Empty at founding. */
  noticeboard: VillageNotice[];
  /**
   * Legacy prose Events, newest first. The map displays them for the player,
   * but they do not enter resident prompts or change village state. Future
   * structured Events can give explicit, validated effects across days.
   */
  happenings: VillageHappening[];
  /**
   * What the village REMEMBERS, newest first. Durable, attributed history;
   * unlike the visual Events feed above, these entries can inform residents.
   *
   * A chronicle entry is distilled, attributed to people, and scoped to the
   * whole village or to specific residents. Visual Events age out separately.
   */
  chronicle: VillageChronicleEntry[];
  /** Active, expiring conversational continuity. Exact transcripts live in the visit archive. */
  recollections: VillageRecollection[];
  /** Submission IDs whose false wish completion was explicitly corrected. */
  correctedWishMemoryIds: string[];
  /** Durable high-water mark for deterministic reconciliation. */
  simulatedThrough: string;
  /** Device timezone observed by the last reconciliation. */
  lastKnownTimeZone: string;
  /** Optional model-shaped story frequency; deterministic life always advances. */
  storyPace: VillageStoryPace;
  /** Last local calendar day on which a creative planning call committed. */
  lastCreativeDate: string;
  processedOpportunityIds: string[];
  opportunities: VillageOpportunity[];
  scheduledEvents: VillageScheduledEvent[];
  relationships: VillageRelationship[];
  projects: VillageProject[];
  pendingDecisions: VillagePendingDecision[];
  venueMail: VillageVenueMail[];
  villagers: VillageVillager[];
  /**
   * The village's one prompt box: what a villager here knows.
   *
   * Where the village is, who lives here and what has been happening lately,
   * written as the macros that render those blocks. Editable — a village may want
   * its roster and its noticeboard in a different order, or not at all — and
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
  /**
   * The town map the homepage draws, as a `data:` URL. Empty means the village
   * has no map yet.
   *
   * Deliberately NOT part of the snapshot: the snapshot is read on every chat
   * send, so a picture in it would be re-sent on every single turn. It travels
   * on its own route, and `townMapImageSetAt` is the key the tab refetches on.
   */
  townMapImage: string;
  /** When the map was last set or cleared. Empty whenever `townMapImage` is. */
  townMapImageSetAt: string;
  townMapCanvasWidth: number;
  townMapCanvasHeight: number;
  /**
   * How that picture is framed in the map's own shape. Meaningless without a
   * picture, so it is reset to the shipped framing whenever the map is cleared
   * — the map the package ships must be drawn as it was drawn before.
   */
  townMapView: VillageTownMapView;
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
 * How the player uses a speech turn within a venue visit. The mode changes
 * the framing of this turn while preserving the same session and history.
 *
 * What differs is what the villager has been asked to do with this one turn.
 * `chat` is an ordinary exchange, where a villager may volunteer something, may
 * let a wish show as its tell, and may change the subject. `ask` is a question
 * being put to them, which they answer directly and briefly. `fulfill` is the
 * player saying they have done something for them, which the villager values
 * rather than judges — see `renderModeBlock`.
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

/**
 * What the village decided about a claim the player made.
 *
 * `fulfilled` is false unless a separate, single-purpose call said otherwise
 * with a wish id that matches a wish this villager actually has — see
 * `coerceVerdict`, which is where that is enforced and which defaults to NO.
 * The default matters more than anything the prompt says: a judge that is
 * merely ASKED to be strict is a judge that is lenient the first time it
 * returns something the coercion did not expect.
 *
 * `reason` is one line, written by the judge and shown to the player under the
 * villager's answer. It is the whole of what makes strictness legible instead
 * of arbitrary — a refusal a player cannot read is indistinguishable from a
 * bug — and it is deliberately the JUDGE's words rather than the villager's,
 * because the villager is a party to the question and cannot also be its
 * referee.
 */
export type VillageWishVerdict = {
  fulfilled: boolean;
  reason: string;
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
  characterId: string;
  dialogueColor: string;
  sprite: (VillageResidentSprite & { images: Array<{ view: "front" | "side"; label: string; url: string }> }) | null;
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
export type VillageSettingsView = {
  characterSpeechColors: boolean;
  visitRetention: VillageState["visitRetention"];
  promptKnowledge: string;
  defaultPromptKnowledge: string;
  /** The cap on the box. */
  promptBoxMaxLength: number;
  macros: readonly VillagePresetMacro[];
  /** Controls optional model-shaped stories; time and deterministic state always advance. */
  storyPace: VillageStoryPace;
  storyPaces: readonly VillageStoryPace[];
  /** How long the village's own name may be. The wizard is the only editor of it. */
  villageNameMaxLength: number;
  /**
   * The Persona the player is, or "" for a village that has never been founded.
   *
   * There is no typed name and description beside it any more. "Who are you" is
   * the Persona's job now, and a second answer to it was only ever a way for the
   * two to disagree.
   */
  playerPersonaId: string;
  /**
   * That Persona's name, cached. Survives the Persona being deleted, so the tab
   * can still say who the player was while it tells them the link is broken.
   */
  playerPersonaName: string;
  /** True when a Persona is linked but is no longer in the library. */
  playerPersonaMissing: boolean;
  maxNoticeboardNotes: number;
  maxNoticeLength: number;
  /** The world, as the settings panel edits it. */
  setting: string;
  settingMaxLength: number;
  foundingReason: string;
  foundingDetails: string;
  foundingGuidance: string;
  scenarioImprint: VillageScenarioImprint | null;
  worldFacts: string[];
  selectedLorebookIds: string[];
  loreTokenBudget: number;
  loreTokenBudgetMin: number;
  loreTokenBudgetMax: number;
  foundingDetailsMaxLength: number;
  foundingGuidanceMaxLength: number;
  /** Testing-only editable copy; omitted from the image prompt unless explicitly submitted. */
  townMapLayoutPrompt: string;
  townMapNegativePrompt: string;
  /** Every place the village holds, homes included. The tab draws its map and its editor from this one list. */
  venues: VillageVenue[];
  homeBuildingNames: Record<HomeBuildingKind, string>;
  maxPlaces: number;
  maxVenueNameLength: number;
  maxVenueNoteLength: number;
  /**
   * How big a place's stored picture reference may be, and how long its gallery
   * id may run. The tab uses these to refuse an edit the server would refuse,
   * rather than to enforce anything of its own.
   */
  maxVenueImageUrlLength: number;
  maxVenueImageIdLength: number;
  /**
   * How large a place's picture may be, in bytes of image data. The tab checks
   * a picked file against this before it is encoded, so a picture that is too
   * large is refused with both sizes in the message instead of being uploaded,
   * refused at the other end, and reported as a field.
   */
  maxVenueImageBytes: number;
  /**
   * The gallery folder a place's picture is filed in. Named so the tab can say
   * where the village's pictures live instead of leaving the player to find
   * them among every other image in the Engine.
   */
  villageGalleryFolderName: string;
  /**
   * The buildings a place may be, with the class each one belongs to. The tab
   * draws what a place IS from here and offers no family of its own.
   *
   * Only the places somebody lives in use this: everything else is a place with
   * no building of its own, which is `building: null` on the record rather than
   * a kind of its own in here.
   */
  homeBuildings: readonly VillageBuildingOption[];
  /** What a home is until it is something else, so a new pin is drawn as the server would store it. */
  defaultHomeBuilding: HomeBuildingKind;
  /** The maximum homes the founding wizard places: one player home plus initial Villager homes. */
  setupHomeCount: number;
  /** The complete first-founding graph: homes plus one public center. */
  setupPlaceCount: number;
  setupMinVillagerCount: number;
  setupMaxVillagerCount: number;
  /**
   * The stamp of the current town map, not the image itself. The tab compares
   * it against the map it already holds and refetches when it changes, so the
   * snapshot stays small while the homepage still notices an edit elsewhere.
   */
  townMapImageSetAt: string;
  townMapImageMaxLength: number;
  /** Kept per village so pre-1536×1024 pictures retain their original frame. */
  townMapCanvasWidth: number;
  townMapCanvasHeight: number;
  /** How the map is framed right now, so an editor can open on the current crop. */
  townMapView: VillageTownMapView;
  /**
   * The picture size the map's shape is authored against. A picture at least
   * this large fills the frame without being blown up; a smaller one is what
   * the tab warns about, not a size the village refuses.
   */
  townMapExpectedWidth: number;
  townMapExpectedHeight: number;
  townMapGenerationWidth: number;
  townMapGenerationHeight: number;
  /** How far the picture may be magnified, and how much one press moves it. */
  townMapZoomMin: number;
  townMapZoomMax: number;
  townMapZoomStep: number;
};

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

export type VillageSnapshot = {
  status: "ready";
  foundingPreparation: NonNullable<VillageState["foundingPreparation"]> | null;
  village: VillageMomentView;
  venueRequests: VillagePendingDecision[];
  upgradeRequests: VillagePendingDecision[];
  residences: VillageResidence[];
  venueMail: VillageVenueMail[];
  /** Newest last, so the board reads the way a board fills up. */
  noticeboard: VillageNotice[];
  /** Newest first, so the window on the map opens on what just happened. */
  happenings: VillageHappening[];
  villagers: VillageVillagerView[];
  /**
   * True once the village has been founded, which is what tells the tab to draw
   * the village rather than the setup wizard. Derived, never stored directly: a
   * village that already has places or villagers counts as founded, so an
   * install made before this field existed is not dropped into a wizard.
   */
  isFounded: boolean;
  settings: VillageSettingsView;
  recap: VillageRecap | null;
};

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
  completedWishes: VillageCompletedWish[];
  ingestSchedule: boolean;
  nativeSchedule: {
    weekStart: string;
    days: Record<string, { time: string; activity: string; status: string }[]>;
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
  /** The block's hour range, exactly as the Engine wrote it: "06:00-08:00". */
  time: string;
  /** The Engine's own activity string, verbatim. Shown to nobody but the schedule tab. */
  activity: string;
  /** What that same block reads as here, or the village's own default. */
  here: string;
  /** Villages' short explanation of why this activity is in the agenda. */
  reason?: string;
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
  /** The Engine's availability token for this block, or "". */
  status: string;
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

// ── RETIRED 0.4.43 — the scene lane's return path. Kept, not called. ─────────
//
// Everything the type below described is still exactly true of it. What changed
// is who reads it. Up to 0.4.42 a scene was a two-way arrangement: the package
// held a link document per villager, the whole village waited while a scene was
// open, and the chat could be read back into the villager's memory when the
// player was done. 0.4.43 made the hand-off one way, and every one of those
// claims went with it — so `VillageScene` and the six view types that follow are
// the record of an arrangement the package no longer makes.
//
// They are kept, exported and unread, because the shapes are the hard part and
// they are worked out: this is what a link between a village document and an
// Engine chat looks like, with the stamps the tab drew rows from and the states a
// chat can be in from the village's side. A future release with a reason to
// remember a chat again should start from these rather than from nothing. Nothing
// in the live lane imports them, and nothing on disk is migrated because of them.

/**
 * One villager's scene: a real Engine roleplay chat, linked back to the villager
 * it belongs to.
 *
 * RETIRED 0.4.43 — the scene lane's return path. Kept, not called.
 *
 * This is the second way to spend time with somebody from the village, and it is
 * deliberately the opposite trade from the conversation in the drawer. A
 * conversation is owned by the package: it lives in a village document, it is
 * rendered by the package's own prompt, and the Engine never sees it. A scene is
 * owned by the ENGINE: it lives in an ordinary roleplay chat, it is rendered by
 * the Engine's prompt pipeline, and the package's only stake in it is this link.
 *
 * So this record is not a transcript and must never become one. It is the answer
 * to "which chat is this villager's scene", plus the few stamps the tab needs to
 * draw a row without a second read. Everything that is actually SAID stays in the
 * Engine, where the player can use every roleplay feature they already have —
 * swipes, editing, branching, the memory system — on it.
 *
 * The consequence worth stating out loud: the village cannot see the scene until
 * it is asked to. A conversation that ends is distilled into the chronicle on the
 * spot, because the package holds the words. A scene is distilled only when the
 * player ends it (`importVillagerScene`), because only then does the package go
 * and read what the Engine has been keeping.
 */
export type VillageScene = {
  version: 1;
  characterId: string;
  /**
   * The Engine chat this scene lives in.
   *
   * The whole record exists for this one string. A scene whose chat is gone from
   * the Engine is a scene that cannot be opened, which is a real and reachable
   * state — the player may delete a chat from the Engine's own list — and it is
   * reported as `missing` rather than treated as corruption.
   */
  chatId: string;
  /** The chat's name as the village wrote it, so a row can be drawn before the Engine answers. */
  chatName: string;
  /**
   * The Engine preset bound when the scene opened, or "" for none.
   *
   * "" is not "the default preset": it means the chat was created without a
   * `promptPresetId`, so whatever the Engine does for a chat with no preset is
   * what happens. The village never guesses at a preset, because binding one the
   * player did not choose would silently rewrite the prompt of a chat they are
   * about to use for everything else.
   */
  presetId: string;
  /** The Persona the player was when the scene opened, or "" for none. */
  personaId: string;
  /** When the chat was created. Never empty. */
  spawnedAt: string;
  /**
   * When the villager's opening line was written into the chat, or "" when none
   * was.
   *
   * Empty is an honest outcome rather than a failure to hide: writing a line into
   * a chat needs `chat-write`, which this package only holds if the player
   * approved it, and a scene opens perfectly well with the player speaking first.
   */
  beatAt: string;
  /**
   * When the scene was last read back into the village, or "" when it never has
   * been. Set by `importVillagerScene`, and the thing the tab uses to say
   * "remembered" rather than "not yet remembered".
   */
  lastImportedAt: string;
  /**
   * When the player filed the scene, or "" while it is still open.
   *
   * Filing it does NOT close or delete the Engine chat — the player keeps it and
   * keeps using it. This stamp only records that the village has finished
   * reading it, so the row can stop offering to read it again.
   */
  endedAt: string;
};

/**
 * A scene as the tab drew it: the link, plus everything that could only be
 * known by asking the Engine.
 *
 * RETIRED 0.4.43 — the scene lane's return path. Kept, not called.
 *
 * Read fresh on every listing rather than cached, because three of these fields
 * are statements about the ENGINE's current state and a cached one would let the
 * tab offer to open a chat that was deleted an hour ago. The read is two cheap
 * loopback calls per linked villager, which is once per row and only on the route
 * that draws the rows — and only for villagers who actually have a scene, which
 * is normally none of them.
 */
export type VillageSceneView = {
  characterId: string;
  /** The villager's name, read live from the card. Empty when the card is gone. */
  name: string;
  /** Whether the villager's CARD could still be read. */
  cardMissing: boolean;
  /** Whether the Engine still holds the chat. False makes the row read-only. */
  live: boolean;
  chatId: string;
  chatName: string;
  presetId: string;
  personaId: string;
  spawnedAt: string;
  beatAt: string;
  lastImportedAt: string;
  endedAt: string;
  /** How many lines the Engine is keeping for this scene. 0 when it cannot be read. */
  messageCount: number;
};

/**
 * The villager the village stood still for, and where they were.
 *
 * RETIRED 0.4.43 — the scene lane's return path. Kept, not called.
 *
 * A scene is OPEN while nobody has filed it, and while one is open the whole
 * village waits: the narrative rule is that the player is doing something with
 * one character, and a village they can keep rearranging behind that is a village
 * that is not taking its own story seriously. This is the fact the tab draws its
 * gate from and the fact the routes refuse work on, which is why it travels on
 * the listing rather than being asked for separately — it is the same read.
 *
 * `name` is read live from the card for the message rather than cached, because
 * the message is the whole point: "Mira is away in a scene" is an instruction and
 * "a villager is away" is a wall.
 */
export type VillageSceneLockView = {
  characterId: string;
  name: string;
  chatId: string;
};

/**
 * The whole scene surface, as it used to be answered in one go.
 *
 * RETIRED 0.4.43 — the scene lane's return path. Kept, not called.
 *
 * Both halves travel together because the picker and the rows are the same
 * screen: the player chooses who to take somewhere and picks a preset in the same
 * breath, and splitting it would be two round trips to draw one panel.
 */
export type VillageSceneListingView = {
  scenes: VillageSceneView[];
  /** Every preset the Engine would let the player bind to a new chat, newest first. */
  presets: VillageSpinOffPresetOption[];
  /**
   * What the picker calls the choice of NO preset.
   *
   * The village deliberately owns no preset of its own: a scene is an ordinary
   * Engine roleplay chat, and what the village has to say about its own people
   * reaches that chat live through the `prompt-context` permission rather than
   * through a preset that would freeze it. So the presets here are all the
   * Engine's, and the one thing the picker has to name that is not in that list
   * is the empty choice. It is named by the server so the tab does not hardcode a
   * string the server owns.
   */
  defaultPresetLabel: string;
  /** The longest chat name the package will send, so the input can stop at it. */
  maxSceneNameLength: number;
  /**
   * What the village is called, for the copy that has to name it.
   *
   * Carried here because both surfaces that say "this scene belongs to your
   * village" read this listing and neither of them reads the village itself: the
   * chat chip is mounted in a roleplay chat with no tab and no snapshot behind
   * it, and the gate in the tab is drawn before the tab's own snapshot matters.
   * A name is what turns an abstract ownership claim into a specific one.
   *
   * Empty when the village has not been named yet, which the copy has to survive.
   */
  villageName: string;
  /**
   * The scene the village is waiting on, or null when it is nobody's turn to wait.
   *
   * Carried on the listing rather than fetched on its own because the tab has to
   * know this before it draws anything, and it already reads this listing on the
   * way in — a second route asking the same question would be a second read of the
   * same documents on every mount.
   */
  lock: VillageSceneLockView | null;
};

/**
 * What one scene write answered with: the row, and the whole list.
 *
 * RETIRED 0.4.43 — the scene lane's return path. Kept, not called.
 */
export type VillageSceneResponse = {
  scene: VillageSceneView;
  scenes: VillageSceneView[];
  presets: VillageSpinOffPresetOption[];
  defaultPresetLabel: string;
  maxSceneNameLength: number;
  villageName: string;
  /** Recomputed on every write, because a spawn and a bring-home both changed it. */
  lock: VillageSceneLockView | null;
};

/**
 * The answers a player gave to a preset's own questions.
 *
 * Keyed by VARIABLE NAME and not by the variable's row id, because that is the
 * key the Engine's own preset reader looks up: `presetChoices` is the Engine's
 * chat-metadata key, its selector writes it, `parsePromptPresetChoices` reads it
 * and the preset's macros are substituted from it. A village that keyed by id
 * would be writing a map nobody reads.
 *
 * A single-choice variable stores a string and a multi-choice one stores an
 * array. That asymmetry is the Engine's, not the package's: an empty string and
 * an empty array are both the user's "off" value, and a multi-choice answer
 * collapsed to a joined string would lose which options were actually chosen.
 */
export type VillageSpinOffChoiceSelections = Record<string, string | string[]>;

/** One option inside a preset's variable, as the spawn popup offers it. */
export type VillageSpinOffVariableOption = {
  value: string;
  label: string;
};

/**
 * One question a preset asks before it can run, in the shape the popup draws.
 *
 * Only ever the fields a selector needs, and deliberately not the Engine's whole
 * choice-block row: the row carries a preset id, a sort order, a row id and a
 * separator, none of which the popup draws, and a package that mirrored the whole
 * record would break every time the Engine added to it. The defaults are already
 * resolved here — `displayMode` and `optionSort` arrive as the real values rather
 * than as the strings the database column holds — so the tab has one shape to
 * draw and the Engine has one place to change its mind.
 */
export type VillageSpinOffVariable = {
  /** The macro name this question answers, e.g. "POV". The key of a selection. */
  variableName: string;
  question: string;
  options: VillageSpinOffVariableOption[];
  multiSelect: boolean;
  /**
   * Whether the Engine picks one of the chosen options at random per generation.
   *
   * Carried because it changes what the popup should PRESELECT — a single-choice
   * random variable gets a random default rather than the first option — and not
   * because the village resolves anything itself. The Engine resolves it.
   */
  randomPick: boolean;
  displayMode: "auto" | "buttons" | "listbox";
  optionSort: "manual" | "alphabetical";
};

/** A preset's questions, plus the preset they belong to. */
export type VillageSpinOffVariableList = {
  presetId: string;
  variables: VillageSpinOffVariable[];
};

// ── Spin-offs ────────────────────────────────────────────────────────────────
//
// The live lane, and it is small on purpose. A spin-off is one-way: the package
// makes an Engine chat, leaves a snapshot in it, and then has no further stake in
// it at all. So there is no record type here — nothing in a village document
// points at a chat — and the only thing the package ever has to answer about a
// spin-off afterwards is WHICH VILLAGER it was, which it answers from the stamp
// it left in the chat's own metadata. See `spinoff.ts`.

/**
 * One Engine prompt preset, as the spawn picker offers it.
 *
 * Only ever the two fields the picker draws. The Engine's preset record carries a
 * great deal more — prompts, sections, groups, parameters, regex — none of which
 * the village has any business copying into its own wire format, because a preset
 * the player edits must be able to change without the village noticing.
 */
export type VillageSpinOffPresetOption = {
  id: string;
  name: string;
};

/**
 * A chat that began as a spin-off, as the two in-chat surfaces read it.
 *
 * Assembled on the spot from the stamp in the chat's metadata and the villager's
 * card, and answered with a null rather than an error when the chat is not one of
 * ours — a roleplay chat the player made themselves is the common case on the
 * route this comes back from, not an exceptional one.
 *
 * There is no `chatId` here even though the caller obviously has one: the chat is
 * the thing being asked ABOUT, and repeating its id back would invite a caller to
 * treat this as a record it can look the chat up from. It is not a record. It is
 * the answer to "is this one of ours, and whose".
 *
 * `resident` is the one field that can go stale, and deliberately. A villager
 * whose card was deleted after the spin-off began still has a chat and still has
 * a stamp saying who they were, so the surfaces keep working and say who it was;
 * the boolean is what lets them drop the parts that would need a card to draw.
 */
export type VillageSpinOffOriginView = {
  characterId: string;
  /** The villager's name. Falls back to the chat's id when the card is gone. */
  name: string;
  /** The chat's own name, as the Engine spells it. */
  room: string;
  /** The village the villager was taken out of, as the stamp recorded it. */
  villageName: string;
  /** Whether the villager's CARD could still be read. */
  resident: boolean;
};

/**
 * Everything the spawn popup needs before there is a chat to put it in.
 *
 * Read on its own route rather than riding on a listing, because on this lane
 * there is nothing to list: the popup is opened from a villager's tile, has no
 * rows to draw beside it, and would otherwise make the tab fetch a document store
 * it does not need in order to offer a dropdown.
 */
export type VillageSpinOffPresetPickerView = {
  presets: VillageSpinOffPresetOption[];
  /** What the picker calls the choice of NO preset. Owned by the server, not the tab. */
  defaultPresetLabel: string;
  /** The longest chat name the package will send, so the input can stop at it. */
  maxNameLength: number;
};

/**
 * What one spawn answers with: just enough for the tab to say what happened.
 *
 * The chat's id and name are both here because the tab offers to open it, and the
 * name is the one the package asked for rather than one read back — a second read
 * of a chat the package just created would be a round trip for a string it already
 * has in hand.
 *
 * `beatAt` is empty when the villager said nothing, which is a normal outcome
 * rather than a failure. See `writeSpinOffOpening` for why there is no fallback
 * line. There is deliberately no `lastImportedAt` or `endedAt` beside it: on a
 * one-way lane nothing ever comes back, so there is nothing for those stamps to
 * mean.
 */
export type VillageSpinOffSpawnResult = {
  characterId: string;
  /** The villager's name, read from the card. */
  name: string;
  chatId: string;
  chatName: string;
  /** When the villager's opening line landed, or "" when they did not open. */
  beatAt: string;
};
