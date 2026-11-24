import type { VillageVenue } from "../../../shared/contracts/village.js";
import type { FoundingVenueSuggestion } from "../../../shared/contracts/founding.js";
import { newSetupVenue } from "./FoundingPanels.js";
import { createVillagesClientId } from "../../shared/request-id.js";

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
export function emptyFoundingVenue(id: string): VillageVenue {
  return {
    ...newSetupVenue(id, 0.5, 0.5),
    name: "",
    form: "",
    description: "",
    layout: "exterior",
    spaces: [],
    privateSpaces: [],
    workerIds: [],
    destinations: {},
    presentation: { mapId: "", image: null, x: null, y: null },
  };
}
export function newFoundingPlanSources(): VillageVenue[] {
  return Array.from({ length: 4 }, () => emptyFoundingVenue("venue:" + createVillagesClientId()));
}
/** Older paid results can still supply physical details without restoring assignments. */
export function physicalFoundingProposal(plan: FoundingVenueSuggestion): FoundingVenueSuggestion {
  if (plan.zones)
    return {
      ...plan,
      zones: plan.zones.map((zone) => ({
        ...zone,
        ownerId: "",
        ...(zone.access
          ? { access: { ...zone.access, managerIds: null, memberIds: [], memberRoles: [], inviterIds: [] } }
          : {}),
      })),
    };
  const common = ["common", "both"].includes(plan.layout),
    personal = ["private", "both"].includes(plan.layout);
  const links = (id: string) =>
    plan.connections?.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : [])) ?? ["exterior"];
  return {
    ...plan,
    zones: [
      ...(common
        ? [
            {
              id: "common:base",
              name: plan.commonName,
              purpose: plan.commonPurpose || "Everyday activities",
              description: plan.commonDescription,
              private: false,
              ownerId: "",
              connectedTo: links("common:base"),
            },
          ]
        : []),
      ...(personal
        ? [
            {
              id: "private:base",
              name: plan.privateName,
              purpose: plan.privatePurpose || "Rest",
              description: plan.privateDescription || "A private room.",
              private: true,
              ownerId: "",
              connectedTo: links("private:base"),
            },
          ]
        : []),
    ],
  };
}

export function clearFoundingAssignments(venue: VillageVenue): VillageVenue {
  const clearRoom = <T extends NonNullable<VillageVenue["spaces"]>[number]>(zone: T): T => ({
    ...zone,
    ownerId: "",
    controllerIds: [],
    ...(zone.access
      ? { access: { ...zone.access, managerIds: null, memberIds: [], memberRoles: [], inviterIds: [] } }
      : {}),
  });
  return {
    ...venue,
    residentIds: [],
    workerIds: [],
    occupancy: { ...venue.occupancy, playerHome: false, residentCharacterId: null },
    destinations: {},
    access: undefined,
    spaces: venue.spaces?.map(clearRoom),
    privateSpaces: venue.privateSpaces?.map(clearRoom),
  };
}
