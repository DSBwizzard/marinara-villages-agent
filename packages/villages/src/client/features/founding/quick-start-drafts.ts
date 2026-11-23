import { applyFoundingPeople } from "../../../shared/helpers/founding-people.js";
import { zoneDayNightDefault } from "../../../shared/helpers/zone-day-night.js";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import type { SetupVenueDraft } from "../../shared/types.js";
import { newSetupVenue } from "./FoundingPanels.js";
import { startingZone } from "./founding-template.js";

export type { FoundingVenueSuggestion as StartingVenueSuggestion } from "../../../shared/contracts/founding.js";
import type { FoundingVenueSuggestion as StartingVenueSuggestion } from "../../../shared/contracts/founding.js";

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
    const residence = previous.occupancy.playerHome || !!previous.residentIds?.length;
    const venue = newSetupVenue(previous.id, 0.5, 0.5, residence && previous.occupancy.playerHome, index);
    venue.name =
      previous.name === "New Venue" ? (residence ? `Home ${index + 1}` : `Venue ${index + 1}`) : previous.name;
    venue.category = previous.category;
    venue.residentIds = previous.residentIds ?? [];
    const community = venue.category === "public-center";
    venue.layout = residence ? "both" : "common";
    venue.spaces = [
      {
        ...startingZone(venue, false),
        ...(community ? { name: "Gathering Space" } : residence ? { purpose: "Daily life and shared activities" } : {}),
        connectedTo: residence ? ["exterior", "private:base"] : ["exterior"],
      },
      ...(community
        ? [
            {
              ...startingZone(venue, false),
              id: "common:activity",
              name: "Activity Space",
              purpose: "Shared activities",
              description: "A public space for community activities.",
              connectedTo: ["exterior"],
            },
          ]
        : []),
    ];
    venue.privateSpaces = residence ? [{ ...startingZone(venue, true), connectedTo: ["common:base"] }] : [];
    return venue;
  });
}

/** Confirmation authorizes complete replacement; no field-level edit detection is used. */
export function replaceQuickStartVenue(venue: VillageVenue, proposal: StartingVenueSuggestion): VillageVenue {
  venue = applyFoundingPeople(venue, proposal.people);
  const template = quickStartTemplates([venue])[0]!;
  return applyFoundingPeople(
    {
      ...venue,
      ...zoneDayNightDefault(proposal.dayNight),
      name: proposal.name,
      venueType: proposal.venueType,
      form: proposal.form,
      description: proposal.description,
      layout: template.layout,
      spaces: template.spaces?.map((zone, index) =>
        index
          ? zone
          : {
              ...zone,
              ...zoneDayNightDefault(proposal.commonDayNight),
              name: proposal.commonName || zone.name,
              purpose: proposal.commonPurpose || zone.purpose,
              description: proposal.commonDescription || zone.description,
            },
      ),
      privateSpaces: template.privateSpaces?.map((zone) => ({
        ...zone,
        ...zoneDayNightDefault(proposal.privateDayNight),
        name: proposal.privateName || zone.name,
        purpose: proposal.privatePurpose || zone.purpose,
        description: proposal.privateDescription || zone.description,
      })),
    },
    proposal.people,
  );
}

/** Only an explicit replacement creates the simplified starting set. */
export function separateFoundingTemplates(
  residentIds: readonly string[],
  communityId: string,
  reservedIds: readonly string[] = [],
): SetupVenueDraft[] {
  const secondId = communityId === "founding-garden" ? "founding-community" : "founding-garden";
  const used = new Set([communityId, secondId, ...reservedIds]);
  return quickStartTemplates([
    ...["player", ...residentIds].map((actor, index) => {
      let id = `founding-home:${actor}`;
      while (used.has(id)) id += ":home";
      used.add(id);
      return {
        ...newSetupVenue(id, 0.5, 0.5, actor === "player", index),
        residentIds: actor === "player" ? [] : [actor],
      };
    }),
    { ...newSetupVenue(communityId, 0.5, 0.5), category: "public-center", name: "Meeting place" },
    { ...newSetupVenue(secondId, 0.5, 0.5), category: "public-center", name: "Shared space" },
  ]);
}
