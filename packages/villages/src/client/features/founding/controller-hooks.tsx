import { DEFAULT_RESIDENT_FOUNDING_CONTEXT } from "../../../engine/packages/shared/src/villages/resident-founding-context.js";
import { messageFrom, request } from "../../shared/api.js";
import { freshRowKey, measureImage } from "../../shared/presentation.js";
import type { VillageSnapshot } from "../../shared/types.js";
import {
  newSetupVenue,
  requestSetupMapReceipt,
  SETUP_MAX_VILLAGER_COUNT,
  SETUP_MIN_VILLAGER_COUNT,
} from "./FoundingPanels.js";
import { foundingZoneProblem } from "./villages-founding-zones";
import { playerRoleProblem } from "./villages-player-role.js";
import { useCallback, useEffect, useMemo } from "react";

export function useFoundingSelectedResidentContexts(ports: {
  setupFoundingVillagerIds: string[];
  setupResidentContexts: Record<
    string,
    import("../../../engine/packages/shared/src/villages/resident-founding-context").ResidentFoundingContext
  >;
}) {
  const { setupFoundingVillagerIds, setupResidentContexts } = ports;
  return useMemo(
    () =>
      Object.fromEntries(
        setupFoundingVillagerIds.map((id) => [
          id,
          setupResidentContexts[id] ?? { ...DEFAULT_RESIDENT_FOUNDING_CONTEXT },
        ]),
      ),
    [setupFoundingVillagerIds, setupResidentContexts],
  );
}

export function useFoundingImageContext(ports: {
  setupImageContextKey: string;
  setupImageContextKeyRef: React.RefObject<string>;
}) {
  const { setupImageContextKey, setupImageContextKeyRef } = ports;
  useEffect(() => {
    setupImageContextKeyRef.current = setupImageContextKey;
  }, [setupImageContextKey]);
}

export function useFoundingVenueReference(ports: {
  setupVenues: import("../../shared/types").VillageVenue[];
  setupVenuesRef: React.RefObject<import("../../shared/types").VillageVenue[]>;
}) {
  const { setupVenues, setupVenuesRef } = ports;
  useEffect(() => {
    setupVenuesRef.current = setupVenues;
  }, [setupVenues]);
}

export function useFoundingBeginningReference(ports: {
  setupBeginningSourceKey: string;
  setupBeginningSourceKeyRef: React.RefObject<string>;
  snapshot: import("../../shared/types").VillageSnapshot;
}) {
  const { setupBeginningSourceKey, setupBeginningSourceKeyRef, snapshot } = ports;
  useEffect(() => {
    if (setupBeginningSourceKeyRef.current !== setupBeginningSourceKey && !snapshot?.isFounded) {
    }
    setupBeginningSourceKeyRef.current = setupBeginningSourceKey;
  }, [setupBeginningSourceKey, snapshot?.isFounded]);
}

export function useFoundingMapClock(ports: {
  setSetupMapClock: React.Dispatch<React.SetStateAction<number>>;
  setupMapBusy: boolean;
}) {
  const { setSetupMapClock, setupMapBusy } = ports;
  useEffect(() => {
    if (!setupMapBusy) return;
    const timer = window.setInterval(() => setSetupMapClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [setupMapBusy]);
}

export function useFoundingAuthoredReference(ports: {
  setupAuthoredFields: Record<string, string[]>;
  setupAuthoredFieldsRef: React.RefObject<Record<string, string[]>>;
}) {
  const { setupAuthoredFields, setupAuthoredFieldsRef } = ports;
  useEffect(() => {
    setupAuthoredFieldsRef.current = setupAuthoredFields;
  }, [setupAuthoredFields]);
}

export function useFoundingSetupDraftData(ports: {
  mapVisualLore: boolean;
  movingSetupVenueId: string;
  personaDraft: string;
  personalizeHomes: boolean;
  sceneryStyle: string;
  selectedSetupVenueId: string;
  setupAuthoredFields: Record<string, string[]>;
  setupEditorAuthoredOriginal: React.RefObject<string[]>;
  setupEditorOpen: boolean;
  setupEditorOriginal: React.RefObject<import("../../shared/types").VillageVenue>;
  setupEditorZoneOriginal: React.RefObject<{
    common?: {
      id: string;
      name?: string;
      ownerId?: string;
      purpose?: string;
      access?: import("../../../engine/packages/shared/src/villages/venue-access").ZoneAccessPolicy;
      accessView?: import("../../../engine/packages/shared/src/villages/venue-access").ZoneAccessView;
      controllerIds?: string[];
      venueClass: "residence" | "workplace" | "gathering" | "other";
      description: string;
      image: import("../../shared/types").VillageVenueImage;
      state: {
        condition: string;
        items: string[];
        publicFacts: string[];
        features: { id: string; text: string; sourceCharacterId: string; locked: boolean; updatedAt: string }[];
        traces: { id: string; kind: string; text: string; recipientId: string; createdAt: string }[];
        updatedAt: string;
      };
    };
    personal?: {
      id: string;
      name?: string;
      ownerId?: string;
      purpose?: string;
      access?: import("../../../engine/packages/shared/src/villages/venue-access").ZoneAccessPolicy;
      accessView?: import("../../../engine/packages/shared/src/villages/venue-access").ZoneAccessView;
      controllerIds?: string[];
      venueClass: "residence" | "workplace" | "gathering" | "other";
      description: string;
      image: import("../../shared/types").VillageVenueImage;
      state: {
        condition: string;
        items: string[];
        publicFacts: string[];
        features: { id: string; text: string; sourceCharacterId: string; locked: boolean; updatedAt: string }[];
        traces: { id: string; kind: string; text: string; recipientId: string; createdAt: string }[];
        updatedAt: string;
      };
    } & {
      ownerId: string;
      name?: string;
      purpose?: string;
      access?: import("../../../engine/packages/shared/src/villages/venue-access").ZoneAccessPolicy;
      accessView?: import("../../../engine/packages/shared/src/villages/venue-access").ZoneAccessView;
      controllerIds?: string[];
      adaptationPending?: boolean;
      initialImageAttemptedAt?: string;
    };
  }>;
  setupFoundingDetails: string;
  setupFoundingGuidance: string;
  setupFoundingReason: "rebuild" | "pioneer" | "prosper" | "custom" | "none";
  setupFoundingVillagerIds: string[];
  setupImprint: import("../../shared/types").ScenarioImprint;
  setupKeyboardSpot: { x: number; y: number };
  setupLorebookDraft: string[];
  setupLoreTokenBudgetDraft: number;
  setupMapBusy: boolean;
  setupMapGeneratedKey: string;
  setupMapImage: string;
  setupMapImageSource: "generate" | "upload";
  setupMapNegativePrompt: string;
  setupMapOptions: import("../../shared/types").TownMapOptions;
  setupMapProblem: string;
  setupMapPrompt: string;
  setupMapRequest: import("../../shared/types").SetupMapRequest;
  setupMapReviewed: boolean;
  setupMapSize: { width: number; height: number };
  setupMapSource: import("../../shared/types").SetupMapSource;
  setupName: string;
  setupPlayerRole: import("./villages-player-role").PlayerRole;
  setupResidentContexts: Record<
    string,
    import("../../../engine/packages/shared/src/villages/resident-founding-context").ResidentFoundingContext
  >;
  setupSetting: string;
  setupStep: number;
  setupSuggestionsBusy: boolean;
  setupSuggestionsKey: string;
  setupVenueBusy: boolean;
  setupVenues: import("../../shared/types").VillageVenue[];
  setupWorkspace: import("./villages-founding-workspace-state").FoundingWorkspaceState;
  setupWorldFacts: string[];
  setupZoneDrafts: React.RefObject<
    Record<
      string,
      {
        common?: {
          id: string;
          name?: string;
          ownerId?: string;
          purpose?: string;
          access?: import("../../../engine/packages/shared/src/villages/venue-access").ZoneAccessPolicy;
          accessView?: import("../../../engine/packages/shared/src/villages/venue-access").ZoneAccessView;
          controllerIds?: string[];
          venueClass: "residence" | "workplace" | "gathering" | "other";
          description: string;
          image: import("../../shared/types").VillageVenueImage;
          state: {
            condition: string;
            items: string[];
            publicFacts: string[];
            features: { id: string; text: string; sourceCharacterId: string; locked: boolean; updatedAt: string }[];
            traces: { id: string; kind: string; text: string; recipientId: string; createdAt: string }[];
            updatedAt: string;
          };
        };
        personal?: {
          id: string;
          name?: string;
          ownerId?: string;
          purpose?: string;
          access?: import("../../../engine/packages/shared/src/villages/venue-access").ZoneAccessPolicy;
          accessView?: import("../../../engine/packages/shared/src/villages/venue-access").ZoneAccessView;
          controllerIds?: string[];
          venueClass: "residence" | "workplace" | "gathering" | "other";
          description: string;
          image: import("../../shared/types").VillageVenueImage;
          state: {
            condition: string;
            items: string[];
            publicFacts: string[];
            features: { id: string; text: string; sourceCharacterId: string; locked: boolean; updatedAt: string }[];
            traces: { id: string; kind: string; text: string; recipientId: string; createdAt: string }[];
            updatedAt: string;
          };
        } & {
          ownerId: string;
          name?: string;
          purpose?: string;
          access?: import("../../../engine/packages/shared/src/villages/venue-access").ZoneAccessPolicy;
          accessView?: import("../../../engine/packages/shared/src/villages/venue-access").ZoneAccessView;
          controllerIds?: string[];
          adaptationPending?: boolean;
          initialImageAttemptedAt?: string;
        };
      }
    >
  >;
  visualLoreDefault: boolean;
}) {
  const {
    mapVisualLore,
    movingSetupVenueId,
    personaDraft,
    personalizeHomes,
    sceneryStyle,
    selectedSetupVenueId,
    setupAuthoredFields,
    setupEditorAuthoredOriginal,
    setupEditorOpen,
    setupEditorOriginal,
    setupEditorZoneOriginal,
    setupFoundingDetails,
    setupFoundingGuidance,
    setupFoundingReason,
    setupFoundingVillagerIds,
    setupImprint,
    setupKeyboardSpot,
    setupLorebookDraft,
    setupLoreTokenBudgetDraft,
    setupMapBusy,
    setupMapGeneratedKey,
    setupMapImage,
    setupMapImageSource,
    setupMapNegativePrompt,
    setupMapOptions,
    setupMapProblem,
    setupMapPrompt,
    setupMapRequest,
    setupMapReviewed,
    setupMapSize,
    setupMapSource,
    setupName,
    setupPlayerRole,
    setupResidentContexts,
    setupSetting,
    setupStep,
    setupSuggestionsBusy,
    setupSuggestionsKey,
    setupVenueBusy,
    setupVenues,
    setupWorkspace,
    setupWorldFacts,
    setupZoneDrafts,
    visualLoreDefault,
  } = ports;
  return useMemo(
    () => ({
      step: setupStep,
      name: setupName,
      setting: setupSetting,
      reason: setupFoundingReason,
      circumstances: setupFoundingDetails,
      direction: setupFoundingGuidance,
      role: setupPlayerRole,
      imprint: setupImprint,
      worldFacts: setupWorldFacts,
      venues: setupVenues,
      zoneDrafts: structuredClone(setupZoneDrafts.current),
      roster: setupFoundingVillagerIds,
      residentContexts: setupResidentContexts,
      persona: personaDraft,
      lorebooks: setupLorebookDraft,
      loreBudget: setupLoreTokenBudgetDraft,
      artStyle: sceneryStyle,
      personalizeHomes,
      visualLoreDefault,
      mapVisualLore,
      mapSource: setupMapSource,
      mapImage: setupMapImage,
      mapImageSource: setupMapImageSource,
      mapGeneratedKey: setupMapGeneratedKey,
      mapSize: setupMapSize,
      mapPrompt: setupMapPrompt,
      mapNegative: setupMapNegativePrompt,
      mapOptions: setupMapOptions,
      mapReviewed: setupMapReviewed,
      mapProblem: setupMapProblem,
      mapRequest: setupMapRequest,
      authoredFields: setupAuthoredFields,
      suggestionsKey: setupSuggestionsKey,
      selectedVenueId: selectedSetupVenueId,
      workspace: setupWorkspace,
      movingVenueId: movingSetupVenueId,
      editorOpen: setupEditorOpen,
      editorOriginal: setupEditorOriginal.current,
      editorAuthoredOriginal: setupEditorAuthoredOriginal.current,
      editorZoneOriginal: setupEditorZoneOriginal.current,
      keyboardSpot: setupKeyboardSpot,
      interruptedGeneration: (setupMapBusy && !setupMapRequest) || setupVenueBusy || setupSuggestionsBusy,
    }),
    [
      setupStep,
      setupWorkspace,
      setupName,
      setupSetting,
      setupFoundingReason,
      setupFoundingDetails,
      setupFoundingGuidance,
      setupPlayerRole,
      setupImprint,
      setupWorldFacts,
      setupVenues,
      setupFoundingVillagerIds,
      setupResidentContexts,
      personaDraft,
      setupLorebookDraft,
      setupLoreTokenBudgetDraft,
      sceneryStyle,
      personalizeHomes,
      visualLoreDefault,
      mapVisualLore,
      setupMapSource,
      setupMapImage,
      setupMapImageSource,
      setupMapGeneratedKey,
      setupMapSize,
      setupMapPrompt,
      setupMapNegativePrompt,
      setupMapOptions,
      setupMapReviewed,
      setupMapProblem,
      setupMapRequest,
      setupAuthoredFields,
      setupSuggestionsKey,
      selectedSetupVenueId,
      movingSetupVenueId,
      setupEditorOpen,
      setupKeyboardSpot,
      setupMapBusy,
      setupVenueBusy,
      setupSuggestionsBusy,
    ],
  );
}

export function useFoundingRosterReconciliation(ports: {
  catalog: import("../../shared/types").CatalogEntry[];
  draftReady: boolean;
  screen: "home" | "menu" | "setup" | "resume" | "preparing" | "venue" | "room" | "person";
  setSetupVenues: React.Dispatch<React.SetStateAction<import("../../shared/types").VillageVenue[]>>;
  setupFoundingVillagerIds: string[];
  snapshot: import("../../shared/types").VillageSnapshot;
}) {
  const { catalog, draftReady, screen, setSetupVenues, setupFoundingVillagerIds, snapshot } = ports;
  useEffect(() => {
    if (screen !== "setup" || snapshot?.isFounded || !draftReady || setupFoundingVillagerIds.length < 1) return;
    setSetupVenues((rows) => {
      const home = rows.find((row) => row.occupancy.playerHome);
      const center = rows.find((row) => row.category === "public-center");
      const emptyVenue = (residence: boolean, player = false) => {
        const row = newSetupVenue(freshRowKey(), residence ? "residence" : "gathering", 0.5, 0.5, player);
        return { ...row, layout: "exterior" as const, presentation: { ...row.presentation, x: null, y: null } };
      };
      const next = [
        home ?? emptyVenue(true, true),
        ...setupFoundingVillagerIds.map(
          (id) =>
            rows.find((row) => row.occupancy.residentCharacterId === id) ?? {
              ...emptyVenue(true),
              name: (catalog?.find((person) => person.id === id)?.name ?? "Villager") + "'s living space",
              residentIds: [id],
              occupancy: { playerHome: false, residentCharacterId: id, homeKind: null },
            },
        ),
        center ?? emptyVenue(false),
      ];
      return next.length === rows.length && next.every((row, index) => row === rows[index]) ? rows : next;
    });
  }, [screen, snapshot?.isFounded, draftReady, setupFoundingVillagerIds, catalog]);
}

export function useFoundingMapReceipt(ports: {
  screen: "home" | "menu" | "setup" | "resume" | "preparing" | "venue" | "room" | "person";
  setSetupMapBusy: React.Dispatch<React.SetStateAction<boolean>>;
  setSetupMapGeneratedKey: React.Dispatch<React.SetStateAction<string>>;
  setSetupMapImage: React.Dispatch<React.SetStateAction<string>>;
  setSetupMapImageSource: React.Dispatch<React.SetStateAction<"generate" | "upload">>;
  setSetupMapProblem: React.Dispatch<React.SetStateAction<string>>;
  setSetupMapReviewed: React.Dispatch<React.SetStateAction<boolean>>;
  setSetupMapSize: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>;
  setupMapRequest: import("../../shared/types").SetupMapRequest;
  updateSetupMapRequest: (value: import("../../shared/types").SetupMapRequest) => void;
}) {
  const {
    screen,
    setSetupMapBusy,
    setSetupMapGeneratedKey,
    setSetupMapImage,
    setSetupMapImageSource,
    setSetupMapProblem,
    setSetupMapReviewed,
    setSetupMapSize,
    setupMapRequest,
    updateSetupMapRequest,
  } = ports;
  useEffect(() => {
    if (screen !== "setup" || setupMapRequest?.phase !== "waiting") return;
    const pending = setupMapRequest;
    let cancelled = false;
    let timer: number | undefined;
    const poll = async () => {
      try {
        const receipt = await requestSetupMapReceipt(`/setup/town-map/generation/${encodeURIComponent(pending.id)}`);
        if (cancelled) return;
        if (receipt.status === "running") {
          timer = window.setTimeout(() => void poll(), 2000);
          return;
        }
        if (receipt.status !== "complete" || !receipt.result) {
          setSetupMapProblem(
            receipt.error || "The map request stopped without an image. Generate again only when you choose.",
          );
          updateSetupMapRequest(null);
          setSetupMapBusy(false);
          return;
        }
        const generated = receipt.result;
        const measured = await measureImage(generated.image);
        if (cancelled) return;
        if (measured.width !== generated.width || measured.height !== generated.height)
          throw new Error("The generated map's reported dimensions do not match the image.");
        setSetupMapImage(generated.image);
        setSetupMapImageSource("generate");
        setSetupMapGeneratedKey(receipt.sourceKey);
        setSetupMapSize(measured);
        setSetupMapReviewed(false);
        setSetupMapProblem("");
        updateSetupMapRequest(null);
        setSetupMapBusy(false);
      } catch (cause) {
        if (cancelled) return;
        setSetupMapProblem(
          `${messageFrom(cause, "Map status could not be retrieved.")} Check map status to retrieve this attempt without generating again.`,
        );
        updateSetupMapRequest({ ...pending, phase: "paused" });
        setSetupMapBusy(false);
      }
    };
    void poll();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [screen, setupMapRequest, updateSetupMapRequest]);
}

export function useFoundingSetupBlocker(ports: {
  catalog: import("../../shared/types").CatalogEntry[];
  personaDraft: string;
  setupFoundingDetails: string;
  setupFoundingVillagerIds: string[];
  setupHomeCount: number;
  setupMapBusy: boolean;
  setupMapGeneratedKey: string;
  setupMapGenerationKey: string;
  setupMapReviewed: boolean;
  setupMapSource: import("../../shared/types").SetupMapSource;
  setupMapSrc: string;
  setupName: string;
  setupPlayerRole: import("./villages-player-role").PlayerRole;
  setupSetting: string;
  setupVenues: import("../../shared/types").VillageVenue[];
  setupWorldFacts: string[];
  snapshot: import("../../shared/types").VillageSnapshot;
}) {
  const {
    catalog,
    personaDraft,
    setupFoundingDetails,
    setupFoundingVillagerIds,
    setupHomeCount,
    setupMapBusy,
    setupMapGeneratedKey,
    setupMapGenerationKey,
    setupMapReviewed,
    setupMapSource,
    setupMapSrc,
    setupName,
    setupPlayerRole,
    setupSetting,
    setupVenues,
    setupWorldFacts,
    snapshot,
  } = ports;
  return useCallback((): string => {
    if (setupName.trim().length === 0) return "Give the village a name.";
    if (personaDraft.trim().length === 0) return "Choose the Persona who lives in this village.";
    if (!snapshot?.isFounded && !setupFoundingDetails.trim())
      return "Describe what brings you and the others together here.";
    if (!snapshot?.isFounded && playerRoleProblem(setupPlayerRole)) return playerRoleProblem(setupPlayerRole);
    const presentFacts = setupWorldFacts.map((line) => line.trim()).filter(Boolean);
    if (snapshot?.isFounded && (presentFacts.length > 4 || presentFacts.some((line) => line.length > 160)))
      return "Use at most four current world facts of 160 characters each.";
    if (setupSetting.trim().length === 0) return "Describe what the village is like.";
    if (setupMapSource !== "none" && setupMapBusy) return "Wait for the requested artwork, or select Simple map.";
    if (setupMapSource !== "none" && !setupMapSrc) return "Generate or upload the chosen map, or select Simple map.";
    if (setupMapSource === "generate" && setupMapGeneratedKey !== setupMapGenerationKey)
      return "Review the saved map against your changed inputs on Place.";
    if (
      !snapshot?.isFounded &&
      setupVenues.some((venue) => venue.presentation.x === null || venue.presentation.y === null)
    )
      return "Place every starting Venue photograph.";
    if (setupMapSource !== "none" && !setupMapReviewed) return "Check all Venue photographs against the map on Spaces.";

    const residences = setupVenues.filter((venue) => venue.classes?.includes("residence"));
    const villagerHomes = residences.filter((venue) => !venue.occupancy.playerHome);
    if (villagerHomes.length < SETUP_MIN_VILLAGER_COUNT || villagerHomes.length > SETUP_MAX_VILLAGER_COUNT) {
      return "Place one to three homes for initial villagers.";
    }
    if (!residences.some((venue) => venue.occupancy.playerHome)) return "One Residence has to be yours.";
    if (
      setupVenues.some(
        (venue) =>
          !venue.name.trim() ||
          !venue.form?.trim() ||
          !venue.description.trim() ||
          (!snapshot?.isFounded && venue.layoutVersion === 1 && !venue.layout) ||
          foundingZoneProblem(venue),
      )
    )
      return "Complete each Venue's physical form, Entrance appearance and Zone name, use and appearance on Spaces.";
    const occupants = villagerHomes
      .map((home) => home.occupancy.residentCharacterId)
      .filter((id): id is string => id !== null);
    if (occupants.length !== villagerHomes.length) return "Choose who lives in each villager home.";
    if (new Set(occupants).size !== occupants.length) return "A villager can only live in one house.";
    if (
      !snapshot?.isFounded &&
      (occupants.length !== setupHomeCount || occupants.some((id) => !setupFoundingVillagerIds.includes(id)))
    )
      return "Assign every villager chosen on People to one Residence.";
    if (
      setupVenues.some((venue) =>
        venue.privateSpaces?.some(
          (room) =>
            !room.access &&
            (!room.name?.trim() ||
              !room.purpose?.trim() ||
              (!["residence", "workplace"].includes(room.venueClass) && !room.controllerIds?.length)),
        ),
      )
    )
      return "Give each Private Space a name, purpose, and controller on Spaces.";
    if (!snapshot?.isFounded && setupFoundingVillagerIds.some((id) => !catalog?.some((entry) => entry.id === id)))
      return "A chosen villager is no longer in your character cards. Choose another villager on People.";
    if (setupVenues.filter((venue) => venue.category === "public-center").length !== 1)
      return "Place one Gathering Place.";
    return "";
  }, [
    setupMapBusy,
    setupMapReviewed,
    setupMapGeneratedKey,
    setupMapGenerationKey,
    setupHomeCount,
    setupFoundingVillagerIds,
    catalog,
    setupVenues,
    personaDraft,
    setupMapSource,
    setupMapSrc,
    setupName,
    setupFoundingDetails,
    setupPlayerRole,
    snapshot?.isFounded,
    setupWorldFacts,
    setupSetting,
  ]);
}

export function useFoundingPreparationPolling(ports: {
  screen: "home" | "menu" | "setup" | "resume" | "preparing" | "venue" | "room" | "person";
  setPreparationProblem: React.Dispatch<React.SetStateAction<string>>;
  setScreen: React.Dispatch<
    React.SetStateAction<"home" | "menu" | "setup" | "resume" | "preparing" | "venue" | "room" | "person">
  >;
  setSnapshot: React.Dispatch<React.SetStateAction<import("../../shared/types").VillageSnapshot>>;
}) {
  const { screen, setPreparationProblem, setScreen, setSnapshot } = ports;
  useEffect(() => {
    if (screen !== "preparing") return;
    let cancelled = false;
    const poll = async () => {
      try {
        const next = await request<VillageSnapshot>("/setup/preparation");
        if (cancelled) return;
        setSnapshot(next);
        setPreparationProblem("");
        if (!next.foundingPreparation || next.foundingPreparation.status === "ready") setScreen("home");
      } catch (cause) {
        if (!cancelled) setPreparationProblem(messageFrom(cause, "Preparation status could not be read."));
      }
    };
    void poll();
    const timer = window.setInterval(() => void poll(), 2500);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [screen]);
}
