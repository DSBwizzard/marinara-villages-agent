import { type NativeDayBlock, type NativeWeekSchedule } from "../../domain/rules/schedule-rules.js";

import { VILLAGE_WEEKDAYS } from "../../domain/rules/village-clock.js";

import type { villagesLogger, villagesResources } from "./runtime-host.js";

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
export type NativeSchedulesPorts = {
  villagesResources: typeof villagesResources;
  villagesLogger: typeof villagesLogger;
};
export function createNativeSchedules(ports: NativeSchedulesPorts) {
  const { villagesResources, villagesLogger } = ports;

  // Villages — read Marinara's own character schedules, without owning them.
  //
  // Read activity text and timing as optional preferences for Villages-owned routines.
  // Engine Conversation availability never crosses this adapter boundary.
  //
  // Card reads are best-effort: a missing or malformed schedule leaves a resident
  // without a native routine, while a failed library read is reported separately.

  /** What the village wants to know about one character's existing routine. */

  /** How long a parsed read is reused. The tab polls on open; schedules do not change minute to minute. */
  const CACHE_TTL_MS = 30_000;

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

  /** Read activity and timing only; Conversation availability belongs to Engine. */
  function parseBlocks(value: unknown): NativeDayBlock[] {
    if (!Array.isArray(value)) return [];
    const blocks: NativeDayBlock[] = [];
    for (const entry of value) {
      if (!isRecord(entry)) continue;
      const time = readString(entry.time);
      const activity = readString(entry.activity);
      if (time.length === 0 || activity.length === 0) continue;
      blocks.push({ time, activity });
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

  /** Read source schedules and whether their library was available. */
  async function readNativeScheduleSnapshot(
    now: Date,
    characterIds?: readonly string[],
  ): Promise<NativeScheduleSnapshot> {
    return readSnapshot(now, characterIds);
  }
  return {
    readNativeScheduleSnapshot,
  };
}
export type NativeSchedules = ReturnType<typeof createNativeSchedules>;
