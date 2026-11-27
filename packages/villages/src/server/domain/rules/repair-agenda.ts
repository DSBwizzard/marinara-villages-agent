import type { RepairField, RepairRecord, RepairValue } from "../../../shared/contracts/repair.js";
import { repairClockMinutes } from "../../../shared/helpers/repair-clock.js";
import { calendarAt, calendarDate, ZonedDate } from "../../../shared/helpers/zoned-date.js";
import type { AgendaPurpose, VillageAgendaBlock, VillageState, VillageVillager } from "../models/world.js";
import { composeAgenda } from "./agenda-composition.js";
import { readAgendaPurpose } from "./agenda-flexibility.js";
import { restingAgendaBlock, scheduledAgendaActivity } from "./agenda-plan.js";
import {
  agendaBlocksFor,
  agendaDateKey,
  agendaPersonalPlansPending,
  completeAgendaWeek,
  ordinaryAgendaBlocksFor,
  workingAgendaWeek,
} from "./agenda-week.js";
import { conflict, repairFieldError, VillagesRequestError } from "./errors.js";
import { memoryHash } from "./memory-integrity.js";
import { validateRoutineDay } from "./owned-routine.js";
import { findLocation } from "./places.js";
import { zoneActivityFits } from "./venue-presence.js";
import { chooseAgendaZone, resolveVenueZone, venueZones, zoneClosed } from "./venue-zones.js";
import { venueResidentIds } from "./venue-model.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";
import { refreshWorkReservations } from "./venue-work.js";
import { planRoutineDays } from "./resident-agenda.js";

export function routineRepairRecord(resident: VillageVillager): RepairRecord | undefined {
  const agenda = resident.agenda;
  if (!agenda) return;
  return {
    id: JSON.stringify(["routine", resident.characterId]),
    topic: "people",
    title: "Routine",
    summary: agenda.routineSummary,
    fields: [
      { key: "summary", label: "Routine", type: "text", value: agenda.routineSummary },
      {
        key: "source",
        label: "Source",
        type: "text",
        readOnly: true,
        value:
          [agenda.routineProfile?.influenceSource, ...(agenda.scheduleInfluenceSnapshot?.adopted ?? [])]
            .filter(Boolean)
            .join("\n") || "Village routine",
      },
    ],
    related: [],
    source: [],
    actions: [
      { id: "correct", label: "Modify" },
      ...(Object.keys(agenda.repairedWeek ?? {}).length ? [{ id: "reset-week", label: "Use saved routine" }] : []),
    ],
  };
}
export function applyRoutineRepair(
  state: VillageState,
  record: RepairRecord,
  values: Record<string, RepairValue>,
  action: string,
  at: string,
): void {
  const actor = JSON.parse(record.id)[1],
    resident = state.villagers.find((p) => p.characterId === actor),
    agenda = resident?.agenda;
  if (!agenda) throw conflict("This person's routine changed.");
  const summary = String(values.summary);
  if (summary.length > 1600) throw repairFieldError("summary", "Shorten the routine summary.");
  agenda.routineSummary = summary;
  if (action === "reset-week") {
    delete agenda.repairedWeek;
    planRoutineDays(state, villageCalendar(state, at));
  }
}

const villageCalendar = (state: VillageState, at: string) =>
  new ZonedDate(at, state.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);
const dateLabel = new Intl.DateTimeFormat("en", { timeZone: "UTC", weekday: "long", month: "short", day: "numeric" });
const clock = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
function minutes(value: RepairValue, key: string) {
  const minute = repairClockMinutes(String(value));
  if (minute === undefined) throw repairFieldError(key, "Use a 24-hour time such as 09:30 or 24:00.");
  return minute;
}

export function requireAgendaDay(state: VillageState, date: string, at: string, wasToday?: boolean) {
  const today = villageCalendar(state, at);
  const key = agendaDateKey(today);
  if (date < key || (wasToday !== undefined && wasToday !== (date === key)))
    throw conflict("The Agenda date rolled over. Open the current schedule and review again.");
  return calendarAt(today, date);
}

function locationLabels<T extends { id: string; name: string }>(locations: T[]) {
  const keyFor = (name: string) => name.normalize("NFKC").trim().toLocaleLowerCase("en-US");
  const count = new Map<string, number>();
  for (const { name } of locations) {
    const key = keyFor(name);
    count.set(key, (count.get(key) ?? 0) + 1);
  }
  const ordinal = new Map<string, number>();
  const labels = new Set(count.keys());
  return locations.map(({ id, name }) => {
    const key = keyFor(name);
    if (count.get(key) === 1) return { value: id, label: name };
    let number = (ordinal.get(key) ?? 0) + 1;
    while (labels.has(keyFor(`${name} (${number})`))) number++;
    ordinal.set(key, number);
    const label = `${name} (${number})`;
    labels.add(keyFor(label));
    return { value: id, label };
  });
}

const activityTypeLabels: Record<AgendaPurpose, string> = {
  unplanned: "Unplanned",
  ordinary: "Ordinary",
  rest: "Rest",
  work: "Work",
  repair: "Repair",
};

export function agendaRepairRecords(state: VillageState, resident: VillageVillager, at: string): RepairRecord[] {
  if (!resident.agenda) return [];
  const agenda = structuredClone(resident.agenda);
  refreshWorkReservations({ ...state, villagers: [{ ...resident, agenda }] }, villageCalendar(state, at));
  const today = villageCalendar(state, at);
  const availableVenues = state.venues.filter((venue) => venue.constructionStatus !== "worksite");
  const venues = locationLabels(availableVenues).map((option, index) => {
    const venue = availableVenues[index]!;
    return { ...option, zones: locationLabels(venueZones(venue).filter((zone) => !zoneClosed(state, venue, zone))) };
  });
  const locationFields = (index: number | "new", block?: VillageAgendaBlock): RepairField[] => [
    { key: `venue:${index}`, label: "Venue", type: "choice", value: block?.venueId ?? "", group: "Location" },
    { key: `zone:${index}`, label: "Zone", type: "choice", value: block?.zoneId ?? "", group: "Location" },
  ];
  const activityFields = (index: number | "new", block?: VillageAgendaBlock): RepairField[] => [
    {
      key: `purpose:${index}`,
      label: "Activity type",
      type: "choice",
      value: block ? (block.purpose ?? "") : "ordinary",
      options: [
        ...(block && !block.purpose ? [{ value: "", label: "Existing type" }] : []),
        ...Object.entries(activityTypeLabels)
          .filter(([value]) => value !== "unplanned" || block?.purpose === value)
          .map(([value, label]) => ({ value, label })),
      ],
    },
    { key: `flexible:${index}`, label: "Can reschedule", type: "boolean", value: block?.flexible === true },
  ];
  return Array.from({ length: 7 }, (_, offset) => {
    const day = calendarDate(today, today.getFullYear(), today.getMonth(), today.getDate() + offset, 12);
    const date = agendaDateKey(day);
    const label = dateLabel.format(new Date(`${date}T12:00:00Z`));
    const scheduled = agendaBlocksFor(agenda, day);
    const ordinary = ordinaryAgendaBlocksFor(agenda, day);
    const fields = ordinary.flatMap<RepairField>((block, index) => {
      if (
        block.commitmentId ||
        !scheduled.some(
          (part) => !part.commitmentId && part.startMinute < block.endMinute && part.endMinute > block.startMinute,
        )
      )
        return [];
      const activity = `Activity ${index + 1}`;
      return [
        {
          key: `activity:${index}`,
          label: activity,
          type: "text",
          value: block.activity,
          multiline: false,
          group: "Activity",
        },
        {
          key: `start:${index}`,
          label: `${activity} start`,
          type: "clock",
          value: clock(block.startMinute),
          group: "Time",
        },
        { key: `end:${index}`, label: `${activity} end`, type: "clock", value: clock(block.endMinute), group: "Time" },
        ...locationFields(index, block),
        ...activityFields(index, block),
        {
          key: `repeat:${index}`,
          label: "Repeat",
          type: "choice",
          value: "date",
          options: [
            { value: "date", label: "This date only" },
            { value: "weekly", label: `Every ${VILLAGE_WEEKDAYS[(day.getDay() + 6) % 7]}` },
          ],
        },
      ];
    });
    const blocks = scheduled.map((block) => {
      const place = findLocation(state, block.venueId);
      const zone = place && block.zoneId ? resolveVenueZone(place, block.zoneId) : null;
      const option = venues.find((entry) => entry.value === block.venueId);
      const booking = agenda.reservations?.find(
        (entry) =>
          entry.dateKey === date &&
          (entry.id === block.commitmentId ||
            (entry.source === "work" &&
              !block.essential &&
              !restingAgendaBlock(block) &&
              entry.venueId === block.venueId &&
              entry.zoneId === block.zoneId &&
              entry.activity === block.activity &&
              entry.startMinute <= block.startMinute &&
              entry.endMinute >= block.endMinute)),
      );
      const index =
        block.commitmentId || booking
          ? -1
          : ordinary.findIndex((part) => part.startMinute <= block.startMinute && part.endMinute >= block.endMinute);
      return {
        startMinute: block.startMinute,
        endMinute: block.endMinute,
        activity: block.activity,
        place: [
          option?.label ?? (place ? `${place.name} (unavailable)` : block.venueId ? "Unavailable location" : ""),
          option?.zones.find((entry) => entry.value === block.zoneId)?.label ??
            (zone ? `${zone.name} (unavailable)` : block.zoneId && place ? "Unavailable Zone" : ""),
        ]
          .filter(Boolean)
          .join(", "),
        ...(restingAgendaBlock(block) ? { resting: true as const } : {}),
        ...(booking?.source === "appointment" ? { source: "agreed" as const } : {}),
        ...(booking?.source === "project"
          ? { note: "Project reservation" }
          : block.commitmentId && !booking
            ? { note: "Commitment" }
            : {}),
        ...(index >= 0 ? { repairIndex: index } : {}),
        ...(booking?.source === "appointment"
          ? { repairRecordId: JSON.stringify(["appointment", resident.characterId, booking.id]) }
          : {}),
        ...(booking?.source === "work"
          ? { repairRecordId: JSON.stringify(["work", resident.characterId, booking.venueId]) }
          : {}),
        ...(booking?.source === "project" ? { repairRecordId: JSON.stringify(["project", booking.id]) } : {}),
        ...(booking?.source === "social" ? { repairRecordId: JSON.stringify(["social-plan", booking.id]) } : {}),
      };
    });
    return {
      id: JSON.stringify(["agenda", resident.characterId, date]),
      topic: "people",
      title: `${resident.cardSnapshot.name}, Agenda, ${label}`,
      agendaDay: label,
      agenda: {
        residentId: resident.characterId,
        today: offset === 0,
        venues,
        date,
        weekday: VILLAGE_WEEKDAYS[(day.getDay() + 6) % 7]!,
        ...(agendaPersonalPlansPending(agenda, date) ? { personalPlansPending: true as const } : {}),
        blocks: blocks.filter((_, index) => scheduledAgendaActivity(scheduled[index]!)),
      },
      summary: offset === 0 ? "Today, Agenda" : "Agenda",
      fields: [
        ...fields,
        { key: "activity:new", label: "Activity", type: "text", value: "", multiline: false, group: "Activity" },
        { key: "start:new", label: "Start", type: "clock", value: "", group: "Time" },
        { key: "end:new", label: "End", type: "clock", value: "", group: "Time" },
        ...locationFields("new"),
        ...activityFields("new"),
        {
          key: "repeat:new",
          label: "Repeat",
          type: "choice",
          value: "date",
          options: [
            { value: "date", label: "This date only" },
            { value: "weekly", label: `Every ${VILLAGE_WEEKDAYS[(day.getDay() + 6) % 7]}` },
          ],
        },
      ],
      source: blocks.map((block, index) => {
        const activity = scheduled[index]!;
        return [
          `${clock(block.startMinute)}–${clock(block.endMinute)}`,
          block.activity,
          block.place,
          block.source === "agreed" ? "Agreed plan" : block.note,
          activity.purpose ? activityTypeLabels[activity.purpose] : "",
          activity.flexible === true ? "Can reschedule" : "",
        ]
          .filter(Boolean)
          .join(", ");
      }),
      actions: [
        ...(fields.length ? [{ id: "correct", label: "Modify" }] : []),
        ...(fields.length ? [{ id: "remove-activity", label: "Remove activity" }] : []),
        { id: "add-activity", label: "Add activity" },
      ],
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
  add: boolean,
  remove = false,
) {
  const day = requireAgendaDay(state, date, at);
  const resident = state.villagers.find((entry) => entry.characterId === residentId);
  const agenda = resident?.agenda;
  if (!agenda) throw conflict("This Agenda day is no longer editable.");
  const before = ordinaryAgendaBlocksFor(agenda, day);
  const reservations = (agenda.reservations ?? []).filter((entry) => entry.dateKey === date);
  const changed = before.findIndex(
    (block, index) =>
      (values[`start:${index}`] !== undefined && values[`start:${index}`] !== clock(block.startMinute)) ||
      (values[`end:${index}`] !== undefined && values[`end:${index}`] !== clock(block.endMinute)),
  );
  const timeField = add
    ? "start:new"
    : changed < 0
      ? ""
      : `${values[`start:${changed}`] === clock(before[changed]!.startMinute) ? "end" : "start"}:${changed}`;
  const timeError = (message: string, status = 409) =>
    timeField ? repairFieldError(timeField, message, status) : new VillagesRequestError(status, message);
  const moved: {
    item: VillageAgendaBlock;
    index: number | "new";
    explicitZone: string | undefined;
    prior?: VillageAgendaBlock;
  }[] = [];
  const activityFor = (index: number | "new", block?: VillageAgendaBlock) => {
    const activity = String(values[`activity:${index}`] ?? "").trim();
    if (!activity || activity.length > 240)
      throw repairFieldError(`activity:${index}`, "Enter an activity of up to 240 characters.");
    const startMinute = minutes(values[`start:${index}`]!, `start:${index}`);
    const endMinute = minutes(values[`end:${index}`]!, `end:${index}`);
    if (endMinute <= startMinute) throw repairFieldError(`end:${index}`, "End time must be after the start time.");
    const venueId = String(values[`venue:${index}`] ?? block?.venueId ?? "");
    const zoneId = String(values[`zone:${index}`] ?? block?.zoneId ?? "") || undefined;
    const requestedPurpose = values[`purpose:${index}`];
    const selectedPurpose =
      requestedPurpose === undefined || requestedPurpose === ""
        ? block
          ? block.purpose
          : "ordinary"
        : readAgendaPurpose(requestedPurpose);
    if (requestedPurpose && (!selectedPurpose || (selectedPurpose === "unplanned" && block?.purpose !== "unplanned")))
      throw repairFieldError(`purpose:${index}`, "Choose an activity type.");
    const purpose =
      selectedPurpose === "unplanned" && block && activity !== block.activity ? "ordinary" : selectedPurpose;
    const requestedFlexibility = values[`flexible:${index}`] ?? block?.flexible === true;
    if (typeof requestedFlexibility !== "boolean")
      throw repairFieldError(`flexible:${index}`, "Choose whether to allow rescheduling.");
    const flexible = purpose !== "rest" && requestedFlexibility;
    const relocating = !block || venueId !== block.venueId || zoneId !== (block.zoneId || undefined);
    if (
      block &&
      !relocating &&
      activity === block.activity &&
      purpose === block.purpose &&
      flexible === (block.flexible === true) &&
      startMinute === block.startMinute &&
      endMinute === block.endMinute
    )
      return block;
    if (relocating) {
      const venue = state.venues.find((entry) => entry.id === venueId);
      if ((venueId && !venue) || (zoneId && !venue))
        throw repairFieldError(`venue:${index}`, "Choose an available Venue.");
      if (zoneId && venue && !resolveVenueZone(venue, zoneId))
        throw repairFieldError(`zone:${index}`, "Choose a Zone in this Venue.");
    }
    const edited = {
      ...block,
      purpose,
      flexible,
      activity,
      startMinute,
      endMinute,
      venueId,
      zoneId,
    };
    const checked = validateRoutineDay([edited], resident, state, day)[0]!;
    if (checked.venueId !== edited.venueId) {
      const message = "The activity's location is unavailable at the start time.";
      if (relocating) throw repairFieldError(`${zoneId ? "zone" : "venue"}:${index}`, message, 409);
      throw timeError(message);
    }
    if (relocating || (zoneId && block && (startMinute < block.startMinute || endMinute > block.endMinute)))
      moved.push({ item: checked, index, explicitZone: zoneId, prior: relocating ? undefined : block });
    return checked;
  };
  let blocks;
  if (add) {
    const item = activityFor("new");
    const overlaps = (block: { startMinute: number; endMinute: number }) =>
      block.startMinute < item.endMinute && block.endMinute > item.startMinute;
    if (reservations.some(overlaps) || before.some((block) => block.commitmentId && overlaps(block)))
      throw timeError("That time overlaps reserved time. Choose another time for this activity.");
    if (before.some((block) => block.essential && overlaps(block)))
      throw timeError("That time overlaps an essential activity. Choose another time.");
    blocks = before.flatMap((block) =>
      !overlaps(block)
        ? [block]
        : [
            ...(block.startMinute < item.startMinute ? [{ ...block, endMinute: item.startMinute }] : []),
            ...(block.endMinute > item.endMinute ? [{ ...block, startMinute: item.endMinute }] : []),
          ],
    );
    blocks.push(item);
  } else {
    blocks = before.flatMap((block, index) => {
      if (values[`activity:${index}`] === undefined) return [block];
      if (remove) {
        if (block.essential || block.commitmentId)
          throw timeError("Keep essential rest and edit reserved commitments through their owning record.");
        return [];
      }
      return [activityFor(index, block)];
    });
  }
  blocks.sort((a, b) => a.startMinute - b.startMinute);
  if (blocks.some((block, index) => index > 0 && block.startMinute < blocks[index - 1]!.endMinute))
    throw timeError("Agenda activities cannot overlap.", 400);
  const corrected = completeAgendaWeek({ Monday: blocks }, workingAgendaWeek()).Monday!;
  const commitments = (rows: VillageAgendaBlock[]) => {
    const intervals: VillageAgendaBlock[] = [];
    for (const block of rows) {
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
  const scheduledBefore = composeAgenda(before, reservations);
  const scheduledAfter = composeAgenda(corrected, reservations);
  if (memoryHash(commitments(scheduledBefore)) !== memoryHash(commitments(scheduledAfter)))
    throw timeError("This change would move or displace reserved time. Keep the existing commitments in place.");
  const repeating = Object.entries(values).find(([key, value]) => key.startsWith("repeat:") && value === "weekly");
  if (memoryHash(corrected) === memoryHash(before) && !repeating) return;
  const home = state.venues.find((entry) => venueResidentIds(entry).includes(residentId));
  const locationFor = (item: VillageAgendaBlock) => findLocation(state, item.venueId) ?? home;
  for (const block of scheduledAfter) {
    const relocation = moved.find(
      ({ item }) =>
        item.startMinute <= block.startMinute &&
        item.endMinute >= block.endMinute &&
        block.venueId === item.venueId &&
        block.zoneId === item.zoneId,
    );
    if (
      block.commitmentId ||
      (!relocation &&
        scheduledBefore.some(
          (prior) =>
            prior.startMinute <= block.startMinute &&
            prior.endMinute >= block.endMinute &&
            prior.venueId === block.venueId &&
            prior.zoneId === block.zoneId &&
            prior.activity === block.activity,
        ))
    )
      continue;
    const venue = locationFor(block);
    if (!venue) continue;
    const zoneFor = (item: VillageAgendaBlock, at: Date) =>
      chooseAgendaZone(venue, residentId, item, item.zoneId, state, { at }).id;
    const available = zoneActivityFits(
      state,
      [residentId],
      venue.id,
      (at, minute) => {
        const zone = zoneFor(block, at);
        const checkZone =
          relocation?.explicitZone &&
          (!relocation.prior || minute < relocation.prior.startMinute || minute >= relocation.prior.endMinute);
        if (relocation && checkZone && zone !== relocation.explicitZone) {
          const message = "This Zone is unavailable for part of that time. Choose another time or Zone.";
          if (relocation.prior) throw timeError(message);
          throw repairFieldError(`zone:${relocation.index}`, message, 409);
        }
        const prior = scheduledBefore.find((item) => minute >= item.startMinute && minute < item.endMinute);
        const samePlacement = prior && locationFor(prior)?.id === venue.id && zone === zoneFor(prior, at);
        return samePlacement && !checkZone ? undefined : zone;
      },
      block.startMinute,
      block.endMinute,
      day,
    );
    if (!available) {
      const message = "That location is full at this time. Choose another time or location.";
      if (relocation && !relocation.prior && (relocation.index !== "new" || relocation.item.venueId))
        throw repairFieldError(`${relocation.explicitZone ? "zone" : "venue"}:${relocation.index}`, message, 409);
      throw timeError(message);
    }
  }
  (agenda.plannedDays ??= {})[date] = corrected;
  if (date === agendaDateKey(villageCalendar(state, at))) {
    agenda.activeDay = {
      dateKey: date,
      weekday: VILLAGE_WEEKDAYS[(day.getDay() + 6) % 7]!,
      blocks: corrected,
      scheduleInformed: agenda.activeDay?.dateKey === date && agenda.activeDay.scheduleInformed,
    };
  }
  if (!(agenda.repairedDays ??= []).includes(date)) agenda.repairedDays.push(date);
  if (repeating) {
    const selected = repeating[0].slice(7),
      original = selected === "new" ? undefined : before[Number(selected)],
      weekday = VILLAGE_WEEKDAYS[(day.getDay() + 6) % 7]!;
    const repeatingAgenda = structuredClone(agenda);
    delete repeatingAgenda.activeDay;
    repeatingAgenda.plannedDays = {};
    const weekly = ordinaryAgendaBlocksFor(repeatingAgenda, day);
    const index = original ? weekly.findIndex((block) => memoryHash(block) === memoryHash(original)) : -1;
    if (remove && index < 0) throw timeError("This activity has no repeating source. Remove it for this date only.");
    const target = index < 0 ? "new" : String(index),
      repeatedValues: Record<string, RepairValue> = {};
    for (const key of ["activity", "start", "end", "venue", "zone", "purpose", "flexible"])
      if (values[`${key}:${selected}`] !== undefined)
        repeatedValues[`${key}:${target}`] = values[`${key}:${selected}`]!;
    const repeatedState = {
      ...state,
      villagers: state.villagers.map((person) =>
        person === resident ? { ...person, agenda: repeatingAgenda } : person,
      ),
    };
    applyAgendaRepair(repeatedState, residentId, date, repeatedValues, at, index < 0, remove);
    const repeatedDay = repeatingAgenda.plannedDays?.[date];
    if (!repeatedDay) return;
    (agenda.repairedWeek ??= {})[weekday] = repeatedDay;
    for (const key of Object.keys(agenda.plannedDays ?? {})) {
      if (
        key !== date &&
        !agenda.repairedDays?.includes(key) &&
        new ZonedDate(`${key}T12:00:00Z`, "UTC").getDay() === day.getDay()
      )
        delete agenda.plannedDays![key];
    }
  }
}
