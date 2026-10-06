import { messageFrom } from "../../shared/api.js";
import { API_PATH } from "../../shared/constants.js";
import type { SettingsState } from "../settings/useSettingsState.js";
import type { useFoundingSetupDraftData } from "./controller-hooks.js";
import type { SetupDraftData } from "./draft-model.js";
import type { FoundingState } from "./useFoundingState.js";
import { readFoundingDraft, removeFoundingDraft, saveFoundingDraft } from "./villages-founding-draft.js";
import { emptyFoundingWorkspace } from "./villages-founding-workspace-state";
import { useCallback, useEffect } from "react";

export function useFoundingPersistSetupDraft(ports: {
  readonly draftBlocked: FoundingState["draftBlocked"];
  readonly draftRevision: FoundingState["draftRevision"];
  readonly draftSaveQueue: FoundingState["draftSaveQueue"];
  readonly pendingDraftSaves: React.RefObject<number>;
  readonly setDraftSavedAt: FoundingState["setDraftSavedAt"];
  readonly setDraftSaveError: FoundingState["setDraftSaveError"];
  readonly setDraftSaving: FoundingState["setDraftSaving"];
  readonly setSavedSetupDraft: React.Dispatch<
    React.SetStateAction<import("./villages-founding-draft").SavedFoundingDraft<import("./draft-model").SetupDraftData>>
  >;
}) {
  return useCallback((data: SetupDraftData) => {
    const {
      draftBlocked,
      draftRevision,
      draftSaveQueue,
      pendingDraftSaves,
      setDraftSavedAt,
      setDraftSaveError,
      setDraftSaving,
      setSavedSetupDraft,
    } = ports;

    pendingDraftSaves.current += 1;
    setDraftSaving(true);
    const pending = draftSaveQueue.current.then(async () => {
      if (draftBlocked.current) throw new Error("Draft saving needs attention. Keep this tab open and retry saving.");
      try {
        const saved = await saveFoundingDraft(API_PATH, data, draftRevision.current);
        draftRevision.current = saved.revision;
        setSavedSetupDraft(saved);
        setDraftSavedAt(saved.savedAt);
        setDraftSaveError("");
      } catch (cause) {
        draftBlocked.current = true;
        setDraftSaveError(messageFrom(cause, "Draft could not be saved. Keep this tab open."));
        throw cause;
      }
    });
    draftSaveQueue.current = pending.catch(() => undefined);
    void pending
      .finally(() => {
        pendingDraftSaves.current -= 1;
        if (!pendingDraftSaves.current) setDraftSaving(false);
      })
      .catch(() => undefined);
    return pending;
  }, []);
}
export function useFoundingDraftAutosave(ports: {
  readonly draftReady: FoundingState["draftReady"];
  readonly persistSetupDraft: (data: import("./draft-model").SetupDraftData) => Promise<void>;
  readonly screen: "menu" | "home" | "setup" | "resume" | "preparing" | "venue" | "room" | "person";
  readonly setupDraftData: ReturnType<typeof useFoundingSetupDraftData>;
  readonly snapshot: import("../../../shared/contracts/village").VillageSnapshot;
}) {
  useEffect(() => {
    const { draftReady, persistSetupDraft, screen, setupDraftData, snapshot } = ports;

    if (draftReady && !snapshot?.isFounded && (screen === "setup" || screen === "resume"))
      void persistSetupDraft(setupDraftData).catch(() => undefined);
  }, [ports.draftReady, ports.persistSetupDraft, ports.setupDraftData, ports.snapshot?.isFounded, ports.screen]);
}
export function useFoundingFlushSetupDraft(ports: {
  readonly draftBlocked: FoundingState["draftBlocked"];
  readonly draftReady: FoundingState["draftReady"];
  readonly persistSetupDraft: (data: import("./draft-model").SetupDraftData) => Promise<void>;
  readonly setupDraftData: ReturnType<typeof useFoundingSetupDraftData>;
}) {
  return useCallback(async () => {
    const { draftBlocked, draftReady, persistSetupDraft, setupDraftData } = ports;

    if (!draftReady) throw new Error("Draft storage is unavailable. Retry saving before leaving or founding.");
    await persistSetupDraft(setupDraftData);
    if (draftBlocked.current) throw new Error("Draft saving needs attention. Keep this tab open.");
  }, [ports.draftReady, ports.persistSetupDraft, ports.setupDraftData]);
}
export function createFoundingRestoreSetupDraft(ports: {
  readonly loadCatalog: (signal?: AbortSignal) => Promise<void>;
  readonly loadLorebooks: (signal?: AbortSignal) => Promise<void>;
  readonly loadPersonas: (signal?: AbortSignal) => Promise<void>;
  readonly setDraftReady: FoundingState["setDraftReady"];
  readonly setDraftSaveError: FoundingState["setDraftSaveError"];
  readonly setMapVisualLore: FoundingState["setMapVisualLore"];
  readonly setMovingSetupVenueId: FoundingState["setMovingSetupVenueId"];
  readonly setPersonaDraft: SettingsState["setPersonaDraft"];
  readonly setPersonalizeHomes: FoundingState["setPersonalizeHomes"];
  readonly setSceneryStyle: FoundingState["setSceneryStyle"];
  readonly setScreen: React.Dispatch<
    React.SetStateAction<"menu" | "home" | "setup" | "resume" | "preparing" | "venue" | "room" | "person">
  >;
  readonly setSelectedSetupVenueId: FoundingState["setSelectedSetupVenueId"];
  readonly setSetupAuthoredFields: FoundingState["setSetupAuthoredFields"];
  readonly setSetupEditorOpen: FoundingState["setSetupEditorOpen"];
  readonly setSetupFoundingDetails: FoundingState["setSetupFoundingDetails"];
  readonly setSetupFoundingGuidance: FoundingState["setSetupFoundingGuidance"];
  readonly setSetupFoundingReason: FoundingState["setSetupFoundingReason"];
  readonly setSetupFoundingVillagerIds: FoundingState["setSetupFoundingVillagerIds"];
  readonly setSetupImprint: FoundingState["setSetupImprint"];
  readonly setSetupKeyboardSpot: FoundingState["setSetupKeyboardSpot"];
  readonly setSetupLorebookDraft: FoundingState["setSetupLorebookDraft"];
  readonly setSetupLoreTokenBudgetDraft: FoundingState["setSetupLoreTokenBudgetDraft"];
  readonly setSetupMapBusy: FoundingState["setSetupMapBusy"];
  readonly setSetupMapGeneratedKey: FoundingState["setSetupMapGeneratedKey"];
  readonly setSetupMapImage: FoundingState["setSetupMapImage"];
  readonly setSetupMapImageSource: FoundingState["setSetupMapImageSource"];
  readonly setSetupMapNegativePrompt: FoundingState["setSetupMapNegativePrompt"];
  readonly setSetupMapOptions: FoundingState["setSetupMapOptions"];
  readonly setSetupMapProblem: FoundingState["setSetupMapProblem"];
  readonly setSetupMapPrompt: FoundingState["setSetupMapPrompt"];
  readonly setSetupMapReviewed: FoundingState["setSetupMapReviewed"];
  readonly setSetupMapSize: FoundingState["setSetupMapSize"];
  readonly setSetupMapSource: FoundingState["setSetupMapSource"];
  readonly setSetupName: FoundingState["setSetupName"];
  readonly setSetupPlayerRole: FoundingState["setSetupPlayerRole"];
  readonly setSetupProblem: FoundingState["setSetupProblem"];
  readonly setSetupResidentContexts: FoundingState["setSetupResidentContexts"];
  readonly setSetupSetting: FoundingState["setSetupSetting"];
  readonly setSetupStep: FoundingState["setSetupStep"];
  readonly setSetupSuggestionsKey: FoundingState["setSetupSuggestionsKey"];
  readonly setSetupVenues: FoundingState["setSetupVenues"];
  readonly setSetupWorkspace: FoundingState["setSetupWorkspace"];
  readonly setSetupWorldFacts: FoundingState["setSetupWorldFacts"];
  readonly setupEditorAuthoredOriginal: FoundingState["setupEditorAuthoredOriginal"];
  readonly setupEditorOriginal: FoundingState["setupEditorOriginal"];
  readonly setupEditorZoneOriginal: FoundingState["setupEditorZoneOriginal"];
  readonly setupZoneDrafts: FoundingState["setupZoneDrafts"];
  readonly setVisualLoreDefault: FoundingState["setVisualLoreDefault"];
  readonly updateSetupMapRequest: (value: import("../../../shared/contracts/village").SetupMapRequest) => void;
}) {
  return (data: SetupDraftData) => {
    const {
      loadCatalog,
      loadLorebooks,
      loadPersonas,
      setDraftReady,
      setDraftSaveError,
      setMapVisualLore,
      setMovingSetupVenueId,
      setPersonaDraft,
      setPersonalizeHomes,
      setSceneryStyle,
      setScreen,
      setSelectedSetupVenueId,
      setSetupAuthoredFields,
      setSetupEditorOpen,
      setSetupFoundingDetails,
      setSetupFoundingGuidance,
      setSetupFoundingReason,
      setSetupFoundingVillagerIds,
      setSetupImprint,
      setSetupKeyboardSpot,
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
      setSetupMapReviewed,
      setSetupMapSize,
      setSetupMapSource,
      setSetupName,
      setSetupPlayerRole,
      setSetupProblem,
      setSetupResidentContexts,
      setSetupSetting,
      setSetupStep,
      setSetupSuggestionsKey,
      setSetupVenues,
      setSetupWorkspace,
      setSetupWorldFacts,
      setupEditorAuthoredOriginal,
      setupEditorOriginal,
      setupEditorZoneOriginal,
      setupZoneDrafts,
      setVisualLoreDefault,
      updateSetupMapRequest,
    } = ports;

    if (
      !Array.isArray(data.venues) ||
      !Array.isArray(data.roster) ||
      data.roster.length > 3 ||
      data.venues.length > 5 ||
      data.venues.some((row) => !row.id || !row.presentation || !row.occupancy || typeof row.description !== "string")
    ) {
      setDraftSaveError("This saved draft cannot be read. Start a new draft to continue.");
      return;
    }
    setSetupStep(Math.max(0, Math.min(3, data.step)));
    setSetupName(data.name);
    setSetupSetting(data.setting);
    setSetupFoundingReason(data.reason);
    setSetupFoundingDetails(data.circumstances);
    setSetupFoundingGuidance(data.direction);
    setSetupPlayerRole(data.role);
    setSetupImprint(data.imprint);
    setSetupWorldFacts(data.worldFacts);
    setSetupVenues(data.venues);
    setupZoneDrafts.current = data.zoneDrafts ?? {};
    setSetupFoundingVillagerIds(data.roster);
    setSetupResidentContexts(data.residentContexts ?? {});
    setPersonaDraft(data.persona);
    setSetupLorebookDraft(data.lorebooks);
    setSetupLoreTokenBudgetDraft(data.loreBudget);
    setSceneryStyle(data.artStyle);
    setPersonalizeHomes(data.personalizeHomes);
    setVisualLoreDefault(data.visualLoreDefault);
    setMapVisualLore(data.mapVisualLore);
    setSetupMapSource(data.mapSource);
    setSetupMapImage(data.mapImage);
    setSetupMapImageSource(data.mapImageSource);
    setSetupMapGeneratedKey(data.mapGeneratedKey);
    setSetupMapSize(data.mapSize);
    setSetupMapPrompt(data.mapPrompt);
    setSetupMapNegativePrompt(data.mapNegative);
    setSetupMapOptions(data.mapOptions);
    setSetupMapReviewed(data.mapReviewed);
    setSetupMapProblem(data.mapProblem ?? "");
    const mapRequest = data.mapRequest ? { ...data.mapRequest, phase: "waiting" as const } : null;
    updateSetupMapRequest(mapRequest);
    setSetupMapBusy(!!mapRequest);
    setSetupAuthoredFields(data.authoredFields);
    setSetupSuggestionsKey(data.suggestionsKey);
    setSelectedSetupVenueId(data.selectedVenueId);
    setMovingSetupVenueId(data.movingVenueId);
    setSetupEditorOpen(false);
    setSetupWorkspace(
      data.workspace ?? {
        ...emptyFoundingWorkspace(),
        view: data.editorOpen ? "details" : "map",
        paused: !!data.editorOpen,
      },
    );
    setupEditorOriginal.current = data.editorOriginal;
    setupEditorAuthoredOriginal.current = data.editorAuthoredOriginal ?? [];
    setupEditorZoneOriginal.current = data.editorZoneOriginal;
    setSetupKeyboardSpot(data.keyboardSpot);
    setSetupProblem(
      data.interruptedGeneration
        ? "A generation request was interrupted and may have been billed. Saved results are kept. Generate again only when you choose."
        : "",
    );
    setDraftReady(true);
    setScreen("setup");
    void loadPersonas();
    void loadLorebooks();
    void loadCatalog();
  };
}
export function createFoundingExitSetupDraft(ports: {
  readonly flushSetupDraft: () => Promise<void>;
  readonly setScreen: React.Dispatch<
    React.SetStateAction<"menu" | "home" | "setup" | "resume" | "preparing" | "venue" | "room" | "person">
  >;
  readonly setSetupEditorOpen: FoundingState["setSetupEditorOpen"];
  readonly setSetupProblem: FoundingState["setSetupProblem"];
  readonly setupImageClaim: FoundingState["setupImageClaim"];
  readonly setupSuggestionsClaim: FoundingState["setupSuggestionsClaim"];
}) {
  return async () => {
    const { flushSetupDraft, setScreen, setSetupEditorOpen, setSetupProblem, setupImageClaim, setupSuggestionsClaim } =
      ports;

    if (setupImageClaim.current || setupSuggestionsClaim.current) return;
    try {
      await flushSetupDraft();
      if (setupImageClaim.current || setupSuggestionsClaim.current) return;
      setSetupEditorOpen(false);
      setScreen("resume");
    } catch (cause) {
      setSetupProblem(messageFrom(cause, "The draft has not been saved. Keep this tab open."));
    }
  };
}
export function createFoundingNewSetupDraft(ports: {
  readonly draftBlocked: FoundingState["draftBlocked"];
  readonly draftRevision: FoundingState["draftRevision"];
  readonly draftSaveQueue: FoundingState["draftSaveQueue"];
  readonly openSetup: (fresh: boolean, village: import("../../../shared/contracts/village").VillageSnapshot) => void;
  readonly savedSetupDraft: import("./villages-founding-draft").SavedFoundingDraft<
    import("./draft-model").SetupDraftData
  >;
  readonly setDraftReady: FoundingState["setDraftReady"];
  readonly setDraftSaveError: FoundingState["setDraftSaveError"];
  readonly setSavedSetupDraft: React.Dispatch<
    React.SetStateAction<import("./villages-founding-draft").SavedFoundingDraft<import("./draft-model").SetupDraftData>>
  >;
  readonly setSetupAuthoredFields: FoundingState["setSetupAuthoredFields"];
  readonly setSetupMapProblem: FoundingState["setSetupMapProblem"];
  readonly setSetupMapReviewed: FoundingState["setSetupMapReviewed"];
  readonly setSetupSuggestionsKey: FoundingState["setSetupSuggestionsKey"];
  readonly setupMapBusy: FoundingState["setupMapBusy"];
  readonly setupSuggestionsBusy: FoundingState["setupSuggestionsBusy"];
  readonly setupVenueBusy: FoundingState["setupVenueBusy"];
  readonly setupZoneDrafts: FoundingState["setupZoneDrafts"];
  readonly snapshot: import("../../../shared/contracts/village").VillageSnapshot;
  readonly updateSetupMapRequest: (value: import("../../../shared/contracts/village").SetupMapRequest) => void;
}) {
  return async () => {
    const {
      draftBlocked,
      draftRevision,
      draftSaveQueue,
      openSetup,
      savedSetupDraft,
      setDraftReady,
      setDraftSaveError,
      setSavedSetupDraft,
      setSetupAuthoredFields,
      setSetupMapProblem,
      setSetupMapReviewed,
      setSetupSuggestionsKey,
      setupMapBusy,
      setupSuggestionsBusy,
      setupVenueBusy,
      setupZoneDrafts,
      snapshot,
      updateSetupMapRequest,
    } = ports;

    if (setupMapBusy || setupVenueBusy || setupSuggestionsBusy) return;
    if (
      savedSetupDraft &&
      !window.confirm("Discard this saved founding draft and its artwork? Your founded village is unchanged.")
    )
      return;
    try {
      setDraftReady(false);
      await draftSaveQueue.current;
      await removeFoundingDraft(API_PATH);
      draftRevision.current = 0;
      draftBlocked.current = false;
      setDraftSaveError("");
      setSavedSetupDraft(null);
      setSetupAuthoredFields({});
      setSetupSuggestionsKey("");
      setSetupMapReviewed(false);
      updateSetupMapRequest(null);
      setSetupMapProblem("");
      setupZoneDrafts.current = {};
      openSetup(true, snapshot);
      setDraftReady(true);
    } catch (cause) {
      setDraftSaveError(messageFrom(cause, "The draft could not be cleared."));
    }
  };
}
export function createFoundingRetrySetupSaving(ports: {
  readonly draftBlocked: FoundingState["draftBlocked"];
  readonly draftRevision: FoundingState["draftRevision"];
  readonly persistSetupDraft: (data: import("./draft-model").SetupDraftData) => Promise<void>;
  readonly setDraftReady: FoundingState["setDraftReady"];
  readonly setDraftSaveError: FoundingState["setDraftSaveError"];
  readonly setupDraftData: ReturnType<typeof useFoundingSetupDraftData>;
}) {
  return async () => {
    const { draftBlocked, draftRevision, persistSetupDraft, setDraftReady, setDraftSaveError, setupDraftData } = ports;

    try {
      const saved = await readFoundingDraft<SetupDraftData>(API_PATH);
      if ((saved?.revision ?? 0) !== draftRevision.current)
        throw new Error("This draft changed in another tab. Reload to resume the latest saved choices.");
      draftBlocked.current = false;
      setDraftReady(true);
      await persistSetupDraft(setupDraftData);
    } catch (cause) {
      setDraftSaveError(messageFrom(cause, "Draft saving is unavailable."));
    }
  };
}
export function useFoundingDraftOffer(ports: {
  readonly draftRevision: FoundingState["draftRevision"];
  readonly loadCatalog: (signal?: AbortSignal) => Promise<void>;
  readonly loadPersonas: (signal?: AbortSignal) => Promise<void>;
  readonly openSetup: (fresh: boolean, village: import("../../../shared/contracts/village").VillageSnapshot) => void;
  readonly setDraftReady: FoundingState["setDraftReady"];
  readonly setDraftSavedAt: FoundingState["setDraftSavedAt"];
  readonly setDraftSaveError: FoundingState["setDraftSaveError"];
  readonly setSavedSetupDraft: React.Dispatch<
    React.SetStateAction<import("./villages-founding-draft").SavedFoundingDraft<import("./draft-model").SetupDraftData>>
  >;
  readonly setScreen: React.Dispatch<
    React.SetStateAction<"menu" | "home" | "setup" | "resume" | "preparing" | "venue" | "room" | "person">
  >;
  readonly setupOfferedRef: FoundingState["setupOfferedRef"];
  readonly snapshot: import("../../../shared/contracts/village").VillageSnapshot;
}) {
  useEffect(() => {
    const {
      draftRevision,
      loadCatalog,
      loadPersonas,
      openSetup,
      setDraftReady,
      setDraftSavedAt,
      setDraftSaveError,
      setSavedSetupDraft,
      setScreen,
      setupOfferedRef,
      snapshot,
    } = ports;

    if (!snapshot || setupOfferedRef.current) return;
    setupOfferedRef.current = true;
    if (!snapshot.isFounded) {
      void readFoundingDraft<SetupDraftData>(API_PATH)
        .then((saved) => {
          if (saved) {
            draftRevision.current = saved.revision;
            setSavedSetupDraft(saved);
            setDraftSavedAt(saved.savedAt);
            setScreen("resume");
            void loadPersonas();
            void loadCatalog();
          } else {
            openSetup(false, snapshot);
            setDraftReady(true);
          }
        })
        .catch((cause) => {
          openSetup(false, snapshot);
          setDraftSaveError(messageFrom(cause, "Draft storage is unavailable. Keep this tab open."));
        });
    } else {
      void removeFoundingDraft(API_PATH).catch(() => undefined);
      if (snapshot.foundingPreparation && snapshot.foundingPreparation.status !== "ready") setScreen("preparing");
    }
  }, [ports.openSetup, ports.snapshot, ports.loadPersonas, ports.loadCatalog]);
}
