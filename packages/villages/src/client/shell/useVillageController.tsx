import type {
  CatalogEntry,
  PersonaEntry,
  ProgressDebugView,
  TownMapView,
  VillageLorebookOption,
  VillageSnapshot,
} from "../../shared/contracts/village.js";
import { useResidentsRetryWork } from "../features/background/actions.js";
import { BackgroundWorkPanel } from "../features/background/BackgroundPanel.js";
import {
  useCloseExploration,
  useDiscardTownMapDraft,
  useDrawPlaceImage,
  useDropPlaceImage,
  useGenerateReplacementMap,
  useKeepPlaceImage,
  useOpenPlace,
  usePickTownMap,
  useSaveTownMap,
  useStartMapReplacement,
} from "../features/exploration/actions.js";
import {
  calculateFramingMap,
  calculatePanelMapView,
  calculateSavedPins,
  calculateSavedTownMapShape,
  calculateSavedTownMapView,
  calculateTownMapAdvice,
  calculateTownMapShape,
  calculateTownMapSrc,
  calculateTownMapZoom,
} from "../features/exploration/calculations.js";
import {
  useExplorationOutsideClick,
  useMapNavigationReset,
  useRemovedVenueNavigation,
  useTownMapImage,
} from "../features/exploration/controller-hooks.js";
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
  calculateSetupMapProgress,
  calculateSetupMapSeconds,
  calculateSetupMapShape,
  calculateSetupMapSrc,
} from "../features/founding/calculations.js";
import {
  useFoundingAuthoredReference,
  useFoundingBeginningReference,
  useFoundingImageContext,
  useFoundingMapClock,
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
import type { SetupDraftData } from "../features/founding/draft-model.js";
import {
  createFoundingGenerateSetupImage,
  createFoundingSetupDraftRow,
  createFoundingUploadSetupImage,
  createFoundingWithSetupImage,
  useFoundingGenerateSetupTownMap,
} from "../features/founding/image-controller.js";
import { useFoundingState } from "../features/founding/useFoundingState.js";
import type { SavedFoundingDraft } from "../features/founding/villages-founding-draft.js";
import {
  createFoundingChooseSetupScenario,
  createFoundingGotoSetupStep,
  createFoundingSuggestSetupVenues,
  useFoundingStartOver,
} from "../features/founding/setup-controller.js";
import { useProjectsState } from "../features/projects/useProjectsState.js";
import {
  useAddVillager,
  useApplyVillagerRefresh,
  useCorrectCompletedWish,
  useForgetMemory,
  useLoadAgendas,
  useLoadMemoryLibrary,
  usePreviewVillagerRefresh,
  useRemoveVillager,
  useRewriteAgenda,
  useSetAgendaScheduleIngestion,
} from "../features/residents/actions.js";
import {
  calculateNeedle,
  calculatePersonaPortraitId,
  calculatePortraitWanted,
  calculateVisibleCatalog,
} from "../features/residents/calculations.js";
import {
  useResidentAgendaPolling,
  useResidentInspection,
  useResidentsNameOfCharacter,
  useResidentsStandingAt,
} from "../features/residents/controller-hooks.js";
import { useResidentsState } from "../features/residents/useResidentsState.js";
import {
  usePersonaPortrait,
  useResidentPickerLoad,
  useResidentPortraits,
  useResidentsLoadCatalog,
} from "../features/residents/workflow-controller.js";
import {
  useCloseRoom,
  useContinueRoomWithoutGreeting,
  useDeleteArchivedVisits,
  useDiscardRoomDebug,
  useDismissRoomNotice,
  useGreetRoom,
  useLeaveRoom,
  useMoveRoom,
  useOpenRoom,
  useOpenVisit,
  useReceiveRoomRecordEvents,
  useRetrySavedScene,
  useSendRoom,
} from "../features/scenes/actions.js";
import {
  useActiveSceneRestoration,
  useSceneArchive,
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
  useAddNotice,
  useInsertMacro,
  useRemoveNotice,
  useSaveCharacterSpeechColors,
  useSaveSendOnEnter,
  useSaveSettings,
  useSaveSpriteCardFlip,
  useSaveStoryPace,
  useSaveVisitRetention,
} from "../features/settings/actions.js";
import { useSettingsState } from "../features/settings/useSettingsState.js";
import { useKnowledgeCaret } from "../features/settings/workflow-controller.js";
import {
  useAddVenue,
  useDecideVenueRequest,
  useLeaveVenue,
  useOpenVenue,
  useRemoveVenue,
  useSaveVenue,
} from "../features/venues/actions.js";
import { useVenueRequestFocus } from "../features/venues/controller-hooks.js";
import { useVenuesState } from "../features/venues/useVenuesState.js";
import { useVenueZoneSelection } from "../features/venues/zone-selection.js";
import {
  useInitialVillageLoad,
  useLoadLorebooks,
  useLoadPersonas,
  useLoadVillageSnapshot,
  usePendingWorkPolling,
  useReconcileVillage,
  useSnapshotReference,
  useVillagePolling,
  useVillagePresence,
  useVillageTransitions,
  useWriteVillageEvent,
} from "../shared/data-controller.js";
import type { MapFrameShape, MapPin, MapZoomRange, MenuPage, Portrait } from "../shared/types.js";
import { useScenesOpenMenu } from "./navigation-actions.js";
import { useNavigationGoHome, useNavigationOpenPerson } from "./navigation-controller.js";
import { menuCategory } from "./navigation.js";
import { useLayoutEffect, useRef, useState } from "react";

export function useVillageController({ element }: { element: HTMLElement }) {
  const [mobile, setMobile] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const box = element.getBoundingClientRect();
      setMobile(box.width <= 704 || (box.width <= 880 && box.height <= 512));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  const [snapshot, setSnapshot] = useState<VillageSnapshot | null>(null);

  const homeBuildings = snapshot?.settings.homeBuildings ?? [];

  const [catalog, setCatalog] = useState<CatalogEntry[] | null>(null);
  const {
    memoryLibrary,
    setMemoryLibrary,
    agendas,
    setAgendas,
    personProfile,
    setPersonProfile,
    profileInspection,
    setProfileInspection,
    rosterSearch,
    setRosterSearch,
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
    spriteFlipSaving,
    setSpriteFlipSaving,
    spriteFlipDraft,
    setSpriteFlipDraft,
    spriteFlipError,
    setSpriteFlipError,
    portraitsAsked,
  } = useResidentsState();

  const {
    venueVisits,
    setVenueVisits,
    archiveTotal,
    setArchiveTotal,
    archiveOffset,
    setArchiveOffset,
    archiveVersion,
    setArchiveVersion,
    openArchivedVisit,
    setOpenArchivedVisit,
    _endFailed,
    setEndFailed,
    archiveVenueId,
    setArchiveVenueId,
    archiveVillagerId,
    setArchiveVillagerId,
    archiveError,
    setArchiveError,
    mailboxOpen,
    setMailboxOpen,
    roomOpen,
    setRoomOpen,
    roomDraft,
    setRoomDraft,
    roomMode,
    setRoomMode,
    roomContactBoundary,
    setRoomContactBoundary,
    roomContactKind,
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
    lastRoomActivitySentRef,
    lastRoomDeliberateAtRef,
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
    writeUpNote,
    setWriteUpNote,
  } = useScenesState();

  const [progressDebug, setProgressDebug] = useState<ProgressDebugView | null>(null);

  const [pickerOpen, setPickerOpen] = useState(false);

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
  const [screen, setScreen] = useState<
    "home" | "menu" | "setup" | "resume" | "preparing" | "venue" | "room" | "person"
  >("home");

  useSceneViewport(element, screen === "room");
  const {
    focusedProjectId,
    setFocusedProjectId,
    focusedRequestId,
    setFocusedRequestId,
    placingProjectId,
    setPlacingProjectId,
    siteProjectId,
    setSiteProjectId,
  } = useProjectsState();

  const {
    venueId,
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
    selectedMapVenueId,
    setSelectedMapVenueId,
    placingMapVenueId,
    setPlacingMapVenueId,
    mapReplaceOpen,
    setMapReplaceOpen,
    mapRemoveDraft,
    setMapRemoveDraft,
    mapGenerating,
    setMapGenerating,
    mapExpectedSetAt,
    setMapExpectedSetAt,
    mapBasePositions,
    setMapBasePositions,
    mapPinDraft,
    setMapPinDraft,
    townMapImage,
    setTownMapImage,
    townMapPick,
    setTownMapPick,
    townMapDraft,
    setTownMapDraft,
    reframingMap,
    setReframingMap,
  } = useExplorationState();

  useExplorationViewport(element, mobile && screen === "home");

  const explorationMapKey = snapshot
    ? JSON.stringify([
        snapshot.isFounded,
        snapshot.settings.townMapImageSetAt,
        snapshot.settings.townMapExpectedWidth,
        snapshot.settings.townMapExpectedHeight,
      ])
    : "";

  useMapNavigationReset({ explorationMapKey, setExploreSheet, setNavigationView });

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

  useVenueRequestFocus({ element, focusedRequestId, menuPage, screen });

  const menuSection = menuCategory(menuPage);

  const openPerson = useNavigationOpenPerson({
    element,
    profileOrigin,
    get setError() {
      return setError;
    },
    setPersonProfile,
    setProfileInspection,
    setScreen,
    setSpriteManagerId,
    spriteLeaveGuard,
  });
  const {
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
    noticeDraft,
    setNoticeDraft,
    settingsError,
    setSettingsError,
    knowledgeRef,
  } = useSettingsState();

  /**
   * The player's own face, for the card's read of their own turns.
   *
   * Not in `portraits` beside the villagers, because it is not keyed the same
   * way and does not come from the same route: a villager's picture is the
   * Engine's character library keyed by character id, and the player's is the
   * Engine's Persona — a different record, with a different picture, read through
   * a different endpoint. One object rather than a map, because there is only
   * ever one of them: the Persona this village is written against. See the effect
   * that fills it, and `AvatarFace` for what is drawn when it is null.
   */
  const [personaPortrait, setPersonaPortrait] = useState<Portrait | null>(null);

  const [search, setSearch] = useState("");

  /**
   * The Personas on offer, or null while they are being read. `null` rather
   * than an empty list because "still reading" and "you have none" are two
   * different things to say, and only one of them is the player's fault.
   */
  const [personas, setPersonas] = useState<PersonaEntry[] | null>(null);
  const {
    setupLorebookDraft,
    setSetupLorebookDraft,
    setupLoreTokenBudgetDraft,
    setSetupLoreTokenBudgetDraft,
    setupStep,
    setSetupStep,
    setupName,
    setSetupName,
    setupSetting,
    setSetupSetting,
    setupFoundingReason,
    setSetupFoundingReason,
    setupFoundingDetails,
    setSetupFoundingDetails,
    setupFoundingGuidance,
    setSetupFoundingGuidance,
    setupPlayerRole,
    setSetupPlayerRole,
    setupImprint,
    setSetupImprint,
    setupWorldFacts,
    setSetupWorldFacts,
    setupVenues,
    setSetupVenues,
    setupFoundingVillagerIds,
    setSetupFoundingVillagerIds,
    setupResidentContexts,
    setSetupResidentContexts,
    setupRoleExpanded,
    setSetupRoleExpanded,
    setupKeyboardSpot,
    setSetupKeyboardSpot,
    setupEditorOpen,
    setSetupEditorOpen,
    setupEditorOriginal,
    setupEditorAuthoredOriginal,
    setupEditorZoneOriginal,
    sceneryStyle,
    setSceneryStyle,
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
    setupMapOptions,
    setSetupMapOptions,
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
    setupMapClock,
    setSetupMapClock,
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
  const [savedSetupDraft, setSavedSetupDraft] = useState<SavedFoundingDraft<SetupDraftData> | null>(null);

  const [lorebooks, setLorebooks] = useState<VillageLorebookOption[] | null>(null);

  const [lorebooksError, setLorebooksError] = useState("");

  // Which home the next click on the map will place, and which pin the editor is
  // pointing at so the row and the map agree about what is being edited.
  const [_placingHome, setPlacingHome] = useState(false);

  const [_placingPublicCenter, setPlacingPublicCenter] = useState(false);

  const selectedResidentContexts = useFoundingSelectedResidentContexts({
    setupFoundingVillagerIds,
    setupResidentContexts,
  });

  const residentContextProblem = calculateResidentContextProblem({ selectedResidentContexts, snapshot });

  const setupHomeCount = calculateSetupHomeCount({ setupFoundingVillagerIds });

  const [, setSetupCompletedIds] = useState<string[]>([]);

  const [, setSetupNewVenueId] = useState("");

  const setupBeginningSourceKey = calculateSetupBeginningSourceKey({
    personaDraft,
    personalizeHomes,
    sceneryStyle,
    selectedResidentContexts,
    setupFoundingDetails,
    setupFoundingGuidance,
    setupFoundingReason,
    setupLorebookDraft,
    setupLoreTokenBudgetDraft,
    setupSetting,
    visualLoreDefault,
  });

  const setupBeginningSourceKeyRef = useRef(setupBeginningSourceKey);

  const setupImageContextKey = calculateSetupImageContextKey({
    personaDraft,
    personalizeHomes,
    setupBeginningSourceKey,
    setupImprint,
    setupName,
    setupWorldFacts,
    visualLoreDefault,
  });

  const setupImageContextKeyRef = useRef(setupImageContextKey);

  useFoundingImageContext({ setupImageContextKey, setupImageContextKeyRef });

  const setupVenuesRef = useRef(setupVenues);

  useFoundingVenueReference({ setupVenues, setupVenuesRef });

  useFoundingBeginningReference({ setupBeginningSourceKey, setupBeginningSourceKeyRef, snapshot });

  const setupMapGenerationKey = calculateSetupMapGenerationKey({
    mapVisualLore,
    sceneryStyle,
    setupLorebookDraft,
    setupMapNegativePrompt,
    setupMapOptions,
    setupMapPrompt,
    setupSetting,
    setupWorldFacts,
    snapshot,
  });

  const updateSetupMapRequest = useUpdateSetupMapRequest({ setSetupMapRequest, setupMapRequestRef });

  useFoundingMapClock({ setSetupMapClock, setupMapBusy });

  const setupMapSeconds = calculateSetupMapSeconds({ setupMapClock, setupMapRequest });

  const setupMapProgress = calculateSetupMapProgress({ setupMapSeconds });

  const [resetArmed, setResetArmed] = useState(false);

  /**
   * The framing the village has saved. The map is drawn with this everywhere
   * except in the panel's own preview, which draws the draft being tried out.
   */
  const savedTownMapView: TownMapView = calculateSavedTownMapView({ snapshot });

  /**
   * The shape a map is drawn at, as the settings give it. This is the one place
   * that answers "how big is a map", so the frame the picture is drawn in, the
   * advice beside the file box and the server all agree about it.
   */
  const savedTownMapShape: MapFrameShape | null = calculateSavedTownMapShape({ snapshot });

  const townMapShape: MapFrameShape | null = calculateTownMapShape({ savedTownMapShape, townMapPick });

  const setupMapShape: MapFrameShape | null = calculateSetupMapShape({
    setupMapImageSource,
    setupMapSize,
    setupMapSource,
    snapshot,
  });

  /** How far the picture may be magnified in the panel, and how far one press moves it. */
  const townMapZoom: MapZoomRange = calculateTownMapZoom({ snapshot });

  /**
   * The map as it is drawn: the picture being previewed in the panel, or the
   * village's own picture, or the one the package ships.
   */
  const townMapSrc = calculateTownMapSrc({ mapRemoveDraft, townMapImage, townMapPick });

  const setupMapSrc = calculateSetupMapSrc({ setupMapImage, setupMapImageSource, setupMapSource, townMapImage });

  const setupAuthoredFieldsRef = useRef(setupAuthoredFields);

  useFoundingAuthoredReference({ setupAuthoredFields, setupAuthoredFieldsRef });

  const pendingDraftSaves = useRef(0);

  const setupDraftData = useFoundingSetupDraftData({
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
  });

  const exitSetupDraft = createFoundingExitSetupDraft({
    flushSetupDraft,
    setScreen,
    setSetupEditorOpen,
    setSetupProblem,
    setupImageClaim,
    setupSuggestionsClaim,
  });

  const newSetupDraft = createFoundingNewSetupDraft({
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

  const suggestSetupVenues = createFoundingSuggestSetupVenues({
    personaDraft,
    selectedResidentContexts,
    setSetupProblem,
    setSetupSuggestionsBusy,
    setSetupSuggestionsKey,
    setSetupVenues,
    setupAuthoredFieldsRef,
    setupBeginningSourceKey,
    setupBeginningSourceKeyRef,
    setupFoundingDetails,
    setupImageTargetRef,
    setupLorebookDraft,
    setupLoreTokenBudgetDraft,
    setupSetting,
    setupSuggestionsClaim,
    setupVenues,
    setupVenuesRef,
  });

  /** Whether the panel is framing a picture: one just picked, or the saved one under revision. */
  const framingMap = calculateFramingMap({ reframingMap, townMapPick });

  /**
   * The framing the panel draws. Everywhere else draws the saved one, so the
   * draft never leaks out of the panel and the village is never seen wearing a
   * framing that has not been agreed to.
   */
  const panelMapView: TownMapView = calculatePanelMapView({ framingMap, savedTownMapView, townMapDraft });

  /** What is true of the picture being previewed, if the panel is holding one. */
  const townMapAdvice = calculateTownMapAdvice({ townMapPick });

  const [error, setError] = useState("");

  const [busy, setBusy] = useState(false);

  /**
   * The room the player is standing in, and whether it is on screen.
   *
   * A ROOM IS NOT A CONVERSATION, and the two are held apart on purpose: what is
   * in `conversation` belongs to one villager, is drawn by the villager's own
   * drawer and is held shut against the map while it is in hand; what is in `room`
   * belongs to a PLACE — everybody standing in it, and one list of what they all
   * said, which the village keeps under the place's own id. So a room can be walked
   * out of and back into with nothing lost and nothing parked, and the two drawers
   * never have to agree about which of them owns the map.
   *
   * `roomOpen` is a flag of its own for the same reason `chatOpen` is: the drawer
   * is animated by an attribute and a panel that is not there cannot slide.
   */
  const [room, setRoom] = useSceneRecord();

  /** Accept each server receipt once, regardless of which visit-ending path returned it. */
  const receiveRoomRecordEvents = useReceiveRoomRecordEvents({
    dismissedRoomEventIdsRef,
    seenRoomEventIdsRef,
    setRoomNotices,
  });

  useSceneChangesPolling({
    dismissedRoomEventIdsRef,
    receiveRoomRecordEvents,
    room,
    roomChangeStatus,
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

  /**
   * The next exact transition the server reported for schedules or atmosphere.
   *
   * A ref rather than state, because the poll reads and writes it on a timer and
   * storing it in state would resubscribe the timer every time it noticed
   * something. Empty until the first read, so opening the tab immediately asks
   * the server to reconcile any elapsed time.
   */
  const transitionRef = useRef("");

  /** Stops a second village write-up starting while one is already running. */
  const reconcilingRef = useRef(false);

  /**
   * True while a write-up the tab has asked for is still running.
   *
   * Only ever set after `SHOW_CATCHING_UP_AFTER_MS`, so a quick reconciliation
   * never flickers it. Opening a village that has been
   * unread for hours is the case it exists for: the tab is asking the village
   * to write about all of that time, which takes a while, and a player looking
   * at an unchanged map deserves to know it is being worked on rather than
   * broken.
   */
  const [catchingUp, setCatchingUp] = useState(false);

  const pendingCaretRef = useRef<number | null>(null);

  useKnowledgeCaret({ knowledgeDraft, knowledgeRef, pendingCaretRef });

  /**
   * Ask the village to write down whatever has happened since it last did.
   *
   * Safe to call whenever: the server advances from its exact high-water mark,
   * deduplicates stable opportunity ids, and spends no generation when there is
   * no eligible creative work.
   *
   * Called whenever the next exact transition changes. The package scheduler
   * uses the same endpoint while Marinara is running; reopening Marinara uses
   * this call to reconstruct elapsed time since the stored high-water mark.
   *
   * `force` is passed through untouched and is only ever true from the debug
   * menu; see `writeItUpNow`. An ordinary call sends no body at all, so the
   * request the tab makes on its own is exactly the request it made before
   * anything could force one.
   *
   * It returns the snapshot it read, or null when the call failed, because the
   * one caller that forces has to be able to say what actually happened rather
   * than assume it worked.
   */
  const currentSnapshotRef = useRef(snapshot);

  useSnapshotReference({ currentSnapshotRef, snapshot });

  const storyActionRef = useRef<{ id: string; expectedAttempt: number } | null>(null);

  const reconcile = useReconcileVillage({
    currentSnapshotRef,
    reconcilingRef,
    setCatchingUp,
    setSnapshot,
    storyActionRef,
  });

  /**
   * Ask for one creative village event right now, whatever Background events and wishes says.
   *
   * This debug action spends at most one model call and bypasses the daily pace
   * gate. The event must still fit a fact-backed opportunity and pass the same
   * validation as an automatic creative event.
   *
   * It reports what actually happened rather than that it finished. A forced
   * creative pass over already-covered facts may have nothing to add —
   * the window is deduped against, so it can only write what is genuinely new —
   * and a button that always said "done" would leave the player wondering
   * whether the feature was broken or the village was simply quiet.
   */
  const writeItUpNow = useWriteVillageEvent({ reconcile, setWriteUpNote, snapshot });

  /**
   * Read the village.
   *
   * `quiet` is the whole of the difference between the two callers. Opening the
   * tab has nothing to fall back on, so a failure there clears the village and
   * says so; a stumble in a read that runs every minute leaves the last good
   * reading on screen instead of blanking a village that is working perfectly
   * well.
   */
  const loadSnapshot = useLoadVillageSnapshot({ setError, setSnapshot });

  const presenceSession = useRef("");

  useVillagePresence({ element, loadSnapshot, presenceSession, reconcile, setSnapshot, snapshot });

  const backgroundPending =
    snapshot?.backgroundWork?.some((job) => ["queued", "running"].includes(job.status)) ?? false;

  usePendingWorkPolling({ backgroundPending, loadSnapshot });

  /*
    Reconcile whenever the server's next meaningful transition changes.

    Watching the snapshot rather than hanging off each read means this covers
    every way the tab can learn the time — the opening read, the minute-by-minute
    poll, founding the village, coming back to a tab that was hidden — without
    any of them having to remember to ask. The ref is what makes it happen once
    per exact transition rather than once per snapshot: nearly every snapshot
    carries the same transition timestamp, and the ones that do end right here.

    The ref starts empty, so the very first snapshot the tab ever sees always
    looks like a transition. That is the point of it: opening the tab on a
    village that has been sitting unread for a week reconciles that week then,
    instead of waiting for the next scheduled transition.

    An unfounded village is shown and not reconciled. There is no durable village
    state to advance before founding.
  */
  useVillageTransitions({ reconcile, snapshot, transitionRef });

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
    loadMemoryLibrary,
    personProfile,
    profileInspection,
    screen,
    setAgendas,
    setMemoryLibrary,
  });

  useResidentAgendaPolling({ agendas, loadAgendas, personProfile, profileInspection, screen });

  /**
   * Ask the village to work one villager out again.
   *
   * The press only clears what is stored; the writing happens on the next part of
   * the day, along with everything else the village does. The server answers with
   * the whole list and that answer is what gets drawn, so a row can never be left
   * showing something the village has already forgotten.
   */
  const backgroundRetryActions = useRef(new Map<string, { id: string; attempt: number }>());

  const retryWork = useResidentsRetryWork({ backgroundRetryActions, loadAgendas, setSnapshot });

  const backgroundPanel = (
    <BackgroundWorkPanel
      jobs={(snapshot?.backgroundWork ?? []).filter((job) =>
        menuPage === "venueRequests" ? ["mail", "adaptation"].includes(job.kind) : true,
      )}
      onRetry={retryWork}
    />
  );

  const agendaActions = useRef(new Map<string, string>());

  const rewriteAgenda = useRewriteAgenda({
    agendaActions,
    currentSnapshotRef,
    retryWork,
    setAgendas,
    setBusy,
    setError,
  });

  const correctCompletedWish = useCorrectCompletedWish({ setAgendas, setBusy, setError });

  const setAgendaScheduleIngestion = useSetAgendaScheduleIngestion({ setAgendas, setBusy, setError });

  useInitialVillageLoad({ loadSnapshot });

  /*
    Keep the tab in step with the village for as long as it is open.

    A capability package gets no timer and no background loop, so nothing can
    advance a village whose tab is closed — which is why the catch-up matters
    more than the poll. Once a minute is far finer than the thing being watched
    (four parts to a day), so nearly every one of these reads finds the same
    moment and stops at the first question, and the whole arrangement costs
    about as much as the clock in the corner.

    A hidden tab is skipped rather than ticked, since nobody is looking at it.
    The read on the way back covers the time it was away in one batch, because
    that is what the server makes of a moment it has fallen behind on.
  */
  useVillagePolling({ loadSnapshot, reconcilingRef });

  useSceneSelectionReset({
    lastRoomActivitySentRef,
    lastRoomDeliberateAtRef,
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

  useSceneOperationPolling({ room, roomBusy, setRoom, setRoomEnded, setRoomError });

  useSceneInterruptedSubmission({
    composerEditVersionRef,
    restoredSceneDraftRef,
    room,
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
  useActiveSceneRestoration({
    setDebugDiscardEnabled,
    setRoom,
    setRoomBusy,
    setRoomGreetingError,
    setRoomMode,
    setRoomOpen,
    setScreen,
  });

  useSceneArchive({
    archiveOffset,
    archiveVenueId,
    archiveVersion,
    archiveVillagerId,
    menuPage,
    setArchiveError,
    setArchiveTotal,
    setVenueVisits,
    snapshot,
  });

  const openVisit = useOpenVisit({ setArchiveError, setOpenArchivedVisit });

  const deleteArchivedVisits = useDeleteArchivedVisits({
    setArchiveError,
    setArchiveOffset,
    setArchiveVersion,
    setBusy,
    setOpenArchivedVisit,
  });

  useResidentPickerLoad({ loadCatalog, pickerOpen });

  // Kept as its own effect, keyed on the stamp: the picture is fetched once and
  // re-fetched only when the server says the map changed, so the homepage never
  // holds a stale copy and the snapshot never carries a megabyte of base64.
  const townMapSetAt = snapshot ? snapshot.settings.townMapImageSetAt : null;

  useTownMapImage({ setTownMapImage, townMapSetAt });

  const addVillager = useAddVillager({ loadCatalog, setBusy, setError, setSnapshot });

  const removeVillager = useRemoveVillager({ catalog, loadCatalog, setBusy, setError, setSnapshot });

  const previewVillagerRefresh = usePreviewVillagerRefresh({ setError, setRefreshBusyId, setRefreshPreviews });

  const applyVillagerRefresh = useApplyVillagerRefresh({ setError, setRefreshBusyId, setRefreshPreviews, setSnapshot });

  // ── Menu screen ────────────────────────────────────────────────────────────
  // The menu is its own screen rather than a panel on the homepage, and every
  // option lives here now that nothing is drawn beside the map. Drafts are
  // seeded when Village Settings opens and never re-seeded while it stays open,
  // so a snapshot arriving from a chat send cannot overwrite what is being typed.
  const openMenu = useScenesOpenMenu({
    loadCatalog,
    loadLorebooks,
    loadPersonas,
    menuPage,
    screen,
    setError,
    setFocusedRequestId,
    setKnowledgeDraft,
    setLorebookDraft,
    setLoreTokenBudgetDraft,
    setMenuPage,
    setPersonaDraft,
    setPersonalizeHomes,
    setProgressDebug,
    setSceneryStyle,
    setScreen,
    setSettingDraft,
    setSettingsError,
    setSiteProjectId,
    setVenuesDraft,
    setVisualLoreDefault,
    snapshot,
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
    leavingRoomPendingRef,
    loadSnapshot,
    receiveRoomRecordEvents,
    room,
    roomBusy,
    roomCompletionRef,
    roomEnded,
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
    loadSnapshot,
    receiveRoomRecordEvents,
    room,
    roomBusy,
    roomCompletionRef,
    roomDraft,
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
    loadSnapshot,
    room,
    roomBusy,
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

  const sendRoom = useSendRoom({
    loadSnapshot,
    receiveRoomRecordEvents,
    room,
    roomBusy,
    roomCompletionRef,
    roomContactBoundary,
    roomContactKind,
    roomDraft,
    roomEnded,
    roomMode,
    roomSendInFlightRef,
    roomSubmissionIdRef,
    roomTargetId,
    seenRoomEventIdsRef,
    setLastSceneEnding,
    setRoom,
    setRoomBusy,
    setRoomContactKind,
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
  const standingAt = useResidentsStandingAt({ snapshot });

  /**
   * Look at a place rather than at whoever happens to be standing in it.
   *
   * The map opens View Venue first. From there the player can visit a space or
   * enter one of the dedicated editing pages without a model request.
   */
  const openPlace = useOpenPlace({
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
    loadSnapshot,
    setRoom,
    setRoomBusy,
    setRoomError,
    setRoomGreetingError,
    setRoomGreetingNotice,
  });

  const retrySavedScene = useRetrySavedScene({
    loadSnapshot,
    receiveRoomRecordEvents,
    room,
    roomBusy,
    roomCompletionRef,
    roomDraft,
    roomLeaveSubmissionIdRef,
    roomMoveOperationIdRef,
    roomSubmissionIdRef,
    setRoom,
    setRoomBusy,
    setRoomContactBoundary,
    setRoomContactKind,
    setRoomDraft,
    setRoomEnded,
    setRoomError,
    setRoomMode,
    setRoomMoveZoneId,
    setRoomTargetId,
  });

  const continueRoomWithoutGreeting = useContinueRoomWithoutGreeting({
    setRoom,
    setRoomBusy,
    setRoomError,
    setRoomGreetingNotice,
  });

  /** Visit starts one venue session with a fixed cast, including when the venue is empty. */
  const openRoom = useOpenRoom({
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
    knowledgeDraft,
    lorebookDraft,
    loreTokenBudgetDraft,
    personaDraft,
    setBusy,
    setSettingsError,
    setSnapshot,
    settingDraft,
  });

  const saveSpriteCardFlip = useSaveSpriteCardFlip({
    setSnapshot,
    setSpriteFlipDraft,
    setSpriteFlipError,
    setSpriteFlipSaving,
  });

  const saveStoryPace = useSaveStoryPace({ setBusy, setSettingsError, setSnapshot });

  const saveSendOnEnter = useSaveSendOnEnter({ setBusy, setSettingsError, setSnapshot, snapshot });

  const saveCharacterSpeechColors = useSaveCharacterSpeechColors({ setBusy, setSettingsError, setSnapshot, snapshot });

  const saveVisitRetention = useSaveVisitRetention({ setArchiveVersion, setBusy, setSettingsError, setSnapshot });

  /**
   * Ask the model for places again. Deliberately a separate button from Save:
   * the call is slow and can fail on its own, and its result replaces the
   * venue editor wholesale, which is a decision the player should make
   * explicitly rather than have happen on every save.
   */
  const suggestPlaces = useSuggestPlaces({ setBusy, setSettingsError, setVenuesDraft, snapshot });

  // ── Town map ───────────────────────────────────────────────────────────────
  useFoundingMapReceipt({
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
    setSetupMapBusy,
    setSetupMapClock,
    setSetupMapProblem,
    setSetupProblem,
    setupDraftData,
    setupLorebookDraft,
    setupMapGenerationKey,
    setupMapNegativePrompt,
    setupMapOptions,
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
  const startMapReplacement = useStartMapReplacement({
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
  });

  const generateReplacementMap = useGenerateReplacementMap({
    setMapGenerating,
    setMapRemoveDraft,
    setSettingsError,
    setTownMapDraft,
    setTownMapPick,
    snapshot,
  });

  const pickTownMap = usePickTownMap({
    setBusy,
    setMapRemoveDraft,
    setSettingsError,
    setTownMapDraft,
    setTownMapPick,
    snapshot,
  });

  const saveTownMap = useSaveTownMap({
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
  });

  /** Put the panel back the way it was: nothing picked, nothing changed. */
  const discardTownMapDraft = useDiscardTownMapDraft({
    setMapRemoveDraft,
    setMapReplaceOpen,
    setPlacingMapVenueId,
    setReframingMap,
    setSettingsError,
    setTownMapDraft,
    setTownMapPick,
  });

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
    setupMapSource,
    setupMapSrc,
    setupVenuesRef,
    setupWorkspace,
  });

  const patchSetupVenue = usePatchSetupVenue({ setSetupAuthoredFields, setSetupVenues });

  // ── Founding the village ───────────────────────────────────────────────────
  // The wizard collects place, shared circumstances, map, and residents before
  // writing the village. A half-answered setup never claims to be founded.

  const chooseSetupScenario = createFoundingChooseSetupScenario({
    setSetupFoundingDetails,
    setSetupFoundingGuidance,
    setSetupFoundingReason,
    setSetupProblem,
    setupFoundingDetails,
    setupFoundingReason,
    snapshot,
  });

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
  });

  const gotoSetupStep = createFoundingGotoSetupStep({
    catalog,
    connectionSetupProblem,
    loadCatalog,
    loadLorebooks,
    loadPersonas,
    personaDraft,
    personas,
    residentContextProblem,
    setMovingSetupVenueId,
    setPlacingHome,
    setPlacingPublicCenter,
    setSetupEditorOpen,
    setSetupProblem,
    setSetupStep,
    get setupBlocker() {
      return setupBlocker;
    },
    setupFoundingDetails,
    setupFoundingVillagerIds,
    setupHomeCount,
    setupName,
    setupPlayerRole,
    setupSetting,
    setupStep,
    setupSuggestionsBusy,
    setupVenueBusy,
    snapshot,
  });

  const setupDraftRow = createFoundingSetupDraftRow({});

  const generateSetupImage = createFoundingGenerateSetupImage({
    element,
    personaDraft,
    personalizeHomes,
    sceneryStyle,
    selectedResidentContexts,
    setSelectedSetupVenueId,
    setSetupImageTarget,
    setSetupProblem,
    setSetupVenueBusy,
    setSetupVenues,
    setupDraftRow,
    setupFoundingDetails,
    setupImageClaim,
    setupImageContextKey,
    setupImageContextKeyRef,
    setupImageTargetRef,
    setupImprint,
    setupLorebookDraft,
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

  const withSetupImage = createFoundingWithSetupImage({});

  /** Why the wizard cannot finish yet, or "" when it can. Checked here as well as on the server so the player is told before a request is made. */
  const setupBlocker = useFoundingSetupBlocker({
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
  });

  const foundVillage = useFoundVillage({
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

  useFoundingPreparationPolling({ screen, setPreparationProblem, setScreen, setSnapshot });

  const retryPreparation = useRetryPreparation({ setPreparationProblem, setSnapshot });

  // ── Venue editor ───────────────────────────────────────────────────────────
  // Rows are keyed by a client-side id; the server accepts or mints its own, so
  // a hand-added row can be edited and removed without ever having been saved.
  //
  // It edits the places you can be sent to and not the houses, because the two
  // are edited in different places for good reasons: a house is a spot on a map
  // and a destination has a name and Class. Each row saves by its
  // own id, so an older panel cannot replace a newly approved destination.
  const addVenue = useAddVenue({ setVenueEditDraft });

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
    requestEdits,
    setBusy,
    setRequestEdits,
    setSettingsError,
    setSnapshot,
    setVenuesDraft,
    venuesDraft,
  });

  /**
   * Drop a macro in at the caret of the prompt box, then put the caret back
   * where it was.
   *
   * It used to choose between two boxes on the strength of which one was last
   * focused. There is one box left, and the choice went with the box.
   */
  const insertMacro = useInsertMacro({ knowledgeDraft, knowledgeRef, pendingCaretRef, setKnowledgeDraft });

  const addNotice = useAddNotice({ noticeDraft, setBusy, setNoticeDraft, setSettingsError, setSnapshot });

  const removeNotice = useRemoveNotice({ setBusy, setSettingsError, setSnapshot });

  const needle = calculateNeedle({ search });

  const visibleCatalog = calculateVisibleCatalog({ catalog, needle });

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
  const portraitWanted = calculatePortraitWanted({ catalog, pickerOpen, screen, setupStep, snapshot, visibleCatalog });

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

  const savedPins: MapPin[] = calculateSavedPins({ mobile, nameOfCharacter, openPlaceId, openVenue, snapshot });

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
  return {
    element,
    addNotice,
    addVenue,
    addVillager,
    agendas,
    applyVillagerRefresh,
    archiveError,
    archiveOffset,
    archiveTotal,
    archiveVenueId,
    archiveVillagerId,
    backgroundPanel,
    busy,
    catalog,
    catchingUp,
    chooseSetupScenario,
    closeExploration,
    closeRoom,
    composerEditVersionRef,
    connectionSetupProblem,
    continueRoomWithoutGreeting,
    correctCompletedWish,
    debugDiscardEnabled,
    decideVenueRequest,
    deleteArchivedVisits,
    discardRoomDebug,
    discardTownMapDraft,
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
    forgetMemory,
    foundVillage,
    framingMap,
    generateReplacementMap,
    generateSetupImage,
    generateSetupTownMap,
    goHome,
    gotoSetupStep,
    greetRoom,
    homeBuildings,
    insertMacro,
    keepPlaceImage,
    knowledgeDraft,
    knowledgeRef,
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
    mapGenerating,
    mapPinDraft,
    mapRemoveDraft,
    mapReplaceOpen,
    mapVisualLore,
    memoryLibrary,
    menuPage,
    menuSection,
    mobile,
    movePrivateZoneId,
    moveRoom,
    moveTargetId,
    movingSetupVenueId,
    nameOfCharacter,
    navigationView,
    newSetupDraft,
    noticeDraft,
    openArchivedVisit,
    openMenu,
    openPerson,
    openPlace,
    openPlaceId,
    openRoom,
    openSetup,
    openVenue,
    openVisit,
    panelMapView,
    patchSetupVenue,
    personProfile,
    personaDraft,
    personaPortrait,
    personalizeHomes,
    personas,
    pickSetupTownMap,
    pickTownMap,
    pickerOpen,
    placeBusyId,
    placeCount,
    placeProblem,
    placeSetupPin,
    placingMapVenueId,
    placingProjectId,
    playerMovePrivateZoneId,
    portraits,
    preparationProblem,
    previewVillagerRefresh,
    profileOrigin,
    progressDebug,
    reframingMap,
    refreshBusyId,
    refreshPreviews,
    removeNotice,
    removeVenue,
    removeVillager,
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
    roomMoveOperationIdRef,
    roomMoveZoneId,
    roomNotices,
    roomOpen,
    roomRuling,
    roomSubmissionIdRef,
    roomTargetId,
    roomUnresolvedChanges,
    rosterSearch,
    saveCharacterSpeechColors,
    saveSendOnEnter,
    saveSettings,
    saveSpriteCardFlip,
    saveStoryPace,
    saveTownMap,
    saveVenue,
    saveVisitRetention,
    savedPins,
    savedSetupDraft,
    savedTownMapShape,
    savedTownMapView,
    sceneryStyle,
    screen,
    search,
    selectedMapVenueId,
    selectedResidentContexts,
    selectedSetupVenueId,
    sendRoom,
    setAgendaScheduleIngestion,
    setArchiveOffset,
    setArchiveVenueId,
    setArchiveVillagerId,
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
    setMapPinDraft,
    setMapRemoveDraft,
    setMapVisualLore,
    setMemoryLibrary,
    setMenuPage,
    setMovePrivateZoneId,
    setMoveTargetId,
    setMovingSetupVenueId,
    setNavigationView,
    setNoticeDraft,
    setOpenArchivedVisit,
    setOpenPlaceId,
    setPersonProfile,
    setPersonaDraft,
    setPersonalizeHomes,
    setPickerOpen,
    setPlaceProblem,
    setPlacingMapVenueId,
    setPlacingProjectId,
    setPlayerMovePrivateZoneId,
    setProfileInspection,
    setProgressDebug,
    setReframingMap,
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
    setRosterSearch,
    setSceneryStyle,
    setScreen,
    setSearch,
    setSelectedMapVenueId,
    setSelectedSetupVenueId,
    setSettingDraft,
    setSettingsError,
    setSetupEditorOpen,
    setSetupFocusIssue,
    setSetupFoundingDetails,
    setSetupFoundingGuidance,
    setSetupFoundingVillagerIds,
    setSetupKeyboardSpot,
    setSetupLoreTokenBudgetDraft,
    setSetupLorebookDraft,
    setSetupMapBusy,
    setSetupMapGeneratedKey,
    setSetupMapNegativePrompt,
    setSetupMapOptions,
    setSetupMapProblem,
    setSetupMapPrompt,
    setSetupMapReviewed,
    setSetupMapSource,
    setSetupName,
    setSetupPlacementError,
    setSetupPlayerRole,
    setSetupProblem,
    setSetupResidentContexts,
    setSetupRoleExpanded,
    setSetupSetting,
    setSetupShowIssues,
    setSetupStep,
    setSetupVenues,
    setSetupWorkspace,
    setSetupWorldFacts,
    setSiteProjectId,
    setSnapshot,
    setSpriteManagerId,
    setTownMapDraft,
    setTownMapPick,
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
    setupFoundingDetails,
    setupFoundingGuidance,
    setupFoundingReason,
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
    setupMapOptions,
    setupMapProblem,
    setupMapProgress,
    setupMapPrompt,
    setupMapRequest,
    setupMapReviewed,
    setupMapShape,
    setupMapSize,
    setupMapSource,
    setupMapSrc,
    setupName,
    setupPlacementError,
    setupPlayerRole,
    setupProblem,
    setupResidentContexts,
    setupRoleExpanded,
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
    spriteFlipDraft,
    spriteFlipError,
    spriteFlipSaving,
    spriteLeaveGuard,
    spriteManagerId,
    spriteProfileScroll,
    standingAt,
    startMapReplacement,
    startOver,
    suggestPlaces,
    suggestSetupVenues,
    townMapAdvice,
    townMapImage,
    townMapPick,
    townMapShape,
    townMapSrc,
    townMapZoom,
    updateSetupMapRequest,
    uploadSetupImage,
    venueEditBusy,
    venueEditDraft,
    venueEditError,
    venueEditNotice,
    venueExplorationActions,
    venueId,
    venuePage,
    venueProposalDraft,
    venueSearch,
    venueVisits,
    venueZoneKey,
    venuesDraft,
    visibleCatalog,
    visualLoreDefault,
    writeItUpNow,
    writeUpNote,
  };
}
