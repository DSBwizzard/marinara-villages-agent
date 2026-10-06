import type { VillageVenue } from "./villages-package-entry";

export type FoundingWorkspaceState = {
  view: "map" | "details";
  paused: boolean;
  sections: Record<string, "venue" | "zones">;
  zones: Record<string, string>;
};
export const emptyFoundingWorkspace = (): FoundingWorkspaceState => ({
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
export function foundingVenueIssues(venues: readonly VillageVenue[], existing = false): FoundingIssue[] {
  return venues.flatMap((venue) => {
    const issues: FoundingIssue[] = [];
    const add = (field: FoundingIssue["field"], message: string, zoneId?: string) =>
      issues.push({ venueId: venue.id, field, message, ...(zoneId ? { zoneId } : {}) });
    if (!existing && (venue.presentation.x === null || venue.presentation.y === null))
      add("placement", "Place this Venue on the map.");
    if (!venue.name.trim()) add("name", "Add a Venue name.");
    if (!venue.form?.trim()) add("form", "Add its physical form.");
    if (!venue.description.trim()) add("description", "Describe the Entrance appearance.", "exterior");
    if (!existing && venue.layoutVersion === 1 && !venue.layout) add("layout", "Choose the Venue’s Zones.");
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
      if (zone.access || privateZone) {
        if (!zone.name?.trim()) add("zone-name", "Give the Zone a name.", zone.id);
        if (!zone.purpose?.trim()) add("zone-purpose", "Describe what the Zone is used for.", zone.id);
      }
      if (!privateZone && !zone.description.trim()) add("zone-appearance", "Describe the Zone appearance.", zone.id);
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
