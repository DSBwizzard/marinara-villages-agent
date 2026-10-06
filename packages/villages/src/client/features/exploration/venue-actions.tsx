import type { VillageVenue } from "../../../shared/contracts/village.js";
import type { ProjectsState } from "../projects/useProjectsState.js";
import type { ExplorationState } from "./useExplorationState.js";

/**
 * Every placed Venue uses its public photograph or a plain placeholder.
 * Keep legacy MapPin identifiers for callers; the presentation is always a Polaroid.
 * Unplaced Venues remain available in play without guessing map coordinates.
 */
export function createVenueExplorationActions(ports: {
  readonly openMenu: (tab: import("../../shared/types").MenuPage) => void;
  readonly openPlace: (place: import("../../../shared/contracts/village").VillageVenue) => void;
  readonly openRoom: (
    place: import("../../../shared/contracts/village").VillageVenue,
    spaceClass?: "residence" | "workplace" | "gathering" | "other",
    privateOwnerId?: string,
    entryArea?: "private" | "outside" | "shared" | "public",
    zoneId?: string,
  ) => Promise<void>;
  readonly setExploreSheet: ExplorationState["setExploreSheet"];
  readonly setFocusedProjectId: ProjectsState["setFocusedProjectId"];
  readonly setSiteProjectId: ProjectsState["setSiteProjectId"];
  readonly snapshot: import("../../../shared/contracts/village").VillageSnapshot;
}) {
  return (place: VillageVenue): { label: string; onSelect: () => void }[] => {
    const { openMenu, openPlace, openRoom, setExploreSheet, setFocusedProjectId, setSiteProjectId, snapshot } = ports;

    const project = snapshot?.projects.find(
      (entry) => entry.venueId === place.id && entry.lifecycle?.phase !== "complete",
    );
    return [
      ...(project?.kind === "new-venue"
        ? []
        : [
            { label: "Visit", onSelect: () => void openRoom(place) },
            { label: "View venue", onSelect: () => openPlace(place) },
          ]),
      ...(project
        ? [
            {
              label: "View Project",
              onSelect: () => {
                setExploreSheet(null);
                openMenu("projects");
                setFocusedProjectId(project.id);
                setSiteProjectId(project.id);
              },
            },
          ]
        : []),
    ];
  };
}
