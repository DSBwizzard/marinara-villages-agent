import type { VillageVenue } from "../models/world.js";
import { badRequest } from "./errors.js";
import { boundText, MAX_VENUE_DESCRIPTION_LENGTH, MAX_VENUE_NOTE_LENGTH } from "./prompt-preset.js";
import { defaultVenueZoneId } from "./venue-zones.js";

export function venueFieldText(value: unknown, fallback: string, limit: number): string {
  if (
    limit === MAX_VENUE_DESCRIPTION_LENGTH &&
    value !== undefined &&
    (typeof value !== "string" || value.length > limit)
  )
    throw badRequest("Zone descriptions must be at most 4000 characters.");
  return value === undefined ? fallback : boundText(value, limit);
}
export function venueStringList(value: unknown, fallback: string[]): string[] {
  if (value === undefined) return [...fallback];
  if (!Array.isArray(value)) throw badRequest("Venue lists must be arrays of text.");
  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => boundText(entry, MAX_VENUE_NOTE_LENGTH))
    .filter(Boolean)
    .slice(0, 24);
}
export function personalDestinationSpace(venue: VillageVenue, characterId: string) {
  const id = defaultVenueZoneId(venue, "private", "residence", characterId);
  return venue.privateSpaces?.find((space) => space.id === id);
}
/** Where a place stands, or a refusal — see `parsePlace` for why the two are exclusive. */
export function readPlacePosition(record: Record<string, unknown>): { x: number | null; y: number | null } {
  const x = record.x ?? null;
  const y = record.y ?? null;
  // Absent on BOTH counts is "not on the map yet" and is ordinary. Absent on one
  // is half a position, which is not a position: silently dropping the half that
  // arrived would move the pin to the wrong street, and inventing the other half
  // would be worse.
  if (x === null && y === null) return { x: null, y: null };
  const placed = typeof x === "number" && typeof y === "number" && x >= 0 && x <= 1 && y >= 0 && y <= 1;
  if (!placed) throw badRequest("A place's spot on the map is two fractions between 0 and 1.");
  return { x: x as number, y: y as number };
}
