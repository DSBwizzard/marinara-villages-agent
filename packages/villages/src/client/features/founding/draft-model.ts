import type { useFoundingSetupDraftData } from "./controller-hooks.js";
import type { FoundingCircumstance, VillageVenue } from "../../../shared/contracts/village.js";

export type FoundingContext = {
  rules: string;
  circumstances: FoundingCircumstance[];
  openingVenueId: string;
  /** Opaque source data retained only while an already-admitted request is recovered. */
  households?: unknown;
};

export type SetupDraftData = ReturnType<typeof useFoundingSetupDraftData>;

export function activeFoundingCircumstances(rows: readonly FoundingCircumstance[], venues: readonly VillageVenue[]) {
  return rows.filter(
    (row) => row.summary.trim() && (row.scope === "village" || venues.some((venue) => venue.id === row.venueId)),
  );
}
