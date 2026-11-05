import { foundingVenueShapeProblem } from "../../../shared/helpers/founding-venues.js";
import { FOUNDING_CIRCUMSTANCE_MAX_LENGTH } from "../../../shared/helpers/founding-circumstance.js";
import type { AreaDraftCache } from "./villages-founding-editor.js";
import { SETUP_STEPS } from "./founding-steps.js";
import type { VillageSnapshot } from "../../../shared/contracts/village.js";
import { EMPTY_RESIDENT_ADMISSION } from "../../../shared/helpers/resident-admission.js";
import { messageFrom, request } from "../../shared/api.js";
import { measureImage } from "../../shared/presentation.js";
import type { SetupVenueDraft } from "../../shared/types.js";
import { requestSetupMapReceipt, SETUP_MAX_VILLAGER_COUNT, SETUP_MIN_VILLAGER_COUNT } from "./FoundingPanels.js";
import { foundingZoneProblem } from "./villages-founding-zones";
import { playerBackgroundProblem } from "./villages-player-background.js";
import { useCallback, useEffect, useMemo, useRef } from "react";

/** Initial values belong to this mounted founding workspace; effects update the same refs. */
export function useFoundingDraftReferences(ports: {
  setupBeginningSourceKey: string;
  setupImageContextKey: string;
  setupVenues: SetupVenueDraft[];
  setupAuthoredFields: Record<string, string[]>;
}) {
  const setupBeginningSourceKeyRef = useRef(ports.setupBeginningSourceKey);
  const setupImageContextKeyRef = useRef(ports.setupImageContextKey);
  const setupVenuesRef = useRef(ports.setupVenues);
  const setupAuthoredFieldsRef = useRef(ports.setupAuthoredFields);
  return { setupBeginningSourceKeyRef, setupImageContextKeyRef, setupVenuesRef, setupAuthoredFieldsRef };
}

export function useFoundingSelectedResidentContexts(ports: {
  setupFoundingVillagerIds: string[];
  setupResidentAdmissions: Record<string, import("../../../shared/helpers/resident-admission.js").ResidentAdmission>;
}) {
  const { setupFoundingVillagerIds, setupResidentAdmissions } = ports;
  return useMemo(
    () =>
      Object.fromEntries(
        setupFoundingVillagerIds.map((id) => [id, setupResidentAdmissions[id] ?? { ...EMPTY_RESIDENT_ADMISSION }]),
      ),
    [setupFoundingVillagerIds, setupResidentAdmissions],
  );
}

export function useFoundingImageContext(ports: {
  setupImageContextKey: string;
  setupImageContextKeyRef: React.RefObject<string>;
}) {
  const { setupImageContextKey, setupImageContextKeyRef } = ports;
  useEffect(() => {
    setupImageContextKeyRef.current = setupImageContextKey;
  }, [setupImageContextKey, setupImageContextKeyRef]);
}

export function useFoundingVenueReference(ports: {
  setupVenues: import("../../../shared/contracts/village.js").VillageVenue[];
  setupVenuesRef: React.RefObject<import("../../../shared/contracts/village.js").VillageVenue[]>;
}) {
  const { setupVenues, setupVenuesRef } = ports;
  useEffect(() => {
    setupVenuesRef.current = setupVenues;
  }, [setupVenues, setupVenuesRef]);
}

export function useFoundingBeginningReference(ports: {
  setupBeginningSourceKey: string;
  setupBeginningSourceKeyRef: React.RefObject<string>;
  snapshot: import("../../../shared/contracts/village.js").VillageSnapshot;
}) {
  const { setupBeginningSourceKey, setupBeginningSourceKeyRef, snapshot } = ports;
  useEffect(() => {
    if (setupBeginningSourceKeyRef.current !== setupBeginningSourceKey && !snapshot?.isFounded) {
    }
    setupBeginningSourceKeyRef.current = setupBeginningSourceKey;
  }, [setupBeginningSourceKey, setupBeginningSourceKeyRef, snapshot?.isFounded]);
}

export function useFoundingAuthoredReference(ports: {
  setupAuthoredFields: Record<string, string[]>;
  setupAuthoredFieldsRef: React.RefObject<Record<string, string[]>>;
}) {
  const { setupAuthoredFields, setupAuthoredFieldsRef } = ports;
  useEffect(() => {
    setupAuthoredFieldsRef.current = setupAuthoredFields;
  }, [setupAuthoredFields, setupAuthoredFieldsRef]);
}

export function useFoundingSetupDraftData(ports: {
  movingSetupVenueId: string;
  personaDraft: string;
  personalizeHomes: boolean;
  sceneryStyle: string;
  sceneryStyleProfileId: string | null;
  selectedSetupVenueId: string;
  setupAuthoredFields: Record<string, string[]>;
  setupEditorAuthoredOriginal: React.RefObject<string[]>;
  setupEditorOpen: boolean;
  setupEditorOriginal: React.RefObject<import("../../../shared/contracts/village.js").VillageVenue>;
  setupEditorZoneOriginal: React.RefObject<AreaDraftCache["current"] | undefined>;

  setupSpriteRevisions?: Record<string, number>;
  setupFoundingVillagerIds: string[];

  setupKeyboardSpot: { x: number; y: number };
  setupLorebookDraft: string[];
  setupLoreTokenBudgetDraft: number;
  setupMapBusy: boolean;
  setupMapGeneratedKey: string;
  setupMapImage: string;
  setupMapImageSource: "generate" | "upload";
  setupMapNegativePrompt: string;
  setupMapProblem: string;
  setupMapPrompt: string;
  setupMapRequest: import("../../../shared/contracts/village.js").SetupMapRequest;
  setupMapReviewed: boolean;
  setupMapSize: { width: number; height: number };
  setupMapSource: import("../../shared/types.js").SetupMapSource;
  setupName: string;
  setupTimeZone?: string;
  setupPlayerBackground: import("../../../shared/contracts/player-background.js").PlayerBackground;
  setupResidentAdmissions: Record<string, import("../../../shared/helpers/resident-admission.js").ResidentAdmission>;
  setupWorldName?: string;
  setupSetting: string;
  setupStep: number;
  setupSuggestionsBusy: boolean;
  setupSuggestionsKey: string;
  setupVenueBusy: boolean;
  setupVenues: import("../../../shared/contracts/village.js").VillageVenue[];
  setupWorkspace: import("./villages-founding-workspace-state.js").FoundingWorkspaceState;
  setupContext: import("./draft-model.js").FoundingContext;
  setupZoneDrafts: React.RefObject<Record<string, AreaDraftCache["current"]>>;
}) {
  const {
    movingSetupVenueId,
    personaDraft,
    personalizeHomes,
    sceneryStyle,
    sceneryStyleProfileId,
    selectedSetupVenueId,
    setupAuthoredFields,
    setupEditorAuthoredOriginal,
    setupEditorOpen,
    setupEditorOriginal,
    setupEditorZoneOriginal,

    setupSpriteRevisions,
    setupFoundingVillagerIds,

    setupKeyboardSpot,
    setupLorebookDraft,
    setupLoreTokenBudgetDraft,
    setupMapBusy,
    setupMapGeneratedKey,
    setupMapImage,
    setupMapImageSource,
    setupMapNegativePrompt,
    setupMapProblem,
    setupMapPrompt,
    setupMapRequest,
    setupMapReviewed,
    setupMapSize,
    setupMapSource,
    setupName,
    setupTimeZone,
    setupPlayerBackground,
    setupResidentAdmissions,
    setupWorldName,
    setupSetting,
    setupStep,
    setupSuggestionsBusy,
    setupSuggestionsKey,
    setupVenueBusy,
    setupVenues,
    setupWorkspace,
    setupContext,
    setupZoneDrafts,
  } = ports;
  return useMemo(
    () => ({
      step: setupStep,
      phase: SETUP_STEPS[setupStep],
      name: setupName,
      timeZone: setupTimeZone,
      worldName: setupWorldName,
      setting: setupSetting,
      version: 2 as const,
      playerBackground: setupPlayerBackground,
      context: setupContext,
      venues: setupVenues,
      zoneDrafts: structuredClone(setupZoneDrafts.current),
      spriteRevisions: setupSpriteRevisions ?? {},
      roster: setupFoundingVillagerIds,
      residentAdmissions: setupResidentAdmissions,
      persona: personaDraft,
      lorebooks: setupLorebookDraft,
      loreBudget: setupLoreTokenBudgetDraft,
      artStyle: sceneryStyle,
      styleProfileId: sceneryStyleProfileId,
      personalizeHomes,
      mapSource: setupMapSource,
      mapImage: setupMapImage,
      mapImageSource: setupMapImageSource,
      mapGeneratedKey: setupMapGeneratedKey,
      mapSize: setupMapSize,
      mapPrompt: setupMapPrompt,
      mapNegative: setupMapNegativePrompt,
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
      setupName,
      setupTimeZone,
      setupWorldName,
      setupSetting,
      setupPlayerBackground,
      setupContext,
      setupVenues,
      setupZoneDrafts,
      setupSpriteRevisions,
      setupFoundingVillagerIds,
      setupResidentAdmissions,
      personaDraft,
      setupLorebookDraft,
      setupLoreTokenBudgetDraft,
      sceneryStyle,
      sceneryStyleProfileId,
      personalizeHomes,
      setupMapSource,
      setupMapImage,
      setupMapImageSource,
      setupMapGeneratedKey,
      setupMapSize,
      setupMapPrompt,
      setupMapNegativePrompt,
      setupMapReviewed,
      setupMapProblem,
      setupMapRequest,
      setupAuthoredFields,
      setupSuggestionsKey,
      selectedSetupVenueId,
      setupWorkspace,
      movingSetupVenueId,
      setupEditorOpen,
      setupEditorOriginal,
      setupEditorAuthoredOriginal,
      setupEditorZoneOriginal,
      setupKeyboardSpot,
      setupMapBusy,
      setupVenueBusy,
      setupSuggestionsBusy,
    ],
  );
}

export function useFoundingMapReceipt(ports: {
  setSetupWorkspace?: React.Dispatch<
    React.SetStateAction<import("./villages-founding-workspace-state.js").FoundingWorkspaceState>
  >;
  visible: boolean;
  screen: "home" | "menu" | "setup" | "resume" | "preparing" | "venue" | "room" | "person";
  setSetupMapBusy: React.Dispatch<React.SetStateAction<boolean>>;
  setSetupMapGeneratedKey: React.Dispatch<React.SetStateAction<string>>;
  setSetupMapImage: React.Dispatch<React.SetStateAction<string>>;
  setSetupMapSource: React.Dispatch<React.SetStateAction<import("../../shared/types.js").SetupMapSource>>;
  setSetupMapImageSource: React.Dispatch<React.SetStateAction<"generate" | "upload">>;
  setSetupMapProblem: React.Dispatch<React.SetStateAction<string>>;
  setSetupMapReviewed: React.Dispatch<React.SetStateAction<boolean>>;
  setSetupMapSize: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>;
  setupMapRequest: import("../../../shared/contracts/village.js").SetupMapRequest;
  updateSetupMapRequest: (value: import("../../../shared/contracts/village.js").SetupMapRequest) => void;
}) {
  const {
    screen,
    setSetupMapBusy,
    setSetupMapGeneratedKey,
    setSetupMapImage,
    setSetupMapImageSource,
    setSetupMapSource,
    setSetupMapProblem,
    setSetupMapReviewed,
    setSetupMapSize,
    setSetupWorkspace,
    setupMapRequest,
    updateSetupMapRequest,
  } = ports;
  useEffect(() => {
    if (!ports.visible || screen !== "setup" || setupMapRequest?.phase !== "waiting") return;
    const pending = setupMapRequest;
    const controller = new AbortController();
    let cancelled = false;
    let timer: number | undefined;
    const poll = async () => {
      try {
        const receipt = await requestSetupMapReceipt(
          `/maps/generation/founding-map/${encodeURIComponent(pending.id)}`,
          {
            signal: controller.signal,
          },
        );
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
        setSetupWorkspace?.((state) => ({ ...state, mapLore: generated.lore }));
        setSetupMapImageSource("generate");
        setSetupMapSource("generate");
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
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [
    screen,
    setSetupMapBusy,
    setSetupMapGeneratedKey,
    setSetupMapImage,
    setSetupMapImageSource,
    setSetupMapSource,
    setSetupMapProblem,
    setSetupMapReviewed,
    setSetupMapSize,
    setSetupWorkspace,
    setupMapRequest,
    updateSetupMapRequest,
    ports.visible,
  ]);
}

export function useFoundingSetupBlocker(ports: {
  catalog: import("../../../shared/contracts/village.js").CatalogEntry[];
  personaDraft: string;

  setupFoundingVillagerIds: string[];
  setupHomeCount: number;
  setupMapBusy: boolean;
  setupMapReviewed: boolean;
  setupMapSrc: string;
  setupName: string;
  setupPlayerBackground: import("../../../shared/contracts/player-background.js").PlayerBackground;
  setupSetting: string;
  setupVenues: import("../../../shared/contracts/village.js").VillageVenue[];
  setupContext: import("./draft-model.js").FoundingContext;
  snapshot: import("../../../shared/contracts/village.js").VillageSnapshot;
}) {
  const {
    catalog,
    personaDraft,

    setupFoundingVillagerIds,
    setupHomeCount,
    setupMapBusy,
    setupMapReviewed,
    setupMapSrc,
    setupName,
    setupPlayerBackground,
    setupSetting,
    setupVenues,
    setupContext,
    snapshot,
  } = ports;
  return useCallback(
    (reviewingMap = false): string => {
      if (setupName.trim().length === 0) return "Give the village a name.";
      if (personaDraft.trim().length === 0) return "Choose the Persona who lives in this village.";
      if (!snapshot?.isFounded && playerBackgroundProblem(setupPlayerBackground))
        return playerBackgroundProblem(setupPlayerBackground);
      const presentFacts = setupContext.circumstances.map((line) => line.summary.trim()).filter(Boolean);
      if (presentFacts.length > 4 || presentFacts.some((line) => line.length > FOUNDING_CIRCUMSTANCE_MAX_LENGTH))
        return "Use at most four starting circumstances of 4000 characters each.";
      if (setupSetting.trim().length === 0) return "Describe what the village is like.";
      if (!snapshot?.isFounded && setupMapBusy) return "Wait for the requested map artwork.";
      if (!snapshot?.isFounded && !setupMapSrc) return "Generate or upload map artwork on Map before founding.";
      if (
        !snapshot?.isFounded &&
        setupVenues.some((venue) => venue.presentation.x === null || venue.presentation.y === null)
      )
        return "Place every starting Venue.";
      if (!snapshot?.isFounded && !setupMapReviewed && !reviewingMap) return "Check the Venue positions on the map.";

      const shapeProblem = foundingVenueShapeProblem(setupVenues, setupContext.communityVenueId);
      if (!snapshot?.isFounded && shapeProblem) return shapeProblem;
      const residences = setupVenues.filter((venue) => venue.classes?.includes("residence"));
      const villagerHomes = residences;
      if (
        setupFoundingVillagerIds.length < SETUP_MIN_VILLAGER_COUNT ||
        setupFoundingVillagerIds.length > SETUP_MAX_VILLAGER_COUNT
      ) {
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
        return "Describe what each Venue looks like and complete each Zone's name, use and long-term details on Venues.";
      const occupants = villagerHomes.flatMap((home) => home.residentIds ?? []);
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
        return "Give each Private Space a name, purpose, and controller on Venues.";
      if (!snapshot?.isFounded && setupFoundingVillagerIds.some((id) => !catalog?.some((entry) => entry.id === id)))
        return "A chosen villager is no longer in your character cards. Choose another villager on People.";
      const community = setupVenues.find((venue) => venue.id === setupContext.communityVenueId);
      if (
        !community ||
        community.classes?.includes("residence") ||
        community.residentIds?.length ||
        community.occupancy.playerHome ||
        community.workerIds?.length
      )
        return "Choose a separate non-residential Community Venue.";
      if (
        !community.spaces?.some(
          (zone) =>
            zone.description.trim() &&
            (!zone.access ||
              (zone.access.mode === "public" &&
                !zone.access.accompanied &&
                !zone.access.managerIds?.length &&
                !Array.isArray(zone.access.visitorHours))),
        )
      )
        return "The Community Venue needs a usable public common Zone.";
      if (setupVenues.length > 16) return "A Village supports at most 16 Venues.";
      if (
        residences.some(
          (home) => (home.residentIds?.length ?? 0) + Number(home.occupancy.playerHome) > (home.residenceCapacity ?? 1),
        )
      )
        return "Household assignments exceed a Residence’s capacity.";
      return "";
    },
    [
      setupMapBusy,
      setupMapReviewed,
      setupHomeCount,
      setupFoundingVillagerIds,
      catalog,
      setupVenues,
      personaDraft,
      setupMapSrc,
      setupName,
      setupPlayerBackground,
      snapshot?.isFounded,
      setupContext,
      setupSetting,
    ],
  );
}

export function useFoundingPreparationPolling(ports: {
  visible: boolean;
  historyPending: boolean;
  canPlay: boolean | undefined;
  status: VillageSnapshot["foundingPreparation"]["status"] | undefined;
  screen: "home" | "menu" | "setup" | "resume" | "preparing" | "venue" | "room" | "person";
  setPreparationProblem: React.Dispatch<React.SetStateAction<string>>;
  setScreen: React.Dispatch<
    React.SetStateAction<"home" | "menu" | "setup" | "resume" | "preparing" | "venue" | "room" | "person">
  >;
  setSnapshot: React.Dispatch<React.SetStateAction<import("../../../shared/contracts/village.js").VillageSnapshot>>;
}) {
  const { screen, setPreparationProblem, setScreen, setSnapshot } = ports;
  const status = ports.status;
  useEffect(() => {
    if (screen !== "preparing" || !ports.visible) return;
    if (ports.canPlay) {
      setScreen("home");
      return;
    }
    if (status === "failed" && !ports.historyPending) return;
    let cancelled = false;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const next = await request<VillageSnapshot>("/setup/preparation", { signal: controller.signal });
        if (cancelled) return;
        setSnapshot(next);
        setPreparationProblem("");
        if (!next.foundingPreparation || next.foundingPreparation.canPlay) setScreen("home");
        else if (
          next.foundingPreparation.status === "pending" ||
          next.backgroundWork.some((row) => row.kind === "starting-ties" && ["queued", "running"].includes(row.status))
        )
          timer = setTimeout(() => void poll(), 2500);
      } catch (cause) {
        if (!cancelled) {
          setPreparationProblem(messageFrom(cause, "Preparation status could not be read."));
          timer = setTimeout(() => void poll(), 2500);
        }
      }
    };
    void poll();
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [
    screen,
    setPreparationProblem,
    setScreen,
    setSnapshot,
    ports.visible,
    ports.canPlay,
    ports.historyPending,
    status,
  ]);
}
