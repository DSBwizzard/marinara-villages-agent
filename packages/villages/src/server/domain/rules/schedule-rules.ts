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
export type NativeDayBlock = { time: string; activity: string; status: string };
export type NativeWeekSchedule = {
  characterId: string;
  /** The Monday this schedule was generated for. "" when the Engine wrote none. */
  weekStart: string;
  routineSummary: string;
  talkativeness: number | null;
  /** Only the days the Engine actually wrote, keyed by the Engine's weekday names. */
  days: Record<string, NativeDayBlock[]>;
};
export function parseBlockRange(value: string): { start: number; end: number } | null {
  const match = /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const start = Number(match[1]) * 60 + Number(match[2]);
  const end = Number(match[3]) * 60 + Number(match[4]);
  if (start >= 24 * 60 || end > 24 * 60) return null;
  return { start, end };
}
export function blockAt(blocks: readonly NativeDayBlock[], hour: number, minute: number): NativeDayBlock | null {
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
export function activityAt(blocks: readonly NativeDayBlock[], hour: number, minute: number): string {
  return blockAt(blocks, hour, minute)?.activity ?? "";
}
