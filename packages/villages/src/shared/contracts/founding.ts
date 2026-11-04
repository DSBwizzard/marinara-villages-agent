import type { VillageVenueImage } from "./village.js";
export type FoundingDraftZone = {
  id: string;
  name: string;
  purpose: string;
  description: string;
  private: boolean;
  ownerId: string;
  connectedTo: string[];
};
export type FoundingVenueSuggestion = {
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
  entranceImage?: VillageVenueImage;
  imageError?: string;
};
