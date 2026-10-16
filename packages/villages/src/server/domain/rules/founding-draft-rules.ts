import { connectionProblem } from "../../../shared/helpers/zone-contact.js";
import { asTrimmedString } from "./coerce.js";
import { badRequest } from "./errors.js";

export type FoundingVenueSuggestion = {
  id: string;
  name: string;
  form: string;
  venueType?: string;
  description: string;
  layout: "exterior" | "common" | "private" | "both";
  connections?: [string, string][];
  commonName: string;
  commonPurpose?: string;
  commonDescription: string;
  privateName: string;
  privatePurpose: string;
  privateDescription?: string;
};

export function parseFoundingVenueSuggestions(
  value: unknown,
  ids: readonly string[],
  template?: readonly { id: string; venueClass: string; residentCharacterId?: string | null }[],
  quickStart = false,
  requireConnections = false,
): FoundingVenueSuggestion[] {
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
    const venue = template?.find((venue) => venue.id === id);
    if (quickStart && venue?.venueClass === "residence" && layout !== "both")
      throw badRequest(
        "Quick Start requires both Common Space and Private Space for every Residence. Your draft is unchanged.",
      );
    if (venue && (venue.venueClass === "community" ? layout !== "common" : layout === "exterior"))
      throw badRequest(
        "Residences require Common or Private Space; the starting Community Place requires Common only.",
      );
    if (!["exterior", "common", "private", "both"].includes(String(layout)))
      throw badRequest("Choose a valid suggested Zone layout.");
    const connections = row.connections;
    if (requireConnections && connections === undefined)
      throw badRequest("The suggested Venue needs explicit space connections. Your draft is unchanged.");
    if (connections !== undefined) {
      const zoneIds = [
        "exterior",
        ...(["common", "both"].includes(String(layout)) ? ["common:base"] : []),
        ...(["private", "both"].includes(String(layout)) ? ["private:base"] : []),
      ];
      if (
        !Array.isArray(connections) ||
        connections.length > 3 ||
        connections.some(
          (edge) =>
            !Array.isArray(edge) ||
            edge.length !== 2 ||
            edge.some((id) => typeof id !== "string" || !zoneIds.includes(id)) ||
            edge[0] === edge[1],
        ) ||
        new Set(connections.map((edge) => [...edge].sort().join("\\0"))).size !== connections.length
      )
        throw badRequest("The proposed space connections are invalid. Your draft is unchanged.");
      const problem = connectionProblem(
        zoneIds.map((id) => ({
          id,
          connectedTo: connections
            .filter((edge) => edge.includes(id))
            .map((edge) => (edge[0] === id ? edge[1] : edge[0])),
        })),
      );
      if (problem) throw badRequest(problem);
    }
    return {
      id,
      ...(connections === undefined ? {} : { connections: connections as [string, string][] }),
      name: text("name", 100, true),
      form: text("form", 240, true),
      venueType: text("venueType", 100),
      description: text("description", 1000, true),
      layout: layout as FoundingVenueSuggestion["layout"],
      commonName: text("commonName", 100, layout === "common" || layout === "both"),
      commonPurpose: text("commonPurpose", 240, !!template && (layout === "common" || layout === "both")),
      commonDescription: text("commonDescription", 1000, layout === "common" || layout === "both"),
      privateName: text("privateName", 100, layout === "private" || layout === "both"),
      privatePurpose: text("privatePurpose", 240, layout === "private" || layout === "both"),
      ...(venue?.venueClass === "residence" && !venue.residentCharacterId && (layout === "private" || layout === "both")
        ? { privateDescription: text("privateDescription", 1000, true) }
        : {}),
    };
  });
}

export type DraftRow = {
  id: string;
  name: string;
  form: string;
  description: string;
  spaceDescription: string;
  venueClass: "residence" | "community" | "workplace" | "other";
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
    if (!["residence", "community", "workplace", "other"].includes(String(venueClass)))
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
