import type { PlayerRole } from "../../../shared/contracts/player-role.js";
import type {
  ScenarioImprint,
  SetupMapRequest,
  TownMapView,
  VillageSnapshot,
  VillageVenue,
} from "../../../shared/contracts/village.js";
import type { ResidentFoundingContext } from "../../../shared/helpers/resident-founding-context.js";
import { messageFrom, request } from "../../shared/api.js";
import { API_PATH, ELEMENT_TAG } from "../../shared/constants.js";
import { destinationPlaces, freshRowKey, measureImage, readFileAsDataUrl } from "../../shared/presentation.js";
import type { SetupMapSource, SetupVenueDraft, TownMapOptions } from "../../shared/types.js";
import { defaultView } from "../exploration/MapStage.js";
import {
  DEFAULT_TOWN_MAP_OPTIONS,
  emptyScenarioImprint,
  foundingScenario,
  LEGACY_FOUNDING_REASONS,
} from "./FoundingPanels.js";
import { FOUNDING_SCENARIOS, type FoundingScenarioId } from "./scenarios.js";
import { removeFoundingDraft } from "./villages-founding-draft.js";
import { SCENERY_STYLES, venueHasCommon } from "./villages-founding-editor";
import { foundingPhotoOverlaps } from "./villages-founding-placement";
import { emptyFoundingWorkspace } from "./villages-founding-workspace-state";
import type { FoundingIssue, FoundingWorkspaceState } from "./villages-founding-workspace-state.js";
import { DEFAULT_PLAYER_ROLE } from "./villages-player-role.js";
import { type SetStateAction, useCallback } from "react";

export function useUpdateSetupMapRequest(ports: {
  setSetupMapRequest: React.Dispatch<SetStateAction<SetupMapRequest>>;
  setupMapRequestRef: React.RefObject<SetupMapRequest>;
}) {
  const { setSetupMapRequest, setupMapRequestRef } = ports;
  return useCallback((value: SetupMapRequest | null) => {
    setupMapRequestRef.current = value;
    setSetupMapRequest(value);
  }, []);
}

export function useSuggestPlaces(ports: {
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setVenuesDraft: React.Dispatch<SetStateAction<VillageVenue[]>>;
  snapshot: VillageSnapshot;
}) {
  const { setBusy, setSettingsError, setVenuesDraft, snapshot } = ports;
  return useCallback(async () => {
    if (
      snapshot &&
      destinationPlaces(snapshot.settings.venues).length > 0 &&
      !window.confirm("Replace the current places with new suggestions? This removes places you created or approved.")
    )
      return;
    setBusy(true);
    setSettingsError("");
    try {
      const next = await request<{ places: Array<{ name: string }> }>("/bootstrap", {
        method: "POST",
      });
      // Suggestions stay in the editor until each description has been reviewed and saved.
      setVenuesDraft(
        next.places.map((place): VillageVenue => ({
          id: freshRowKey(),
          name: place.name,
          description: "",
          category: "public",
          presentation: { image: null, x: null, y: null },
          occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
          capabilities: [],
          state: { condition: "", upgrades: [], furniture: [], publicFacts: [], updatedAt: "" },
        })),
      );
    } catch (cause) {
      setSettingsError(messageFrom(cause, "The village did not suggest any places."));
    } finally {
      setBusy(false);
    }
  }, [snapshot]);
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
        const mb = (bytes: number) => Math.round(bytes / 100_000) / 10;
        setSetupMapProblem(
          `That picture is ${mb(file.size)} MB and a village map holds ${mb(bytesThatFit)} MB. Choose a smaller copy.`,
        );
        return;
      }
      setSetupMapBusy(true);
      try {
        const image = await readFileAsDataUrl(file);
        const size = await measureImage(image);
        setSetupMapImage(image);
        setSetupMapImageSource("upload");
        setSetupMapSize(size);
        setSetupMapSource("upload");
        setSetupMapReviewed(false);
        updateSetupMapRequest(null);
      } catch (cause) {
        setSetupMapProblem(messageFrom(cause, "That picture could not be used as the village map."));
      } finally {
        setSetupMapBusy(false);
      }
    },
    [snapshot, updateSetupMapRequest],
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
  setupMapSource: SetupMapSource;
  setupMapSrc: string;
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
    setupMapSource,
    setupMapSrc,
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
        : (rows.find((row) => row.id === movingSetupVenueId) ??
          rows.find((row) => row.presentation.x === null || row.presentation.y === null));
      if (!target || setupEditorOpen || (setupWorkspace.paused && !movingSetupVenueId && !draggedVenueId)) return;
      if (setupMapSource !== "none" && (!setupMapSrc || setupMapBusy)) {
        setSetupPlacementError("Wait for the selected artwork before placing Venue photographs, or use Simple map.");
        return;
      }
      if (
        foundingPhotoOverlaps(
          { x, y },
          rows.filter((row) => row.id !== target.id).map((row) => row.presentation),
          pictureSize ?? { width: 1000, height: 700, photoWidth: 58, photoHeight: 58 },
        )
      ) {
        setSetupPlacementError("That Venue photograph would overlap another Venue. Choose a nearby spot.");
        return;
      }
      const next = rows.map((row) =>
        row.id === target.id ? { ...row, presentation: { ...row.presentation, x, y } } : row,
      );
      setSetupVenues(next);
      if (draggedVenueId || (movingSetupVenueId && target.presentation.x !== null && target.presentation.y !== null))
        setSetupWorkspace((state) => ({ ...state, paused: true }));
      setMovingSetupVenueId(null);
      setSetupPlacementError("");
      if (next.every((row) => row.presentation.x !== null && row.presentation.y !== null)) setSetupMapReviewed(true);
    },
    [movingSetupVenueId, setupEditorOpen, setupWorkspace.paused, setupMapSource, setupMapSrc, setupMapBusy],
  );
}

export function usePatchSetupVenue(ports: {
  setSetupAuthoredFields: React.Dispatch<SetStateAction<Record<string, string[]>>>;
  setSetupVenues: React.Dispatch<SetStateAction<VillageVenue[]>>;
}) {
  const { setSetupAuthoredFields, setSetupVenues } = ports;
  return useCallback((id: string, next: (venue: SetupVenueDraft) => SetupVenueDraft) => {
    setSetupVenues((rows) =>
      rows.map((row) => {
        if (row.id !== id) return row;
        const changed = next(row);
        const fields = ["name", "venueType", "form", "description", "layout", "spaces", "privateSpaces"] as const;
        const edited = fields.filter((field) => JSON.stringify(row[field]) !== JSON.stringify(changed[field]));
        if (edited.length)
          setSetupAuthoredFields((current) => ({
            ...current,
            [id]: [...new Set([...(current[id] ?? []), ...edited])],
          }));
        return changed;
      }),
    );
  }, []);
}

export function useOpenSetup(ports: {
  loadCatalog: (signal?: AbortSignal) => Promise<void>;
  loadLorebooks: (signal?: AbortSignal) => Promise<void>;
  loadPersonas: (signal?: AbortSignal) => Promise<void>;
  setMapVisualLore: React.Dispatch<SetStateAction<boolean>>;
  setMovingSetupVenueId: React.Dispatch<SetStateAction<string>>;
  setPersonaDraft: React.Dispatch<SetStateAction<string>>;
  setPersonalizeHomes: React.Dispatch<SetStateAction<boolean>>;
  setPickerOpen: React.Dispatch<SetStateAction<boolean>>;
  setResetArmed: React.Dispatch<SetStateAction<boolean>>;
  setSceneryStyle: React.Dispatch<SetStateAction<string>>;
  setScreen: React.Dispatch<
    SetStateAction<"menu" | "venue" | "home" | "setup" | "resume" | "preparing" | "room" | "person">
  >;
  setSearch: React.Dispatch<SetStateAction<string>>;
  setSelectedSetupVenueId: React.Dispatch<SetStateAction<string>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setSetupCompletedIds: React.Dispatch<SetStateAction<string[]>>;
  setSetupEditorOpen: React.Dispatch<SetStateAction<boolean>>;
  setSetupFocusIssue: React.Dispatch<SetStateAction<FoundingIssue>>;
  setSetupFoundingDetails: React.Dispatch<SetStateAction<string>>;
  setSetupFoundingGuidance: React.Dispatch<SetStateAction<string>>;
  setSetupFoundingReason: React.Dispatch<SetStateAction<"rebuild" | "pioneer" | "prosper" | "custom" | "none">>;
  setSetupFoundingVillagerIds: React.Dispatch<SetStateAction<string[]>>;
  setSetupImprint: React.Dispatch<SetStateAction<ScenarioImprint>>;
  setSetupLorebookDraft: React.Dispatch<SetStateAction<string[]>>;
  setSetupLoreTokenBudgetDraft: React.Dispatch<SetStateAction<number>>;
  setSetupMapBusy: React.Dispatch<SetStateAction<boolean>>;
  setSetupMapGeneratedKey: React.Dispatch<SetStateAction<string>>;
  setSetupMapImage: React.Dispatch<SetStateAction<string>>;
  setSetupMapImageSource: React.Dispatch<SetStateAction<"generate" | "upload">>;
  setSetupMapNegativePrompt: React.Dispatch<SetStateAction<string>>;
  setSetupMapOptions: React.Dispatch<SetStateAction<TownMapOptions>>;
  setSetupMapProblem: React.Dispatch<SetStateAction<string>>;
  setSetupMapPrompt: React.Dispatch<SetStateAction<string>>;
  setSetupMapSize: React.Dispatch<SetStateAction<{ width: number; height: number }>>;
  setSetupMapSource: React.Dispatch<SetStateAction<SetupMapSource>>;
  setSetupName: React.Dispatch<SetStateAction<string>>;
  setSetupNewVenueId: React.Dispatch<SetStateAction<string>>;
  setSetupPlacementError: React.Dispatch<SetStateAction<string>>;
  setSetupPlayerRole: React.Dispatch<SetStateAction<PlayerRole>>;
  setSetupProblem: React.Dispatch<SetStateAction<string>>;
  setSetupResidentContexts: React.Dispatch<SetStateAction<Record<string, ResidentFoundingContext>>>;
  setSetupSetting: React.Dispatch<SetStateAction<string>>;
  setSetupShowIssues: React.Dispatch<SetStateAction<boolean>>;
  setSetupStep: React.Dispatch<SetStateAction<number>>;
  setSetupVenues: React.Dispatch<SetStateAction<VillageVenue[]>>;
  setSetupWorkspace: React.Dispatch<SetStateAction<FoundingWorkspaceState>>;
  setSetupWorldFacts: React.Dispatch<SetStateAction<string[]>>;
  setVisualLoreDefault: React.Dispatch<SetStateAction<boolean>>;
  updateSetupMapRequest: (value: SetupMapRequest | null) => void;
}) {
  const {
    loadCatalog,
    loadLorebooks,
    loadPersonas,
    setMapVisualLore,
    setMovingSetupVenueId,
    setPersonaDraft,
    setPersonalizeHomes,
    setPickerOpen,
    setResetArmed,
    setSceneryStyle,
    setScreen,
    setSearch,
    setSelectedSetupVenueId,
    setSettingsError,
    setSetupCompletedIds,
    setSetupEditorOpen,
    setSetupFocusIssue,
    setSetupFoundingDetails,
    setSetupFoundingGuidance,
    setSetupFoundingReason,
    setSetupFoundingVillagerIds,
    setSetupImprint,
    setSetupLorebookDraft,
    setSetupLoreTokenBudgetDraft,
    setSetupMapBusy,
    setSetupMapGeneratedKey,
    setSetupMapImage,
    setSetupMapImageSource,
    setSetupMapNegativePrompt,
    setSetupMapOptions,
    setSetupMapProblem,
    setSetupMapPrompt,
    setSetupMapSize,
    setSetupMapSource,
    setSetupName,
    setSetupNewVenueId,
    setSetupPlacementError,
    setSetupPlayerRole,
    setSetupProblem,
    setSetupResidentContexts,
    setSetupSetting,
    setSetupShowIssues,
    setSetupStep,
    setSetupVenues,
    setSetupWorkspace,
    setSetupWorldFacts,
    setVisualLoreDefault,
    updateSetupMapRequest,
  } = ports;
  return useCallback(
    (fresh: boolean, village: VillageSnapshot | null) => {
      setSettingsError("");
      setSetupProblem("");
      setResetArmed(false);
      setPickerOpen(false);
      setSearch("");
      setSetupStep(0);
      setSetupWorkspace(emptyFoundingWorkspace());
      setSetupShowIssues(false);
      setSetupFocusIssue(null);
      setSetupName(fresh ? "" : (village?.village.name ?? ""));
      setSetupSetting(fresh ? "" : (village?.village.setting ?? ""));
      const storedReason = fresh ? "" : (village?.settings.foundingReason ?? "");
      const isCurrentScenario = FOUNDING_SCENARIOS.some((scenario) => scenario.value === storedReason);
      const reason: FoundingScenarioId = isCurrentScenario
        ? (storedReason as FoundingScenarioId)
        : storedReason
          ? "custom"
          : "custom";
      const legacyReason = LEGACY_FOUNDING_REASONS[storedReason] ?? storedReason;
      const savedDetails = village?.settings.foundingDetails ?? "";
      const legacyPremise = [legacyReason, savedDetails].filter(Boolean).join(" ");
      const legacyOverflow = legacyPremise.length > (village?.settings.foundingDetailsMaxLength ?? 500);
      const details = village?.isFounded
        ? savedDetails
        : storedReason && !isCurrentScenario
          ? legacyOverflow
            ? savedDetails
            : legacyPremise
          : fresh || !storedReason
            ? foundingScenario(reason).premise
            : savedDetails;
      const guidance = fresh
        ? ""
        : village?.isFounded
          ? (village.settings.foundingGuidance ?? "")
          : [legacyOverflow ? legacyReason : "", village?.settings.foundingGuidance ?? ""].filter(Boolean).join(" ");
      setSetupFoundingReason(reason);
      setSetupFoundingDetails(details);
      setSetupFoundingGuidance(reason === "none" ? "" : guidance);
      setSetupPlayerRole(
        fresh
          ? { ...DEFAULT_PLAYER_ROLE }
          : village?.isFounded
            ? (village.settings.playerRole ?? null)
            : { ...(village?.settings.playerRole ?? DEFAULT_PLAYER_ROLE), enabled: true },
      );
      if (fresh) setSetupResidentContexts({});
      setSetupImprint(fresh ? emptyScenarioImprint() : (village?.settings.scenarioImprint ?? emptyScenarioImprint()));
      setSetupWorldFacts(fresh ? [] : (village?.settings.worldFacts ?? []));
      const foundingPlaces =
        fresh || !village
          ? []
          : village.settings.venues.filter(
              (venue) => venue.classes?.includes("residence") || venue.category === "public-center",
            );
      setSetupVenues(foundingPlaces);
      setSetupFoundingVillagerIds(
        foundingPlaces.flatMap((venue) =>
          venue.occupancy.residentCharacterId ? [venue.occupancy.residentCharacterId] : [],
        ),
      );
      setSetupCompletedIds(
        foundingPlaces
          .filter((venue) => venue.form?.trim() && venue.description.trim() && venue.spaces?.[0]?.description.trim())
          .map((venue) => venue.id),
      );
      setSetupEditorOpen(false);
      setSetupNewVenueId("");
      setSceneryStyle(
        fresh || !village?.isFounded
          ? SCENERY_STYLES["Painted illustration"]
          : (village.settings.sceneryArtStyle ?? ""),
      );
      setPersonalizeHomes(village?.settings.personalizeVenueImagesByDefault !== false);
      setVisualLoreDefault(village?.settings.useVisualLoreByDefault !== false);
      setMapVisualLore(village?.settings.useVisualLoreByDefault !== false);
      setSelectedSetupVenueId(foundingPlaces[0]?.id ?? null);
      setMovingSetupVenueId(null);
      setSetupPlacementError("");
      setSetupLorebookDraft(fresh ? [] : (village?.settings.selectedLorebookIds ?? []));
      setSetupLoreTokenBudgetDraft(fresh ? 1600 : (village?.settings.loreTokenBudget ?? 1600));
      setSetupMapOptions({ ...DEFAULT_TOWN_MAP_OPTIONS });
      setSetupMapSource(fresh ? "none" : village?.settings.townMapImageSetAt ? "existing" : "none");
      setSetupMapImage("");
      setSetupMapImageSource(null);
      setSetupMapGeneratedKey("");
      setSetupMapSize(null);
      setSetupMapPrompt(fresh ? "" : (village?.settings.townMapLayoutPrompt ?? ""));
      setSetupMapNegativePrompt(village?.settings.townMapNegativePrompt ?? "");
      setSetupMapBusy(false);
      setSetupMapProblem("");
      updateSetupMapRequest(null);
      // Coming back through the wizard over a village that already exists keeps
      // the Persona it is linked to, exactly as it keeps the name and the
      // setting: the second run is a chance to redraw the map, not to be told
      // something new about yourself by accident.
      setPersonaDraft(fresh ? "" : (village?.settings.playerPersonaId ?? ""));
      // Load the Persona and lorebook choices as the wizard opens so their
      // respective steps are ready when the player reaches them.
      void loadPersonas();
      void loadLorebooks();
      void loadCatalog();
      setScreen("setup");
    },
    [loadCatalog, loadLorebooks, loadPersonas, updateSetupMapRequest],
  );
}

export function useFoundVillage(ports: {
  draftSaveQueue: React.RefObject<Promise<void>>;
  element: HTMLElement;
  flushSetupDraft: () => Promise<void>;
  mapVisualLore: boolean;
  personaDraft: string;
  personalizeHomes: boolean;
  residentContextProblem: "" | "Complete the highlighted resident background fields in People.";
  savedTownMapView: TownMapView;
  sceneryStyle: string;
  selectedResidentContexts: { [k: string]: ResidentFoundingContext };
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setDraftReady: React.Dispatch<SetStateAction<boolean>>;
  setPlacingHome: React.Dispatch<SetStateAction<boolean>>;
  setScreen: React.Dispatch<
    SetStateAction<"menu" | "venue" | "home" | "setup" | "resume" | "preparing" | "room" | "person">
  >;
  setSelectedSetupVenueId: React.Dispatch<SetStateAction<string>>;
  setSetupProblem: React.Dispatch<SetStateAction<string>>;
  setSetupStep: React.Dispatch<SetStateAction<number>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
  setupBlocker: () => string;
  setupFoundingDetails: string;
  setupFoundingGuidance: string;
  setupFoundingReason: "rebuild" | "pioneer" | "prosper" | "custom" | "none";
  setupFoundingVillagerIds: string[];
  setupLorebookDraft: string[];
  setupLoreTokenBudgetDraft: number;
  setupMapSource: SetupMapSource;
  setupMapSrc: string;
  setupName: string;
  setupPlayerRole: PlayerRole;
  setupSetting: string;
  setupVenues: VillageVenue[];
  setupWorldFacts: string[];
  snapshot: VillageSnapshot;
  visualLoreDefault: boolean;
}) {
  const {
    draftSaveQueue,
    element,
    flushSetupDraft,
    mapVisualLore,
    personaDraft,
    personalizeHomes,
    residentContextProblem,
    savedTownMapView,
    sceneryStyle,
    selectedResidentContexts,
    setBusy,
    setDraftReady,
    setPlacingHome,
    setScreen,
    setSelectedSetupVenueId,
    setSetupProblem,
    setSetupStep,
    setSnapshot,
    setupBlocker,
    setupFoundingDetails,
    setupFoundingGuidance,
    setupFoundingReason,
    setupFoundingVillagerIds,
    setupLorebookDraft,
    setupLoreTokenBudgetDraft,
    setupMapSource,
    setupMapSrc,
    setupName,
    setupPlayerRole,
    setupSetting,
    setupVenues,
    setupWorldFacts,
    snapshot,
    visualLoreDefault,
  } = ports;
  return useCallback(async () => {
    if (residentContextProblem) {
      setSetupProblem(residentContextProblem);
      setSetupStep(0);
      return;
    }
    const blocker = setupBlocker();
    if (blocker) {
      const incomplete = setupVenues.find(
        (venue) =>
          !venue.name.trim() ||
          !venue.form?.trim() ||
          !venue.description.trim() ||
          (!snapshot?.isFounded && venue.layoutVersion === 1 && !venue.layout) ||
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
      if (!snapshot?.isFounded) await flushSetupDraft();
      const founded = await request<VillageSnapshot>("/setup", {
        method: "POST",
        body: JSON.stringify({
          name: setupName.trim(),
          setting: setupSetting.trim(),
          foundingReason: snapshot?.isFounded ? snapshot.settings.foundingReason : setupFoundingReason,
          foundingDetails: snapshot?.isFounded ? snapshot.settings.foundingDetails : setupFoundingDetails.trim(),
          foundingGuidance: snapshot?.isFounded ? snapshot.settings.foundingGuidance : setupFoundingGuidance.trim(),
          playerRole: snapshot?.isFounded ? (snapshot.settings.playerRole ?? null) : setupPlayerRole,
          scenarioImprint: snapshot?.isFounded ? snapshot.settings.scenarioImprint : null,
          worldFacts: snapshot?.isFounded ? setupWorldFacts.map((line) => line.trim()).filter(Boolean) : [],
          selectedLorebookIds: setupLorebookDraft,
          personalizeVenueImagesByDefault: personalizeHomes,
          useVisualLoreByDefault: visualLoreDefault,
          sceneryArtStyle: sceneryStyle,
          useVisualLore: mapVisualLore,
          loreTokenBudget: setupLoreTokenBudgetDraft,
          playerPersonaId: personaDraft,
          townMapImage: setupMapSrc ?? "",
          townMapView: setupMapSource === "existing" ? savedTownMapView : defaultView("cover"),
          // Founding is authoritative: submit the complete graph, including
          // the named public center, rather than relying on stored destinations.
          venues: setupVenues,
          foundingCharacterIds: snapshot?.isFounded ? undefined : setupFoundingVillagerIds,
          foundingResidentContexts: snapshot?.isFounded ? undefined : selectedResidentContexts,
        }),
      });
      setSnapshot(founded);
      setDraftReady(false);
      await draftSaveQueue.current;
      await removeFoundingDraft(API_PATH).catch(() => undefined);
      setPlacingHome(false);
      setScreen(
        !snapshot?.isFounded ||
          founded.foundingPreparation?.status === "pending" ||
          founded.foundingPreparation?.status === "failed"
          ? "preparing"
          : "home",
      );
    } catch (cause) {
      setSetupProblem(messageFrom(cause, "The village could not be founded."));
    } finally {
      setBusy(false);
    }
  }, [
    flushSetupDraft,
    element,
    setupVenues,
    setupFoundingVillagerIds,
    snapshot?.isFounded,
    snapshot?.settings.foundingReason,
    snapshot?.settings.foundingDetails,
    snapshot?.settings.foundingGuidance,
    snapshot?.settings.playerRole,
    snapshot?.settings.scenarioImprint,
    residentContextProblem,
    selectedResidentContexts,
    personaDraft,
    savedTownMapView,
    setupBlocker,
    sceneryStyle,
    mapVisualLore,
    personalizeHomes,
    visualLoreDefault,
    setupMapSource,
    setupMapSrc,
    setupName,
    setupFoundingReason,
    setupFoundingDetails,
    setupFoundingGuidance,
    setupPlayerRole,
    setupWorldFacts,
    setupLorebookDraft,
    setupLoreTokenBudgetDraft,
    setupSetting,
  ]);
}

export function useRetryPreparation(ports: {
  setPreparationProblem: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
}) {
  const { setPreparationProblem, setSnapshot } = ports;
  return useCallback(async () => {
    setPreparationProblem("");
    try {
      setSnapshot(await request<VillageSnapshot>("/setup/preparation/retry", { method: "POST" }));
    } catch (cause) {
      setPreparationProblem(messageFrom(cause, "Preparation could not be retried."));
    }
  }, []);
}
