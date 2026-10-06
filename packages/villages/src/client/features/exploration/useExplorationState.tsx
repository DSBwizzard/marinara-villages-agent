import type { TownMapView } from "../../../shared/contracts/village.js";
import type { ExplorationSheet, ExplorationTab } from "./villages-exploration";
import type { MobileMapView } from "./villages-mobile-map";
import { useRef, useState } from "react";

/** Always mounted by the application controller so navigation retains this feature state. */
export function useExplorationState() {
  const [openPlaceId, setOpenPlaceId] = useState<string | null>(null);

  const [exploreSheet, setExploreSheet] = useState<ExplorationSheet | null>(null);

  const [explorationSearch, setExplorationSearch] = useState({ places: "", people: "" });

  const explorationReturnTab = useRef<ExplorationTab>("map");

  const [navigationView, setNavigationView] = useState<MobileMapView | null>(null);

  const explorationOrigin = useRef<HTMLElement | null>(null);

  const [selectedMapVenueId, setSelectedMapVenueId] = useState<string | null>(null);

  const [placingMapVenueId, setPlacingMapVenueId] = useState<string | null>(null);

  const [mapReplaceOpen, setMapReplaceOpen] = useState(false);

  const [mapRemoveDraft, setMapRemoveDraft] = useState(false);

  const [mapGenerating, setMapGenerating] = useState(false);

  const [mapExpectedSetAt, setMapExpectedSetAt] = useState("");

  const [mapBasePositions, setMapBasePositions] = useState<Record<string, { x: number | null; y: number | null }>>({});

  const [mapPinDraft, setMapPinDraft] = useState<Record<string, { x: number | null; y: number | null }>>({});

  // The town map itself, held here rather than on the snapshot: an image in a
  // snapshot read on every chat send would be re-sent whole every turn.
  const [townMapImage, setTownMapImage] = useState("");

  /**
   * A picture that has been picked but not written yet, with the size it decoded
   * to. Held here rather than sent straight up because picking a picture and
   * deciding how it sits in the frame are two answers to one question, and the
   * village should not be handed the first without the second.
   */
  const [townMapPick, setTownMapPick] = useState<{
    image: string;
    size: { width: number; height: number };
  } | null>(null);

  /** The framing being tried out on the preview. Null means "whatever is saved". */
  const [townMapDraft, setTownMapDraft] = useState<TownMapView | null>(null);

  /** Whether the saved picture is being re-framed. A picked picture frames itself. */
  const [reframingMap, setReframingMap] = useState(false);
  return {
    openPlaceId,
    setOpenPlaceId,
    exploreSheet,
    setExploreSheet,
    explorationSearch,
    setExplorationSearch,
    explorationReturnTab,
    navigationView,
    setNavigationView,
    explorationOrigin,
    selectedMapVenueId,
    setSelectedMapVenueId,
    placingMapVenueId,
    setPlacingMapVenueId,
    mapReplaceOpen,
    setMapReplaceOpen,
    mapRemoveDraft,
    setMapRemoveDraft,
    mapGenerating,
    setMapGenerating,
    mapExpectedSetAt,
    setMapExpectedSetAt,
    mapBasePositions,
    setMapBasePositions,
    mapPinDraft,
    setMapPinDraft,
    townMapImage,
    setTownMapImage,
    townMapPick,
    setTownMapPick,
    townMapDraft,
    setTownMapDraft,
    reframingMap,
    setReframingMap,
  };
}
