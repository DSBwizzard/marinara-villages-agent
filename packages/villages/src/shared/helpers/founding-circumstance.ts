import type { FoundingCircumstance } from "../contracts/village.js";

export const FOUNDING_CIRCUMSTANCE_MAX_LENGTH = 4000;

export function foundingCircumstanceText(rows: readonly FoundingCircumstance[]): string {
  return rows
    .map((row) => row.summary)
    .filter(Boolean)
    .join("\n\n");
}

export function foundingCircumstanceFromText(summary: string): FoundingCircumstance[] {
  return summary.trim() ? [{ scope: "village", summary, venueId: "", zoneId: "" }] : [];
}
