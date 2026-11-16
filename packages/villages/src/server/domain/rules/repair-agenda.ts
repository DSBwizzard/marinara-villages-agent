import type { RepairField, RepairRecord, RepairValue } from "../../../shared/contracts/repair.js";
import { calendarAt, calendarDate, ZonedDate } from "../../../shared/helpers/zoned-date.js";
import type { VillageAgendaBlock, VillageState, VillageVillager } from "../models/world.js";
import { composeAgenda } from "./agenda-composition.js";
import { restingAgendaBlock, scheduledAgendaActivity } from "./agenda-plan.js";
import {
  agendaBlocksFor,
  agendaDateKey,
  completeAgendaWeek,
  ordinaryAgendaBlocksFor,
  workingAgendaWeek,
} from "./agenda-week.js";
import { badRequest, conflict } from "./errors.js";
import { memoryHash } from "./memory-integrity.js";
import { validateRoutineDay } from "./owned-routine.js";
import { findLocation } from "./places.js";
import { resolveVenueZone } from "./venue-zones.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";

const villageCalendar = (state: VillageState, at: string) =>
  new ZonedDate(at, state.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);
const dateLabel = new Intl.DateTimeFormat("en", { timeZone: "UTC", weekday: "long", month: "short", day: "numeric" });
const clock = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
function minutes(value: RepairValue) {
  const match = /^(\d{1,2}):([0-5]\d)$/.exec(String(value).trim());
  const minute = match ? Number(match[1]) * 60 + Number(match[2]) : NaN;
  if (!Number.isInteger(minute) || minute > 1440) throw badRequest("Use a 24-hour time such as 09:30 or 24:00.");
  return minute;
}

export function requireFutureAgendaDay(state: VillageState, date: string, at: string) {
  const today = villageCalendar(state, at);
  if (date <= agendaDateKey(today)) throw conflict("This Agenda day has already started. Choose an upcoming date.");
  return calendarAt(today, date);
}

export function agendaRepairRecords(state: VillageState, resident: VillageVillager, at: string): RepairRecord[] {
  const agenda = resident.agenda;
  if (!agenda) return [];
  const today = villageCalendar(state, at);
  return Array.from({ length: 7 }, (_, offset) => {
    const day = calendarDate(today, today.getFullYear(), today.getMonth(), today.getDate() + offset, 12);
    const date = agendaDateKey(day);
    const label = dateLabel.format(new Date(`${date}T12:00:00Z`));
    const scheduled = agendaBlocksFor(agenda, day);
    const ordinary = ordinaryAgendaBlocksFor(agenda, day);
    const editable = offset > 0 && agenda.activeDay?.dateKey !== date;
    const fields = editable
      ? ordinary.flatMap<RepairField>((block, index) => {
          if (
            block.commitmentId ||
            !scheduled.some(
              (part) => !part.commitmentId && part.startMinute < block.endMinute && part.endMinute > block.startMinute,
            )
          )
            return [];
          const activity = `Activity ${index + 1}`;
          return [
            { key: `activity:${index}`, label: activity, type: "text", value: block.activity },
            { key: `start:${index}`, label: `${activity} start`, type: "clock", value: clock(block.startMinute) },
            { key: `end:${index}`, label: `${activity} end`, type: "clock", value: clock(block.endMinute) },
          ];
        })
      : [];
    const blocks = scheduled.map((block) => {
      const place = findLocation(state, block.venueId);
      const zone = place && block.zoneId ? resolveVenueZone(place, block.zoneId) : null;
      const booking = agenda.reservations?.find((entry) => entry.dateKey === date && entry.id === block.commitmentId);
      const index = block.commitmentId
        ? -1
        : ordinary.findIndex((part) => part.startMinute <= block.startMinute && part.endMinute >= block.endMinute);
      return {
        startMinute: block.startMinute,
        endMinute: block.endMinute,
        activity: block.activity,
        place: [place?.name, zone?.name].filter(Boolean).join(" · "),
        ...(restingAgendaBlock(block) ? { resting: true as const } : {}),
        ...(booking?.source === "appointment" ? { source: "agreed" as const } : {}),
        ...(booking?.source === "project"
          ? { note: "Project reservation" }
          : block.commitmentId && !booking
            ? { note: "Commitment" }
            : {}),
        ...(editable && index >= 0 ? { repairIndex: index } : {}),
      };
    });
    return {
      id: JSON.stringify(["agenda", resident.characterId, date]),
      topic: "people",
      title: `${resident.cardSnapshot.name} · Agenda · ${label}`,
      agendaDay: label,
      agenda: {
        residentId: resident.characterId,
        date,
        weekday: VILLAGE_WEEKDAYS[(day.getDay() + 6) % 7]!,
        blocks: blocks.filter((_, index) => scheduledAgendaActivity(scheduled[index]!)),
      },
      summary: offset === 0 ? "Today · View schedule" : "View schedule",
      fields,
      source: blocks.map((block) =>
        [
          `${clock(block.startMinute)}–${clock(block.endMinute)}`,
          block.activity,
          block.place,
          block.source === "agreed" ? "Agreed plan" : block.note,
        ]
          .filter(Boolean)
          .join(" · "),
      ),
      actions: fields.length ? [{ id: "correct", label: "Modify" }] : [],
      related: [],
    };
  });
}

export function applyAgendaRepair(
  state: VillageState,
  residentId: string,
  date: string,
  values: Record<string, RepairValue>,
  at: string,
) {
  const day = requireFutureAgendaDay(state, date, at);
  const resident = state.villagers.find((entry) => entry.characterId === residentId);
  const agenda = resident?.agenda;
  if (!agenda || agenda.activeDay?.dateKey === date) throw conflict("This Agenda day is no longer editable.");
  const before = ordinaryAgendaBlocksFor(agenda, day);
  const blocks = before
    .map((block, index) => {
      const value = values[`activity:${index}`];
      if (value === undefined) return block;
      const activity = String(value).trim(),
        startMinute = minutes(values[`start:${index}`]!),
        endMinute = minutes(values[`end:${index}`]!);
      if (!activity || activity.length > 240) throw badRequest("Enter a short activity description.");
      if (endMinute <= startMinute) throw badRequest("Each activity must end after it starts.");
      if (activity === block.activity && startMinute === block.startMinute && endMinute === block.endMinute)
        return block;
      const edited = { ...block, activity, startMinute, endMinute };
      const checked = validateRoutineDay([edited], resident, state, day)[0]!;
      if (checked.venueId !== edited.venueId) throw conflict("The activity's location is unavailable at that time.");
      return checked;
    })
    .sort((a, b) => a.startMinute - b.startMinute);
  if (blocks.some((block, index) => index > 0 && block.startMinute < blocks[index - 1]!.endMinute))
    throw badRequest("Agenda activities cannot overlap.");
  const corrected = completeAgendaWeek({ Monday: blocks }, workingAgendaWeek()).Monday!;
  const reservations = (agenda.reservations ?? []).filter((entry) => entry.dateKey === date);
  const commitments = (rows: VillageAgendaBlock[]) => {
    const intervals: VillageAgendaBlock[] = [];
    for (const block of composeAgenda(rows, reservations)) {
      if (!block.commitmentId) continue;
      const previous = intervals.at(-1);
      if (
        previous?.endMinute === block.startMinute &&
        previous.commitmentId === block.commitmentId &&
        previous.activity === block.activity &&
        previous.venueId === block.venueId &&
        previous.zoneId === block.zoneId
      ) {
        previous.endMinute = block.endMinute;
      } else intervals.push(block);
    }
    return intervals;
  };
  if (memoryHash(commitments(before)) !== memoryHash(commitments(corrected)))
    throw conflict("This change would move or displace reserved time. Keep the existing commitments in place.");
  if (memoryHash(corrected) === memoryHash(before)) return;
  (agenda.plannedDays ??= {})[date] = corrected;
  if (!(agenda.repairedDays ??= []).includes(date)) agenda.repairedDays.push(date);
}
