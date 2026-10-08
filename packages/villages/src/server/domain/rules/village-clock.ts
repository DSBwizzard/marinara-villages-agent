// Villages — the village's own clock, derived rather than stored.
//
// Every answer to "when is it?" is derived on read from the village founding
// time, seed, and the device-local wall clock at the requested instant. The
// projected clock itself is not persisted; reconciliation stores only its exact
// high-water mark and durable consequences.
//
// Deriving on read lets a reopened village project the current time immediately.
// `reconcileVillage` then advances durable state from the stored high-water mark
// without replaying every minute. The scheduler beside this file wakes only
// while Marinara is running; when it is shut down, restart reconciliation uses
// the same rules over the elapsed interval.
//
// Two consequences shape the rest of the package:
//
//   * Village time runs 1:1 with the real world, deliberately. Marinara's
//     native character schedules are keyed by real weekday names
//     (`days: { Monday: [...] }`), so an accelerated village clock would have
//     no weekday to look up and the native-schedule integration would be a
//     fiction. `weekday` is a first-class field of the moment for that reason,
//     not a decoration on a date chip.
//   * `deriveVillageMoment` is PURE: `now` is an argument, never a clock read.
//     That lets the regression test assert a specific moment without mocking
//     `Date`, the same way `buildVillagerMessages` is pure so the prompt shape
//     can be asserted without a runtime behind it.
//
// The weather is hash(seed, dayIndex) drawn from a season-biased table. It is
// stable for a whole day, changes once a day, and cannot accidentally be the
// real weather anywhere — which is the point: a village is a fiction and
// should not pretend to be a forecast.

/** The four seasons, lower case because they are read as prose ("an autumn morning"). */
export type VillageSeason = "spring" | "summer" | "autumn" | "winter";

/** One instant in the village, everything about it derived. */
export type VillageMoment = {
  /** Day and month as the village writes them, e.g. "11 September". */
  dateLabel: string;
  /** Real weekday name. This is the key a native character schedule is looked up by. */
  weekday: string;
  season: VillageSeason;
  /** Atmospheric part of the day, e.g. "morning". Never a simulation key. */
  dayPhase: string;
  /** Exact wall-clock instant used for this projection. */
  instant: string;
  /** Local `HH:MM`, for display and exact fallback-agenda lookup. */
  localTime: string;
  /** 0-1439 local minute, the canonical exact position within the day. */
  minuteOfDay: number;
  /** Device IANA timezone when available. */
  timeZone: string;
  /** 0-23 local hour, for matching against a schedule block's time range. */
  hour: number;
  /** 0-59 local minute, kept alongside the hour for the same reason. */
  minute: number;
  /** Stable for the day, biased to the season, never real. */
  weather: string;
  /** Whole days since the village was founded, 0 on the founding day. */
  dayIndex: number;
  /** First minute after this one. Consumers may refine it with schedule deadlines. */
  nextTransitionAt: string;
};

/**
 * Monday-first, matching the Engine's own `CONVERSATION_SCHEDULE_DAYS`. Native
 * schedules are keyed by these exact strings, so this list is a contract with
 * the Engine rather than a presentation choice — it is spelled out here rather
 * than imported so the package keeps no runtime dependency on the Engine bundle
 * beyond what the host hands it.
 */
export const VILLAGE_WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** Meteorological seasons, so the village turns over with the calendar month. */
const SEASONS_BY_MONTH: readonly VillageSeason[] = [
  "winter",
  "winter",
  "spring",
  "spring",
  "spring",
  "summer",
  "summer",
  "summer",
  "autumn",
  "autumn",
  "autumn",
  "winter",
];

/**
 * The four parts of a village day, in the order the hours run.
 *
 * One table, because the hour a part of day begins and the name it is called by
 * are one fact said twice. `fromHour` is inclusive and the next entry's is
 * exclusive, so the parts tile a real day exactly: no gap, no overlap, and no
 * hour belonging to two of them.
 */
const CLOCKS = [
  { clock: "night", label: "Night", fromHour: 0 },
  { clock: "morning", label: "Morning", fromHour: 5 },
  { clock: "afternoon", label: "Afternoon", fromHour: 12 },
  { clock: "evening", label: "Evening", fromHour: 17 },
] as const;

/** One part of a village day, as something a person can be shown. */
export type VillageClockWindow = {
  /** The part of day, e.g. "morning". The stable identifier, never shown to a player. */
  clock: string;
  /** Title case, for a chip or a heading. */
  label: string;
  /** The hours it covers, e.g. "05:00–11:59". */
  hours: string;
};

const twoDigits = (value: number): string => String(value).padStart(2, "0");

/**
 * The four parts of a village day, in the order they run, with the hours each
 * one covers.
 *
 * Exported because two things outside this file need the same answer. Anything
 * counting how much village time passed between two moments has to agree with
 * `clockForHour` about the order — the happening writer turns a gap into a
 * number of parts of day — and the settings panel offers the player one switch
 * per part, which needs a label and an hour range to be readable. A second copy
 * of any of it written out elsewhere is a second answer waiting to disagree.
 */
export const VILLAGE_CLOCK_WINDOWS: readonly VillageClockWindow[] = CLOCKS.map((entry, index) => {
  // The minute before the next part begins, or 23:59 for the last one. An en
  // dash joins them: a hyphen reads as a minus sign in a time range.
  const endsAtHour = CLOCKS[index + 1]?.fromHour ?? 24;
  return {
    clock: entry.clock,
    label: entry.label,
    hours: `${twoDigits(entry.fromHour)}:00–${twoDigits(endsAtHour - 1)}:59`,
  };
});

/** Just the part-of-day names, in the order the day runs them. */
export const VILLAGE_CLOCKS: readonly string[] = VILLAGE_CLOCK_WINDOWS.map((window) => window.clock);

/** Where a part of day sits in the order, or -1 when it is not one at all. */
export function villageClockIndex(clock: unknown): number {
  return typeof clock === "string" ? VILLAGE_CLOCKS.indexOf(clock) : -1;
}

/**
 * Weather a season can plausibly produce. Deliberately plain: every entry has
 * to read naturally straight after "the weather is ".
 */
const WEATHER_BY_SEASON: Record<VillageSeason, readonly string[]> = {
  spring: ["clear", "overcast", "light rain", "breezy", "warm haze"],
  summer: ["clear", "hot and still", "thunderheads", "dry heat", "breezy"],
  autumn: ["overcast", "drizzle", "cold fog", "windy", "clear"],
  winter: ["overcast", "snow", "sleet", "hard frost", "clear"],
};

const MS_PER_DAY = 86_400_000;

/**
 * A fresh weather seed for a village that is being founded.
 *
 * This is flavour, not a security decision, so `Math.random` is the right tool:
 * it only has to make two villages founded the same day age differently.
 */
export function randomVillageSeed(): string {
  return Math.random().toString(36).slice(2, 10).padEnd(8, "0");
}

/**
 * FNV-1a. Small, dependency-free and stable across runs — which is what
 * weather-by-day needs.
 *
 * Exported because a second thing in the package needs the same property for the
 * same reason: a wish's lifetime is rolled from the wish's own id, so that the
 * same id is always given the same number of days and the debug tab can say how
 * long a wish is meant to last. Two hashes would be two answers to "is this
 * reproducible", and the whole point of rolling from the id is that there is
 * only one.
 */
export function hashString(value: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

/**
 * The day number of a local calendar date. Built from the local Y/M/D rather
 * than from the epoch, so a DST shift cannot make one day last 23 hours and
 * push the village a day out.
 */
function localDayNumber(date: Date): number {
  return Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / MS_PER_DAY);
}

/**
 * Which part of a day an hour falls in.
 *
 * Walked from the end so the table above can be written in the order the day
 * runs while the lookup stays a single comparison per entry.
 */
export function dayPhaseForHour(hour: number): string {
  for (let index = CLOCKS.length - 1; index >= 0; index -= 1) {
    const entry = CLOCKS[index]!;
    if (hour >= entry.fromHour) return entry.clock;
  }
  return CLOCKS[0]!.clock;
}

/**
 * When the part of the day is next a different one: the first minute of the
 * next part, or midnight when the current part is the last of the day.
 *
 * Lives here rather than in the scheduler because it is a fact about the clock,
 * and `clockForHour` is what decides where a part of day ends. The two have to
 * agree or the village would be woken at an hour it just wrote about, or never
 * woken at all.
 */
export function nextClockChangeAt(now: Date): Date {
  const hour = now.getHours();
  const next = CLOCKS.find((entry) => entry.fromHour > hour);
  const at = new Date(now);
  // 24 rolls to midnight tomorrow, which is what the last part of day wants.
  at.setHours(next ? next.fromHour : 24, 0, 0, 0);
  return at;
}

function weatherFor(seed: string, dayIndex: number, season: VillageSeason): string {
  const table = WEATHER_BY_SEASON[season];
  return table[hashString(`${seed}#${dayIndex}`) % table.length]!;
}

/**
 * Everything about "when it is", derived from when the village began and the
 * clock the caller hands in.
 *
 * An unreadable or absent `foundedAt` means the village began today. That is
 * the honest reading: the village keeps its own time from the moment it exists,
 * and a record written before it had a clock should not invent a past.
 */
export function deriveVillageMoment(input: { foundedAt: string; seed: string; now: Date }): VillageMoment {
  const { foundedAt, seed, now } = input;
  const founded = new Date(foundedAt);
  const start = Number.isNaN(founded.getTime()) ? now : founded;
  const dayIndex = Math.max(0, localDayNumber(now) - localDayNumber(start));
  const month = now.getMonth();
  const season = SEASONS_BY_MONTH[month] ?? "spring";
  const hour = now.getHours();
  const minute = now.getMinutes();
  const dayPhase = dayPhaseForHour(hour);
  const nextTransition = nextClockChangeAt(now);
  let timeZone = "local";
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "local";
  } catch {
    // A runtime without Intl still has a perfectly usable device-local clock.
  }
  return {
    dateLabel: `${now.getDate()} ${MONTHS[month]}`,
    weekday: VILLAGE_WEEKDAYS[(now.getDay() + 6) % 7]!,
    season,
    dayPhase,
    instant: now.toISOString(),
    localTime: `${twoDigits(hour)}:${twoDigits(minute)}`,
    minuteOfDay: hour * 60 + minute,
    timeZone,
    hour,
    minute,
    weather: weatherFor(seed, dayIndex, season),
    dayIndex,
    nextTransitionAt: nextTransition.toISOString(),
  };
}

/**
 * The phrase `{{time}}` renders, e.g. "an autumn morning on 11 September".
 *
 * The old wording ("morning on day 1 of Spring") counted days and named a
 * season together, which only made sense while the village clock was a stored
 * counter. At 1:1 the day count and the season are independent facts, so the
 * phrase names the real date instead.
 */
export function describeMoment(moment: VillageMoment): string {
  const article = "aeiou".includes(moment.season.slice(0, 1)) ? "an" : "a";
  return `${article} ${moment.season} ${moment.dayPhase} at ${moment.localTime} on ${moment.dateLabel}`;
}

/**
 * The calendar date a village day falls on, e.g. "12 September".
 *
 * The mirror of the arithmetic in `deriveVillageMoment`: a `dayIndex` is a
 * difference between two LOCAL calendar dates, so the date it names is found by
 * walking that many local days forward from the founding day rather than by
 * adding 86,400,000 milliseconds — a DST shift inside the stretch would put a
 * millisecond sum an hour out and, at the edge, a day out.
 *
 * Kept beside the clock rather than in the rendering code because a date is a
 * fact about the clock. Anything that has to show a stored `dayIndex` as a date
 * asks here, so a memory line and the header above it cannot disagree about
 * what day it is.
 *
 * An unparseable `foundedAt` means the village began today, which is the same
 * reading `deriveVillageMoment` takes: `dayIndex` 0 is then today's date.
 */
export function villageDateLabel(foundedAt: string, dayIndex: number): string {
  const founded = new Date(foundedAt);
  const start = Number.isNaN(founded.getTime()) ? new Date() : founded;
  const day = Number.isFinite(dayIndex) ? Math.max(0, Math.floor(dayIndex)) : 0;
  const at = new Date(start.getFullYear(), start.getMonth(), start.getDate() + day);
  return `${at.getDate()} ${MONTHS[at.getMonth()]}`;
}

/** Spelled out because these are read straight into prose ("three days ago"). */
const AGE_WORDS = ["two", "three", "four", "five", "six"] as const;

/**
 * How long ago a stored `dayIndex` and `clock` were, as a person would say it.
 *
 * This exists because of a failure mode, not because of a preference. A model
 * handed "Day 3" and "Day 5" does not reliably subtract them, and a villager
 * who has been told a conversation happened "this morning" when it happened on
 * Tuesday is not slightly wrong — the shared history is wrong, in the direction
 * that is hardest to notice. So the subtraction happens HERE, in code that
 * cannot get it wrong, and the answer is handed over as prose.
 *
 * A delta that cannot be believed is never rendered as a future: a restored
 * backup or a corrected system date can put an entry ahead of the clock, and
 * "in three days" is not a thing a village can remember. It reads as the
 * vaguest past there is instead.
 *
 * Returns "" when there is genuinely nothing to say — an entry from today whose
 * stored part of day is not one this clock knows cannot be placed before or
 * after now, and guessing "earlier today" would be inventing an ordering. A
 * caller renders the date alone in that case.
 */
export function describeVillageAge(fromDayIndex: number, fromClock: string, moment: VillageMoment): string {
  const days = moment.dayIndex - fromDayIndex;
  if (!Number.isFinite(days) || days < 0) return "recently";
  if (days === 0) {
    const from = villageClockIndex(fromClock);
    if (from < 0) return "";
    // ">=" rather than ">": the same part of day is not earlier than itself.
    return from >= villageClockIndex(moment.dayPhase) ? "not long ago" : "earlier today";
  }
  if (days === 1) return "yesterday";
  if (days < 7) return `${AGE_WORDS[days - 2] ?? "several"} days ago`;
  if (days < 14) return "last week";
  return `${Math.floor(days / 7)} weeks ago`;
}
