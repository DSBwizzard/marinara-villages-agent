import { createVillagesClientId } from "../../shared/request-id.js";
import {
  MAP_UPLOAD_FALLBACK,
  townMapFileSizeMessage,
  townMapImageProblem,
  townMapUploadError,
} from "../../../shared/helpers/town-map-upload.js";
import type { PlayerBackground } from "../../../shared/contracts/player-background.js";
import type { SetupMapRequest, VillageSnapshot, VillageVenue } from "../../../shared/contracts/village.js";
import type { ResidentAdmission } from "../../../shared/helpers/resident-admission.js";
import { messageFrom, request } from "../../shared/api.js";
import { API_PATH, ELEMENT_TAG } from "../../shared/constants.js";
import { measureImage, readFileAsDataUrl } from "../../shared/presentation.js";
import type { SetupMapSource, SetupVenueDraft } from "../../shared/types.js";
import { defaultView } from "../exploration/MapStage.js";
import { removeDeviceDraft } from "../../shared/device-drafts.js";
import { venueHasCommon } from "./villages-founding-editor";
import { emptyFoundingWorkspace } from "./villages-founding-workspace-state";
import type { FoundingIssue, FoundingWorkspaceState } from "./villages-founding-workspace-state.js";
import { type SetStateAction, useCallback } from "react";

export function useUpdateSetupMapRequest(ports: {
  setSetupMapRequest: React.Dispatch<SetStateAction<SetupMapRequest>>;
  setupMapRequestRef: React.RefObject<SetupMapRequest>;
}) {
  const { setSetupMapRequest, setupMapRequestRef } = ports;
  return useCallback(
    (value: SetupMapRequest | null) => {
      setupMapRequestRef.current = value;
      setSetupMapRequest(value);
    },
    [setSetupMapRequest, setupMapRequestRef],
  );
}

export function usePickSetupTownMap(ports: {
  setSetupMapBusy: React.Dispatch<SetStateAction<boolean>>;
  setSetupMapImage: React.Dispatch<SetStateAction<string>>;
  setSetupMapImageSource: React.Dispatch<SetStateAction<"generate" | "upload">>;
  setSetupMapProblem: React.Dispatch<SetStateAction<string>>;
  setSetupMapReviewed: React.Dispatch<SetStateAction<boolean>>;
  setSetupMapSize: React.Dispatch<SetStateAction<{ width: number; height: number }>>;
  setSetupMapSource: React.Dispatch<SetStateAction<SetupMapSource>>;
  snapshot: VillageSnapshot;
  updateSetupMapRequest: (value: SetupMapRequest | null) => void;
}) {
  const {
    setSetupMapBusy,
    setSetupMapImage,
    setSetupMapImageSource,
    setSetupMapProblem,
    setSetupMapReviewed,
    setSetupMapSize,
    setSetupMapSource,
    snapshot,
    updateSetupMapRequest,
  } = ports;
  return useCallback(
    async (file: File | undefined) => {
      if (!file || !snapshot) return;
      setSetupMapProblem("");
      const bytesThatFit = Math.floor(((snapshot.settings.townMapImageMaxLength - 64) * 3) / 4);
      if (file.size > bytesThatFit) {
        setSetupMapProblem(townMapFileSizeMessage(file.size, bytesThatFit));
        return;
      }
      setSetupMapBusy(true);
      try {
        const image = await readFileAsDataUrl(file);
        const size = await measureImage(image);
        const problem = townMapImageProblem(size);
        if (problem) throw new Error(problem);
        setSetupMapImage(image);
        setSetupMapImageSource("upload");
        setSetupMapSize(size);
        setSetupMapSource("upload");
        setSetupMapReviewed(false);
        updateSetupMapRequest(null);
      } catch (cause) {
        setSetupMapProblem(townMapUploadError(messageFrom(cause, MAP_UPLOAD_FALLBACK)));
      } finally {
        setSetupMapBusy(false);
      }
    },
    [
      setSetupMapBusy,
      setSetupMapImage,
      setSetupMapImageSource,
      setSetupMapProblem,
      setSetupMapReviewed,
      setSetupMapSize,
      setSetupMapSource,
      snapshot,
      updateSetupMapRequest,
    ],
  );
}

export function usePlaceSetupPin(ports: {
  movingSetupVenueId: string;
  setMovingSetupVenueId: React.Dispatch<SetStateAction<string>>;
  setSetupMapReviewed: React.Dispatch<SetStateAction<boolean>>;
  setSetupPlacementError: React.Dispatch<SetStateAction<string>>;
  setSetupVenues: React.Dispatch<SetStateAction<VillageVenue[]>>;
  setSetupWorkspace: React.Dispatch<SetStateAction<FoundingWorkspaceState>>;
  setupEditorOpen: boolean;
  setupMapBusy: boolean;
  setupVenuesRef: React.RefObject<VillageVenue[]>;
  setupWorkspace: FoundingWorkspaceState;
}) {
  const {
    movingSetupVenueId,
    setMovingSetupVenueId,
    setSetupMapReviewed,
    setSetupPlacementError,
    setSetupVenues,
    setSetupWorkspace,
    setupEditorOpen,
    setupMapBusy,
    setupVenuesRef,
    setupWorkspace,
  } = ports;
  return useCallback(
    (
      x: number,
      y: number,
      pictureSize?: { width: number; height: number; photoWidth: number; photoHeight: number },
      draggedVenueId?: string,
    ) => {
      const rows = setupVenuesRef.current;
      const target = draggedVenueId
        ? rows.find((row) => row.id === draggedVenueId)
        : rows.find((row) => row.id === movingSetupVenueId);
      if (!target || setupEditorOpen || (setupWorkspace.paused && !movingSetupVenueId && !draggedVenueId)) return;
      if (setupMapBusy) {
        setSetupPlacementError("Wait for the selected map before moving Venues.");
        return;
      }
      if (![x, y].every((value) => Number.isFinite(value) && value >= 0 && value <= 1)) {
        setSetupPlacementError("Place the Venue inside the map.");
        return;
      }
      const next = rows.map((row) =>
        row.id === target.id ? { ...row, presentation: { ...row.presentation, x, y } } : row,
      );
      setSetupVenues(next);
      setSetupWorkspace((state) => ({ ...state, paused: true }));
      setMovingSetupVenueId(null);
      setSetupPlacementError("");
      setSetupMapReviewed(false);
    },
    [
      setupVenuesRef,
      setupEditorOpen,
      setupWorkspace?.paused,
      movingSetupVenueId,
      setupMapBusy,
      setSetupVenues,
      setSetupWorkspace,
      setMovingSetupVenueId,
      setSetupPlacementError,
      setSetupMapReviewed,
    ],
  );
}

export function usePatchSetupVenue(ports: {
  setSetupAuthoredFields: React.Dispatch<SetStateAction<Record<string, string[]>>>;
  setSetupVenues: React.Dispatch<SetStateAction<VillageVenue[]>>;
}) {
  const { setSetupAuthoredFields, setSetupVenues } = ports;
  return useCallback(
    (id: string, next: (venue: SetupVenueDraft) => SetupVenueDraft) => {
      setSetupVenues((rows) =>
        rows.map((row) => {
          if (row.id !== id) return row;
          const changed = next(row);
          const fields = ["name", "venueType", "form", "description"] as const;
          const edited = fields.filter((field) => row[field] !== changed[field]);
          if (edited.length)
            setSetupAuthoredFields((current) => ({
              ...current,
              [id]: [...new Set([...(current[id] ?? []), ...edited])],
            }));
          return changed;
        }),
      );
    },
    [setSetupAuthoredFields, setSetupVenues],
  );
}

export function useOpenSetup(ports: {
  loadCatalog: (signal?: AbortSignal) => Promise<void>;
  loadLorebooks: (signal?: AbortSignal) => Promise<void>;
  loadPersonas: (signal?: AbortSignal) => Promise<void>;
  setMovingSetupVenueId: React.Dispatch<SetStateAction<string>>;
  setPersonaDraft: React.Dispatch<SetStateAction<string>>;
  setPersonalizeHomes: React.Dispatch<SetStateAction<boolean>>;
  setPickerOpen: React.Dispatch<SetStateAction<boolean>>;
  setResetArmed: React.Dispatch<SetStateAction<boolean>>;
  setSceneryStyle: React.Dispatch<SetStateAction<string>>;
  setSceneryStyleProfileId: React.Dispatch<SetStateAction<string | null>>;
  setScreen: React.Dispatch<
    SetStateAction<"menu" | "venue" | "home" | "setup" | "resume" | "preparing" | "room" | "person">
  >;
  setSearch: React.Dispatch<SetStateAction<string>>;
  setSelectedSetupVenueId: React.Dispatch<SetStateAction<string>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setSetupEditorOpen: React.Dispatch<SetStateAction<boolean>>;
  setSetupFocusIssue: React.Dispatch<SetStateAction<FoundingIssue>>;

  setSetupFoundingVillagerIds: React.Dispatch<SetStateAction<string[]>>;

  setSetupLorebookDraft: React.Dispatch<SetStateAction<string[]>>;
  setSetupLoreTokenBudgetDraft: React.Dispatch<SetStateAction<number>>;
  setSetupMapBusy: React.Dispatch<SetStateAction<boolean>>;
  setSetupMapGeneratedKey: React.Dispatch<SetStateAction<string>>;
  setSetupMapImage: React.Dispatch<SetStateAction<string>>;
  setSetupMapImageSource: React.Dispatch<SetStateAction<"generate" | "upload">>;
  setSetupMapNegativePrompt: React.Dispatch<SetStateAction<string>>;
  setSetupMapProblem: React.Dispatch<SetStateAction<string>>;
  setSetupMapPrompt: React.Dispatch<SetStateAction<string>>;
  setSetupMapSize: React.Dispatch<SetStateAction<{ width: number; height: number }>>;
  setSetupMapSource: React.Dispatch<SetStateAction<SetupMapSource>>;
  setSetupName: React.Dispatch<SetStateAction<string>>;
  setSetupPlacementError: React.Dispatch<SetStateAction<string>>;
  setSetupPlayerBackground: React.Dispatch<SetStateAction<PlayerBackground>>;
  setSetupProblem: React.Dispatch<SetStateAction<string>>;
  setSetupResidentAdmissions: React.Dispatch<SetStateAction<Record<string, ResidentAdmission>>>;
  setSetupWorldName?: React.Dispatch<SetStateAction<string>>;
  setSetupSetting: React.Dispatch<SetStateAction<string>>;
  setSetupShowIssues: React.Dispatch<SetStateAction<boolean>>;
  setSetupStep: React.Dispatch<SetStateAction<number>>;
  setSetupVenues: React.Dispatch<SetStateAction<VillageVenue[]>>;
  setSetupWorkspace: React.Dispatch<SetStateAction<FoundingWorkspaceState>>;
  setSetupContext: React.Dispatch<SetStateAction<import("./draft-model.js").FoundingContext>>;
  updateSetupMapRequest: (value: SetupMapRequest | null) => void;
}) {
  const {
    loadCatalog,
    loadLorebooks,
    loadPersonas,
    setMovingSetupVenueId,
    setPersonaDraft,
    setPersonalizeHomes,
    setPickerOpen,
    setResetArmed,
    setSceneryStyle,
    setSceneryStyleProfileId,
    setScreen,
    setSearch,
    setSelectedSetupVenueId,
    setSettingsError,
    setSetupEditorOpen,
    setSetupFocusIssue,

    setSetupFoundingVillagerIds,

    setSetupLorebookDraft,
    setSetupLoreTokenBudgetDraft,
    setSetupMapBusy,
    setSetupMapGeneratedKey,
    setSetupMapImage,
    setSetupMapImageSource,
    setSetupMapNegativePrompt,
    setSetupMapProblem,
    setSetupMapPrompt,
    setSetupMapSize,
    setSetupMapSource,
    setSetupName,
    setSetupPlacementError,
    setSetupPlayerBackground,
    setSetupProblem,
    setSetupResidentAdmissions,
    setSetupWorldName,
    setSetupSetting,
    setSetupShowIssues,
    setSetupStep,
    setSetupVenues,
    setSetupWorkspace,
    setSetupContext,
    updateSetupMapRequest,
  } = ports;
  return useCallback(
    (fresh: boolean, village: VillageSnapshot | null) => {
      if (village?.isFounded) {
        setScreen("home");
        return;
      }
      setSettingsError("");
      setSetupProblem("");
      setResetArmed(false);
      setPickerOpen(false);
      setSearch("");
      setSetupStep(0);
      setSetupWorkspace(emptyFoundingWorkspace());
      setSetupShowIssues(false);
      setSetupFocusIssue(null);
      // Unfounded snapshots have a server fallback name; authored drafts restore their own name separately.
      setSetupName("");
      setSetupWorldName?.(fresh ? "" : (village?.settings.worldName ?? ""));
      setSetupSetting(fresh ? "" : (village?.village.setting ?? ""));
      setSetupPlayerBackground(fresh ? "" : (village?.settings.playerBackground ?? ""));
      if (fresh) setSetupResidentAdmissions({});
      setSetupContext({
        rules: "",
        circumstances: [],
        communityVenueId: "founding-community",
      });
      const foundingPlaces =
        fresh || !village
          ? []
          : village.settings.venues.filter(
              (venue) => venue.classes?.includes("residence") || venue.category === "public-center",
            );
      setSetupVenues(foundingPlaces);
      setSetupFoundingVillagerIds(foundingPlaces.flatMap((venue) => venue.residentIds ?? []));
      setSetupEditorOpen(false);
      setSceneryStyle("");
      setSceneryStyleProfileId("");
      setPersonalizeHomes(village?.settings.personalizeVenueImagesByDefault !== false);
      setSelectedSetupVenueId(foundingPlaces[0]?.id ?? null);
      setMovingSetupVenueId(null);
      setSetupPlacementError("");
      setSetupLorebookDraft(fresh ? [] : (village?.settings.selectedLorebookIds ?? []));
      setSetupLoreTokenBudgetDraft(fresh ? 1600 : (village?.settings.loreTokenBudget ?? 1600));
      setSetupMapSource("simple");
      setSetupMapImage("");
      setSetupMapImageSource(null);
      setSetupMapGeneratedKey("");
      setSetupMapSize(null);
      setSetupMapPrompt(fresh ? "" : (village?.settings.townMapLayoutPrompt ?? ""));
      setSetupMapNegativePrompt(village?.settings.townMapNegativePrompt ?? "");
      setSetupMapBusy(false);
      setSetupMapProblem("");
      updateSetupMapRequest(null);
      setPersonaDraft(fresh ? "" : (village?.settings.playerPersonaId ?? ""));
      // Load the Persona and lorebook choices as the wizard opens so their
      // respective steps are ready when the player reaches them.
      void loadPersonas();
      void loadLorebooks();
      void loadCatalog();
      setScreen("setup");
    },
    [
      loadCatalog,
      loadLorebooks,
      loadPersonas,
      setMovingSetupVenueId,
      setPersonaDraft,
      setPersonalizeHomes,
      setPickerOpen,
      setResetArmed,
      setSceneryStyle,
      setSceneryStyleProfileId,
      setScreen,
      setSearch,
      setSelectedSetupVenueId,
      setSettingsError,
      setSetupEditorOpen,
      setSetupFocusIssue,
      setSetupFoundingVillagerIds,
      setSetupLoreTokenBudgetDraft,
      setSetupLorebookDraft,
      setSetupMapBusy,
      setSetupMapGeneratedKey,
      setSetupMapImage,
      setSetupMapImageSource,
      setSetupMapNegativePrompt,
      setSetupMapProblem,
      setSetupMapPrompt,
      setSetupMapSize,
      setSetupMapSource,
      setSetupName,
      setSetupPlacementError,
      setSetupPlayerBackground,
      setSetupProblem,
      setSetupResidentAdmissions,
      setSetupSetting,
      setSetupShowIssues,
      setSetupStep,
      setSetupVenues,
      setSetupWorkspace,
      setSetupContext,
      setSetupWorldName,
      updateSetupMapRequest,
    ],
  );
}

export function useFoundVillage(ports: {
  setupContext: import("./draft-model.js").FoundingContext;
  draftSaveQueue: React.RefObject<Promise<void>>;
  element: HTMLElement;
  flushSetupDraft: () => Promise<void>;
  personaDraft: string;
  personalizeHomes: boolean;
  residentContextProblem: "" | "Check starting notes in People.";
  sceneryStyle: string;
  sceneryStyleProfileId: string | null;
  selectedResidentAdmissions: { [k: string]: ResidentAdmission };
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setDraftReady: React.Dispatch<SetStateAction<boolean>>;
  setScreen: React.Dispatch<
    SetStateAction<"menu" | "venue" | "home" | "setup" | "resume" | "preparing" | "room" | "person">
  >;
  setSelectedSetupVenueId: React.Dispatch<SetStateAction<string>>;
  setSetupProblem: React.Dispatch<SetStateAction<string>>;
  setSetupStep: React.Dispatch<SetStateAction<number>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
  setupBlocker: () => string;

  setupSpriteRevisions?: Record<string, number>;
  setupFoundingVillagerIds: string[];
  setupLorebookDraft: string[];
  setupLoreTokenBudgetDraft: number;
  setupMapSrc: string;
  setupName: string;
  setupTimeZone?: string;
  setupPlayerBackground: PlayerBackground;
  setupWorldName?: string;
  setupSetting: string;
  setupVenues: VillageVenue[];
  snapshot: VillageSnapshot;
}) {
  const {
    draftSaveQueue,
    element,
    flushSetupDraft,
    personaDraft,
    personalizeHomes,
    residentContextProblem,
    sceneryStyle,
    sceneryStyleProfileId,
    selectedResidentAdmissions,
    setBusy,
    setDraftReady,
    setScreen,
    setSelectedSetupVenueId,
    setSetupProblem,
    setSetupStep,
    setSnapshot,
    setupBlocker,

    setupSpriteRevisions,
    setupFoundingVillagerIds,
    setupLorebookDraft,
    setupLoreTokenBudgetDraft,
    setupMapSrc,
    setupName,
    setupPlayerBackground,
    setupWorldName,
    setupSetting,
    setupVenues,
    snapshot,
  } = ports;
  return useCallback(async () => {
    if (snapshot?.isFounded) {
      setSetupProblem("This Village is already founded. Use World Configuration.");
      return;
    }
    if (residentContextProblem) {
      setSetupProblem(residentContextProblem);
      return;
    }
    const blocker = setupBlocker();
    if (blocker) {
      const incomplete = setupVenues.find(
        (venue) =>
          !venue.name.trim() ||
          !venue.form?.trim() ||
          !venue.description.trim() ||
          (venue.layoutVersion === 1 && !venue.layout) ||
          (venueHasCommon(venue) && !venue.spaces?.[0]?.description.trim()),
      );
      if (incomplete) {
        const field = !incomplete.name.trim()
          ? "venue-name"
          : !incomplete.form?.trim()
            ? "form"
            : !incomplete.description.trim()
              ? "exterior-description"
              : "interior-description";
        setSelectedSetupVenueId(incomplete.id);
        setSetupStep(2);
        window.setTimeout(() => element.querySelector<HTMLElement>(`#${ELEMENT_TAG}-setup-${field}`)?.focus(), 0);
      }
      setSetupProblem(blocker);
      return;
    }
    setBusy(true);
    setSetupProblem("");
    try {
      await flushSetupDraft();
      const founded = await request<VillageSnapshot>("/setup", {
        method: "POST",
        body: JSON.stringify({
          name: setupName.trim(),
          timeZone: snapshot.clock?.timeZone || snapshot.village.timeZone,
          worldName: setupWorldName,
          setting: setupSetting.trim(),
          worldRules: ports.setupContext.rules,
          communityVenueId: ports.setupContext.communityVenueId,
          playerBackground: setupPlayerBackground,
          circumstances: ports.setupContext.circumstances.filter((row) => row.summary.trim()),
          selectedLorebookIds: setupLorebookDraft,
          personalizeVenueImagesByDefault: personalizeHomes,
          sceneryArtStyle: sceneryStyle,
          sceneryStyleProfileId,
          loreTokenBudget: setupLoreTokenBudgetDraft,
          playerPersonaId: personaDraft,
          townMapImage: setupMapSrc ?? "",
          townMapView: defaultView("cover"),
          // Founding is authoritative: submit the complete graph, including
          // the named public center, rather than relying on stored destinations.
          venues: setupVenues,
          foundingSpriteRevisions: setupSpriteRevisions,
          foundingCharacterIds: setupFoundingVillagerIds,
          foundingResidentAdmissions: selectedResidentAdmissions,
        }),
      });
      setSnapshot(founded);
      setDraftReady(false);
      await draftSaveQueue.current;
      await removeDeviceDraft(API_PATH).catch(() => undefined);
      setScreen(founded.foundingPreparation?.canPlay ? "home" : "preparing");
    } catch (cause) {
      setSetupProblem(messageFrom(cause, "The village could not be founded."));
    } finally {
      setBusy(false);
    }
  }, [
    snapshot?.isFounded,
    snapshot?.clock?.timeZone,
    snapshot?.village?.timeZone,
    residentContextProblem,
    setupBlocker,
    setBusy,
    setSetupProblem,
    setupVenues,
    setSelectedSetupVenueId,
    setSetupStep,
    element,
    flushSetupDraft,
    setupName,
    setupWorldName,
    setupSetting,
    ports.setupContext,
    setupPlayerBackground,
    setupLorebookDraft,
    personalizeHomes,
    sceneryStyle,
    sceneryStyleProfileId,
    setupLoreTokenBudgetDraft,
    personaDraft,
    setupMapSrc,
    setupSpriteRevisions,
    setupFoundingVillagerIds,
    selectedResidentAdmissions,
    setSnapshot,
    setDraftReady,
    draftSaveQueue,
    setScreen,
  ]);
}

export function useRetryPreparation(ports: {
  setPreparationProblem: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
}) {
  const { setPreparationProblem, setSnapshot } = ports;
  return useCallback(
    async (target?: { characterId: string; task: "routine" | "wish"; expectedAttempt: number }) => {
      setPreparationProblem("");
      try {
        setSnapshot(
          await request<VillageSnapshot>("/setup/preparation/retry", {
            method: "POST",
            body: JSON.stringify({ ...target, actionId: createVillagesClientId() }),
          }),
        );
      } catch (cause) {
        setPreparationProblem(messageFrom(cause, "Preparation could not be retried."));
      }
    },
    [setPreparationProblem, setSnapshot],
  );
}
