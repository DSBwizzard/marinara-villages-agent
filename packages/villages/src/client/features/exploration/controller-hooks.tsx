import { ELEMENT_TAG } from "../../shared/constants.js";
import { useEffect } from "react";

export function useExplorationOutsideClick(ports: {
  closeExploration: () => void;
  element: HTMLElement;
  exploreSheet: import("./villages-exploration.js").ExplorationSheet;
  openPlaceId: string;
  screen: "home" | "menu" | "setup" | "resume" | "preparing" | "venue" | "room" | "person";
  setExploreSheet: React.Dispatch<React.SetStateAction<import("./villages-exploration.js").ExplorationSheet>>;
  setOpenPlaceId: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { closeExploration, element, exploreSheet, openPlaceId, screen, setExploreSheet, setOpenPlaceId } = ports;
  useEffect(() => {
    if (screen !== "home" || (!exploreSheet && !openPlaceId)) return;
    const outside = (event: PointerEvent) => {
      if (
        !(event.target instanceof Element) ||
        !element.contains(event.target) ||
        event.target.closest(
          "." +
            ELEMENT_TAG +
            "-explore-sheet, ." +
            ELEMENT_TAG +
            "-home-bar, ." +
            ELEMENT_TAG +
            "-explore-nav, ." +
            ELEMENT_TAG +
            "-map-camera-controls, ." +
            ELEMENT_TAG +
            "-navigator-toggle, ." +
            ELEMENT_TAG +
            '-stage[data-exploration="true"]',
        )
      )
        return;
      if (event.target.closest("." + ELEMENT_TAG + "-pin")) {
        setExploreSheet(null);
        setOpenPlaceId(null);
      } else closeExploration();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && element.contains(event.target as Node)) closeExploration();
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [closeExploration, element, exploreSheet, openPlaceId, screen, setExploreSheet, setOpenPlaceId]);
}

export function useRemovedVenueNavigation(ports: {
  closeExploration: () => void;
  openPlaceId: string;
  snapshot: import("../../../shared/contracts/village.js").VillageSnapshot;
}) {
  const { closeExploration, openPlaceId, snapshot } = ports;
  useEffect(() => {
    if (openPlaceId && snapshot && !snapshot.settings.venues.some((venue) => venue.id === openPlaceId))
      closeExploration();
  }, [closeExploration, openPlaceId, snapshot]);
}
