import type { VillageVenue } from "../../../shared/contracts/village.js";
import type { SetupVenueDraft } from "../../shared/types.js";
import { newSetupVenue } from "./FoundingPanels.js";
import { startingZone } from "./founding-template.js";

export type StartingVenueSuggestion = {
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

/** Bind recovered templates to their intended owners, independently of editable content. */
export function quickStartIdentity(venues: readonly VillageVenue[]): string {
  return JSON.stringify(
    venues.map((venue) => [
      venue.id,
      venue.category === "public-center",
      venue.occupancy.playerHome,
      venue.residentIds,
    ]),
  );
}

/** Fresh template inputs deliberately exclude the current Venue's authored content. */
export function quickStartTemplates(venues: readonly SetupVenueDraft[]): SetupVenueDraft[] {
  return venues.map((previous, index) => {
    const residence = previous.classes?.includes("residence") ?? false;
    const venue = newSetupVenue(
      previous.id,
      previous.classes?.[0] ?? "other",
      0.5,
      0.5,
      residence && previous.occupancy.playerHome,
      index,
    );
    venue.category = previous.category;
    venue.residentIds = previous.residentIds ?? [];
    venue.residenceCapacity = previous.residenceCapacity;
    venue.foundingCapacity = previous.foundingCapacity;
    venue.classes = previous.classes;
    venue.spaces = [startingZone(venue, false)];
    venue.privateSpaces = residence ? [startingZone(venue, true)] : [];
    return venue;
  });
}

/** Confirmation authorizes complete replacement; no field-level edit detection is used. */
export function replaceQuickStartVenue(venue: VillageVenue, proposal: StartingVenueSuggestion): VillageVenue {
  const residence = venue.classes?.includes("residence") ?? false;
  const links = (id: string) =>
    proposal.connections?.filter((edge) => edge.includes(id)).map((edge) => (edge[0] === id ? edge[1] : edge[0]));
  return {
    ...venue,
    name: proposal.name,
    venueType: proposal.venueType,
    form: proposal.form,
    description: proposal.description,
    layout: proposal.layout,
    spaces: ["common", "both"].includes(proposal.layout)
      ? [
          {
            ...startingZone(venue, false),
            name: proposal.commonName,
            purpose: proposal.commonPurpose || (residence ? "Everyday activities" : "Community gatherings"),
            description: proposal.commonDescription,
            connectedTo:
              links("common:base") ?? (proposal.layout === "both" ? ["exterior", "private:base"] : ["exterior"]),
          },
        ]
      : [],
    privateSpaces: ["private", "both"].includes(proposal.layout)
      ? [
          {
            ...startingZone(venue, true),
            name: proposal.privateName,
            purpose: proposal.privatePurpose,
            description: proposal.privateDescription ?? "",
            connectedTo: links("private:base") ?? [proposal.layout === "private" ? "exterior" : "common:base"],
          },
        ]
      : [],
  };
}
