import type { VenueClass, VillageSnapshot, VillageVenue } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { readFileAsDataUrl } from "../../shared/presentation.js";

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
  }, [element, explorationOrigin, explorationReturnTab, setExploreSheet, setOpenPlaceId]);
}

export function useOpenPlace(ports: {
  screen?: string;
  setVenueReturnTo?: React.Dispatch<SetStateAction<"home" | "menu" | "room" | "person">>;
  setVenueSection?: React.Dispatch<SetStateAction<"about" | "zones" | "manage">>;
  setVenueEditError?: (error: string) => void;
  setVenueEditNotice?: (notice: string) => void;
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

      title: string;
      description: string;
    }>
  >;
  setVenueZoneKey: React.Dispatch<SetStateAction<string>>;
}) {
  const { screen, setVenueReturnTo, setVenueSection, setVenueEditError, setVenueEditNotice } = ports;

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
  return useCallback(
    (place: VillageVenue) => {
      if (screen === "menu" || screen === "room" || screen === "person" || screen === "home")
        setVenueReturnTo?.(screen);
      setExploreSheet(null);
      setOpenPlaceId(null);
      setVenueId(place.id);
      setVenuePage("view");
      setVenueSection?.("about");
      setVenueZoneKey("exterior");
      setVenueEditDraft((current) => (current?.id === place.id ? current : null));
      setVenueEditError?.("");
      setVenueEditNotice?.("");
      setVenueProposalDraft(null);
      setScreen("venue");
    },
    [
      screen,
      setExploreSheet,
      setOpenPlaceId,
      setScreen,
      setVenueEditDraft,
      setVenueEditError,
      setVenueEditNotice,
      setVenueId,
      setVenuePage,
      setVenueProposalDraft,
      setVenueReturnTo,
      setVenueSection,
      setVenueZoneKey,
    ],
  );
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
    [placeBusyId, setPlaceBusyId, setPlaceProblem, setSettingsError, setSnapshot],
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
    [placeBusyId, setPlaceBusyId, setPlaceProblem, setSettingsError, setSnapshot, snapshot],
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
    [placeBusyId, setPlaceBusyId, setPlaceProblem, setSettingsError, setSnapshot],
  );
}
