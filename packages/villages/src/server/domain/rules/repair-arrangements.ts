import type { VillageState } from "../models/world.js";
import type { RepairField, RepairRecord, RepairRequest } from "../../../shared/contracts/repair.js";
import { WORK_DAYS, venueWorkSchema, workTime } from "../../../shared/helpers/venue-work.js";
import { contactNeighborIds } from "../../../shared/helpers/zone-contact.js";
import { repairClockMinutes } from "../../../shared/helpers/repair-clock.js";
import { badRequest, conflict } from "./errors.js";
import { venueZones } from "./venue-zones.js";
import { initializeVenueAccess } from "./venue-access.js";
import { assertWorkSchedules, refreshWorkReservations } from "./venue-work.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { repairSceneAppointment } from "./agenda-overview.js";

const id = (...parts: string[]) => JSON.stringify(parts);
const text = (key: string, label: string, value: string): RepairField => ({
  key,
  label,
  value,
  type: "text",
  multiline: false,
});
export function arrangementRepairRecords(state: VillageState): RepairRecord[] {
  const locations = [
    ...state.venues,
    ...Object.values(state.worldPlaces.places)
      .filter((place) => !place.disabled)
      .map((place) => place.location),
  ].filter((venue) => venue.constructionStatus !== "worksite");
  const destinations = (venueId: string, zoneId: string, choices = locations): RepairField[] => [
    {
      key: "venueId",
      label: "Location",
      type: "choice",
      value: venueId,
      options: [
        { value: "", label: "Choose a location" },
        ...choices.map((venue) => ({ value: venue.id, label: venue.name })),
      ],
    },
    {
      key: "zoneId",
      label: "Zone",
      type: "choice",
      value: zoneId,
      dependsOn: "venueId",
      options: [
        { value: "", label: "Choose a Zone" },
        ...choices.flatMap((venue) =>
          venueZones(venue).map((zone) => ({ value: zone.id, label: zone.name, parent: venue.id })),
        ),
      ],
    },
  ];
  const record = (
    parts: string[],
    title: string,
    summary: string,
    fields: RepairField[],
    source: string[] = [],
  ): RepairRecord => ({
    id: id(...parts),
    topic: "people",
    title,
    summary,
    fields,
    source,
    actions: [
      { id: "correct", label: "Modify" },
      ...(parts[0] === "work" && parts[2] === "new" ? [] : [{ id: "cancel", label: "Remove" }]),
    ],
    related: [],
  });
  const records: RepairRecord[] = [];
  for (const resident of state.villagers) {
    const works = state.venues.flatMap((venue) =>
      (venue.access?.work ?? [])
        .filter((work) => work.characterId === resident.characterId)
        .map((work) => ({ venue, work })),
    );
    for (const current of works.length ? works : [undefined]) {
      const work = current?.work;
      records.push(
        record(
          ["work", resident.characterId, current?.venue.id ?? "new"],
          current ? current.venue.name + ", Work" : "Work",
          "Work arrangement",
          [
            ...destinations(
              current?.venue.id ?? "",
              work?.zoneId ?? "",
              state.venues.filter((venue) => venue.constructionStatus !== "worksite"),
            ),
            text("activity", "Work", work?.activity ?? ""),
            { key: "inviteGuests", label: "May invite guests", type: "boolean", value: work?.inviteGuests ?? false },
            {
              key: "days",
              label: "Days",
              type: "days",
              value: work?.days.join(",") ?? "Monday,Tuesday,Wednesday,Thursday,Friday",
              options: WORK_DAYS.map((day) => ({ value: day, label: day.slice(0, 3) })),
            },
            { key: "start", label: "Start", type: "clock", value: workTime(work?.startMinute ?? 540) },
            { key: "end", label: "End", type: "clock", value: workTime(work?.endMinute ?? 1020) },
          ],
          current
            ? [
                "Work access: " +
                  work!.accessZoneIds
                    .map((zone) => venueZones(current.venue).find((entry) => entry.id === zone)?.name)
                    .filter(Boolean)
                    .join(", "),
              ]
            : [],
        ),
      );
    }
  }
  for (const booking of state.residentPlans.appointments ?? [])
    records.push(
      record(["appointment", booking.resident.id, booking.id], booking.activity, "Agreed plan", [
        text("activity", "Activity", booking.activity),
        { key: "date", label: "Date", type: "date", value: booking.time.date },
        { key: "start", label: "Start", type: "clock", value: workTime(booking.time.startMinute) },
        { key: "end", label: "End", type: "clock", value: workTime(booking.time.endMinute) },
        ...destinations(booking.time.venueId, booking.time.zoneId ?? "exterior"),
      ]),
    );
  return records;
}

export function applyArrangementRepair(state: VillageState, record: RepairRecord, request: RepairRequest, at: string) {
  const [kind, actor, originalVenue] = JSON.parse(record.id) as string[];
  const value = (key: string) =>
    String(request.values[key] ?? record.fields.find((field) => field.key === key)?.value ?? "");
  const startMinute = repairClockMinutes(value("start")),
    endMinute = repairClockMinutes(value("end"));
  if (request.action !== "cancel" && (startMinute === undefined || endMinute === undefined || startMinute >= endMinute))
    throw badRequest("Choose a start time and a later end time.");
  if (kind === "appointment") {
    repairSceneAppointment(
      state,
      originalVenue!,
      request.action === "cancel"
        ? null
        : {
            activity: value("activity"),
            time: {
              date: value("date"),
              startMinute: startMinute!,
              endMinute: endMinute!,
              venueId: value("venueId"),
              zoneId: value("zoneId"),
            },
          },
      at,
      request.operationId,
    );
    return;
  }
  const resident = state.villagers.find((person) => person.characterId === actor);
  if (!resident) throw conflict("This worker is no longer a Villager.");
  const prior = state.venues.find((venue) => venue.id === originalVenue);
  const existing = prior?.access?.work?.find((work) => work.characterId === actor);
  if (originalVenue !== "new" && !existing) throw conflict("This work arrangement changed.");
  if (prior?.access) {
    prior.access.work = prior.access.work?.filter((work) => work !== existing);
    prior.workerIds = prior.workerIds?.filter((id) => id !== actor);
    if (prior.destinations?.[actor!]) delete prior.destinations[actor!]!.work;
    prior.access.revision++;
  }
  if (request.action !== "cancel") {
    const venue = state.venues.find((entry) => entry.id === value("venueId"));
    if (!venue || venue.constructionStatus === "worksite")
      throw badRequest("Choose a completed Venue as the workplace.");
    const zones = venueZones(venue),
      routes = new Map<string, string[]>([["exterior", []]]),
      queue = ["exterior"];
    for (const from of queue)
      for (const next of contactNeighborIds(zones, from)) {
        const zone = zones.find((entry) => entry.id === next);
        if (routes.has(next) || !zone || (zone.ownerId && zone.ownerId !== actor)) continue;
        routes.set(next, [...routes.get(from)!, next]);
        queue.push(next);
      }
    const route = routes.get(value("zoneId"));
    if (!route?.length) throw badRequest("Choose a work Zone with an available route from Entrance.");
    const parsed = venueWorkSchema.safeParse({
      characterId: actor,
      activity: value("activity"),
      inviteGuests:
        request.values.inviteGuests ?? record.fields.find((field) => field.key === "inviteGuests")?.value ?? false,
      zoneId: value("zoneId"),
      days: value("days").split(","),
      startMinute,
      endMinute,
      accessZoneIds: [...new Set([...(venue.id === prior?.id ? (existing?.accessZoneIds ?? []) : []), ...route])],
    });
    if (!parsed.success) throw badRequest("Check the work activity, days and hours.");
    initializeVenueAccess(venue);
    venue.access!.work = [...(venue.access!.work ?? []), parsed.data];
    venue.access!.revision++;
    venue.workerIds = [...new Set([...(venue.workerIds ?? []), actor!])];
    (venue.destinations ??= {})[actor!] = { ...venue.destinations?.[actor!], work: parsed.data.zoneId };
  }
  assertWorkSchedules(
    state.venues,
    state.villagers.map((person) => person.characterId),
  );
  refreshWorkReservations(state, new ZonedDate(at, state.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone));
}
