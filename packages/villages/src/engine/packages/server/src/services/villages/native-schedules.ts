// Villages — read Marinara's own character schedules, without owning them.
//
// Conversation mode already asks the model to invent a weekly routine for each
// character (what they are doing, hour by hour, all seven days) and stores it
// on the CHARACTER CARD, at `data.extensions.conversationSchedule`, keyed by
// character id rather than by chat. `chats.storage.ts` reads it back with
// `readCharacterSchedule(row.data)` and its own comment names the card the
// source of truth. Reading it here therefore uses the data exactly as intended —
// a villager who already has a life in Conversation mode does not need a second
// one invented by the village.
//
// Card reads are best-effort: a missing or malformed schedule leaves a resident
// without a native routine, while a failed library read is reported separately.
import { villagesLogger, villagesResources } from "./package-runtime.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";

/** What the village wants to know about one character's existing routine. */
export type NativeRoutine = {
  /** The Engine's own prose summary of this character's week, or "" when it has none. */
  routineSummary: string;
  /** What this character is doing right now, or "" outside every block. */
  activity: string;
  /**
   * The Engine's availability for the block covering right now, or "" outside
   * every block.
   *
   * See `NativeDayBlock` for why this is worth carrying: it is the only thing in
   * a schedule that is about AUTONOMY rather than about nouns, and reading only
   * the activity threw away the half that says whether this hour is theirs.
   */
  status: string;
  /** 0-100, or null when the schedule did not carry one. */
  talkativeness: number | null;
  /** The Monday this schedule was generated for, so the freshest one can win. */
  weekStart: string;
  /**
   * The Engine's weekday this read was taken on, one of `VILLAGE_WEEKDAYS`.
   *
   * The week is a weekly pattern keyed by weekday NAME and holds no dates, so
   * "this hour of this villager's week" is only addressable with the day attached
   * to it. It is derived here rather than by the caller because this reader is the
   * one place that already knows which day's blocks it went and looked at — a
   * caller deriving the weekday from the same `Date` a second time would be a
   * second derivation of the same fact, and the two would disagree the first time
   * one of them took its clock reading a minute either side of midnight.
   */
  weekday: string;
  /**
   * The block covering right now, exactly as the Engine wrote it, or null when
   * this minute falls outside every block of the day.
   *
   * Carried so that the translation can be looked up by SLOT rather than by
   * sentence: the key needs the day and the block's own hour range as the Engine
   * wrote it, and neither can be reconstructed from `activity` alone. It is the
   * very object `blockAt` returned to produce the two fields above, so keeping it
   * costs nothing.
   */
  block: NativeDayBlock | null;
  /**
   * Every block the Engine wrote for the day `activity` was read from, in order.
   *
   * The narrow read answers "what are they doing at this minute" and throws the
   * rest of the day away; this keeps it. It is carried on the routine rather than
   * fetched by a second call because it costs NOTHING: the blocks below are the
   * very list `blockAt` already searched to find the single block above, so a
   * caller that wants the shape of somebody's whole day gets it out of a read the
   * prompt was already paying for.
   *
   * Empty when there is no schedule at all, which is the same absence `activity`
   * reports and is why a caller can render a plan without a schedule to check
   * for.
   */
  blocks: readonly NativeDayBlock[];
};

/**
 * One block of the Engine's week: an hour range, what it says, and the
 * availability the Engine assigned to it.
 *
 * The `status` is the whole reason this reader has a second half. It is the one
 * field of a native schedule that is not prose — `online`, `idle`, `dnd` or
 * `offline`, the same vocabulary the Engine uses for a character's own
 * availability — and it is the Engine's only statement about a character's
 * AUTONOMY: whether this hour is theirs, whether they can be interrupted, and
 * whether they are meant to be reachable at all. A village that reads only the
 * activity gets the verb and throws away the intent, which is why the status is
 * carried through to the prompt rather than dropped here.
 */
export type NativeDayBlock = { time: string; activity: string; status: string };

/**
 * One character's whole week, exactly as the Engine wrote it.
 *
 * `readNativeRoutine` answers "what are they doing at this minute" and is what
 * every prompt has always used. This is the wider read: the same week before it
 * was narrowed to one minute, which is what a TRANSLATION needs, because
 * translating one moment at a time would give the same character a different
 * village life on Tuesday than they had on Monday.
 */
export type NativeWeekSchedule = {
  characterId: string;
  /** The Monday this schedule was generated for. "" when the Engine wrote none. */
  weekStart: string;
  routineSummary: string;
  talkativeness: number | null;
  /** Only the days the Engine actually wrote, keyed by the Engine's weekday names. */
  days: Record<string, NativeDayBlock[]>;
};

/** How long a parsed read is reused. The tab polls on open; schedules do not change minute to minute. */
const CACHE_TTL_MS = 30_000;

type RawSchedule = NativeWeekSchedule;

/**
 * One read of the Engine's schedules, with the one fact a caller cannot infer
 * from an empty result.
 */
export type NativeScheduleSnapshot = {
  /** Every character the Engine wrote a week for. */
  schedules: RawSchedule[];
  /**
   * Whether the character LIBRARY could be read at all.
   *
   * This exists because empty is not the same as unreadable, and the difference
   * is the player's to act on. An empty week list means the Engine is keeping no
   * schedule for anybody, which is a statement about the cards and is fixed on
   * the Engine's own schedule screen. A library that could not be read means
   * this reader never saw the cards, so it knows nothing about them and the
   * player has nothing to act on at all. Reporting the second as the first is
   * how the schedules tab came to tell a player whose cards were fully scheduled
   * that their cards had no week on them.
   */
  cardsReadable: boolean;
};

let cache: { at: number; key: string; snapshot: NativeScheduleSnapshot } | null = null;
/**
 * Whether the library read has already failed and been reported.
 *
 * The failed read is cached like a good one, so a log per attempt would be a
 * log every thirty seconds for the life of the process. One line when it starts
 * failing and one when it comes back is the whole story, and it is the only
 * thing that would have made the live bug above visible from outside.
 */
let cardsReadFailureReported = false;

/** Drop the cached read. Used by the regression proof so one case cannot leak into the next. */
export function resetNativeScheduleCache(): void {
  cache = null;
  cardsReadFailureReported = false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * The Engine stores card bodies as JSON *text*, not as an
 * object — the capability persistence layer hands the raw column straight
 * through. Accepting both keeps this reader honest against either shape.
 *
 * Parsed with the global `JSON.parse`, NOT through the runtime host, and that is
 * a correction rather than a preference. The host's `json` is a single
 * `parseJsonish` helper and nothing else, so an earlier version of this line
 * read `villagesJson().parse(value)`: a TypeError, on every string, forever —
 * thrown straight into the `catch` below, which is here to mean "this body is
 * not JSON". Cards and chats BOTH store text, so every schedule in the village
 * read as absent while the cards plainly had one, and because the failure was
 * caught in here the log said nothing about it. `catalog.ts` reads its stored
 * columns the same way for the same reason.
 */
function parseMetadata(value: unknown): Record<string, unknown> | null {
  if (typeof value === "string") {
    if (value.trim().length === 0) return null;
    try {
      const parsed = JSON.parse(value) as unknown;
      return isRecord(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return isRecord(value) ? value : null;
}

/**
 * One day's blocks, keeping the status.
 *
 * A block is dropped only when it has no time or no activity, because those are
 * the two fields that make it a block. Its status is NOT required: the Engine
 * has written schedules without one, and "the Engine did not say" is a real
 * answer that the translation reads as "take this hour as ordinary" rather than
 * as "throw the hour away".
 */
function parseBlocks(value: unknown): NativeDayBlock[] {
  if (!Array.isArray(value)) return [];
  const blocks: NativeDayBlock[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) continue;
    const time = readString(entry.time);
    const activity = readString(entry.activity);
    if (time.length === 0 || activity.length === 0) continue;
    blocks.push({ time, activity, status: readString(entry.status) });
  }
  return blocks;
}

function parseSchedule(characterId: string, value: unknown): RawSchedule | null {
  if (!isRecord(value)) return null;
  const days: Record<string, NativeDayBlock[]> = {};
  const rawDays = isRecord(value.days) ? value.days : {};
  for (const day of VILLAGE_WEEKDAYS) {
    const blocks = parseBlocks(rawDays[day]);
    if (blocks.length > 0) days[day] = blocks;
  }
  const talkativeness =
    typeof value.talkativeness === "number" && Number.isFinite(value.talkativeness) ? value.talkativeness : null;
  const schedule: RawSchedule = {
    characterId,
    weekStart: readString(value.weekStart),
    routineSummary: readString(value.routineSummary),
    talkativeness,
    days,
  };
  // A schedule with nothing to say is not a schedule; dropping it here means no
  // caller has to test for an empty one.
  if (Object.keys(schedule.days).length === 0 && schedule.routineSummary.length === 0) return null;
  return schedule;
}

/**
 * The Engine's week off one character card, or nothing when the card has none.
 *
 * Since Engine 2.4.6 this is where a schedule lives — `data.extensions`
 * `.conversationSchedule`, the same `extensions` block the backstory and the
 * appearance already come out of, and the Engine reads it back with the same
 * `readCardExtension(data, "conversationSchedule")` shape. A card body is a JSON
 * *text* column, so it goes through `parseMetadata` first, exactly as
 * `catalog.ts` does it. A card that will not parse, or an `extensions` that is
 * missing or is not an object, is an ordinary card with no week rather than a
 * broken one.
 */
function readCardSchedule(rawData: unknown): unknown {
  const data = parseMetadata(rawData);
  if (!data) return null;
  const extensions = data.extensions;
  return isRecord(extensions) ? extensions.conversationSchedule : null;
}

/**
 * Every character schedule the Engine currently knows about, from its card.
 */
async function readSnapshot(now: Date, characterIds?: readonly string[]): Promise<NativeScheduleSnapshot> {
  const key = characterIds ? [...new Set(characterIds)].sort().join("\0") : "*";
  if (cache && cache.key === key && now.getTime() >= cache.at && now.getTime() - cache.at < CACHE_TTL_MS)
    return cache.snapshot;

  const fromCards = new Map<string, RawSchedule>();
  let cardsReadable = false;
  try {
    for (const record of await villagesResources().listCharacters(characterIds ? [...characterIds] : undefined)) {
      const schedule = parseSchedule(record.id, readCardSchedule(record.data));
      if (schedule) fromCards.set(record.id, schedule);
    }
    cardsReadable = true;
    cardsReadFailureReported = false;
  } catch (error) {
    // Warned rather than whispered, and only on the way in. Everything the
    // village reports about a character's week is a claim about cards it never
    // read when this fails, and a debug line nobody has switched on is how that
    // claim went out unchallenged for five releases.
    if (!cardsReadFailureReported) {
      cardsReadFailureReported = true;
      villagesLogger().warn(
        "[villages] the character library could not be read, so no villager's week is known: %s",
        String(error),
      );
    }
  }

  const snapshot: NativeScheduleSnapshot = {
    schedules: [...fromCards.values()],
    cardsReadable,
  };
  cache = { at: now.getTime(), key, snapshot };
  return snapshot;
}

/**
 * The read the schedules view and the translation both start from, in one hit.
 *
 * A caller that only wants the weeks uses `readNativeWeekSchedules` below; a
 * caller that is going to TELL the player something about those weeks needs the
 * emptiness to be explained, and that is this function.
 */
export async function readNativeScheduleSnapshot(
  now: Date,
  characterIds?: readonly string[],
): Promise<NativeScheduleSnapshot> {
  return readSnapshot(now, characterIds);
}

/**
 * A block's hour range as minutes from midnight. The end is left as written, so
 * a block that ends before it starts ("22:00-06:00") is recognisable as one that
 * wraps past midnight rather than being silently repaired into nonsense.
 */
export function parseBlockRange(value: string): { start: number; end: number } | null {
  const match = /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const start = Number(match[1]) * 60 + Number(match[2]);
  const end = Number(match[3]) * 60 + Number(match[4]);
  if (start >= 24 * 60 || end > 24 * 60) return null;
  return { start, end };
}

/**
 * The block that covers this minute, or null when none does.
 *
 * Split out of `activityAt` so that the two things a block carries — what is
 * happening and whether the hour is theirs — are read from ONE block. Two
 * lookups would be two chances to pick different blocks, and an activity paired
 * with another block's availability is a villager who is asleep at their own
 * shift.
 */
function blockAt(blocks: readonly NativeDayBlock[], hour: number, minute: number): NativeDayBlock | null {
  const at = hour * 60 + minute;
  for (const block of blocks) {
    const range = parseBlockRange(block.time);
    if (!range) continue;
    const wraps = range.end <= range.start;
    const matches = wraps ? at >= range.start || at < range.end : at >= range.start && at < range.end;
    if (matches) return block;
  }
  return null;
}

/** What a block list says the character is doing at this minute, or "" if it says nothing. */
export function activityAt(blocks: readonly NativeDayBlock[], hour: number, minute: number): string {
  return blockAt(blocks, hour, minute)?.activity ?? "";
}

/**
 * Every character's WHOLE week, keyed by character id. Never throws, for the
 * same reason the narrower read does not.
 *
 * One read of the library — plus, at most, one read of the chats behind it —
 * answers this for the entire village at once, which is why it is the entry
 * point a translation uses: a translation is written per character but the week
 * it is written from was already fetched, so a village of sixty does not go
 * looking sixty times.
 */
export async function readNativeWeekSchedules(
  now: Date,
  characterIds?: readonly string[],
): Promise<Map<string, NativeWeekSchedule>> {
  const weeks = new Map<string, NativeWeekSchedule>();
  for (const schedule of (await readSnapshot(now, characterIds)).schedules) weeks.set(schedule.characterId, schedule);
  return weeks;
}

/**
 * The village's read of the Engine's schedules: one entry per character that
 * has one. Never throws — a library that cannot be read at all simply produces
 * an empty map and the village falls back to its own routine.
 */
export async function readNativeSchedules(
  now: Date,
  characterIds?: readonly string[],
): Promise<Map<string, NativeRoutine>> {
  const routines = new Map<string, NativeRoutine>();
  // The weekday the whole read is taken on, derived ONCE. `activityAt` and the
  // key the translation is looked up under both have to be about the same day,
  // and a caller that rebuilt this per character would be rebuilding it off a
  // clock that had moved on.
  const weekday = VILLAGE_WEEKDAYS[(now.getDay() + 6) % 7]!;
  for (const schedule of (await readSnapshot(now, characterIds)).schedules) {
    const blocks = schedule.days[weekday] ?? [];
    const block = blockAt(blocks, now.getHours(), now.getMinutes());
    routines.set(schedule.characterId, {
      routineSummary: schedule.routineSummary,
      activity: block?.activity ?? "",
      status: block?.status ?? "",
      talkativeness: schedule.talkativeness,
      weekStart: schedule.weekStart,
      weekday,
      block,
      blocks,
    });
  }
  return routines;
}

/** The routine the village knows for one character, or null when the Engine has none. */
export async function readNativeRoutine(characterId: string, now: Date): Promise<NativeRoutine | null> {
  return (await readNativeSchedules(now)).get(characterId) ?? null;
}
