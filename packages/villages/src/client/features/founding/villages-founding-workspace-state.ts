import type { VillageVenue } from "../../../shared/contracts/village.js";
import type { InactiveFoundingZones } from "./founding-template.js";

export type FoundingWorkspaceState = {
  mode?: "quick" | "advanced";
  suggestionRequest?: { id: string; sourceKey: string; quickStart: boolean; venueId?: string };

  view: "map" | "details";
  paused: boolean;
  sections: Record<string, "venue" | "zones">;
  zones: Record<string, string>;
  inactive?: Record<string, InactiveFoundingZones>;
};
export const emptyFoundingWorkspace = (): FoundingWorkspaceState => ({
  mode: "quick",
  view: "map",
  paused: false,
  sections: {},
  zones: {},
});
export type FoundingIssue = {
  venueId: string;
  zoneId?: string;
  field:
    | "placement"
    | "name"
    | "form"
    | "description"
    | "layout"
    | "assignment"
    | "zone-name"
    | "zone-purpose"
    | "zone-appearance"
    | "controller";
  message: string;
};
/** The existing founding requirements, collected rather than stopping at the first field. */
export function foundingVenueIssues(
  venues: readonly VillageVenue[],
  existing = false,
  quickStart = false,
): FoundingIssue[] {
  return venues.flatMap((venue) => {
    const issues: FoundingIssue[] = [];
    const add = (field: FoundingIssue["field"], message: string, zoneId?: string) =>
      issues.push({ venueId: venue.id, field, message, ...(zoneId ? { zoneId } : {}) });
    if (!existing && (venue.presentation.x === null || venue.presentation.y === null))
      add("placement", "Place this Venue on the map.");
    if (!venue.name.trim()) add("name", "Add a Venue name.");
    if (!venue.form?.trim()) add("form", "Add its physical form.");
    if (!venue.description.trim()) add("description", "Describe the Exterior.", "exterior");
    if (quickStart && venue.classes?.includes("residence")) {
      if (!venue.spaces?.length) add("layout", "Quick Start requires Common Space in every Residence.", "common");
      if (!venue.privateSpaces?.length)
        add("layout", "Quick Start requires Private Space in every Residence.", "private");
    }
    if (!existing && venue.layoutVersion === 1 && !venue.layout) add("layout", "Choose the Venue’s Zones.");
    if (!existing && venue.classes?.includes("residence") && !venue.spaces?.length && !venue.privateSpaces?.length)
      add("layout", "Include Common or Private Space.", "common");
    if (!existing && venue.category === "public-center" && (!venue.spaces?.length || venue.privateSpaces?.length))
      add("layout", "The starting Community Place requires Common Space and has no Private Space.", "common");
    if (venue.classes?.includes("residence") && !venue.occupancy.playerHome && !venue.occupancy.residentCharacterId)
      add("assignment", "Assign a resident.");
    if (
      venue.occupancy.residentCharacterId &&
      venues.some(
        (row) => row.id !== venue.id && row.occupancy.residentCharacterId === venue.occupancy.residentCharacterId,
      )
    )
      add("assignment", "Assign this resident to only one home.");
    for (const zone of [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])]) {
      const privateZone = venue.privateSpaces?.some((row) => row.id === zone.id);
      if (!existing || zone.access || privateZone) {
        if (!zone.name?.trim()) add("zone-name", "Give the Zone a name.", zone.id);
        if (!zone.purpose?.trim()) add("zone-purpose", "Describe what the Zone is used for.", zone.id);
      }
      if ((!privateZone || (!existing && zone.ownerId === "player")) && !zone.description.trim())
        add("zone-appearance", "Describe the Zone appearance.", zone.id);
      if (
        privateZone &&
        !zone.access &&
        !["residence", "workplace"].includes(zone.venueClass) &&
        !zone.controllerIds?.length
      )
        add("controller", "Choose a controller for this Zone.", zone.id);
    }
    return issues;
  });
}
