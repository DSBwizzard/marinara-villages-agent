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
    ...zoneDayNightDefault({}, proposal.dayNight),
    name: proposal.name,
    venueType: proposal.venueType,
    form: proposal.form,
    description: proposal.description,
    layout: proposal.layout,
    spaces: ["common", "both"].includes(proposal.layout)
      ? [
          {
            ...startingZone(venue, false),
            ...zoneDayNightDefault({}, proposal.commonDayNight),
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
            ...zoneDayNightDefault({}, proposal.privateDayNight),
            name: proposal.privateName,
            purpose: proposal.privatePurpose,
            description: proposal.privateDescription ?? "",
            connectedTo: links("private:base") ?? [proposal.layout === "private" ? "exterior" : "common:base"],
          },
        ]
      : [],
  };
}

/** Only an explicit replacement creates the simplified starting set. */
export function separateFoundingTemplates(residentIds: readonly string[], communityId: string): SetupVenueDraft[] {
  const used = new Set([communityId]);
  return quickStartTemplates([
    ...["player", ...residentIds].map((actor, index) => {
      let id = `founding-home:${actor}`;
      while (used.has(id)) id += ":home";
      used.add(id);
      return {
        ...newSetupVenue(id, "residence", 0.5, 0.5, actor === "player", index),
        residentIds: actor === "player" ? [] : [actor],
      };
    }),
    newSetupVenue(communityId, "community", 0.5, 0.5),
  ]);
}
