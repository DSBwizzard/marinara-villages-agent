import { request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { useEffect } from "react";

export function useMapNavigationReset(ports: {
  explorationMapKey: string;
  setExploreSheet: React.Dispatch<React.SetStateAction<import("./villages-exploration.js").ExplorationSheet>>;
  setNavigationView: React.Dispatch<React.SetStateAction<import("./villages-mobile-map.js").MobileMapView>>;
}) {
  const { explorationMapKey, setExploreSheet, setNavigationView } = ports;
  useEffect(() => {
    setNavigationView(null);
    setExploreSheet(null);
  }, [explorationMapKey]);
}

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
          "." + ELEMENT_TAG + "-explore-sheet, ." + ELEMENT_TAG + "-home-bar, ." + ELEMENT_TAG + "-explore-nav",
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
  }, [closeExploration, element, exploreSheet, openPlaceId, screen]);
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

export function useTownMapImage(ports: {
  setTownMapImage: React.Dispatch<React.SetStateAction<string>>;
  townMapSetAt: string;
}) {
  const { setTownMapImage, townMapSetAt } = ports;
  useEffect(() => {
    if (townMapSetAt === null) return;
    const controller = new AbortController();
    void (async () => {
      try {
        const loaded = await request<{ image: string }>("/town-map", { signal: controller.signal });
        setTownMapImage(loaded.image);
      } catch {
        // Treated as "no map": a failed fetch is not worth an alert on a page
        // whose main job is the village itself, and the panel says what to do.
        if (!controller.signal.aborted) setTownMapImage("");
      }
    })();
    return () => controller.abort();
  }, [townMapSetAt]);
}
