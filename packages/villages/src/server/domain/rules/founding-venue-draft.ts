import { foundingPeopleSchema } from "../../../shared/helpers/founding-people.js";
import { applyFoundingPeople } from "../../../shared/helpers/founding-people.js";
import { readZonePolicy } from "./venue-access.js";
import type { FoundingVenueSuggestion } from "../../../shared/contracts/founding.js";
import { applyFoundingVenueDraft } from "../../../shared/helpers/founding-venue-draft.js";
import { connectionProblem, materializeConnections } from "../../../shared/helpers/zone-contact.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import { badRequest } from "./errors.js";
import { parsePlace } from "./founding-record.js";
import { accessibleVenueRoute } from "./venue-path.js";

function readDayNight(value: unknown): boolean {
  if (typeof value !== "boolean") throw badRequest("The Zone daylight decision must be on or off.");
  return value;
}

export function readFoundingVenueDraftSource(value: unknown) {
  const row = asRecord(value);
  const originalLinks = new Map<string, string[] | undefined>();
  const areas = (value: unknown) => {
    if (!Array.isArray(value) || value.length > 6) throw badRequest("A Venue has at most six Zones.");
    return value.map((value) => {
      const area = asRecord(value);
      if (
        area.connectedTo !== undefined &&
        (!Array.isArray(area.connectedTo) || area.connectedTo.some((id) => typeof id !== "string"))
      )
        throw badRequest("Give each existing Zone a list of connections.");
      originalLinks.set(asTrimmedString(area.id), area.connectedTo as string[] | undefined);
      return {
        ...area,
        name: asTrimmedString(area.name) || "Zone",
        purpose: asTrimmedString(area.purpose) || "Everyday activities",
        description: asTrimmedString(area.description) || "An unfinished Zone.",
        // The requested plan replaces links; source validation must permit repairing a disconnected draft.
        connectedTo: ["exterior"],
      };
    });
  };
  const parsed = parsePlace({
    ...row,
    name: asTrimmedString(row.name) || "Venue",
    form: asTrimmedString(row.form) || "An unfinished place",
    description: asTrimmedString(row.description) || "An unfinished Entrance.",
    spaces: areas(row.spaces ?? []),
    privateSpaces: areas(row.privateSpaces ?? []),
  });
  parsed.zones = materializeConnections(
    parsed.zones!.map((zone) => ({
      ...zone,
      connectedTo: zone.kind === "exterior" ? undefined : originalLinks.get(zone.id),
    })),
  );
  parsed.spaces = parsed.zones.filter((zone) => zone.kind !== "exterior" && zone.kind !== "personal");
  parsed.privateSpaces = parsed
    .zones!.filter((zone) => zone.kind === "personal")
    .map((zone) => ({ ...zone, ownerId: zone.ownerId ?? "" }));
  return parsed;
}

export function readFoundingZoneIds(value: unknown, source: ReturnType<typeof readFoundingVenueDraftSource>): string[] {
  const existing = source.zones!.map((zone) => zone.id);
  if (
    !Array.isArray(value) ||
    value.length > 6 - existing.length + 1 ||
    value.some((id) => typeof id !== "string" || !id.trim() || id.length > 300 || existing.includes(id)) ||
    new Set(value).size !== value.length
  )
    throw badRequest("The Venue draft needs distinct new Zone IDs.");
  return value as string[];
}

export function parseFoundingVenueDraft(
  value: unknown,
  source: ReturnType<typeof readFoundingVenueDraftSource>,
  newIds: string[],
  at: Date,
  allowedActors = [...(source.residentIds ?? []), ...(source.workerIds ?? []), "player"],
): FoundingVenueSuggestion {
  const payload = asRecord(value),
    rows = payload.venues;
  if (!Array.isArray(rows) || rows.length !== 1 || asRecord(rows[0]).id !== source.id)
    throw badRequest("Return the selected Venue exactly once.");
  const row = asRecord(rows[0]);
  const text = (item: Record<string, unknown>, key: string, max: number) => {
    const value = asTrimmedString(item[key]);
    if (!value || value.length > max) throw badRequest(`Complete the Venue draft's ${key}.`);
    return value;
  };
  if (!Array.isArray(row.zones) || row.zones.length > 6) throw badRequest("The Venue draft has at most six Zones.");
  let people = row.people === undefined ? undefined : foundingPeopleSchema.parse(row.people);
  if (
    people &&
    ([
      ...people.residentIds,
      ...people.managerIds,
      ...people.work.map((work) => work.characterId),
      ...Object.keys(people.destinations),
    ].some((id) => !allowedActors.includes(id)) ||
      people.work.some((work) => work.characterId === "player"))
  )
    throw badRequest("Use only the chosen founding people.");
  const existing = source.zones!.filter((zone) => zone.kind !== "exterior");
  const returned = row.zones.map(asRecord);
  const ids = returned.map((zone) => asTrimmedString(zone.id));
  if (ids.some((id) => !id || id === "exterior" || id.length > 300) || new Set(ids).size !== ids.length)
    throw badRequest("The draft needs distinct indoor Zones; Entrance stays separate.");
  if (existing.some((old) => !ids.includes(old.id)))
    throw badRequest("Preserve every existing Zone exactly once. The draft omitted a current room.");
  // Bind only additional rooms to the admitted ID bank; never guess a renamed existing room.
  const free = newIds.filter((id) => !ids.includes(id));
  const aliases = new Map<string, string>();
  for (const id of ids.filter((id) => !existing.some((zone) => zone.id === id) && !newIds.includes(id))) {
    const allocated = free.shift();
    if (!allocated) throw badRequest("The draft added more Zones than this Venue can hold.");
    aliases.set(id, allocated);
  }
  const zoneId = (value: string): string => {
    const id = value.trim();
    if (id !== "exterior" && !ids.includes(id) && ![...aliases.values()].includes(id))
      throw badRequest("The draft refers to a Zone it did not include.");
    return aliases.get(id) ?? id;
  };
  if (people)
    people = {
      ...people,
      work: people.work.map((work) => ({
        ...work,
        zoneId: zoneId(work.zoneId),
        accessZoneIds: work.accessZoneIds.map(zoneId),
      })),
      destinations: Object.fromEntries(
        Object.entries(people.destinations).map(([actor, roles]) => [
          actor,
          Object.fromEntries(
            Object.entries(roles).flatMap(([role, id]) => (id === undefined ? [] : [[role, zoneId(id)]])),
          ),
        ]),
      ),
    };
  const original = source;
  source = applyFoundingPeople(source, people) as typeof source;
  const actors = [...(source.residentIds ?? []), ...(source.occupancy.playerHome ? ["player"] : [])];
  const zones = returned.map((zone) => {
    const id = zoneId(asTrimmedString(zone.id)),
      prior = existing.find((zone) => zone.id === id);
    if (!prior && typeof zone.private !== "boolean")
      throw badRequest("The draft must identify each new Zone's privacy.");
    const personal = prior ? original.privateSpaces!.some((room) => room.id === id) : zone.private === true;
    // Existing ownership survives; new bedrooms derive authority from reviewed Home destinations.
    const ownerId = prior?.ownerId && actors.includes(prior.ownerId) ? prior.ownerId : "";
    if (!Array.isArray(zone.connectedTo) || zone.connectedTo.some((id) => typeof id !== "string"))
      throw badRequest("Give every Zone its connections.");
    return {
      id,
      name: text(zone, "name", 100),
      purpose: text(zone, "purpose", 240),
      description: text(zone, "description", 4000),
      ...(zone.dayNight === undefined ? {} : { dayNight: readDayNight(zone.dayNight) }),
      private: personal,
      ownerId,
      connectedTo: (zone.connectedTo as string[]).map(zoneId),
      ...(zone.access === undefined ? {} : { access: readZonePolicy(zone.access) }),
    };
  });
  const problem = connectionProblem([{ id: "exterior", kind: "exterior", connectedTo: [] }, ...zones]);
  if (problem) throw badRequest(problem);
  const plan: FoundingVenueSuggestion = {
    id: source.id,
    ...(people ? { people } : {}),
    name: text(row, "name", 60),
    form: text(row, "form", 2000),
    venueType: asTrimmedString(row.venueType).slice(0, 100),
    description: text(row, "description", 4000),
    ...(row.dayNight === undefined ? {} : { dayNight: readDayNight(row.dayNight) }),
    zones,
    layout: "common",
    commonName: "",
    commonDescription: "",
    privateName: "",
    privatePurpose: "",
  };
  const candidate = parsePlace(applyFoundingVenueDraft(source, plan));
  plan.layout = zones.some((zone) => !zone.private)
    ? zones.some((zone) => zone.private)
      ? "both"
      : "common"
    : zones.length
      ? "private"
      : "exterior";
  for (const actor of actors) {
    const sleep = candidate.destinations?.[actor]?.sleep;
    if (!sleep || !accessibleVenueRoute({ projects: [] }, candidate, actor, sleep, at, true))
      throw badRequest("Every household member needs an accessible sleeping Zone and route from Entrance.");
  }
  return plan;
}
