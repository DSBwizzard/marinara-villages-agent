import type { VillageVenue } from "../../../shared/contracts/village.js";
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
      venue.occupancy.residentCharacterId,
    ]),
  );
}

/** Fresh template inputs deliberately exclude the current Venue's authored content. */
export function quickStartTemplates(venues: readonly VillageVenue[]): VillageVenue[] {
  return venues.map((previous, index) => {
    const residence = previous.category !== "public-center";
    const venue = newSetupVenue(
      previous.id,
      residence ? "residence" : "community",
      0.5,
      0.5,
      residence && previous.occupancy.playerHome,
      index,
    );
    venue.occupancy.residentCharacterId =
      residence && !venue.occupancy.playerHome ? previous.occupancy.residentCharacterId : null;
    venue.residentIds = venue.occupancy.residentCharacterId ? [venue.occupancy.residentCharacterId] : [];
    venue.spaces = [startingZone(venue, false)];
    venue.privateSpaces = residence ? [startingZone(venue, true)] : [];
    return venue;
  });
}

/** Confirmation authorizes complete replacement; no field-level edit detection is used. */
export function replaceQuickStartVenue(venue: VillageVenue, proposal: StartingVenueSuggestion): VillageVenue {
  const residence = venue.category !== "public-center";
  const links = (id: string) =>
    proposal.connections?.filter((edge) => edge.includes(id)).map((edge) => (edge[0] === id ? edge[1] : edge[0]));
  return {
    ...venue,
    name: proposal.name,
    venueType: proposal.venueType,
    form: proposal.form,
    description: proposal.description,
    layout: residence ? "both" : "common",
    spaces: [
      {
        ...startingZone(venue, false),
        name: proposal.commonName,
        purpose: proposal.commonPurpose || (residence ? "Everyday activities" : "Community gatherings"),
        description: proposal.commonDescription,
        connectedTo: links("common:base") ?? (residence ? ["exterior", "private:base"] : ["exterior"]),
      },
    ],
    privateSpaces: residence
      ? [
          {
            ...startingZone(venue, true),
            name: proposal.privateName,
            purpose: proposal.privatePurpose,
            description: proposal.privateDescription ?? "",
            connectedTo: links("private:base") ?? ["common:base"],
          },
        ]
      : [],
  };
}
