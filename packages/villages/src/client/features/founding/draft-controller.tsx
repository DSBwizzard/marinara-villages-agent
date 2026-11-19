import { savedFoundingStep } from "./founding-steps.js";
import { upgradeUntouchedStartingLayout } from "./quick-start-drafts.js";
import { messageFrom } from "../../shared/api.js";
import { API_PATH } from "../../shared/constants.js";

import type { useFoundingSetupDraftData } from "./controller-hooks.js";
import type { SetupDraftData } from "./draft-model.js";
import type { FoundingState } from "./useFoundingState.js";
import { readDeviceDraft, removeDeviceDraft, saveDeviceDraft } from "../../shared/device-drafts.js";
import { useCallback, useEffect } from "react";

export function useFoundingPersistSetupDraft(ports: {
  readonly draftBlocked: FoundingState["draftBlocked"];
  readonly draftRevision: FoundingState["draftRevision"];
  readonly draftSaveQueue: FoundingState["draftSaveQueue"];
  readonly setDraftSaveError: FoundingState["setDraftSaveError"];
  readonly setSavedSetupDraft: React.Dispatch<
    React.SetStateAction<import("../../shared/device-drafts").SavedDeviceDraft<import("./draft-model").SetupDraftData>>
  >;
}) {
  const { draftBlocked, draftRevision, draftSaveQueue, setDraftSaveError, setSavedSetupDraft } = ports;

  return useCallback(
    (data: SetupDraftData) => {
      const pending = draftSaveQueue.current.then(async () => {
        if (draftBlocked.current) throw new Error("Draft saving needs attention. Keep this tab open and retry saving.");
        try {
          const saved = await saveDeviceDraft(API_PATH, data, draftRevision.current);
          draftRevision.current = saved.revision;
          setSavedSetupDraft(saved);
          setDraftSaveError("");
        } catch (cause) {
          draftBlocked.current = true;
          setDraftSaveError(messageFrom(cause, "Draft could not be saved. Keep this tab open."));
          throw cause;
        }
      });
      draftSaveQueue.current = pending.catch(() => undefined);
      return pending;
    },
    [draftBlocked, draftRevision, draftSaveQueue, setDraftSaveError, setSavedSetupDraft],
  );
}
export function useFoundingDraftAutosave(ports: {
  readonly draftReady: FoundingState["draftReady"];
  readonly persistSetupDraft: (data: import("./draft-model").SetupDraftData) => Promise<void>;
  readonly skipRestoredDraftAutosave: FoundingState["skipRestoredDraftAutosave"];
  readonly screen: "menu" | "home" | "setup" | "preparing" | "venue" | "room" | "person";
  readonly setupDraftData: ReturnType<typeof useFoundingSetupDraftData>;
  readonly snapshot: import("../../../shared/contracts/village").VillageSnapshot;
}) {
  const { draftReady, persistSetupDraft, screen, setupDraftData, skipRestoredDraftAutosave, snapshot } = ports;

  useEffect(() => {
    if (!draftReady || snapshot?.isFounded || screen !== "setup") return;
    if (skipRestoredDraftAutosave.current) {
      skipRestoredDraftAutosave.current = false;
      return;
    }
    void persistSetupDraft(setupDraftData).catch(() => undefined);
  }, [draftReady, persistSetupDraft, setupDraftData, skipRestoredDraftAutosave, snapshot?.isFounded, screen]);
}
export function useFoundingFlushSetupDraft(ports: {
  readonly draftBlocked: FoundingState["draftBlocked"];
  readonly draftReady: FoundingState["draftReady"];
  readonly persistSetupDraft: (data: import("./draft-model").SetupDraftData) => Promise<void>;
  readonly setupDraftData: ReturnType<typeof useFoundingSetupDraftData>;
}) {
  const { draftBlocked, draftReady, persistSetupDraft, setupDraftData } = ports;

  return useCallback(async () => {
    if (!draftReady) throw new Error("Draft storage is unavailable. Retry saving before leaving or founding.");
    await persistSetupDraft(setupDraftData);
    if (draftBlocked.current) throw new Error("Draft saving needs attention. Keep this tab open.");
  }, [draftBlocked, draftReady, persistSetupDraft, setupDraftData]);
}
export function createFoundingRestoreSetupDraft(ports: {
  readonly loadCatalog: (signal?: AbortSignal) => Promise<void>;
  readonly loadLorebooks: (signal?: AbortSignal) => Promise<void>;
  readonly loadPersonas: (signal?: AbortSignal) => Promise<void>;
  readonly setDraftReady: FoundingState["setDraftReady"];
  readonly setMovingSetupVenueId: FoundingState["setMovingSetupVenueId"];
  readonly setPersonaDraft: React.Dispatch<React.SetStateAction<string>>;
  readonly setPersonalizeHomes: FoundingState["setPersonalizeHomes"];
  readonly setSceneryStyle: FoundingState["setSceneryStyle"];
  readonly setSceneryStyleProfileId: FoundingState["setSceneryStyleProfileId"];
  readonly setScreen: React.Dispatch<
    React.SetStateAction<"menu" | "home" | "setup" | "preparing" | "venue" | "room" | "person">
  >;
  readonly setSelectedSetupVenueId: FoundingState["setSelectedSetupVenueId"];
  readonly setSetupAuthoredFields: FoundingState["setSetupAuthoredFields"];
  readonly setSetupEditorOpen: FoundingState["setSetupEditorOpen"];

  readonly setSetupSpriteRevisions?: FoundingState["setSetupSpriteRevisions"];
  readonly setSetupFoundingVillagerIds: FoundingState["setSetupFoundingVillagerIds"];

  readonly setSetupKeyboardSpot: FoundingState["setSetupKeyboardSpot"];
  readonly setSetupLorebookDraft: FoundingState["setSetupLorebookDraft"];
  readonly setSetupLoreTokenBudgetDraft: FoundingState["setSetupLoreTokenBudgetDraft"];
  readonly setSetupMapBusy: FoundingState["setSetupMapBusy"];
  readonly setSetupMapGeneratedKey: FoundingState["setSetupMapGeneratedKey"];
  readonly setSetupMapImage: FoundingState["setSetupMapImage"];
  readonly setSetupMapImageSource: FoundingState["setSetupMapImageSource"];
  readonly setSetupMapNegativePrompt: FoundingState["setSetupMapNegativePrompt"];
  readonly setSetupMapProblem: FoundingState["setSetupMapProblem"];
  readonly setSetupMapPrompt: FoundingState["setSetupMapPrompt"];
  readonly setSetupMapReviewed: FoundingState["setSetupMapReviewed"];
  readonly setSetupMapSize: FoundingState["setSetupMapSize"];
  readonly setSetupMapSource: FoundingState["setSetupMapSource"];
  readonly setSetupName: FoundingState["setSetupName"];
  readonly setSetupLocationName: FoundingState["setSetupLocationName"];
  readonly setSetupTimeZone?: FoundingState["setSetupTimeZone"];
  readonly setSetupPlayerBackground: FoundingState["setSetupPlayerBackground"];
  readonly setSetupProblem: FoundingState["setSetupProblem"];
  readonly setSetupResidentAdmissions: FoundingState["setSetupResidentAdmissions"];
  readonly setSetupWorldName: FoundingState["setSetupWorldName"];
  readonly setSetupSetting: FoundingState["setSetupSetting"];
  readonly setSetupStep: FoundingState["setSetupStep"];
  readonly setSetupSuggestionsKey: FoundingState["setSetupSuggestionsKey"];
  readonly setSetupVenues: FoundingState["setSetupVenues"];
  readonly setSetupWorkspace: FoundingState["setSetupWorkspace"];
  readonly setSetupContext: FoundingState["setSetupContext"];
  readonly setupEditorAuthoredOriginal: FoundingState["setupEditorAuthoredOriginal"];
  readonly setupEditorOriginal: FoundingState["setupEditorOriginal"];
  readonly setupEditorZoneOriginal: FoundingState["setupEditorZoneOriginal"];
  readonly setupZoneDrafts: FoundingState["setupZoneDrafts"];
  readonly updateSetupMapRequest: (value: import("../../../shared/contracts/village").SetupMapRequest) => void;
}) {
  return (data: SetupDraftData) => {
    const {
      loadCatalog,
      loadLorebooks,
      loadPersonas,
      setDraftReady,
      setMovingSetupVenueId,
      setPersonaDraft,
      setPersonalizeHomes,
      setSceneryStyle,
      setSceneryStyleProfileId,
      setScreen,
      setSelectedSetupVenueId,
      setSetupAuthoredFields,
      setSetupEditorOpen,

      setSetupSpriteRevisions,
      setSetupFoundingVillagerIds,

      setSetupKeyboardSpot,
      setSetupLorebookDraft,
      setSetupLoreTokenBudgetDraft,
      setSetupMapBusy,
      setSetupMapGeneratedKey,
      setSetupMapImage,
      setSetupMapImageSource,
      setSetupMapNegativePrompt,
      setSetupMapProblem,
      setSetupMapPrompt,
      setSetupMapReviewed,
      setSetupMapSize,
      setSetupMapSource,
      setSetupName,
      setSetupLocationName,
      setSetupPlayerBackground,
      setSetupProblem,
      setSetupResidentAdmissions,
      setSetupWorldName,
      setSetupSetting,
      setSetupStep,
      setSetupSuggestionsKey,
      setSetupVenues,
      setSetupWorkspace,
      setSetupContext,
      setupEditorAuthoredOriginal,
      setupEditorOriginal,
      setupEditorZoneOriginal,
      setupZoneDrafts,
      updateSetupMapRequest,
    } = ports;

    if (
      data?.version !== 2 ||
      typeof data.name !== "string" ||
      (data.startingLocationName != null && typeof data.startingLocationName !== "string") ||
      typeof data.setting !== "string" ||
      typeof data.persona !== "string" ||
      !data.context ||
      typeof data.context.rules !== "string" ||
      !Array.isArray(data.context.circumstances) ||
      data.context.circumstances.some((row) => typeof row?.summary !== "string") ||
      !Array.isArray(data.lorebooks) ||
      !data.workspace ||
      !data.workspace.inactive ||
      (data.workspace.settingBrief != null && typeof data.workspace.settingBrief !== "string") ||
      (data.workspace.settingWorldBrief != null && typeof data.workspace.settingWorldBrief !== "string") ||
      (data.workspace.settingBeat != null &&
        !["welcome", "world-overview", "world", "lorebooks", "village-overview", "village"].includes(
          data.workspace.settingBeat,
        )) ||
      !data.zoneDrafts ||
      !Array.isArray(data.venues) ||
      !Array.isArray(data.roster) ||
      data.roster.length > 3 ||
      data.venues.length > 16 ||
      data.venues.some(
        (row) =>
          !row?.id ||
          !row.presentation ||
          !row.occupancy ||
          typeof row.name !== "string" ||
          typeof row.description !== "string",
      )
    ) {
      return false;
    }
    const step = savedFoundingStep(data);
    const hasMap =
      data.mapSource === "existing" ||
      ((data.mapSource === "generate" || data.mapSource === "upload") &&
        data.mapImageSource === data.mapSource &&
        !!data.mapImage);
    setSetupStep(step > 2 && !hasMap ? 2 : step);
    setSetupName(data.name);
    setSetupLocationName(data.startingLocationName ?? data.name);
    ports.setSetupTimeZone?.(data.timeZone ?? "");
    setSetupWorldName(data.worldName ?? "");
    setSetupSetting(data.setting);
    setSetupPlayerBackground(data.playerBackground ?? "");
    setSetupContext({
      rules: data.context.rules,
      circumstances: data.context.circumstances,
      openingVenueId: data.context.openingVenueId,
      ...((data.workspace.suggestionRequest || data.mapRequest) && Object.hasOwn(data.context, "households")
        ? { households: data.context.households }
        : {}),
    });
    const preserveLayout =
      data.workspace.suggestionRequest ||
      data.mapRequest ||
      data.interruptedGeneration ||
      data.editorOriginal ||
      Object.keys(data.zoneDrafts).length;
    setSetupVenues(preserveLayout ? data.venues : data.venues.map(upgradeUntouchedStartingLayout));
    setupZoneDrafts.current = data.zoneDrafts;
    setSetupSpriteRevisions?.(data.spriteRevisions ?? {});
    setSetupFoundingVillagerIds(data.roster);
    setSetupResidentAdmissions(data.residentAdmissions ?? {});
    setPersonaDraft(data.persona);
    setSetupLorebookDraft(data.lorebooks);
    setSetupLoreTokenBudgetDraft(data.loreBudget);
    setSceneryStyle(data.artStyle);
    setSceneryStyleProfileId(data.styleProfileId ?? null);
    setPersonalizeHomes(data.personalizeHomes);
    setSetupMapSource(data.mapSource);
    setSetupMapImage(data.mapImage);
    setSetupMapImageSource(data.mapImageSource);
    setSetupMapGeneratedKey(data.mapGeneratedKey);
    setSetupMapSize(data.mapSize);
    setSetupMapPrompt(data.mapPrompt);
    setSetupMapNegativePrompt(data.mapNegative);
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
    setSetupWorkspace(data.workspace);
    setupEditorOriginal.current = data.editorOriginal;
    setupEditorAuthoredOriginal.current = data.editorAuthoredOriginal ?? [];
    setupEditorZoneOriginal.current = data.editorZoneOriginal;
    setSetupKeyboardSpot(data.keyboardSpot);
    setSetupProblem("");
    setDraftReady(true);
    setScreen("setup");
    void loadPersonas();
    void loadLorebooks();
    void loadCatalog();
    return true;
  };
}
export function createFoundingRetrySetupSaving(ports: {
  readonly confirmVillages: (message: string) => Promise<boolean>;
  readonly draftBlocked: FoundingState["draftBlocked"];
  readonly draftNeedsReplacement: FoundingState["draftNeedsReplacement"];
  readonly draftRevision: FoundingState["draftRevision"];
  readonly persistSetupDraft: (data: import("./draft-model").SetupDraftData) => Promise<void>;
  readonly setDraftNeedsReplacement: FoundingState["setDraftNeedsReplacement"];
  readonly setDraftReady: FoundingState["setDraftReady"];
  readonly setDraftSaveError: FoundingState["setDraftSaveError"];
  readonly setupDraftData: ReturnType<typeof useFoundingSetupDraftData>;
}) {
  return async () => {
    const {
      confirmVillages,
      draftBlocked,
      draftNeedsReplacement,
      draftRevision,
      persistSetupDraft,
      setDraftNeedsReplacement,
      setDraftReady,
      setDraftSaveError,
      setupDraftData,
    } = ports;

    try {
      const expectedRevision = draftRevision.current;
      if (draftNeedsReplacement && !(await confirmVillages("Replace the unreadable saved founding draft?"))) return;
      setDraftReady(false);
      const saved = await readDeviceDraft<SetupDraftData>(API_PATH);
      if ((saved?.revision ?? 0) !== expectedRevision || draftRevision.current !== expectedRevision)
        throw new Error("This draft changed in another tab. Reload to resume the latest saved choices.");
      draftBlocked.current = false;
      await persistSetupDraft(setupDraftData);
      setDraftNeedsReplacement(false);
      setDraftReady(true);
    } catch (cause) {
      setDraftSaveError(messageFrom(cause, "Draft saving is unavailable."));
    }
  };
}
export function useFoundingDraftOffer(ports: {
  readonly draftBlocked: FoundingState["draftBlocked"];
  readonly draftRevision: FoundingState["draftRevision"];
  readonly openSetup: (fresh: boolean, village: import("../../../shared/contracts/village").VillageSnapshot) => void;
  readonly restoreSetupDraft: ReturnType<typeof createFoundingRestoreSetupDraft>;
  readonly setDraftNeedsReplacement: FoundingState["setDraftNeedsReplacement"];
  readonly setDraftReady: FoundingState["setDraftReady"];
  readonly setDraftSaveError: FoundingState["setDraftSaveError"];
  readonly setSavedSetupDraft: FoundingState["setSavedSetupDraft"];
  readonly setScreen: React.Dispatch<
    React.SetStateAction<"menu" | "home" | "setup" | "preparing" | "venue" | "room" | "person">
  >;
  readonly setupOfferedRef: FoundingState["setupOfferedRef"];
  readonly skipRestoredDraftAutosave: FoundingState["skipRestoredDraftAutosave"];
  readonly snapshot: import("../../../shared/contracts/village").VillageSnapshot;
}) {
  const {
    draftBlocked,
    draftRevision,
    openSetup,
    restoreSetupDraft,
    setDraftNeedsReplacement,
    setDraftReady,
    setDraftSaveError,
    setSavedSetupDraft,
    setScreen,
    setupOfferedRef,
    skipRestoredDraftAutosave,
    snapshot,
  } = ports;

  useEffect(() => {
    if (!snapshot || setupOfferedRef.current) return;
    setupOfferedRef.current = true;
    if (!snapshot.isFounded) {
      void readDeviceDraft<SetupDraftData>(API_PATH)
        .then((saved) => {
          if (saved) {
            const restored = restoreSetupDraft(saved.data);
            draftRevision.current = saved.revision;
            if (restored) {
              // Opening a second tab should not claim the draft revision until an edit.
              skipRestoredDraftAutosave.current = true;
              setSavedSetupDraft(saved);
              return;
            }
            draftBlocked.current = true;
            openSetup(false, snapshot);
            setDraftNeedsReplacement(true);
            setDraftSaveError("This saved founding draft cannot be read.");
          } else {
            openSetup(false, snapshot);
            setDraftReady(true);
          }
        })
        .catch((cause) => {
          draftBlocked.current = true;
          openSetup(false, snapshot);
          setDraftSaveError(messageFrom(cause, "Draft storage is unavailable. Keep this tab open."));
        });
    } else {
      void removeDeviceDraft(API_PATH).catch(() => undefined);
      if (snapshot.foundingPreparation && !snapshot.foundingPreparation.canPlay) setScreen("preparing");
    }
  }, [
    openSetup,
    restoreSetupDraft,
    snapshot,
    setupOfferedRef,
    draftBlocked,
    draftRevision,
    setDraftNeedsReplacement,
    setSavedSetupDraft,
    skipRestoredDraftAutosave,
    setScreen,
    setDraftReady,
    setDraftSaveError,
  ]);
}
