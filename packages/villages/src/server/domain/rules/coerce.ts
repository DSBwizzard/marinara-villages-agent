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

export function asPositiveInt(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 1 ? Math.floor(value) : fallback;
}

export function asIsoString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/**
 * An instant as an ISO string, or "" when the value does not name one.
 *
 * Deliberately a second reader beside `asIsoString` rather than a stronger
 * version of it, because the two answer different questions and most callers
 * only ask the first: `asIsoString` asks "is there a string here", which is all
 * a field that is only ever displayed needs, and `asInstant` asks "is there a
 * MOMENT here", which a field that is going to be COMPARED needs. A wish's
 * deadline is compared — against the clock, to decide whether the wish is over —
 * and an unreadable deadline has to be distinguishable from a deadline that has
 * passed, or a hand-edited document could delete somebody's wish.
 *
 * The value is normalised rather than returned as it was found, so that the
 * thing the writer stored and the thing the reader hands back are the same
 * string. That is what lets a wish be written and read back byte for byte.
 */
export function asInstant(value: unknown): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length === 0) return "";
  const instant = Date.parse(text);
  return Number.isNaN(instant) ? "" : new Date(instant).toISOString();
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
