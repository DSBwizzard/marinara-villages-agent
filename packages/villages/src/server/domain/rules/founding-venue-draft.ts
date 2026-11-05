import type { FoundingVenueSuggestion } from "../../../shared/contracts/founding.js";
import { applyFoundingVenueDraft } from "../../../shared/helpers/founding-venue-draft.js";
import { connectionProblem } from "../../../shared/helpers/zone-contact.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import { badRequest } from "./errors.js";
import { parsePlace } from "./founding-record.js";
import { accessibleVenueRoute } from "./venue-path.js";
import { communityVenueEligible } from "./community-venue.js";

function readDayNight(value: unknown): boolean {
  if (typeof value !== "boolean") throw badRequest("The Zone daylight decision must be on or off.");
  return value;
}

export function readFoundingVenueDraftSource(value: unknown) {
  const row = asRecord(value);
  const areas = (value: unknown) => {
    if (!Array.isArray(value) || value.length > 6) throw badRequest("A Venue has at most six Zones.");
    return value.map((value) => {
      const area = asRecord(value);
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
  parsed.privateSpaces = parsed
    .zones!.filter((zone) => !["exterior", "public", "shared-residence"].includes(zone.kind))
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
  community: boolean,
  at: Date,
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
  const existing = source.zones!.filter((zone) => zone.kind !== "exterior");
  const actors = [...(source.residentIds ?? []), ...(source.occupancy.playerHome ? ["player"] : [])];
  const zones = row.zones.map((value) => {
    const zone = asRecord(value),
      id = asTrimmedString(zone.id),
      prior = existing.find((zone) => zone.id === id);
    const personal = zone.private === true,
      ownerId = asTrimmedString(zone.ownerId);
    if (
      typeof zone.private !== "boolean" ||
      (!prior && !newIds.includes(id)) ||
      (prior &&
        (personal !== (source.privateSpaces ?? []).some((zone) => zone.id === id) ||
          ownerId !== (prior.ownerId ?? ""))) ||
      (!prior && (personal ? !source.classes?.includes("residence") || !actors.includes(ownerId) : !!ownerId)) ||
      (community && personal)
    )
      throw badRequest("Preserve existing Zone use and ownership; assign new private Zones only to this household.");
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
      connectedTo: zone.connectedTo as string[],
    };
  });
  if (
    new Set(zones.map((zone) => zone.id)).size !== zones.length ||
    existing.some((old) => !zones.some((zone) => zone.id === old.id))
  )
    throw badRequest("Preserve every existing Zone exactly once.");
  const problem = connectionProblem([{ id: "exterior", kind: "exterior", connectedTo: [] }, ...zones]);
  if (problem) throw badRequest(problem);
  const plan: FoundingVenueSuggestion = {
    id: source.id,
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
  if (community && !communityVenueEligible(candidate))
    throw badRequest("The Community Venue must remain public and unowned.");
  return plan;
}
