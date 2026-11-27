import type { VillageSnapshot } from "../../../shared/contracts/village.js";
import type { PlaceSummary } from "../../../shared/contracts/places.js";
import type { ExplorationSheet, ExplorationTab } from "./villages-exploration.js";
import type { MapNavigationView } from "./villages-mobile-map.js";
import { useCallback, useEffect, useRef, useState } from "react";

/** Browsing preferences are device-local, separate from the Village and its Scene. */
export function useExplorationState(snapshot: VillageSnapshot | null) {
  const [openPlaceId, setOpenPlaceId] = useState<string | null>(null);
  const [exploreSheet, setExploreSheet] = useState<ExplorationSheet | null>(null);
  const [explorationSearch, setExplorationSearch] = useState({ places: "", people: "" });
  const explorationReturnTab = useRef<ExplorationTab>("map");
  const explorationOrigin = useRef<HTMLElement | null>(null);
  const [selectedId, selectId] = useState("");
  const [showAllMaps, setShowAllMaps] = useState(false);
  const [placingPlace, setPlacingPlace] = useState<PlaceSummary | null>(null);
  useEffect(() => setPlacingPlace(null), [snapshot?.worldScope]);
  const [cameras, setCameras] = useState<Record<string, MapNavigationView | null>>({});
  const maps = snapshot?.settings.maps ?? [];
  const selectedMap = maps.find((map) => map.id === selectedId) ?? maps[0] ?? null;
  const preferenceKey = "villages-map:" + (snapshot?.settings.maps[0]?.id ?? "");
  useEffect(() => {
    try {
      selectId(localStorage.getItem(preferenceKey) ?? "");
    } catch {
      selectId("");
    }
    setCameras({});
  }, [preferenceKey]);
  const setSelectedMapId = useCallback(
    (id: string) => {
      selectId(id);
      setShowAllMaps(false);
      setOpenPlaceId(null);
      setExplorationSearch((current) => ({ ...current, places: "" }));
      setExploreSheet(null);
      try {
        localStorage.setItem(preferenceKey, id);
      } catch {
        /* Browsing remains available without preference storage. */
      }
    },
    [preferenceKey],
  );
  const mapId = selectedMap?.id ?? "";
  const navigationView = cameras[mapId] ?? null;
  const setNavigationView = useCallback<React.Dispatch<React.SetStateAction<MapNavigationView | null>>>(
    (value) => {
      setCameras((current) => ({
        ...current,
        [mapId]: typeof value === "function" ? value(current[mapId] ?? null) : value,
      }));
    },
    [mapId],
  );
  return {
    openPlaceId,
    setOpenPlaceId,
    exploreSheet,
    setExploreSheet,
    explorationSearch,
    setExplorationSearch,
    explorationReturnTab,
    explorationOrigin,
    navigationView,
    setNavigationView,
    selectedMap,
    setSelectedMapId,
    showAllMaps,
    setShowAllMaps,
    placingPlace,
    setPlacingPlace,
  };
}
export type ExplorationState = ReturnType<typeof useExplorationState>;
