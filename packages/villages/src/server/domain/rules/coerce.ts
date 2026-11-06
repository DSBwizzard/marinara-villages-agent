// Defensive readers for the `unknown` blobs that come back out of storage.
//
// Package documents are stored as JSON text and character cards are stored as
// free-form card JSON, so neither can be trusted to match its TypeScript shape.
// Every field the village reads goes through one of these instead of a cast.

export function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function asTrimmedString(value: unknown): string {
  return asString(value).trim();
}

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => asTrimmedString(entry)).filter((entry) => entry.length > 0);
}

export function asIsoString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/**
 * A 0..1 map coordinate, or null when the value is not one.
 *
 * Deliberately returns null rather than clamping: clamping would silently move
 * a home to the edge of the map, so a caller could not tell "this entry is not
 * a position" apart from "this home really is on the left edge", and the
 * player would find a pin somewhere they never put it.
 */
export function asFraction(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value >= 0 && value <= 1 ? value : null;
}

/** Collapse a long prose field down to one readable line for a card tile. */
export function condense(value: string, limit = 180): string {
  const collapsed = value.replace(/\s+/g, " ").trim();
  if (collapsed.length <= limit) return collapsed;
  return `${collapsed.slice(0, limit - 1).trimEnd()}\u2026`;
}
