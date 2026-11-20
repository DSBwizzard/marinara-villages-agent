import type { VillageVenueImage } from "./village.js";
export const FOUNDING_DRAFT_UNAVAILABLE = "FOUNDING_DRAFT_UNAVAILABLE";
export type FoundingDraftZone = {
  dayNight?: boolean;
  id: string;
  name: string;
  purpose: string;
  description: string;
  private: boolean;
  ownerId: string;
  connectedTo: string[];
};
export type FoundingVenueSuggestion = {
  dayNight?: boolean;
  commonDayNight?: boolean;
  privateDayNight?: boolean;
  zones?: FoundingDraftZone[];
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

export type FoundingSuggestionsResult = {
  lore?: import("./lore.js").LoreUse[];
  venues: FoundingVenueSuggestion[];
  setting?: FoundingSetting;
  entranceImage?: VillageVenueImage;
  imageError?: string;
};

export type FoundingSetting = {
  name: string;
  startingLocationName: string;
  description: string;
  worldName: string;
  rules: string;
};

export const FOUNDING_SETTING_BRIEF_LIMIT = 4096;
