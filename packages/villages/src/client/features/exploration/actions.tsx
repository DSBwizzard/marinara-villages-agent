import type { TownMapView, VenueClass, VillageSnapshot, VillageVenue } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { measureImage, placeSpot, readFileAsDataUrl } from "../../shared/presentation.js";
import { defaultView } from "./MapStage.js";
import type { ExplorationSheet, ExplorationTab } from "./villages-exploration.js";
import { type SetStateAction, useCallback } from "react";

export function useCloseExploration(ports: {
  element: HTMLElement;
  explorationOrigin: React.RefObject<HTMLElement>;
  explorationReturnTab: React.RefObject<ExplorationTab>;
  setExploreSheet: React.Dispatch<SetStateAction<ExplorationSheet>>;
  setOpenPlaceId: React.Dispatch<SetStateAction<string>>;
}) {
  const { element, explorationOrigin, explorationReturnTab, setExploreSheet, setOpenPlaceId } = ports;
  return useCallback(() => {
    setExploreSheet(null);
    setOpenPlaceId(null);
    requestAnimationFrame(() => {
      const target = explorationOrigin.current;
      if (target?.isConnected) target.focus({ preventScroll: true });
      else
        element
          .querySelector<HTMLElement>(`[data-explore-tab="${explorationReturnTab.current}"]`)
          ?.focus({ preventScroll: true });
    });
  }, [element]);
}

export function useOpenPlace(ports: {
  setExploreSheet: React.Dispatch<SetStateAction<ExplorationSheet>>;
  setOpenPlaceId: React.Dispatch<SetStateAction<string>>;
  setScreen: React.Dispatch<
    SetStateAction<"menu" | "venue" | "home" | "setup" | "resume" | "preparing" | "room" | "person">
  >;
  setVenueEditDraft: React.Dispatch<SetStateAction<VillageVenue>>;
  setVenueId: React.Dispatch<SetStateAction<string>>;
  setVenuePage: React.Dispatch<SetStateAction<"view" | "edit" | "proposal">>;
  setVenueProposalDraft: React.Dispatch<
    SetStateAction<{
      classes: VenueClass[];
      capacity: number;
      slot: number;
      title: string;
      description: string;
      extraBeds: number;
    }>
  >;
  setVenueZoneKey: React.Dispatch<SetStateAction<string>>;
}) {
  const {
    setExploreSheet,
    setOpenPlaceId,
    setScreen,
    setVenueEditDraft,
    setVenueId,
    setVenuePage,
    setVenueProposalDraft,
    setVenueZoneKey,
  } = ports;
  return useCallback((place: VillageVenue) => {
    setExploreSheet(null);
    setOpenPlaceId(null);
    setVenueId(place.id);
    setVenuePage("view");
    setVenueZoneKey("exterior");
    setVenueEditDraft(null);
    setVenueProposalDraft(null);
    setScreen("venue");
  }, []);
}

export function useStartMapReplacement(ports: {
  setMapBasePositions: React.Dispatch<SetStateAction<Record<string, { x: number | null; y: number | null }>>>;
  setMapExpectedSetAt: React.Dispatch<SetStateAction<string>>;
  setMapPinDraft: React.Dispatch<SetStateAction<Record<string, { x: number | null; y: number | null }>>>;
  setMapRemoveDraft: React.Dispatch<SetStateAction<boolean>>;
  setMapReplaceOpen: React.Dispatch<SetStateAction<boolean>>;
  setReframingMap: React.Dispatch<SetStateAction<boolean>>;
  setSelectedMapVenueId: React.Dispatch<SetStateAction<string>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setTownMapDraft: React.Dispatch<SetStateAction<TownMapView>>;
  setTownMapPick: React.Dispatch<SetStateAction<{ image: string; size: { width: number; height: number } }>>;
  snapshot: VillageSnapshot;
}) {
  const {
    setMapBasePositions,
    setMapExpectedSetAt,
    setMapPinDraft,
    setMapRemoveDraft,
    setMapReplaceOpen,
    setReframingMap,
    setSelectedMapVenueId,
    setSettingsError,
    setTownMapDraft,
    setTownMapPick,
    snapshot,
  } = ports;
  return useCallback(() => {
    if (!snapshot) return;
    const positions = Object.fromEntries(
      snapshot.settings.venues.map((venue) => [venue.id, { x: venue.presentation.x, y: venue.presentation.y }]),
    );
    setMapBasePositions(positions);
    setMapPinDraft(positions);
    setMapExpectedSetAt(snapshot.settings.townMapImageSetAt);
    setSelectedMapVenueId(snapshot.settings.venues[0]?.id ?? null);
    setMapReplaceOpen(true);
    setMapRemoveDraft(false);
    setTownMapPick(null);
    setTownMapDraft(null);
    setReframingMap(false);
    setSettingsError("");
  }, [snapshot]);
}

export function useGenerateReplacementMap(ports: {
  setMapGenerating: React.Dispatch<SetStateAction<boolean>>;
  setMapRemoveDraft: React.Dispatch<SetStateAction<boolean>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setTownMapDraft: React.Dispatch<SetStateAction<TownMapView>>;
  setTownMapPick: React.Dispatch<SetStateAction<{ image: string; size: { width: number; height: number } }>>;
  snapshot: VillageSnapshot;
}) {
  const { setMapGenerating, setMapRemoveDraft, setSettingsError, setTownMapDraft, setTownMapPick, snapshot } = ports;
  return useCallback(async () => {
    if (!snapshot) return;
    setMapGenerating(true);
    setSettingsError("");
    try {
      const generated = await request<{ image: string; width: number; height: number }>("/setup/town-map/generate", {
        method: "POST",
        body: JSON.stringify({
          setting: snapshot.settings.setting,
          selectedLorebookIds: snapshot.settings.selectedLorebookIds,
          sceneryArtStyle: snapshot.settings.sceneryArtStyle,
          useVisualLore: snapshot.settings.useVisualLoreByDefault,
          scenarioImprint: {
            origin: "",
            worldFacts: snapshot.settings.worldFacts,
            openingConditions: [],
            visualCues: [],
          },
        }),
      });
      const size = await measureImage(generated.image);
      if (size.width !== generated.width || size.height !== generated.height)
        throw new Error("The generated map's reported dimensions do not match the image.");
      setTownMapPick({ image: generated.image, size });
      setMapRemoveDraft(false);
      setTownMapDraft(defaultView("cover"));
    } catch (cause) {
      setSettingsError(messageFrom(cause, "The village map could not be generated."));
    } finally {
      setMapGenerating(false);
    }
  }, [snapshot]);
}

export function usePickTownMap(ports: {
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setMapRemoveDraft: React.Dispatch<SetStateAction<boolean>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setTownMapDraft: React.Dispatch<SetStateAction<TownMapView>>;
  setTownMapPick: React.Dispatch<SetStateAction<{ image: string; size: { width: number; height: number } }>>;
  snapshot: VillageSnapshot;
}) {
  const { setBusy, setMapRemoveDraft, setSettingsError, setTownMapDraft, setTownMapPick, snapshot } = ports;
  return useCallback(
    async (file: File | undefined) => {
      if (!file || !snapshot) return;
      setSettingsError("");
      // A base64 data URL is about a third larger than the bytes it carries, so
      // the stored limit is converted back to a file size once, here.
      const bytesThatFit = Math.floor(((snapshot.settings.townMapImageMaxLength - 64) * 3) / 4);
      if (file.size > bytesThatFit) {
        const mb = (bytes: number) => Math.round(bytes / 100_000) / 10;
        setSettingsError(
          `That picture is ${mb(file.size)} MB and the village map holds ${mb(bytesThatFit)} MB. Try a smaller copy.`,
        );
        return;
      }
      setBusy(true);
      try {
        const image = await readFileAsDataUrl(file);
        const size = await measureImage(image);
        setTownMapPick({ image, size });
        setMapRemoveDraft(false);
        // A fresh picture opens on the fit that fills the frame, because that is
        // the one that leaves the frame looking like a map instead of like a
        // picture parked in a box, and the other two are one press away.
        setTownMapDraft(defaultView("cover"));
      } catch (cause) {
        setSettingsError(messageFrom(cause, "That picture could not be used as the village map."));
      } finally {
        setBusy(false);
      }
    },
    [snapshot],
  );
}

export function useSaveTownMap(ports: {
  mapBasePositions: Record<string, { x: number | null; y: number | null }>;
  mapExpectedSetAt: string;
  mapPinDraft: Record<string, { x: number | null; y: number | null }>;
  mapRemoveDraft: boolean;
  mapReplaceOpen: boolean;
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setMapRemoveDraft: React.Dispatch<SetStateAction<boolean>>;
  setMapReplaceOpen: React.Dispatch<SetStateAction<boolean>>;
  setPlacingMapVenueId: React.Dispatch<SetStateAction<string>>;
  setReframingMap: React.Dispatch<SetStateAction<boolean>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
  setTownMapDraft: React.Dispatch<SetStateAction<TownMapView>>;
  setTownMapImage: React.Dispatch<SetStateAction<string>>;
  setTownMapPick: React.Dispatch<SetStateAction<{ image: string; size: { width: number; height: number } }>>;
  snapshot: VillageSnapshot;
  townMapDraft: TownMapView;
  townMapImage: string;
  townMapPick: { image: string; size: { width: number; height: number } };
}) {
  const {
    mapBasePositions,
    mapExpectedSetAt,
    mapPinDraft,
    mapRemoveDraft,
    mapReplaceOpen,
    setBusy,
    setMapRemoveDraft,
    setMapReplaceOpen,
    setPlacingMapVenueId,
    setReframingMap,
    setSettingsError,
    setSnapshot,
    setTownMapDraft,
    setTownMapImage,
    setTownMapPick,
    snapshot,
    townMapDraft,
    townMapImage,
    townMapPick,
  } = ports;
  return useCallback(async () => {
    if (!snapshot) return;
    const image = mapRemoveDraft ? "" : (townMapPick?.image ?? townMapImage);
    setBusy(true);
    setSettingsError("");
    try {
      const current = Object.fromEntries(snapshot.settings.venues.map((venue) => [venue.id, placeSpot(venue)]));
      const next = await request<VillageSnapshot>("/town-map", {
        method: "PUT",
        body: JSON.stringify({
          image,
          view: townMapDraft ?? snapshot.settings.townMapView,
          expectedMapSetAt: mapReplaceOpen ? mapExpectedSetAt : snapshot.settings.townMapImageSetAt,
          placements: Object.entries(mapReplaceOpen ? mapBasePositions : current).map(([venueId, from]) => ({
            venueId,
            fromX: from.x,
            fromY: from.y,
            x: mapReplaceOpen ? (mapPinDraft[venueId]?.x ?? null) : from.x,
            y: mapReplaceOpen ? (mapPinDraft[venueId]?.y ?? null) : from.y,
          })),
        }),
      });
      setSnapshot(next);
      setTownMapImage(image);
      setTownMapPick(null);
      setTownMapDraft(null);
      setReframingMap(false);
      setMapReplaceOpen(false);
      setMapRemoveDraft(false);
      setPlacingMapVenueId(null);
    } catch (cause) {
      setSettingsError(messageFrom(cause, "The village map could not be saved."));
    } finally {
      setBusy(false);
    }
  }, [
    snapshot,
    townMapDraft,
    townMapImage,
    townMapPick,
    mapRemoveDraft,
    mapReplaceOpen,
    mapExpectedSetAt,
    mapBasePositions,
    mapPinDraft,
  ]);
}

export function useDiscardTownMapDraft(ports: {
  setMapRemoveDraft: React.Dispatch<SetStateAction<boolean>>;
  setMapReplaceOpen: React.Dispatch<SetStateAction<boolean>>;
  setPlacingMapVenueId: React.Dispatch<SetStateAction<string>>;
  setReframingMap: React.Dispatch<SetStateAction<boolean>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setTownMapDraft: React.Dispatch<SetStateAction<TownMapView>>;
  setTownMapPick: React.Dispatch<SetStateAction<{ image: string; size: { width: number; height: number } }>>;
}) {
  const {
    setMapRemoveDraft,
    setMapReplaceOpen,
    setPlacingMapVenueId,
    setReframingMap,
    setSettingsError,
    setTownMapDraft,
    setTownMapPick,
  } = ports;
  return useCallback(() => {
    setTownMapPick(null);
    setTownMapDraft(null);
    setReframingMap(false);
    setMapReplaceOpen(false);
    setMapRemoveDraft(false);
    setPlacingMapVenueId(null);
    setSettingsError("");
  }, []);
}

export function useDrawPlaceImage(ports: {
  placeBusyId: string;
  setPlaceBusyId: React.Dispatch<SetStateAction<string>>;
  setPlaceProblem: React.Dispatch<SetStateAction<{ id: string; text: string }>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
}) {
  const { placeBusyId, setPlaceBusyId, setPlaceProblem, setSettingsError, setSnapshot } = ports;
  return useCallback(
    async (venueId: string, spaceClass?: VenueClass, privateOwnerId = "", zoneId?: string) => {
      if (placeBusyId) return;
      setPlaceBusyId(venueId);
      setPlaceProblem(null);
      setSettingsError("");
      try {
        setSnapshot(
          await request<VillageSnapshot>("/locations/venue/image", {
            method: "POST",
            body: JSON.stringify({ venueId, spaceClass, privateOwnerId, zoneId }),
          }),
        );
      } catch (cause) {
        setPlaceProblem({ id: venueId, text: messageFrom(cause, "That place could not be drawn.") });
      } finally {
        setPlaceBusyId("");
      }
    },
    [placeBusyId],
  );
}

export function useKeepPlaceImage(ports: {
  placeBusyId: string;
  setPlaceBusyId: React.Dispatch<SetStateAction<string>>;
  setPlaceProblem: React.Dispatch<SetStateAction<{ id: string; text: string }>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
  snapshot: VillageSnapshot;
}) {
  const { placeBusyId, setPlaceBusyId, setPlaceProblem, setSettingsError, setSnapshot, snapshot } = ports;
  return useCallback(
    async (venueId: string, file: File | undefined, spaceClass?: VenueClass, privateOwnerId = "", zoneId?: string) => {
      if (!file || !snapshot || placeBusyId) return;
      setPlaceBusyId(venueId);
      setPlaceProblem(null);
      setSettingsError("");
      try {
        const mb = (bytes: number) => Math.round(bytes / 100_000) / 10;
        if (file.size > snapshot.settings.maxVenueImageBytes) {
          setPlaceProblem({
            id: venueId,
            text: `That picture is ${mb(file.size)} MB and a place holds ${mb(
              snapshot.settings.maxVenueImageBytes,
            )} MB. Try a smaller copy.`,
          });
          return;
        }
        const image = await readFileAsDataUrl(file);
        setSnapshot(
          await request<VillageSnapshot>("/locations/venue/image", {
            method: "PUT",
            body: JSON.stringify({ venueId, image, spaceClass, privateOwnerId, zoneId }),
          }),
        );
      } catch (cause) {
        setPlaceProblem({ id: venueId, text: messageFrom(cause, "That picture could not be kept.") });
      } finally {
        setPlaceBusyId("");
      }
    },
    [placeBusyId, snapshot],
  );
}

export function useDropPlaceImage(ports: {
  placeBusyId: string;
  setPlaceBusyId: React.Dispatch<SetStateAction<string>>;
  setPlaceProblem: React.Dispatch<SetStateAction<{ id: string; text: string }>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
}) {
  const { placeBusyId, setPlaceBusyId, setPlaceProblem, setSettingsError, setSnapshot } = ports;
  return useCallback(
    async (venueId: string, spaceClass?: VenueClass, privateOwnerId = "", zoneId?: string) => {
      if (placeBusyId) return;
      setPlaceBusyId(venueId);
      setPlaceProblem(null);
      setSettingsError("");
      try {
        setSnapshot(
          await request<VillageSnapshot>("/locations/venue/image", {
            method: "DELETE",
            body: JSON.stringify({ venueId, spaceClass, privateOwnerId, zoneId }),
          }),
        );
      } catch (cause) {
        setPlaceProblem({ id: venueId, text: messageFrom(cause, "That picture could not be taken away.") });
      } finally {
        setPlaceBusyId("");
      }
    },
    [placeBusyId],
  );
}
