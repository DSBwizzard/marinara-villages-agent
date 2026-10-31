import { useConfirmation } from "../shared/confirmation.js";
import { useLayoutEffect, useRef, useState } from "react";
import type { TownMapView, VillageVenue } from "../../shared/contracts/village.js";
import { useResidentsRetryWork } from "../features/background/actions.js";
import { BackgroundWorkPanel } from "../features/background/BackgroundPanel.js";
import { useProgressDiagnostics } from "../features/background/useProgressDiagnostics.js";
import {
  useCloseExploration,
  useDrawPlaceImage,
  useDropPlaceImage,
  useKeepPlaceImage,
  useOpenPlace,
} from "../features/exploration/actions.js";
import {
  calculateSavedPins,
  calculateSavedTownMapShape,
  calculateSavedTownMapView,
} from "../features/exploration/calculations.js";
import { useExplorationOutsideClick, useRemovedVenueNavigation } from "../features/exploration/controller-hooks.js";
import { useExplorationState } from "../features/exploration/useExplorationState.js";
import { createVenueExplorationActions } from "../features/exploration/venue-actions.js";
import { useExplorationViewport } from "../features/exploration/villages-exploration";
import {
  useFoundVillage,
  useOpenSetup,
  usePatchSetupVenue,
  usePickSetupTownMap,
  usePlaceSetupPin,
  useRetryPreparation,
  useSuggestPlaces,
  useUpdateSetupMapRequest,
} from "../features/founding/actions.js";
import {
  calculateDraftPins,
  calculatePlaceCount,
  calculateResidentContextProblem,
  calculateSetupBeginningSourceKey,
  calculateSetupHomeCount,
  calculateSetupImageContextKey,
  calculateSetupMapGenerationKey,
  calculateSetupMapShape,
  calculateSetupMapSrc,
} from "../features/founding/calculations.js";
import {
  useFoundingAuthoredReference,
  useFoundingBeginningReference,
  useFoundingDraftReferences,
  useFoundingImageContext,
  useFoundingMapReceipt,
  useFoundingPreparationPolling,
  useFoundingRosterReconciliation,
  useFoundingSelectedResidentContexts,
  useFoundingSetupBlocker,
  useFoundingSetupDraftData,
  useFoundingVenueReference,
} from "../features/founding/controller-hooks.js";
import {
  createFoundingExitSetupDraft,
  createFoundingNewSetupDraft,
  createFoundingRestoreSetupDraft,
  createFoundingRetrySetupSaving,
  useFoundingDraftAutosave,
  useFoundingDraftOffer,
  useFoundingFlushSetupDraft,
  useFoundingPersistSetupDraft,
} from "../features/founding/draft-controller.js";
import {
  createFoundingGenerateSetupImage,
  createFoundingSetupDraftRow,
  createFoundingUploadSetupImage,
  createFoundingWithSetupImage,
  useFoundingGenerateSetupTownMap,
} from "../features/founding/image-controller.js";
import {
  createFoundingGotoSetupStep,
  createFoundingSuggestSetupVenues,
  useFoundingStartOver,
} from "../features/founding/setup-controller.js";
import { useFoundingState } from "../features/founding/useFoundingState.js";
import { useProjectsController } from "../features/projects/useProjectsController.js";
import { useProjectsState } from "../features/projects/useProjectsState.js";
import { useRepairController } from "../features/repair/useRepairController.js";
import {
  useApplyVillagerRefresh,
  useForgetMemory,
  useLoadAgendas,
  useLoadMemoryLibrary,
  usePreviewVillagerRefresh,
  useRewriteAgenda,
  useSetAgendaScheduleIngestion,
} from "../features/residents/actions.js";
import { calculatePersonaPortraitId, calculatePortraitWanted } from "../features/residents/calculations.js";
import {
  useResidentAgendaPolling,
  useResidentInspection,
  useResidentsNameOfCharacter,
  useResidentsStandingAt,
} from "../features/residents/controller-hooks.js";
import { useResidentsState } from "../features/residents/useResidentsState.js";
import {
  usePersonaPortrait,
  useResidentPortraits,
  useResidentsLoadCatalog,
} from "../features/residents/workflow-controller.js";
import {
  useCloseRoom,
  useContinueRoomWithoutGreeting,
  useDiscardRoomDebug,
  useDismissRoomNotice,
  useGreetRoom,
  useLeaveRoom,
  useMoveRoom,
  useOpenRoom,
  useReceiveRoomRecordEvents,
  useRetrySavedScene,
  useSendRoom,
} from "../features/scenes/actions.js";
import {
  useActiveSceneRestoration,
  useSceneChangesPolling,
  useSceneInterruptedSubmission,
  useSceneOpeningWarning,
  useSceneOperationPolling,
  useSceneSelectionReset,
} from "../features/scenes/controller-hooks.js";
import { useSceneRecord } from "../features/scenes/useSceneRecord.js";
import { useScenesState } from "../features/scenes/useScenesState.js";
import { useSceneViewport } from "../features/scenes/villages-scene-viewport.js";
import {
  useSaveBackgroundPace,
  useSaveScenerySettings,
  useSaveSendOnEnter,
  useSaveSettings,
} from "../features/settings/actions.js";
import { useAgentConnections } from "../features/settings/AgentConnections.js";
import { useSettingsDraftSession } from "../features/settings/draft-session.js";
import { useSpriteVisualSettings } from "../features/settings/SpriteVisualSettings.js";
import { useSettingsState } from "../features/settings/useSettingsState.js";
import { useVillageWriting } from "../features/settings/WritingSettings.js";
import {
  useDecideVenueRequest,
  useLeaveVenue,
  useOpenVenue,
  useRemoveVenue,
  useSaveVenue,
} from "../features/venues/actions.js";
import { useVenueRequestFocus } from "../features/venues/controller-hooks.js";
import { useVenueRequestCommands } from "../features/venues/request-commands.js";
import { useVenueScreenCommands } from "../features/venues/screen-commands.js";
import { useVenuesState } from "../features/venues/useVenuesState.js";
import { useVenueZoneSelection } from "../features/venues/zone-selection.js";
import { useActivitySignal, useCapabilityVisibility } from "../shared/activity.js";
import { request } from "../shared/api.js";
import {
  useInitialVillageLoad,
  useLoadLorebooks,
  useLoadPersonas,
  useLoadVillageSnapshot,
  usePendingWorkPolling,
  useSnapshotReference,
  useVillagePresence,
  useVillageSnapshot,
} from "../shared/data-controller.js";
import type { MapFrameShape, MapPin, MenuPage } from "../shared/types.js";
import { useScenesOpenMenu } from "./navigation-actions.js";
import { useNavigationGoHome, useNavigationOpenPerson } from "./navigation-controller.js";
import { menuCategory, sceneNavigationScreen } from "./navigation.js";

export function useVillageController({ element }: { element: HTMLElement }) {
  const visible = useCapabilityVisibility(element);
  const [mobile, setMobile] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const box = element.getBoundingClientRect();
      setMobile(box.width <= 704);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  const { snapshot, setSnapshot, beginSnapshotRead } = useVillageSnapshot();
  const writing = useVillageWriting(snapshot?.isFounded === true);
  const [error, setError] = useState("");

  const homeBuildings = snapshot?.settings.homeBuildings ?? [];

  const {
    pickerOpen,
    setPickerOpen,
    catalog,
    setCatalog,
    search,
    setSearch,
    personas,
    setPersonas,
    personaPortrait,
    setPersonaPortrait,
    memoryLibrary,
    setMemoryLibrary,
    agendas,
    setAgendas,
    personProfile,
    setPersonProfile,
    profileInspection,
    setProfileInspection,
    profileOrigin,
    spriteManagerId,
    setSpriteManagerId,
    spriteLeaveGuard,
    spriteProfileScroll,
    portraits,
    setPortraits,
    refreshPreviews,
    setRefreshPreviews,
    refreshBusyId,
    setRefreshBusyId,
    portraitsAsked,
  } = useResidentsState();

  const {
    _endFailed,
    setEndFailed,
    mailboxOpen,
    setMailboxOpen,
    sceneReading,
    roomOpen,
    setRoomOpen,
    roomDraft,
    setRoomDraft,
    roomMode,
    setRoomMode,
    legacyRecovery,
    setLegacyRecovery,
    roomContactBoundary,
    setRoomContactBoundary,
    setRoomContactKind,
    roomTargetId,
    setRoomTargetId,
    roomMoveZoneId,
    setRoomMoveZoneId,
    roomMoveOperationIdRef,
    roomRuling,
    setRoomRuling,
    roomNotices,
    setRoomNotices,
    seenRoomEventIdsRef,
    dismissedRoomEventIdsRef,
    roomChangeStatus,
    setRoomChangeStatus,
    roomUnresolvedChanges,
    setRoomUnresolvedChanges,
    debugDiscardEnabled,
    setDebugDiscardEnabled,
    observedRoomIdRef,
    lastSceneEnding,
    setLastSceneEnding,
    roomBusy,
    setRoomBusy,
    leavingRoomPendingRef,
    roomSubmissionIdRef,
    roomLeaveSubmissionIdRef,
    roomCompletionRef,
    roomSendInFlightRef,
    composerEditVersionRef,
    restoredSceneDraftRef,
    roomError,
    setRoomError,
    roomGreetingError,
    setRoomGreetingError,
    roomGreetingNotice,
    setRoomGreetingNotice,
    roomEnded,
    setRoomEnded,
  } = useScenesState(snapshot?.isFounded);

  // The menu is its own screen. The homepage never carries the villager
  // controls, and the menu never draws the village itself; `menuPage` picks
  // which option inside the menu is open.
  //
  // `setup` is the third screen: the founding wizard owns the whole tab while it
  // runs, because it asks for the village's identity and its map at once and
  // nothing else is worth showing until it is done.
  //
  // `venue` is the fourth, and it is the one the MAP leads to: a place is where
  // the village's business happens, so pressing its pin walks into the place and
  // the place decides what is behind the door. See `openVenue`, which is where
  // the other half of that statement lives — a place with one person standing in
  // it never reaches this screen at all.
  const [room, setRoom] = useSceneRecord();
  const [requestedScreen, setScreen] = useState<
    "home" | "menu" | "setup" | "resume" | "preparing" | "venue" | "room" | "person"
  >("home");

  const {
    focusedProjectId,
    projectFocusRequest,
    setFocusedProjectId,
    focusedRequestId,
    setFocusedRequestId,
    placingProjectId,
    setPlacingProjectId,
    siteProjectId,
    setSiteProjectId,
  } = useProjectsState();
  const screen = sceneNavigationScreen(requestedScreen, !!room && room.status !== "closed", !!placingProjectId);
  useLayoutEffect(() => {
    // Ordinary exploration requests must not wait behind the Scene; Project placement is an editor.
    if (requestedScreen !== screen) setScreen(screen);
  }, [requestedScreen, screen]);

  useSceneViewport(element, screen === "room");
  const projectsController = useProjectsController({
    snapshot,
    onSnapshot: setSnapshot,
    focusProjectId: focusedProjectId,
    focusProjectRequest: projectFocusRequest,
  });

  const {
    venueId,
    venueSection,
    setVenueSection,
    venueReturnTo,
    setVenueReturnTo,
    housingVenueId,
    setHousingVenueId,
    setVenueId,
    venuePage,
    setVenuePage,
    venueZoneKey,
    setVenueZoneKey,
    venueEditDraft,
    setVenueEditDraft,
    venueProposalDraft,
    setVenueProposalDraft,
    venueEditBusy,
    setVenueEditBusy,
    venueEditError,
    setVenueEditError,
    venueEditNotice,
    setVenueEditNotice,
    moveTargetId,
    setMoveTargetId,
    playerMovePrivateZoneId,
    setPlayerMovePrivateZoneId,
    movePrivateZoneId,
    setMovePrivateZoneId,
    venuesDraft,
    setVenuesDraft,
    venueSearch,
    setVenueSearch,
    placeBusyId,
    setPlaceBusyId,
    placeProblem,
    setPlaceProblem,
  } = useVenuesState();

  useVenueZoneSelection({ setVenueZoneKey, snapshot, venueId, venueZoneKey });
  const {
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
    selectedMap,
    setSelectedMapId,
    showAllMaps,
    setShowAllMaps,
  } = useExplorationState(snapshot);
  const townMapImage = selectedMap?.artwork.url ?? "";

  useExplorationViewport(element, mobile && screen === "home");

  const closeExploration = useCloseExploration({
    element,
    explorationOrigin,
    explorationReturnTab,
    setExploreSheet,
    setOpenPlaceId,
  });

  useExplorationOutsideClick({
    closeExploration,
    element,
    exploreSheet,
    openPlaceId,
    screen,
    setExploreSheet,
    setOpenPlaceId,
  });

  useRemovedVenueNavigation({ closeExploration, openPlaceId, snapshot });

  const [menuPage, setMenuPage] = useState<MenuPage>("index");
  const advancedOpen = screen === "menu" && menuPage === "advanced";
  const connections = useAgentConnections(snapshot?.isFounded === true || advancedOpen, advancedOpen);

  useVenueRequestFocus({ element, focusedRequestId, menuPage, screen });

  const menuSection = menuCategory(menuPage);

  const openPerson = useNavigationOpenPerson({
    element,
    profileOrigin,
    setError,
    setPersonProfile,
    setProfileInspection,
    setScreen,
    setSpriteManagerId,
    spriteLeaveGuard,
  });
  const {
    resetArmed,
    setResetArmed,
    requestEdits,
    setRequestEdits,
    knowledgeDraft,
    setKnowledgeDraft,
    personaDraft,
    setPersonaDraft,
    settingDraft,
    setSettingDraft,
    lorebookDraft,
    setLorebookDraft,
    loreTokenBudgetDraft,
    setLoreTokenBudgetDraft,
    settingsError,
    setSettingsError,
  } = useSettingsState();

  useLayoutEffect(() => {
    if (screen !== "menu" || menuPage !== "advanced") setResetArmed(false);
  }, [screen, menuPage, setResetArmed]);

  const {
    savedSetupDraft,
    setSavedSetupDraft,
    lorebooks,
    setLorebooks,
    lorebooksError,
    setLorebooksError,
    pendingDraftSaves,
    setupLorebookDraft,
    setSetupLorebookDraft,
    setupLoreTokenBudgetDraft,
    setSetupLoreTokenBudgetDraft,
    setupStep,
    setSetupStep,
    setupName,
    setSetupName,
    setupTimeZone,
    setSetupTimeZone,
    setupWorldName,
    setupSetting,
    setSetupWorldName,
    setSetupSetting,

    setupPlayerBackground,
    setSetupPlayerBackground,

    setupWorldFacts,
    setSetupWorldFacts,
    setupVenues,
    setSetupVenues,
    setupSpriteRevisions,
    setSetupSpriteRevisions,
    setupFoundingVillagerIds,
    setSetupFoundingVillagerIds,
    setupResidentAdmissions,
    setSetupResidentAdmissions,
    setupKeyboardSpot,
    setSetupKeyboardSpot,
    setupEditorOpen,
    setSetupEditorOpen,
    setupEditorOriginal,
    setupEditorAuthoredOriginal,
    setupEditorZoneOriginal,
    sceneryStyle,
    sceneryStyleProfileId,
    setSceneryStyle,
    setSceneryStyleProfileId,
    personalizeHomes,
    setPersonalizeHomes,
    visualLoreDefault,
    setVisualLoreDefault,
    mapVisualLore,
    setMapVisualLore,
    selectedSetupVenueId,
    setSelectedSetupVenueId,
    setupWorkspace,
    setSetupWorkspace,
    setupShowIssues,
    setSetupShowIssues,
    setupFocusIssue,
    setSetupFocusIssue,
    setupImageTarget,
    setSetupImageTarget,
    setupImageTargetRef,
    setupImageClaim,
    movingSetupVenueId,
    setMovingSetupVenueId,
    setupVenueBusy,
    setSetupVenueBusy,
    setupPlacementError,
    setSetupPlacementError,
    setupMapSource,
    setSetupMapSource,
    setupMapImage,
    setSetupMapImage,
    setupMapImageSource,
    setSetupMapImageSource,
    setupMapGeneratedKey,
    setSetupMapGeneratedKey,
    setupMapSize,
    setSetupMapSize,
    setupMapPrompt,
    setSetupMapPrompt,
    setupMapNegativePrompt,
    setSetupMapNegativePrompt,
    setupMapBusy,
    setSetupMapBusy,
    setupMapProblem,
    setSetupMapProblem,
    setupMapRequest,
    setSetupMapRequest,
    setupMapRequestRef,
    preparationProblem,
    setPreparationProblem,
    connectionSetupProblem,
    setConnectionSetupProblem,
    setupProblem,
    setSetupProblem,
    setupMapReviewed,
    setSetupMapReviewed,
    setupAuthoredFields,
    setSetupAuthoredFields,
    setupSuggestionsKey,
    setSetupSuggestionsKey,
    setupSuggestionsBusy,
    setSetupSuggestionsBusy,
    setupSuggestionsClaim,
    draftReady,
    setDraftReady,
    draftSaveError,
    setDraftSaveError,
    draftSaving,
    setDraftSaving,
    draftSavedAt,
    setDraftSavedAt,
    draftRevision,
    draftSaveQueue,
    draftBlocked,
    setupZoneDrafts,
    setupOfferedRef,
  } = useFoundingState();

  const selectedResidentAdmissions = useFoundingSelectedResidentContexts({
    setupFoundingVillagerIds,
    setupResidentAdmissions,
  });

  const residentContextProblem = calculateResidentContextProblem({ selectedResidentAdmissions, snapshot });

  const setupHomeCount = calculateSetupHomeCount({ setupFoundingVillagerIds });

  const setupBeginningSourceKey = calculateSetupBeginningSourceKey({
    setupName,
    setupWorldFacts,

    personaDraft,
    personalizeHomes,
    sceneryStyle,
    sceneryStyleProfileId,
    selectedResidentAdmissions,

    setupLorebookDraft,
    setupLoreTokenBudgetDraft,
    setupWorldName,
    setupSetting,
    visualLoreDefault,
  });

  const setupImageContextKey = calculateSetupImageContextKey({
    personaDraft,
    personalizeHomes,
    setupBeginningSourceKey,

    setupName,
    setupWorldFacts,
    visualLoreDefault,
  });

  const { setupBeginningSourceKeyRef, setupImageContextKeyRef, setupVenuesRef, setupAuthoredFieldsRef } =
    useFoundingDraftReferences({ setupBeginningSourceKey, setupImageContextKey, setupVenues, setupAuthoredFields });

  useFoundingImageContext({ setupImageContextKey, setupImageContextKeyRef });

  useFoundingVenueReference({ setupVenues, setupVenuesRef });

  useFoundingBeginningReference({ setupBeginningSourceKey, setupBeginningSourceKeyRef, snapshot });

  const setupMapGenerationKey = calculateSetupMapGenerationKey({
    mapVisualLore,
    sceneryStyle,
    sceneryStyleProfileId,
    setupLorebookDraft,
    setupLoreTokenBudgetDraft,
    setupMapNegativePrompt,
    setupMapPrompt,
    setupSetting,
    setupWorldFacts,
    snapshot,
  });

  const updateSetupMapRequest = useUpdateSetupMapRequest({ setSetupMapRequest, setupMapRequestRef });

  /**
   * The framing the village has saved. The map is drawn with this everywhere
   * except in the panel's own preview, which draws the draft being tried out.
   */
  const savedTownMapView: TownMapView = calculateSavedTownMapView({ snapshot, selectedMap });

  /**
   * The shape a map is drawn at, as the settings give it. This is the one place
   * that answers "how big is a map", so the frame the picture is drawn in, the
   * advice beside the file box and the server all agree about it.
   */
  const savedTownMapShape: MapFrameShape | null = calculateSavedTownMapShape({ snapshot, selectedMap });

  const setupMapShape: MapFrameShape | null = calculateSetupMapShape({
    setupMapImageSource,
    setupMapSize,
    setupMapSource,
    snapshot,
  });

  /** How far the picture may be magnified in the panel, and how far one press moves it. */

  /**
   * The map as it is drawn: the picture being previewed in the panel, or the
   * village's own picture, or the one the package ships.
   */

  const setupMapSrc = calculateSetupMapSrc({ setupMapImage, setupMapImageSource, setupMapSource, townMapImage });

  useFoundingAuthoredReference({ setupAuthoredFields, setupAuthoredFieldsRef });

  const setupDraftData = useFoundingSetupDraftData({
    setupSpriteRevisions,
    mapVisualLore,
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
    setupWorldFacts,
    setupZoneDrafts,
    visualLoreDefault,
  });

  const persistSetupDraft = useFoundingPersistSetupDraft({
    draftBlocked,
    draftRevision,
    draftSaveQueue,
    pendingDraftSaves,
    setDraftSavedAt,
    setDraftSaveError,
    setDraftSaving,
    setSavedSetupDraft,
  });

  useFoundingDraftAutosave({ draftReady, persistSetupDraft, screen, setupDraftData, snapshot });

  const flushSetupDraft = useFoundingFlushSetupDraft({ draftBlocked, draftReady, persistSetupDraft, setupDraftData });

  const restoreSetupDraft = createFoundingRestoreSetupDraft({
    setSetupSpriteRevisions,
    get loadCatalog() {
      return loadCatalog;
    },
    get loadLorebooks() {
      return loadLorebooks;
    },
    get loadPersonas() {
      return loadPersonas;
    },
    setDraftReady,
    setDraftSaveError,
    setMapVisualLore,
    setMovingSetupVenueId,
    setPersonaDraft,
    setPersonalizeHomes,
    setSceneryStyle,
    setSceneryStyleProfileId,
    setScreen,
    setSelectedSetupVenueId,
    setSetupAuthoredFields,
    setSetupEditorOpen,

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
    setSetupTimeZone,
    setSetupPlayerBackground,
    setSetupProblem,
    setSetupResidentAdmissions,
    setSetupWorldName,
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
  });

  const exitSetupDraft = createFoundingExitSetupDraft({
    flushSetupDraft,
    setScreen,
    setSetupEditorOpen,
    setSetupProblem,
    setupImageClaim,
    setupSuggestionsClaim,
  });

  const confirmVillages = useConfirmation(snapshot?.settings.maps?.[0]?.id);
  const newSetupDraft = createFoundingNewSetupDraft({
    confirmVillages,
    draftBlocked,
    draftRevision,
    draftSaveQueue,
    get openSetup() {
      return openSetup;
    },
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
  });

  const retrySetupSaving = createFoundingRetrySetupSaving({
    draftBlocked,
    draftRevision,
    persistSetupDraft,
    setDraftReady,
    setDraftSaveError,
    setupDraftData,
  });

  // Roster changes reconcile only the required graph; existing authored Venues survive.
  useFoundingRosterReconciliation({ catalog, draftReady, screen, setSetupVenues, setupFoundingVillagerIds, snapshot });

  const suggestionSignal = useActivitySignal(visible && screen === "setup");
  const suggestSetupVenues = createFoundingSuggestSetupVenues({
    onQuickStartApplied: () => {
      setSetupAuthoredFields({});
      setupAuthoredFieldsRef.current = {};
      setupZoneDrafts.current = {};
      setupEditorOriginal.current = null;
      setupEditorZoneOriginal.current = undefined;
      setupEditorAuthoredOriginal.current = [];
      setSetupEditorOpen(false);
      setSelectedSetupVenueId(null);
      setMovingSetupVenueId(null);
      setSetupMapReviewed(false);
    },
    signal: suggestionSignal,
    setupWorkspace,
    setSetupWorkspace,
    persistSetupDraft,
    setupDraftData,
    setupName,
    setupWorldFacts,

    personaDraft,
    selectedResidentAdmissions,
    setSetupProblem,
    setSetupSuggestionsBusy,
    setSetupSuggestionsKey,
    setSetupVenues,
    setupAuthoredFieldsRef,
    setupBeginningSourceKey,
    setupBeginningSourceKeyRef,

    setupImageTargetRef,
    setupLorebookDraft,
    setupLoreTokenBudgetDraft,
    setupSetting,
    setupSuggestionsClaim,
    setupVenues,
    setupVenuesRef,
  });

  /** Whether the panel is framing a picture: one just picked, or the saved one under revision. */

  /**
   * The framing the panel draws. Everywhere else draws the saved one, so the
   * draft never leaks out of the panel and the village is never seen wearing a
   * framing that has not been agreed to.
   */

  /** What is true of the picture being previewed, if the panel is holding one. */

  const [busy, setBusy] = useState(false);

  /** Accept each server receipt once, regardless of which visit-ending path returned it. */
  const receiveRoomRecordEvents = useReceiveRoomRecordEvents({
    dismissedRoomEventIdsRef,
    seenRoomEventIdsRef,
    setRoomNotices,
  });

  useSceneChangesPolling({
    visible,
    viewing: screen === "room",
    busy: roomBusy,
    snapshot,
    dismissedRoomEventIdsRef,
    receiveRoomRecordEvents,
    room,
    setRoomChangeStatus,
    setRoomNotices,
    setRoomUnresolvedChanges,
  });

  const dismissRoomNotice = useDismissRoomNotice({
    dismissedRoomEventIdsRef,
    room,
    seenRoomEventIdsRef,
    setRoomError,
    setRoomNotices,
  });

  const currentSnapshotRef = useRef(snapshot);

  useSnapshotReference({ currentSnapshotRef, snapshot });

  const loadSnapshot = useLoadVillageSnapshot({ setError, beginSnapshotRead });

  const presenceSession = useRef("");

  useVillagePresence({ visible, presenceSession, beginSnapshotRead, snapshot });

  const backgroundPending =
    snapshot?.foundingPreparation?.status === "pending" ||
    (snapshot?.backgroundWork?.some((job) => ["queued", "running"].includes(job.status)) ?? false);

  usePendingWorkPolling({ visible, backgroundPending, loadSnapshot });

  const loadCatalog = useResidentsLoadCatalog({ setCatalog, setError });

  const loadPersonas = useLoadPersonas({ setError, setPersonaDraft, setPersonas });

  const loadLorebooks = useLoadLorebooks({ setLorebooks, setLorebooksError });

  const loadMemoryLibrary = useLoadMemoryLibrary({ setError, setMemoryLibrary });

  const forgetMemory = useForgetMemory({ loadMemoryLibrary, setBusy, setError });

  /**
   * Read what each villager is privately after.
   *
   * Read when the debug option is opened rather than carried on the snapshot,
   * for the same reason the story and the conversation record are: it is a model
   * call's worth of text per villager and nobody is looking at it while it is
   * closed.
   */
  const loadAgendas = useLoadAgendas({ setAgendas, setError });

  useResidentInspection({
    loadAgendas,
    personProfile,
    profileInspection,
    screen,
    setAgendas,
  });

  useResidentAgendaPolling({ visible, agendas, loadAgendas, personProfile, profileInspection, screen });

  /**
   * Ask the village to work one villager out again.
   *
   * The press only clears what is stored; the writing happens on the next part of
   * the day, along with everything else the village does. The server answers with
   * the whole list and that answer is what gets drawn, so a row can never be left
   * showing something the village has already forgotten.
   */
  const retryWork = useResidentsRetryWork({ loadAgendas, setSnapshot });

  const backgroundPanel = <BackgroundWorkPanel jobs={snapshot?.backgroundWork ?? []} onRetry={retryWork} />;

  const rewriteAgenda = useRewriteAgenda({
    currentSnapshotRef,
    retryWork,
    setAgendas,
    setBusy,
    setError,
  });

  const setAgendaScheduleIngestion = useSetAgendaScheduleIngestion({ setAgendas, setBusy, setError });

  useInitialVillageLoad({ visible: visible && !snapshot?.isFounded, loadSnapshot });

  useSceneSelectionReset({
    loadSnapshot,
    observedRoomIdRef,
    room,
    roomCompletionRef,
    roomMoveOperationIdRef,
    screen,
    seenRoomEventIdsRef,
    setLastSceneEnding,
    setRoom,
    setRoomContactBoundary,
    setRoomMoveZoneId,
    setRoomNotices,
    setRoomOpen,
    setRoomTargetId,
    setScreen,
  });

  // Opening failures belong only to the visit that is still opening. A later
  // authoritative read can recover it even when the original fetch and its
  // recovery read failed; a delayed failure must not revive the old warning.
  useSceneOpeningWarning({ room, roomGreetingError, setRoomGreetingError });

  useSceneInterruptedSubmission({
    composerEditVersionRef,
    restoredSceneDraftRef,
    room,
    setLegacyRecovery,
    roomMoveOperationIdRef,
    setRoomContactBoundary,
    setRoomContactKind,
    setRoomDraft,
    setRoomMode,
    setRoomMoveZoneId,
    setRoomTargetId,
  });

  // An app reload does not end a Scene. The server owns the one active
  // session; the client restores it instead of opening another conversation.
  const sceneRestoration = useActiveSceneRestoration({
    isFounded: snapshot?.isFounded,
    room,
    roomEnded,
    roomCompletionRef,
    roomSendInFlightRef,
    setDebugDiscardEnabled,
    setRoom,
    setRoomBusy,
    setRoomGreetingError,
    setRoomMode,
    setRoomOpen,
    setScreen,
  });

  // Kept as its own effect, keyed on the stamp: the picture is fetched once and
  // re-fetched only when the server says the map changed, so the homepage never
  // holds a stale copy and the snapshot never carries a megabyte of base64.

  const previewVillagerRefresh = usePreviewVillagerRefresh({ setError, setRefreshBusyId, setRefreshPreviews });

  const applyVillagerRefresh = useApplyVillagerRefresh({ setError, setRefreshBusyId, setRefreshPreviews, setSnapshot });

  // ── Menu screen ────────────────────────────────────────────────────────────
  // The menu is its own screen rather than a panel on the homepage, and every
  // option lives here now that nothing is drawn beside the map. Drafts are
  // managed by Settings across navigation; reopening refreshes untouched fields
  // and preserves edits rather than discarding them for an incoming snapshot.
  const { openSettings, acceptSavedSettings } = useSettingsDraftSession({
    snapshot,
    setKnowledgeDraft,
    setLorebookDraft,
    setLoreTokenBudgetDraft,
    setPersonaDraft,
    setPersonalizeHomes,
    setSceneryStyle,
    setSceneryStyleProfileId,
    setSettingDraft,
    setVenuesDraft,
    setVisualLoreDefault,
  });
  const { progressDebug, loadProgressDebug } = useProgressDiagnostics({ setError });
  const openMenu = useScenesOpenMenu({
    loadLorebooks,
    loadProgressDebug,
    debugDiscardEnabled,
    menuPage,
    screen,
    setFocusedRequestId,
    setMenuPage,
    setScreen,
    setSettingsError,
    setSiteProjectId,
    openSettings,
  });

  const goHome = useNavigationGoHome({
    setExploreSheet,
    setOpenPlaceId,
    setPickerOpen,
    setScreen,
    setSettingsError,
    setSpriteManagerId,
    spriteLeaveGuard,
  });

  /** End an active Scene in place; a second press returns the completed scene to the map. */
  const closeRoom = useCloseRoom({
    onUnknownSceneExit: sceneRestoration.retry,
    isFounded: snapshot?.isFounded,
    leavingRoomPendingRef,
    loadSnapshot,
    receiveRoomRecordEvents,
    room,
    roomBusy,
    roomCompletionRef,
    roomEnded,
    roomSendInFlightRef,
    seenRoomEventIdsRef,
    setEndFailed,
    setLastSceneEnding,
    setRoom,
    setRoomBusy,
    setRoomDraft,
    setRoomEnded,
    setRoomError,
    setRoomGreetingNotice,
    setRoomNotices,
    setRoomOpen,
    setScreen,
  });

  const leaveRoom = useLeaveRoom({
    composerEditVersionRef,
    isFounded: snapshot?.isFounded,
    loadSnapshot,
    receiveRoomRecordEvents,
    room,
    legacyRecovery,
    roomBusy,
    roomCompletionRef,
    roomDraft,
    roomEnded,
    roomLeaveSubmissionIdRef,
    roomSendInFlightRef,
    seenRoomEventIdsRef,
    setEndFailed,
    setLastSceneEnding,
    setRoom,
    setRoomBusy,
    setRoomDraft,
    setRoomEnded,
    setRoomError,
    setRoomRuling,
    setRoomNotices,
    setRoomOpen,
    setScreen,
  });

  const discardRoomDebug = useDiscardRoomDebug({
    debugDiscardEnabled,
    loadSnapshot,
    room,
    roomBusy,
    seenRoomEventIdsRef,
    setRoom,
    setRoomBusy,
    setRoomDraft,
    setRoomError,
    setRoomNotices,
    setRoomOpen,
    setScreen,
  });

  /**
   * Submit one speech or action turn in the current Scene.
   *
   * Show the player's line while the server responds, then restore the draft if
   * the turn fails. The server writes the line only after it has a valid reply.
   *
   * The answer REPLACES the room rather than being appended to it: the server
   * returns the room it wrote, which already holds the player's line and every line
   * of the answer, and a client that merged the two would have to know the order
   * the calls came back in. The snapshot is re-read afterwards because a room can
   * move the hour's own record on — see the memory each of them files at the end.
   */
  const moveRoom = useMoveRoom({
    isFounded: snapshot?.isFounded,
    loadSnapshot,
    room,
    legacyRecovery,
    roomBusy,
    roomCompletionRef,
    roomEnded,
    roomMoveOperationIdRef,
    roomMoveZoneId,
    roomSendInFlightRef,
    setRoom,
    setRoomBusy,
    setRoomContactBoundary,
    setRoomError,
    setRoomMode,
    setRoomMoveZoneId,
  });

  const { sendRoom, turnRecovery, checkSavedReply, replyPending } = useSendRoom({
    visible: visible && screen === "room",
    composerEditVersionRef,
    loadSnapshot,
    receiveRoomRecordEvents,
    room,
    legacyRecovery,
    setLegacyRecovery,
    roomBusy,
    roomCompletionRef,
    roomDraft,
    roomEnded,
    roomMode,
    roomSendInFlightRef,
    roomSubmissionIdRef,
    seenRoomEventIdsRef,
    setLastSceneEnding,
    setRoom,
    setRoomBusy,
    setRoomDraft,
    setRoomEnded,
    setRoomError,
    setRoomGreetingNotice,
    setRoomMode,
    setRoomNotices,
    setRoomOpen,
    setRoomRuling,
    setScreen,
    snapshot,
  });

  /**
   * Everybody the village places in one place at this hour.
   *
   * Read off the villagers rather than off the place, because where somebody is
   * is the villager's own answer: a place holds whoever the hour sent there, and a
   * house holds the person who lives in it by exactly the same rule — being at
   * home is what an hour that named nowhere resolves to. So one lookup answers
   * both questions and no place has to be asked twice.
   */
  useSceneOperationPolling({
    visible,
    viewing: screen === "room",
    recoveryPending: replyPending,
    room,
    roomBusy,
    setRoom,
    setRoomEnded,
    setRoomError,
  });

  const standingAt = useResidentsStandingAt({ snapshot });

  /**
   * Look at a place rather than at whoever happens to be standing in it.
   *
   * The map opens View Venue first. From there the player can visit a space or
   * enter one of the dedicated editing pages without a model request.
   */
  const openPlace = useOpenPlace({
    setVenueEditError,
    setVenueEditNotice,
    screen,
    setVenueReturnTo,
    setVenueSection,
    setExploreSheet,
    setOpenPlaceId,
    setScreen,
    setVenueEditDraft,
    setVenueId,
    setVenuePage,
    setVenueProposalDraft,
    setVenueZoneKey,
  });

  const greetRoom = useGreetRoom({
    isFounded: snapshot?.isFounded,
    room,
    roomBusy,
    roomEnded,
    roomCompletionRef,
    roomSendInFlightRef,
    loadSnapshot,
    setRoom,
    setRoomBusy,
    setRoomError,
    setRoomGreetingError,
    setRoomGreetingNotice,
  });

  const retrySavedScene = useRetrySavedScene({
    isFounded: snapshot?.isFounded,
    loadSnapshot,
    receiveRoomRecordEvents,
    room,
    setLegacyRecovery,
    roomBusy,
    roomCompletionRef,
    roomDraft,
    roomEnded,
    roomLeaveSubmissionIdRef,
    roomMoveOperationIdRef,
    roomSendInFlightRef,
    roomSubmissionIdRef,
    composerEditVersionRef,
    setRoom,
    setRoomBusy,
    setRoomContactBoundary,
    setRoomContactKind,
    setRoomDraft,
    setRoomEnded,
    setRoomError,
    setRoomGreetingError,
    setRoomRuling,
    setRoomMode,
    setRoomMoveZoneId,
    setRoomTargetId,
  });

  const continueRoomWithoutGreeting = useContinueRoomWithoutGreeting({
    isFounded: snapshot?.isFounded,
    room,
    roomBusy,
    roomCompletionRef,
    roomEnded,
    roomSendInFlightRef,
    setRoom,
    setRoomBusy,
    setRoomError,
    setRoomGreetingNotice,
  });

  /** Visit starts one venue session with a fixed cast, including when the venue is empty. */
  const openRoom = useOpenRoom({
    isFounded: snapshot?.isFounded,
    roomBusy,
    roomEnded,
    roomSendInFlightRef,
    greetRoom,
    leavingRoomPendingRef,
    loadSnapshot,
    room,
    roomCompletionRef,
    seenRoomEventIdsRef,
    setLastSceneEnding,
    setOpenPlaceId,
    setPlaceProblem,
    setRoom,
    setRoomBusy,
    setRoomDraft,
    setRoomEnded,
    setRoomError,
    setRoomGreetingNotice,
    setRoomMode,
    setRoomNotices,
    setRoomOpen,
    setRoomRuling,
    setRoomTargetId,
    setScreen,
  });

  /**
   * Open a place's pin.
   *
   * THE MAP LEADS TO PLACES, and this is the press that says so. It used to be
   * that a villager's own house was a door into their conversation and every other
   * place on the map was decoration; a place is where the village's business
   * happens, so the pin is the door and the place decides what is behind it.
   *
   * Every place offers both its details and an entrance. When nobody is present,
   * Enter opens the place's own action view; otherwise it opens the Common Space.
   */
  const openVenue = useOpenVenue({
    openPlace,
    explorationOrigin,
    explorationReturnTab,
    setExploreSheet,
    setMovePrivateZoneId,
    setOpenPlaceId,
    setPlayerMovePrivateZoneId,
    setScreen,
  });

  /**
   * Step back out of a place and onto the map.
   *
   * There is no state to unwind beyond the two fields, because standing in a place
   * sets nothing: the screen and the id are the whole of it, and the id is cleared
   * so a stale one cannot be drawn for a frame while the map comes back.
   */
  const leaveVenue = useLeaveVenue({
    screen,
    venueId,
    element,
    explorationOrigin,
    explorationReturnTab,
    venueReturnTo,
    setExploreSheet,
    setOpenPlaceId,
    setScreen,
    setVenueEditDraft,
    setVenueId,
    setVenuePage,
    setVenueProposalDraft,
    setVenueZoneKey,
  });

  const saveSettings = useSaveSettings({
    snapshot,
    knowledgeDraft,
    lorebookDraft,
    loreTokenBudgetDraft,
    visualLoreDefault,
    personaDraft,
    setBusy,
    setSettingsError,
    setSnapshot,
    settingDraft,
    acceptSavedSettings,
  });

  const spriteVisualSettings = useSpriteVisualSettings({ snapshot, setSnapshot, setBusy });

  const saveScenerySettings = useSaveScenerySettings({
    sceneryStyle,
    sceneryStyleProfileId,
    personalizeHomes,
    snapshot,
    setBusy,
    setSettingsError,
    setSnapshot,
  });

  const saveBackgroundPace = useSaveBackgroundPace({ setBusy, setSettingsError, setSnapshot, snapshot });

  const saveSendOnEnter = useSaveSendOnEnter({ setBusy, setSettingsError, setSnapshot, snapshot });

  /**
   * Ask the model for places again. Deliberately a separate button from Save:
   * the call is slow and can fail on its own, and its result replaces the
   * venue editor wholesale, which is a decision the player should make
   * explicitly rather than have happen on every save.
   */
  const suggestPlaces = useSuggestPlaces({ setBusy, setSettingsError, setVenuesDraft, snapshot });

  // ── Town map ───────────────────────────────────────────────────────────────
  useFoundingMapReceipt({
    visible,
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
  });

  const generateSetupTownMap = useFoundingGenerateSetupTownMap({
    mapVisualLore,
    persistSetupDraft,
    sceneryStyle,
    sceneryStyleProfileId,
    setSetupMapBusy,
    setSetupMapProblem,
    setSetupProblem,
    setupDraftData,
    setupLorebookDraft,
    setupLoreTokenBudgetDraft,
    setupMapGenerationKey,
    setupMapNegativePrompt,
    setupMapPrompt,
    setupMapRequestRef,
    setupSetting,
    setupWorldFacts,
    snapshot,
    updateSetupMapRequest,
  });

  const pickSetupTownMap = usePickSetupTownMap({
    setSetupMapBusy,
    setSetupMapImage,
    setSetupMapImageSource,
    setSetupMapProblem,
    setSetupMapReviewed,
    setSetupMapSize,
    setSetupMapSource,
    snapshot,
    updateSetupMapRequest,
  });

  // The picture is stored whole, exactly as it was picked. Re-encoding a big
  // one down to fit would be the same mistake as truncating an over-long prompt
  // box, so a file that will not fit is refused with both sizes in the message
  // instead.
  // ── Pictures of the places ─────────────────────────────────────────────────
  // These handlers serve player-requested draws, uploads, and removal. First
  // entry to a private space can also start one background draw on the server.
  //
  // The bytes never come back through here either. Both ways in upload to the
  // Engine's own gallery and hand back the address the picture landed at, which
  // is the whole of what the village stores — so twenty pictured places cost a
  // village twenty short strings and nothing else.
  //
  // No connection is named on these calls. The village's own choice, then the
  // agent's, then the Engine's own default is a chain the server resolves, and
  // repeating it here would be a second answer to a question already answered.

  /** Draw a picture for one place. The only path in this package that spends money. */
  const drawPlaceImage = useDrawPlaceImage({
    placeBusyId,
    setPlaceBusyId,
    setPlaceProblem,
    setSettingsError,
    setSnapshot,
  });

  /**
   * Keep a picture the player already has.
   *
   * The file is sent whole. Shrinking somebody's photograph to make it fit
   * would be the same mistake as truncating an over-long prompt box, so a file
   * that will not fit is refused here with both sizes in the message — and it
   * is refused before it is encoded, because a picture that is going to be
   * turned down should not first be made a third larger.
   */
  const keepPlaceImage = useKeepPlaceImage({
    placeBusyId,
    setPlaceBusyId,
    setPlaceProblem,
    setSettingsError,
    setSnapshot,
    snapshot,
  });

  /**
   * Stop showing a place's picture.
   *
   * The village is told, and the gallery is not. What was uploaded is a picture
   * in the player's own library now, and a village tidying up after itself by
   * deleting somebody's art from a folder they can see would be the village
   * deciding what an image is for. Everything under the Villages folder is
   * theirs to keep, reuse or throw away from the Engine's own gallery.
   */
  const dropPlaceImage = useDropPlaceImage({
    placeBusyId,
    setPlaceBusyId,
    setPlaceProblem,
    setSettingsError,
    setSnapshot,
  });

  // ── Houses on the map ──────────────────────────────────────────────────────
  // A house is a place: it is on the same list as the mill and the harbour, and
  // the map pins it the same way. What makes it a house is that it has a building
  // and somebody living in it — see `isHouse` — and a house nobody has moved into
  // yet is a normal thing for a village to have.
  /**
   * How many places the village holds with the draft list in it, which is what the
   * ceiling is really checked against: the houses the village has, plus the
   * destinations as the panel currently has them. One count for one list, because
   * a house spends a place like anything else does.
   */
  const placeCount = calculatePlaceCount({ snapshot, venuesDraft });

  const placeSetupPin = usePlaceSetupPin({
    movingSetupVenueId,
    setMovingSetupVenueId,
    setSetupMapReviewed,
    setSetupPlacementError,
    setSetupVenues,
    setSetupWorkspace,
    setupEditorOpen,
    setupMapBusy,
    setupMapSrc,
    setupVenuesRef,
    setupWorkspace,
  });

  const patchSetupVenue = usePatchSetupVenue({ setSetupAuthoredFields, setSetupVenues });

  // ── Founding the village ───────────────────────────────────────────────────
  // The wizard collects place, the description, map, and residents before
  // writing the village. A half-answered setup never claims to be founded.

  /**
   * Open the wizard.
   *
   * `fresh` hands it an empty village, which is what "start over" needs. Without
   * it the wizard is seeded from the village as it stands, so running setup
   * again is a chance to redraw the map rather than a second chance to lose it.
   */
  const openSetup = useOpenSetup({
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
    setSetupWorldFacts,
    setVisualLoreDefault,
    updateSetupMapRequest,
  });

  const gotoSetupStep = createFoundingGotoSetupStep({
    setupResidentAdmissions,
    setSetupResidentAdmissions,
    setupWorldName,
    setSetupMapReviewed,
    catalog,
    connectionSetupProblem,
    loadCatalog,
    loadLorebooks,
    loadPersonas,
    personaDraft,
    personas,
    residentContextProblem,
    setMovingSetupVenueId,
    setSetupEditorOpen,
    setSetupProblem,
    setSetupStep,
    get setupBlocker() {
      return setupBlocker;
    },

    setupFoundingVillagerIds,
    setupHomeCount,
    setupMapBusy,
    setupMapSrc,
    setupName,
    setupPlayerBackground,
    setupSetting,
    setupStep,
    setupSuggestionsBusy,
    setupVenueBusy,
    snapshot,
  });

  const setupDraftRow = createFoundingSetupDraftRow();

  const generateSetupImage = createFoundingGenerateSetupImage({
    element,
    personaDraft,
    personalizeHomes,
    sceneryStyle,
    sceneryStyleProfileId,
    selectedResidentAdmissions,
    setSelectedSetupVenueId,
    setSetupImageTarget,
    setSetupProblem,
    setSetupVenueBusy,
    setSetupVenues,
    setupDraftRow,

    setupImageClaim,
    setupImageContextKey,
    setupImageContextKeyRef,
    setupImageTargetRef,

    setupLorebookDraft,
    setupLoreTokenBudgetDraft,
    setupName,
    setupSetting,
    setupVenuesRef,
    setupWorldFacts,
    snapshot,
    visualLoreDefault,
    get withSetupImage() {
      return withSetupImage;
    },
  });

  const uploadSetupImage = createFoundingUploadSetupImage({
    patchSetupVenue,
    setSetupImageTarget,
    setSetupProblem,
    setSetupVenueBusy,
    setupBeginningSourceKey,
    setupBeginningSourceKeyRef,
    setupImageClaim,
    setupImageTargetRef,
    setupVenuesRef,
    snapshot,
    get withSetupImage() {
      return withSetupImage;
    },
  });

  const withSetupImage = createFoundingWithSetupImage();

  /** Why the wizard cannot finish yet, or "" when it can. Checked here as well as on the server so the player is told before a request is made. */
  const setupBlocker = useFoundingSetupBlocker({
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
    setupWorldFacts,
    snapshot,
  });

  const foundVillage = useFoundVillage({
    setupSpriteRevisions,
    draftSaveQueue,
    element,
    flushSetupDraft,
    mapVisualLore,
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

    setupFoundingVillagerIds,
    setupLorebookDraft,
    setupLoreTokenBudgetDraft,
    setupMapSrc,
    setupName,
    setupTimeZone,
    setupPlayerBackground,
    setupWorldName,
    setupSetting,
    setupVenues,
    snapshot,
    visualLoreDefault,
  });

  /** The destructive half of the pair the General settings panel offers. */
  const startOver = useFoundingStartOver({
    draftRevision,
    draftSaveQueue,
    openSetup,
    setBusy,
    setCatalog,
    setDraftReady,
    setResetArmed,
    setSavedSetupDraft,
    setSettingsError,
    setSnapshot,
  });

  useFoundingDraftOffer({
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
  });

  useFoundingPreparationPolling({
    visible,
    canPlay: snapshot?.foundingPreparation?.canPlay,
    status: snapshot?.foundingPreparation?.status,
    screen,
    setPreparationProblem,
    setScreen,
    setSnapshot,
  });

  const retryPreparation = useRetryPreparation({ setPreparationProblem, setSnapshot });

  // ── Venue editor ───────────────────────────────────────────────────────────
  // Rows are keyed by a client-side id; the server accepts or mints its own, so
  // a hand-added row can be edited and removed without ever having been saved.
  //
  // It edits the places you can be sent to and not the houses, because the two
  // are edited in different places for good reasons: a house is a spot on a map
  // and a destination has a name and Class. Each row saves by its
  // own id, so an older panel cannot replace a newly approved destination.
  const addVenue = () => {
    projectsController.setSelectedId("");
    projectsController.setDraftType("new-venue");
    openMenu("projects");
  };

  const saveVenue = useSaveVenue({
    openMenu,
    setBusy,
    setSettingsError,
    setSnapshot,
    setVenueEditDraft,
    setVenuesDraft,
    snapshot,
  });

  const removeVenue = useRemoveVenue({ setBusy, setSettingsError, setSnapshot, setVenuesDraft, snapshot });

  const decideVenueRequest = useDecideVenueRequest({
    snapshot,
    requestEdits,
    setBusy,
    setRequestEdits,
    setSettingsError,
    setSnapshot,
    setVenuesDraft,
  });

  const { generateRequestDescription, completeResidenceMove, decideResidenceMove } = useVenueRequestCommands({
    snapshot,
    setBusy,
    setSettingsError,
    setSnapshot,
    setRequestEdits,
  });

  const venueScreenCommands = useVenueScreenCommands({
    snapshot,
    screen,
    venueId,
    venuePage,
    venueZoneKey,
    setBusy,
    setSettingsError,
    setSnapshot,
    setVenueEditBusy,
    setVenueEditError,
    setVenueEditNotice,
    setVenueEditDraft,
    setVenueProposalDraft,
    setPlaceProblem,
  });

  /**
   * Everybody the tab can currently draw a face for, as one string.
   *
   * A string rather than the list, because the list is rebuilt on every render —
   * the snapshot is re-read on a timer and after every message, and `filter`
   * above returns a fresh array each time — and an effect keyed on an array that
   * is new every render is an effect that runs every render. Joined, it only
   * changes when the SET of people changes, which is the only thing the read
   * below cares about.
   *
   * The picker's own list is only in here while the picker is open. Reading
   * pictures for a list nobody is looking at is the one kind of work this could
   * do that the player would never see the result of.
   */
  const portraitWanted = calculatePortraitWanted({ catalog, screen, setupStep, snapshot });

  /**
   * The faces behind everybody the tab can draw.
   *
   * One call for the whole list rather than one per villager: the Engine's
   * summary route takes ids in a batch, and a village of twelve asking twelve
   * times is twelve chances to be slow for nothing. Only ids nobody has asked
   * about travel, so opening the picker over a list already on screen costs no
   * call at all, and a search that narrows it costs one small call for whoever
   * has just become visible.
   *
   * Nothing here fails loudly. A picture that could not be read is a villager
   * wearing their initial, which is what they wore before any of this existed —
   * there is no error state to reach and no action the player could take, so a
   * failed read is dropped rather than reported. A character who has since been
   * deleted from the library answers with no row and is remembered as having
   * been asked, so the absence is not re-asked for either.
   */
  useResidentPortraits({ portraitsAsked, portraitWanted, setPortraits });

  /**
   * The picture of the Persona the player is being, or nothing.
   *
   * Held here rather than in the drawer because it is a fact about the village's
   * player rather than about the room: the same Persona walks into every
   * conversation, so reading it again on every door would be the same address
   * fetched once per villager.
   *
   * The drawer draws it on the player's own turns in the card and falls back to
   * the Engine's person mark when there is none — see `AvatarFace`. Null is
   * therefore an ordinary value with a drawing behind it, and not a state: a
   * village played as the name the wizard took, a Persona with no portrait and a
   * Persona since deleted all leave this null and all draw the same mark.
   *
   * The read is dropped with a change of Persona, which is the whole point of
   * keying the effect on the id: a player who switches who they are must not be
   * shown the last one's face for as long as the new one takes to arrive. The id
   * travels through `encodeURIComponent` inside the read itself, because it is a
   * stored value and this tab does not get to decide what is in it.
   */
  const personaPortraitId = calculatePersonaPortraitId({ snapshot });

  usePersonaPortrait({ personaPortraitId, setPersonaPortrait });

  /**
   * The name behind a character id, for a home that is still being placed.
   *
   * The library is asked first because the wizard assigns houses before anyone
   * has moved in, and the reply to moving in is what fills the snapshot in
   * afterwards.
   */
  const nameOfCharacter = useResidentsNameOfCharacter({ catalog, snapshot });

  /**
   * Every placed Venue uses its public photograph or a plain placeholder.
   * Keep legacy MapPin identifiers for callers; the presentation is always a Polaroid.
   * Unplaced Venues remain available in play without guessing map coordinates.
   */
  const venueExplorationActions = createVenueExplorationActions({
    openMenu,
    openPlace,
    openRoom,
    setExploreSheet,
    setFocusedProjectId,
    setSiteProjectId,
    snapshot,
  });

  const savedPins: MapPin[] = calculateSavedPins({
    mapId: selectedMap?.id,
    mobile,
    nameOfCharacter,
    openPlaceId,
    openVenue,
    snapshot,
  });

  const draftPins: MapPin[] = calculateDraftPins({
    selectedSetupVenueId,
    setMovingSetupVenueId,
    setSelectedSetupVenueId,
    setSetupEditorOpen,
    setSetupWorkspace,
    setupAuthoredFields,
    setupEditorAuthoredOriginal,
    setupEditorOriginal,
    setupEditorZoneOriginal,
    setupVenues,
    setupZoneDrafts,
  });
  const repairController = useRepairController(screen === "menu" && menuPage === "repair", async (kind) => {
    setMemoryLibrary(null);
    setAgendas([]);
    await loadSnapshot();
    if (kind === "restore") {
      const { session } = await request<{ session: import("../../shared/contracts/village.js").SceneView | null }>(
        "/rooms/active",
      );
      if (session) {
        const kept =
          room?.id !== session.id && roomDraft ? { title: room?.placeName ?? "Previous Scene", text: roomDraft } : null;
        if (room?.id !== session.id) setRoomDraft("");
        roomCompletionRef.current = null;
        observedRoomIdRef.current = "";
        setRoom(session);
        setRoomEnded(false);
        setRoomOpen(true);
        setRoomMode("chat");
        return kept;
      }
    } else if (roomOpen && room) {
      const { session } = await request<{ session: import("../../shared/contracts/village.js").SceneView | null }>(
        "/rooms/active",
      );
      if (session?.id === room.id) setRoom(session);
    }
    return null;
  });
  return {
    repairController,
    selectedMap,
    setSelectedMapId,
    showAllMaps,
    setShowAllMaps,
    returnToScene: () => setScreen("room"),
    setupSpriteRevisions,
    setSetupSpriteRevisions,
    sceneRestoration,
    ...venueScreenCommands,
    element,
    visible,
    addVenue,
    agendas,
    applyVillagerRefresh,
    backgroundPanel,
    writing,
    busy,
    catalog,

    closeExploration,
    closeRoom,
    composerEditVersionRef,
    connectionSetupProblem,
    continueRoomWithoutGreeting,
    debugDiscardEnabled,
    decideVenueRequest,
    generateRequestDescription,
    completeResidenceMove,
    decideResidenceMove,
    discardRoomDebug,
    dismissRoomNotice,
    draftPins,
    draftSaveError,
    draftSavedAt,
    draftSaving,
    drawPlaceImage,
    dropPlaceImage,
    error,
    exitSetupDraft,
    explorationOrigin,
    explorationReturnTab,
    explorationSearch,
    exploreSheet,
    focusedProjectId,
    projectsController,
    forgetMemory,
    foundVillage,
    generateSetupImage,
    generateSetupTownMap,
    goHome,
    gotoSetupStep,
    greetRoom,
    homeBuildings,
    keepPlaceImage,
    knowledgeDraft,
    lastSceneEnding,
    leaveRoom,
    leaveVenue,
    loadMemoryLibrary,
    loadSnapshot,
    loreTokenBudgetDraft,
    lorebookDraft,
    lorebooks,
    lorebooksError,
    mailboxOpen,
    mapVisualLore,
    memoryLibrary,
    menuPage,
    menuSection,
    connections,
    mobile,
    movePrivateZoneId,
    moveRoom,
    moveTargetId,
    movingSetupVenueId,
    nameOfCharacter,
    navigationView,
    newSetupDraft,
    openMenu,
    openPerson,
    openPlace,
    openPlaceId,
    openRoom,
    openSetup,
    openVenue,
    patchSetupVenue,
    personProfile,
    personaDraft,
    personaPortrait,
    personalizeHomes,
    personas,
    pickSetupTownMap,
    pickerOpen,
    placeBusyId,
    placeCount,
    placeProblem,
    placeSetupPin,
    placingProjectId,
    playerMovePrivateZoneId,
    portraits,
    preparationProblem,
    previewVillagerRefresh,
    profileOrigin,
    progressDebug,
    refreshBusyId,
    refreshPreviews,
    removeVenue,
    requestEdits,
    resetArmed,
    restoreSetupDraft,
    retryPreparation,
    retrySavedScene,
    retrySetupSaving,
    retryWork,
    rewriteAgenda,
    room,
    roomBusy,
    roomChangeStatus,
    roomContactBoundary,
    roomDraft,
    roomEnded,
    roomError,
    roomGreetingError,
    roomGreetingNotice,
    roomLeaveSubmissionIdRef,
    roomMode,
    legacyRecovery,
    setLegacyRecovery,
    roomMoveOperationIdRef,
    roomMoveZoneId,
    roomNotices,
    sceneReading,
    roomOpen,
    roomRuling,
    setRoomRuling,
    roomSubmissionIdRef,
    roomTargetId,
    roomUnresolvedChanges,
    saveScenerySettings,
    spriteVisualSettings,
    saveSendOnEnter,
    saveSettings,
    saveBackgroundPace,
    saveVenue,
    savedPins,
    savedSetupDraft,
    savedTownMapShape,
    savedTownMapView,
    sceneryStyle,
    sceneryStyleProfileId,
    screen,
    search,
    selectedResidentAdmissions,
    selectedSetupVenueId,
    sendRoom,
    turnRecovery,
    checkSavedReply,
    replyPending,
    setAgendaScheduleIngestion,
    setBusy,
    setConnectionSetupProblem,
    setError,
    setExplorationSearch,
    setExploreSheet,
    setFocusedProjectId,
    setFocusedRequestId,
    setKnowledgeDraft,
    setLoreTokenBudgetDraft,
    setLorebookDraft,
    setMailboxOpen,
    setMapVisualLore,
    setMemoryLibrary,
    setMenuPage,
    setMovePrivateZoneId,
    setMoveTargetId,
    setMovingSetupVenueId,
    setNavigationView,
    setOpenPlaceId,
    setPersonProfile,
    setPersonaDraft,
    setPersonalizeHomes,
    setPickerOpen,
    setPlaceProblem,
    setPlacingProjectId,
    setPlayerMovePrivateZoneId,
    setProfileInspection,
    loadProgressDebug,
    setRequestEdits,
    setResetArmed,
    setRoom,
    setRoomBusy,
    setRoomContactBoundary,
    setRoomContactKind,
    setRoomDraft,
    setRoomError,
    setRoomMode,
    setRoomMoveZoneId,
    setRoomTargetId,
    setSceneryStyle,
    setSceneryStyleProfileId,
    setScreen,
    setSearch,
    setSelectedSetupVenueId,
    setSettingDraft,
    setSettingsError,
    setSetupEditorOpen,
    setSetupFocusIssue,

    setSetupFoundingVillagerIds,
    setSetupKeyboardSpot,
    setSetupLoreTokenBudgetDraft,
    setSetupLorebookDraft,
    setSetupMapBusy,
    setSetupMapGeneratedKey,
    setSetupMapNegativePrompt,
    setSetupMapProblem,
    setSetupMapPrompt,
    setSetupMapReviewed,
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
    setSetupWorldFacts,
    setSiteProjectId,
    setSnapshot,
    setSpriteManagerId,
    setVenueEditBusy,
    setVenueEditDraft,
    setVenueEditError,
    setVenueEditNotice,
    setVenueId,
    setVenuePage,
    setVenueProposalDraft,
    setVenueSearch,
    setVenueZoneKey,
    setVisualLoreDefault,
    settingDraft,
    settingsError,
    setupBeginningSourceKey,
    setupEditorOpen,
    setupFocusIssue,

    setupFoundingVillagerIds,
    setupImageClaim,
    setupImageTarget,
    setupKeyboardSpot,
    setupLoreTokenBudgetDraft,
    setupLorebookDraft,
    setupMapBusy,
    setupMapGeneratedKey,
    setupMapGenerationKey,
    setupMapImageSource,
    setupMapNegativePrompt,
    setupMapProblem,
    setupMapPrompt,
    setupMapRequest,
    setupMapReviewed,
    setupMapShape,
    setupMapSize,
    setupMapSource,
    setupMapSrc,
    setupName,
    setupTimeZone,
    setSetupTimeZone,
    setupPlacementError,
    setupPlayerBackground,
    setupProblem,
    setupResidentAdmissions,
    setupWorldName,
    setupSetting,
    setupShowIssues,
    setupStep,
    setupSuggestionsBusy,
    setupSuggestionsClaim,
    setupSuggestionsKey,
    setupVenueBusy,
    setupVenues,
    setupWorkspace,
    setupWorldFacts,
    siteProjectId,
    snapshot,
    spriteLeaveGuard,
    spriteManagerId,
    spriteProfileScroll,
    standingAt,
    startOver,
    suggestPlaces,
    suggestSetupVenues,
    townMapImage,
    updateSetupMapRequest,
    uploadSetupImage,
    venueEditBusy,
    venueEditDraft,
    venueEditError,
    venueEditNotice,
    venueExplorationActions,
    venueId,
    venueSection,
    setVenueSection,
    planVenueRenovation: (place: VillageVenue) => {
      if (projectsController.startRenovation(place)) openMenu("projects");
    },
    openVenueProject: (id: string) => {
      openMenu("projects");
      setFocusedProjectId(id);
    },
    housingVenueId,
    setHousingVenueId,
    openVenueRequests: (venueId: string) => {
      setHousingVenueId(venueId);
      openMenu("venueRequests");
    },
    venuePage,
    venueProposalDraft,
    venueSearch,
    venueZoneKey,
    venuesDraft,
    visualLoreDefault,
  };
}
