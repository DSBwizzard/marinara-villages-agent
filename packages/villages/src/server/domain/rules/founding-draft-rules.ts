import { asTrimmedString } from "./coerce.js";
import { badRequest } from "./errors.js";

export type FoundingVenueSuggestion = {
  id: string;
  name: string;
  form: string;
  venueType?: string;
  description: string;
  layout: "exterior" | "common" | "private" | "both";
  commonName: string;
  commonPurpose?: string;
  commonDescription: string;
  privateName: string;
  privatePurpose: string;
};

export function parseFoundingVenueSuggestions(value: unknown, ids: readonly string[]): FoundingVenueSuggestion[] {
  const payload = record(value);
  if (!Array.isArray(payload.venues))
    throw badRequest(
      "The System model did not return readable Venue suggestions. Your draft is unchanged; retry when ready.",
    );
  const rows = payload.venues;
  const returnedIds = new Set(rows.map((row) => record(row).id));
  if (rows.length !== ids.length || returnedIds.size !== ids.length || ids.some((id) => !returnedIds.has(id)))
    throw badRequest(
      "The System model did not return every starting Venue exactly once with its supplied id. Your draft is unchanged; retry when ready.",
    );
  return ids.map((id) => {
    const row = record(rows.find((candidate) => record(candidate).id === id));
    const text = (key: string, max: number, required = false) => {
      const result = asTrimmedString(row[key]);
      if (result.length > max || (required && !result))
        throw badRequest(`Complete the suggested ${key} for every Venue.`);
      return result;
    };
    const layout = row.layout;
    if (!["exterior", "common", "private", "both"].includes(String(layout)))
      throw badRequest("Choose a valid suggested Zone layout.");
    return {
      id,
      name: text("name", 100, true),
      form: text("form", 240, true),
      venueType: text("venueType", 100),
      description: text("description", 1000, true),
      layout: layout as FoundingVenueSuggestion["layout"],
      commonName: text("commonName", 100, layout === "common" || layout === "both"),
      commonPurpose: text("commonPurpose", 240),
      commonDescription: text("commonDescription", 1000, layout === "common" || layout === "both"),
      privateName: text("privateName", 100, layout === "private" || layout === "both"),
      privatePurpose: text("privatePurpose", 240, layout === "private" || layout === "both"),
    };
  });
}

export type DraftRow = {
  id: string;
  name: string;
  form: string;
  description: string;
  spaceDescription: string;
  venueClass: "residence" | "gathering" | "workplace" | "other";
  residentCharacterId: string;
  layout?: string;
  areas?: unknown;
};

export function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function rowsOf(value: unknown): DraftRow[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 5)
    throw badRequest("Choose one to five founding venues.");
  return value.map((raw) => {
    const row = record(raw);
    const venueClass = row.venueClass;
    if (!["residence", "gathering", "workplace", "other"].includes(String(venueClass)))
      throw badRequest("Choose a founding Venue Class.");
    const id = asTrimmedString(row.id).slice(0, 100);
    if (!id) throw badRequest("A founding venue needs an id.");
    return {
      id,
      name: asTrimmedString(row.name).slice(0, 100),
      venueType: asTrimmedString(row.venueType).slice(0, 100),
      form: asTrimmedString(row.form).slice(0, 240),
      description: asTrimmedString(row.description).slice(0, 1000),
      spaceDescription: asTrimmedString(row.spaceDescription).slice(0, 1000),
      venueClass: venueClass as DraftRow["venueClass"],
      residentCharacterId: asTrimmedString(row.residentCharacterId).slice(0, 100),
      layout: asTrimmedString(row.layout),
      areas: row.areas,
    };
  });
}

export type SeededFoundingVenueDetails = {
  condition: string;
  items: string[];
  publicFacts: string[];
  features: string[];
};
