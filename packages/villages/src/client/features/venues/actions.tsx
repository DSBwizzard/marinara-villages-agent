import type { VenueClass, VenueRequest, VillageSnapshot, VillageVenue } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { destinationPlaces, freshRowKey } from "../../shared/presentation.js";
import type { MenuPage } from "../../shared/types.js";
import { venueClassesFor, venueSpaceFor } from "../../shared/venue.js";
import type { ExplorationSheet, ExplorationTab } from "../exploration/villages-exploration.js";
import { type SetStateAction, useCallback } from "react";

export function useOpenVenue(ports: {
  explorationOrigin: React.RefObject<HTMLElement>;
  explorationReturnTab: React.RefObject<ExplorationTab>;
  setExploreSheet: React.Dispatch<SetStateAction<ExplorationSheet>>;
  setMovePrivateZoneId: React.Dispatch<SetStateAction<string>>;
  setOpenPlaceId: React.Dispatch<SetStateAction<string>>;
  setPlayerMovePrivateZoneId: React.Dispatch<SetStateAction<string>>;
  setScreen: React.Dispatch<
    SetStateAction<"menu" | "venue" | "home" | "setup" | "resume" | "preparing" | "room" | "person">
  >;
}) {
  const {
    explorationOrigin,
    explorationReturnTab,
    setExploreSheet,
    setMovePrivateZoneId,
    setOpenPlaceId,
    setPlayerMovePrivateZoneId,
    setScreen,
  } = ports;
  return useCallback((place: VillageVenue) => {
    setPlayerMovePrivateZoneId("");
    setMovePrivateZoneId("");
    setExploreSheet(null);
    if (!(document.activeElement instanceof HTMLHeadingElement)) {
      explorationReturnTab.current = "map";
      explorationOrigin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    setOpenPlaceId(place.id);
    setScreen("home");
  }, []);
}

export function useLeaveVenue(ports: {
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
  return useCallback(() => {
    setExploreSheet(null);
    setVenueId(null);
    setVenuePage("view");
    setVenueZoneKey("exterior");
    setVenueEditDraft(null);
    setVenueProposalDraft(null);
    setOpenPlaceId(null);
    setScreen("home");
  }, []);
}

export function useAddVenue(ports: { setVenueEditDraft: React.Dispatch<SetStateAction<VillageVenue>> }) {
  const { setVenueEditDraft } = ports;
  return useCallback(() => {
    setVenueEditDraft({
      id: freshRowKey(),
      name: "",
      form: "",
      classes: ["other"],
      spaces: [],
      residenceCapacity: 1,
      residentIds: [],
      improvements: [null, null],
      description: "",
      category: "",
      presentation: { image: null, x: null, y: null },
      occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
      capabilities: [],
      state: { condition: "", upgrades: [], furniture: [], publicFacts: [], updatedAt: "" },
    });
  }, []);
}

export function useSaveVenue(ports: {
  openMenu: (tab: MenuPage) => void;
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
  setVenueEditDraft: React.Dispatch<SetStateAction<VillageVenue>>;
  setVenuesDraft: React.Dispatch<SetStateAction<VillageVenue[]>>;
  snapshot: VillageSnapshot;
}) {
  const { openMenu, setBusy, setSettingsError, setSnapshot, setVenueEditDraft, setVenuesDraft, snapshot } = ports;
  return useCallback(
    async (draft: VillageVenue) => {
      setBusy(true);
      setSettingsError("");
      try {
        const existing = snapshot?.settings.venues.some((venue) => venue.id === draft.id) ?? false;
        const spaces = venueClassesFor(draft).map((item) => venueSpaceFor(draft, item));
        const next = await request<VillageSnapshot>(
          existing ? `/locations/venue/${encodeURIComponent(draft.id)}` : "/projects",
          {
            method: existing ? "PUT" : "POST",
            body: JSON.stringify(
              existing
                ? { name: draft.name, description: spaces[0]?.description ?? draft.description }
                : {
                    name: draft.name,
                    classes: draft.classes,
                    description: spaces[0]?.description ?? draft.description,
                  },
            ),
          },
        );
        const saved = destinationPlaces(next.settings.venues).find((venue) =>
          existing ? venue.id === draft.id : venue.name.toLowerCase() === draft.name.trim().toLowerCase(),
        );
        setSnapshot(next);
        setVenueEditDraft(null);
        if (!existing) openMenu("projects");
        setVenuesDraft((rows) => {
          const merged = rows.map((row) => (row.id === draft.id && saved ? saved : row));
          return [
            ...merged,
            ...destinationPlaces(next.settings.venues).filter((venue) => !merged.some((row) => row.id === venue.id)),
          ];
        });
      } catch (cause) {
        setSettingsError(messageFrom(cause, "That place could not be saved."));
      } finally {
        setBusy(false);
      }
    },
    [snapshot, openMenu],
  );
}

export function useRemoveVenue(ports: {
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
  setVenuesDraft: React.Dispatch<SetStateAction<VillageVenue[]>>;
  snapshot: VillageSnapshot;
}) {
  const { setBusy, setSettingsError, setSnapshot, setVenuesDraft, snapshot } = ports;
  return useCallback(
    async (id: string) => {
      const existing = snapshot?.settings.venues.find((venue) => venue.id === id);
      if (!existing) {
        setVenuesDraft((rows) => rows.filter((row) => row.id !== id));
        return;
      }
      setBusy(true);
      setSettingsError("");
      try {
        const dependencies = await request<{
          residentCharacterIds: string[];
          playerHome: boolean;
          workerCharacterIds: string[];
          pendingMailCount: number;
          pendingResidenceCharacterIds: string[];
          remapCount: number;
          roomPresent: boolean;
          eventCount: number;
        }>(`/locations/venue/${encodeURIComponent(id)}/dependencies`);
        if (
          dependencies.roomPresent ||
          dependencies.playerHome ||
          dependencies.residentCharacterIds.length ||
          dependencies.pendingMailCount
        ) {
          setSettingsError(
            dependencies.roomPresent
              ? "End the active Scene before deleting this Venue."
              : dependencies.pendingMailCount
                ? "Resolve pending Venue decisions before deleting this Venue."
                : "Move every resident, including yourself, before deleting this Residence.",
          );
          return;
        }
        const affected = dependencies.residentCharacterIds.length + dependencies.pendingResidenceCharacterIds.length;
        const note =
          affected || dependencies.workerCharacterIds.length || dependencies.remapCount || dependencies.eventCount
            ? `This place is referenced by ${affected} pending moves, ${dependencies.workerCharacterIds.length} workers, ${dependencies.remapCount} schedule moves, and ${dependencies.eventCount} events. Delete it?`
            : `Delete ${existing.name}?`;
        if (!window.confirm(note)) return;
        const next = await request<VillageSnapshot>(`/locations/venue/${encodeURIComponent(id)}`, {
          method: "DELETE",
          body: JSON.stringify({ confirmed: true }),
        });
        setSnapshot(next);
        setVenuesDraft((rows) => rows.filter((row) => row.id !== id));
      } catch (cause) {
        setSettingsError(messageFrom(cause, "That place could not be removed."));
      } finally {
        setBusy(false);
      }
    },
    [snapshot],
  );
}

export function useDecideVenueRequest(ports: {
  requestEdits: Record<
    string,
    { name: string; classes: Array<"residence" | "workplace" | "gathering" | "other">; description: string }
  >;
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setRequestEdits: React.Dispatch<
    SetStateAction<
      Record<
        string,
        { name: string; classes: Array<"residence" | "workplace" | "gathering" | "other">; description: string }
      >
    >
  >;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
  setVenuesDraft: React.Dispatch<SetStateAction<VillageVenue[]>>;
  venuesDraft: VillageVenue[];
}) {
  const { requestEdits, setBusy, setRequestEdits, setSettingsError, setSnapshot, setVenuesDraft, venuesDraft } = ports;
  return useCallback(
    async (entry: VenueRequest, approved: boolean) => {
      setBusy(true);
      setSettingsError("");
      try {
        const draft = requestEdits[entry.id] ?? entry.venueDraft;
        const next = await request<VillageSnapshot>(
          `/venue-requests/${encodeURIComponent(entry.id)}/${approved ? "approve" : "deny"}`,
          { method: "POST", body: approved ? JSON.stringify(draft) : undefined },
        );
        setSnapshot(next);
        if (approved) {
          const known = new Set(venuesDraft.map((venue) => venue.id));
          setVenuesDraft((rows) => [
            ...rows,
            ...destinationPlaces(next.settings.venues).filter((venue) => !known.has(venue.id)),
          ]);
        }
        setRequestEdits((current) => {
          const nextEdits = { ...current };
          delete nextEdits[entry.id];
          return nextEdits;
        });
      } catch (cause) {
        setSettingsError(
          messageFrom(cause, approved ? "That venue could not be approved." : "That request could not be denied."),
        );
      } finally {
        setBusy(false);
      }
    },
    [requestEdits, venuesDraft],
  );
}
