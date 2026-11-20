import type { useFoundingSetupDraftData } from "./controller-hooks.js";

export type FoundingContext = {
  rules: string;
  circumstances: import("../../../shared/contracts/village.js").FoundingCircumstance[];
  openingVenueId: string;
  /** Opaque source data retained only while an already-admitted request is recovered. */
  households?: unknown;
};

export type SetupDraftData = ReturnType<typeof useFoundingSetupDraftData>;
