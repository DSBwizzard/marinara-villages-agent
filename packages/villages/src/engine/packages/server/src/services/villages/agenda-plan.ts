import { adoptedProfile } from "./owned-routine.js";
import { VILLAGE_CLOCKS, VILLAGE_CLOCK_WINDOWS } from "./village-clock.js";
import { boundText, isHousePlace, MAX_REMAP_HERE_LENGTH } from "./prompt-preset.js";
import type { VillageAgenda, VillageAgendaBlock, VillageDayBlock, VillageVenue } from "./types.js";
import { agendaBlocksFor, agendaDateKey, workingAgendaWeek } from "./agenda-week.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";

type Day = VillageAgenda["day"];

export const VILLAGE_AGENDA_WINDOWS = VILLAGE_CLOCK_WINDOWS.map((window, index) => ({
  legacyClock: window.clock,
  startMinute: [0, 300, 720, 1020][index]!,
  endMinute: [300, 720, 1020, 1440][index]!,
}));

const minuteLabel = (minute: number): string => {
  const bounded = Math.max(0, Math.min(1440, minute));
  const hours = Math.floor(bounded / 60);
  const minutes = bounded % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

/** A complete, repeatable day, even when a model or an older record supplies no itinerary. */
export function villageAgendaDay(proposed: unknown, venues: readonly VillageVenue[], name: string): Day {
  const sendable = venues.filter((venue) => !isHousePlace(venue));
  const offset = [...name].reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
  const defaults = VILLAGE_AGENDA_WINDOWS.map((window, index) => {
    const venue = index === 1 || index === 2 ? sendable[(offset + index - 1) % sendable.length] : undefined;
    return {
      startMinute: window.startMinute,
      endMinute: window.endMinute,
      venueId: venue?.id ?? "",
      activity: venue ? `spending time at ${venue.name}` : index === 0 ? "resting at home" : "taking it easy at home",
    };
  });
  if (!Array.isArray(proposed)) return defaults;
  return defaults.map((fallback, index) => {
    const legacyClock = VILLAGE_CLOCKS[index];
    const item = proposed.find(
      (entry) =>
        entry &&
        typeof entry === "object" &&
        ((entry as Record<string, unknown>).startMinute === fallback.startMinute ||
          (entry as Record<string, unknown>).clock === legacyClock),
    );
    if (!item || typeof item !== "object") return fallback;
    const raw = item as Record<string, unknown>;
    const venueId =
      typeof raw.venue === "number" && Number.isInteger(raw.venue) ? (sendable[raw.venue - 1]?.id ?? "") : "";
    const activity =
      boundText(raw.activity, MAX_REMAP_HERE_LENGTH) ||
      (venueId
        ? `spending time at ${sendable.find((venue) => venue.id === venueId)?.name ?? "the village"}`
        : "taking it easy at home");
    const startMinute =
      typeof raw.startMinute === "number" && Number.isInteger(raw.startMinute)
        ? Math.max(0, Math.min(1439, raw.startMinute))
        : fallback.startMinute;
    const endMinute =
      typeof raw.endMinute === "number" && Number.isInteger(raw.endMinute)
        ? Math.max(startMinute + 1, Math.min(1440, raw.endMinute))
        : fallback.endMinute;
    return { startMinute, endMinute, venueId, activity };
  });
}

export function unwrittenVillageAgenda(venues: readonly VillageVenue[], name: string): VillageAgenda {
  const now = new Date();
  const week = workingAgendaWeek(venues, name);
  const weekday = VILLAGE_WEEKDAYS[(now.getDay() + 6) % 7]!;
  return {
    routineProfile: adoptedProfile(week),
    wishes: [],
    routineSummary: "An ordinary day around the village.",
    day: villageAgendaDay(null, venues, name),
    week,
    scheduleWeek: null,
    activeDay: { dateKey: agendaDateKey(now), weekday, blocks: week[weekday]!, scheduleInformed: false },
    personalizationPending: true,
    source: "village",
    generatedAt: "",
  };
}

export function agendaAt(
  agenda: VillageAgenda | null,
  minuteOfDay: number,
  at = new Date(),
  ingestSchedule = true,
): VillageAgendaBlock | null {
  return agenda
    ? (agendaBlocksFor(agenda, ingestSchedule, at).find(
        (entry) => minuteOfDay >= entry.startMinute && minuteOfDay < entry.endMinute,
      ) ?? null)
    : null;
}

export function agendaDayPlan(
  agenda: VillageAgenda | null,
  minuteOfDay: number,
  at = new Date(),
  ingestSchedule = true,
): VillageDayBlock[] {
  return (agenda ? agendaBlocksFor(agenda, ingestSchedule, at) : []).map((entry) => {
    return {
      time: `${minuteLabel(entry.startMinute)}-${minuteLabel(entry.endMinute)}`,
      activity: entry.activity,
      here: entry.activity,
      reason: entry.reason,
      translated: true,
      venueId: entry.venueId,
      zoneId: entry.zoneId,
      wishId: entry.commitmentId ?? "",
      commitmentId: entry.commitmentId,
      flexible: entry.flexible,
      status: entry.status,
      current: minuteOfDay >= entry.startMinute && minuteOfDay < entry.endMinute,
    };
  });
}
