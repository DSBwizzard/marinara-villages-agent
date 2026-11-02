import type { useFoundingSetupDraftData } from "./controller-hooks.js";

/** Stored founding drafts predate the optional workspace navigation field. */
export type FoundingContext = {
  rules: string;
  history: string;
  circumstances: import("../../../shared/contracts/village.js").FoundingCircumstance[];
  communityVenueId: string;
  households: Record<string, string>;
};

export type SetupDraftData = ReturnType<typeof useFoundingSetupDraftData>;
