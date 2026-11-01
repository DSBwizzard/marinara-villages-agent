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

  const scenes = useScenesState(snapshot?.isFounded);

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

  const founding = useFoundingState();

  const selectedResidentAdmissions = useFoundingSelectedResidentContexts(founding);

  const residentContextProblem = calculateResidentContextProblem({ selectedResidentAdmissions, snapshot });

  const setupHomeCount = founding.setupFoundingVillagerIds.length;

  const setupBeginningSourceKey = calculateSetupBeginningSourceKey({
    ...founding,
    personaDraft,
    selectedResidentAdmissions,
  });

  const setupImageContextKey = calculateSetupImageContextKey({ ...founding, personaDraft, setupBeginningSourceKey });

  const { setupBeginningSourceKeyRef, setupImageContextKeyRef, setupVenuesRef, setupAuthoredFieldsRef } =
    useFoundingDraftReferences({ ...founding, setupBeginningSourceKey, setupImageContextKey });

  useFoundingImageContext({ setupImageContextKey, setupImageContextKeyRef });

  useFoundingVenueReference({ ...founding, setupVenuesRef });

  useFoundingBeginningReference({ setupBeginningSourceKey, setupBeginningSourceKeyRef, snapshot });

  // Preserve existing generation inputs; adding World identity is a separate behavior change.
  const setupMapGenerationKey = calculateSetupMapGenerationKey({ ...founding, setupWorldName: undefined, snapshot });

  const updateSetupMapRequest = useUpdateSetupMapRequest(founding);

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

  const setupMapShape: MapFrameShape | null = calculateSetupMapShape({ ...founding, snapshot });

  /** How far the picture may be magnified in the panel, and how far one press moves it. */

  /**
   * The map as it is drawn: the picture being previewed in the panel, or the
   * village's own picture, or the one the package ships.
   */

  const setupMapSrc = calculateSetupMapSrc({ ...founding, townMapImage });

  useFoundingAuthoredReference({ ...founding, setupAuthoredFieldsRef });

  const setupDraftData = useFoundingSetupDraftData({ ...founding, personaDraft });

  const persistSetupDraft = useFoundingPersistSetupDraft(founding);

  useFoundingDraftAutosave({ ...founding, persistSetupDraft, screen, setupDraftData, snapshot });

  const flushSetupDraft = useFoundingFlushSetupDraft({ ...founding, persistSetupDraft, setupDraftData });

  const restoreSetupDraft = createFoundingRestoreSetupDraft({
    ...founding,
    get loadCatalog() {
      return loadCatalog;
    },
    get loadLorebooks() {
      return loadLorebooks;
    },
    get loadPersonas() {
      return loadPersonas;
    },
    setPersonaDraft,
    setScreen,
    updateSetupMapRequest,
  });

  const exitSetupDraft = createFoundingExitSetupDraft({ ...founding, flushSetupDraft, setScreen });

  const confirmVillages = useConfirmation(snapshot?.settings.maps?.[0]?.id);
  const newSetupDraft = createFoundingNewSetupDraft({
    ...founding,
    confirmVillages,
    get openSetup() {
      return openSetup;
    },
    snapshot,
    updateSetupMapRequest,
  });

  const retrySetupSaving = createFoundingRetrySetupSaving({ ...founding, persistSetupDraft, setupDraftData });

  // Roster changes reconcile only the required graph; existing authored Venues survive.
  useFoundingRosterReconciliation({ ...founding, catalog, screen, snapshot });

  const suggestionSignal = useActivitySignal(visible && screen === "setup");
  const suggestSetupVenues = createFoundingSuggestSetupVenues({
    ...founding,
    setupWorldName: undefined,
    onQuickStartApplied: () => {
      founding.setSetupAuthoredFields({});
      setupAuthoredFieldsRef.current = {};
      founding.setupZoneDrafts.current = {};
      founding.setupEditorOriginal.current = null;
      founding.setupEditorZoneOriginal.current = undefined;
      founding.setupEditorAuthoredOriginal.current = [];
      founding.setSetupEditorOpen(false);
      founding.setSelectedSetupVenueId(null);
      founding.setMovingSetupVenueId(null);
      founding.setSetupMapReviewed(false);
    },
    signal: suggestionSignal,
    persistSetupDraft,
    setupDraftData,
    personaDraft,
    selectedResidentAdmissions,
    setupAuthoredFieldsRef,
    setupBeginningSourceKey,
    setupBeginningSourceKeyRef,
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
  const receiveRoomRecordEvents = useReceiveRoomRecordEvents(scenes);

  useSceneChangesPolling({
    ...scenes,
    visible,
    viewing: screen === "room",
    busy: scenes.roomBusy,
    snapshot,
    receiveRoomRecordEvents,
    room,
  });

  const dismissRoomNotice = useDismissRoomNotice({ ...scenes, room });

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

  const loadLorebooks = useLoadLorebooks(founding);

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

  useSceneSelectionReset({ ...scenes, loadSnapshot, room, screen, setRoom, setScreen });

  // Opening failures belong only to the visit that is still opening. A later
  // authoritative read can recover it even when the original fetch and its
  // recovery read failed; a delayed failure must not revive the old warning.
  useSceneOpeningWarning({ ...scenes, room });

  useSceneInterruptedSubmission({ ...scenes, room });

  // An app reload does not end a Scene. The server owns the one active
  // session; the client restores it instead of opening another conversation.
  const sceneRestoration = useActiveSceneRestoration({
    ...scenes,
    isFounded: snapshot?.isFounded,
    room,
    setRoom,
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
    ...founding,
    snapshot,
    setKnowledgeDraft,
    setLorebookDraft,
    setLoreTokenBudgetDraft,
    setPersonaDraft,
    setSettingDraft,
    setVenuesDraft,
  });
  const { progressDebug, loadProgressDebug } = useProgressDiagnostics({ setError });
  const openMenu = useScenesOpenMenu({
    ...scenes,
    loadLorebooks,
    loadProgressDebug,
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
    ...scenes,
    onUnknownSceneExit: sceneRestoration.retry,
    isFounded: snapshot?.isFounded,
    loadSnapshot,
    receiveRoomRecordEvents,
    room,
    setRoom,
    setScreen,
  });

  const leaveRoom = useLeaveRoom({
    ...scenes,
    isFounded: snapshot?.isFounded,
    loadSnapshot,
    receiveRoomRecordEvents,
    room,
    setRoom,
    setScreen,
  });

  const discardRoomDebug = useDiscardRoomDebug({ ...scenes, loadSnapshot, room, setRoom, setScreen });

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
  const moveRoom = useMoveRoom({ ...scenes, isFounded: snapshot?.isFounded, loadSnapshot, room, setRoom });

  const { sendRoom, turnRecovery, checkSavedReply, replyPending } = useSendRoom({
    ...scenes,
    visible: visible && screen === "room",
    loadSnapshot,
    receiveRoomRecordEvents,
    room,
    setRoom,
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
    ...scenes,
    visible,
    viewing: screen === "room",
    recoveryPending: replyPending,
    room,
    setRoom,
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

  const greetRoom = useGreetRoom({ ...scenes, isFounded: snapshot?.isFounded, room, loadSnapshot, setRoom });

  const retrySavedScene = useRetrySavedScene({
    ...scenes,
    isFounded: snapshot?.isFounded,
    loadSnapshot,
    receiveRoomRecordEvents,
    room,
    setRoom,
  });

  const continueRoomWithoutGreeting = useContinueRoomWithoutGreeting({
    ...scenes,
    isFounded: snapshot?.isFounded,
    room,
    setRoom,
  });

  /** Visit starts one venue session with a fixed cast, including when the venue is empty. */
  const openRoom = useOpenRoom({
    ...scenes,
    isFounded: snapshot?.isFounded,
    greetRoom,
    loadSnapshot,
    room,
    setOpenPlaceId,
    setPlaceProblem,
    setRoom,
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
    ...founding,
    snapshot,
    knowledgeDraft,
    lorebookDraft,
    loreTokenBudgetDraft,
    personaDraft,
    setBusy,
    setSettingsError,
    setSnapshot,
    settingDraft,
    acceptSavedSettings,
  });

  const spriteVisualSettings = useSpriteVisualSettings({ snapshot, setSnapshot, setBusy });

  const saveScenerySettings = useSaveScenerySettings({ ...founding, snapshot, setBusy, setSettingsError, setSnapshot });

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
  useFoundingMapReceipt({ ...founding, visible, screen, updateSetupMapRequest });

  const generateSetupTownMap = useFoundingGenerateSetupTownMap({
    ...founding,
    setupWorldName: undefined,
    persistSetupDraft,
    setupDraftData,
    setupMapGenerationKey,
    snapshot,
    updateSetupMapRequest,
  });

  const pickSetupTownMap = usePickSetupTownMap({ ...founding, snapshot, updateSetupMapRequest });

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

  const placeSetupPin = usePlaceSetupPin({ ...founding, setupMapSrc, setupVenuesRef });

  const patchSetupVenue = usePatchSetupVenue(founding);

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
    ...founding,
    loadCatalog,
    loadLorebooks,
    loadPersonas,
    setPersonaDraft,
    setPickerOpen,
    setResetArmed,
    setScreen,
    setSearch,
    setSettingsError,
    updateSetupMapRequest,
  });

  const gotoSetupStep = createFoundingGotoSetupStep({
    ...founding,
    catalog,
    loadCatalog,
    loadLorebooks,
    loadPersonas,
    personaDraft,
    personas,
    residentContextProblem,
    get setupBlocker() {
      return setupBlocker;
    },
    setupHomeCount,
    setupMapSrc,
    snapshot,
  });

  const setupDraftRow = createFoundingSetupDraftRow();

  const generateSetupImage = createFoundingGenerateSetupImage({
    ...founding,
    setupWorldName: undefined,
    element,
    personaDraft,
    selectedResidentAdmissions,
    setupDraftRow,
    setupImageContextKey,
    setupImageContextKeyRef,
    setupVenuesRef,
    snapshot,
    get withSetupImage() {
      return withSetupImage;
    },
  });

  const uploadSetupImage = createFoundingUploadSetupImage({
    ...founding,
    patchSetupVenue,
    setupBeginningSourceKey,
    setupBeginningSourceKeyRef,
    setupVenuesRef,
    snapshot,
    get withSetupImage() {
      return withSetupImage;
    },
  });

  const withSetupImage = createFoundingWithSetupImage();

  /** Why the wizard cannot finish yet, or "" when it can. Checked here as well as on the server so the player is told before a request is made. */
  const setupBlocker = useFoundingSetupBlocker({
    ...founding,
    catalog,
    personaDraft,
    setupHomeCount,
    setupMapSrc,
    snapshot,
  });

  const foundVillage = useFoundVillage({
    ...founding,
    element,
    flushSetupDraft,
    personaDraft,
    residentContextProblem,
    selectedResidentAdmissions,
    setBusy,
    setScreen,
    setSnapshot,
    setupBlocker,
    setupMapSrc,
    snapshot,
  });

  /** The destructive half of the pair the General settings panel offers. */
  const startOver = useFoundingStartOver({
    ...founding,
    openSetup,
    setBusy,
    setCatalog,
    setResetArmed,
    setSettingsError,
    setSnapshot,
  });

  useFoundingDraftOffer({ ...founding, loadCatalog, loadPersonas, openSetup, setScreen, snapshot });

  useFoundingPreparationPolling({
    ...founding,
    visible,
    canPlay: snapshot?.foundingPreparation?.canPlay,
    status: snapshot?.foundingPreparation?.status,
    screen,
    setScreen,
    setSnapshot,
  });

  const retryPreparation = useRetryPreparation({ ...founding, setSnapshot });

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
  const portraitWanted = calculatePortraitWanted({ ...founding, catalog, screen, snapshot });

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

  const draftPins: MapPin[] = calculateDraftPins(founding);
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
          room?.id !== session.id && scenes.roomDraft
            ? { title: room?.placeName ?? "Previous Scene", text: scenes.roomDraft }
            : null;
        if (room?.id !== session.id) scenes.setRoomDraft("");
        scenes.roomCompletionRef.current = null;
        scenes.observedRoomIdRef.current = "";
        setRoom(session);
        scenes.setRoomEnded(false);
        scenes.setRoomOpen(true);
        scenes.setRoomMode("chat");
        return kept;
      }
    } else if (scenes.roomOpen && room) {
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
    setupSpriteRevisions: founding.setupSpriteRevisions,
    setSetupSpriteRevisions: founding.setSetupSpriteRevisions,
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
    composerEditVersionRef: scenes.composerEditVersionRef,
    connectionSetupProblem: founding.connectionSetupProblem,
    continueRoomWithoutGreeting,
    debugDiscardEnabled: scenes.debugDiscardEnabled,
    decideVenueRequest,
    generateRequestDescription,
    completeResidenceMove,
    decideResidenceMove,
    discardRoomDebug,
    dismissRoomNotice,
    draftPins,
    draftSaveError: founding.draftSaveError,
    draftSavedAt: founding.draftSavedAt,
    draftSaving: founding.draftSaving,
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
    lastSceneEnding: scenes.lastSceneEnding,
    leaveRoom,
    leaveVenue,
    loadMemoryLibrary,
    loadSnapshot,
    loreTokenBudgetDraft,
    lorebookDraft,
    lorebooks: founding.lorebooks,
    lorebooksError: founding.lorebooksError,
    mailboxOpen: scenes.mailboxOpen,
    mapVisualLore: founding.mapVisualLore,
    memoryLibrary,
    menuPage,
    menuSection,
    connections,
    mobile,
    movePrivateZoneId,
    moveRoom,
    moveTargetId,
    movingSetupVenueId: founding.movingSetupVenueId,
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
    personalizeHomes: founding.personalizeHomes,
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
    preparationProblem: founding.preparationProblem,
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
    roomBusy: scenes.roomBusy,
    roomChangeStatus: scenes.roomChangeStatus,
    roomContactBoundary: scenes.roomContactBoundary,
    roomDraft: scenes.roomDraft,
    roomEnded: scenes.roomEnded,
    roomError: scenes.roomError,
    roomGreetingError: scenes.roomGreetingError,
    roomGreetingNotice: scenes.roomGreetingNotice,
    roomLeaveSubmissionIdRef: scenes.roomLeaveSubmissionIdRef,
    roomMode: scenes.roomMode,
    legacyRecovery: scenes.legacyRecovery,
    setLegacyRecovery: scenes.setLegacyRecovery,
    roomMoveOperationIdRef: scenes.roomMoveOperationIdRef,
    roomMoveZoneId: scenes.roomMoveZoneId,
    roomNotices: scenes.roomNotices,
    sceneReading: scenes.sceneReading,
    roomOpen: scenes.roomOpen,
    roomRuling: scenes.roomRuling,
    setRoomRuling: scenes.setRoomRuling,
    roomSubmissionIdRef: scenes.roomSubmissionIdRef,
    roomTargetId: scenes.roomTargetId,
    roomUnresolvedChanges: scenes.roomUnresolvedChanges,
    saveScenerySettings,
    spriteVisualSettings,
    saveSendOnEnter,
    saveSettings,
    saveBackgroundPace,
    saveVenue,
    savedPins,
    savedSetupDraft: founding.savedSetupDraft,
    savedTownMapShape,
    savedTownMapView,
    sceneryStyle: founding.sceneryStyle,
    sceneryStyleProfileId: founding.sceneryStyleProfileId,
    screen,
    search,
    selectedResidentAdmissions,
    selectedSetupVenueId: founding.selectedSetupVenueId,
    sendRoom,
    turnRecovery,
    checkSavedReply,
    replyPending,
    setAgendaScheduleIngestion,
    setBusy,
    setConnectionSetupProblem: founding.setConnectionSetupProblem,
    setError,
    setExplorationSearch,
    setExploreSheet,
    setFocusedProjectId,
    setFocusedRequestId,
    setKnowledgeDraft,
    setLoreTokenBudgetDraft,
    setLorebookDraft,
    setMailboxOpen: scenes.setMailboxOpen,
    setMapVisualLore: founding.setMapVisualLore,
    setMemoryLibrary,
    setMenuPage,
    setMovePrivateZoneId,
    setMoveTargetId,
    setMovingSetupVenueId: founding.setMovingSetupVenueId,
    setNavigationView,
    setOpenPlaceId,
    setPersonProfile,
    setPersonaDraft,
    setPersonalizeHomes: founding.setPersonalizeHomes,
    setPickerOpen,
    setPlaceProblem,
    setPlacingProjectId,
    setPlayerMovePrivateZoneId,
    setProfileInspection,
    loadProgressDebug,
    setRequestEdits,
    setResetArmed,
    setRoom,
    setRoomBusy: scenes.setRoomBusy,
    setRoomContactBoundary: scenes.setRoomContactBoundary,
    setRoomContactKind: scenes.setRoomContactKind,
    setRoomDraft: scenes.setRoomDraft,
    setRoomError: scenes.setRoomError,
    setRoomMode: scenes.setRoomMode,
    setRoomMoveZoneId: scenes.setRoomMoveZoneId,
    setRoomTargetId: scenes.setRoomTargetId,
    setSceneryStyle: founding.setSceneryStyle,
    setSceneryStyleProfileId: founding.setSceneryStyleProfileId,
    setScreen,
    setSearch,
    setSelectedSetupVenueId: founding.setSelectedSetupVenueId,
    setSettingDraft,
    setSettingsError,
    setSetupEditorOpen: founding.setSetupEditorOpen,
    setSetupFocusIssue: founding.setSetupFocusIssue,

    setSetupFoundingVillagerIds: founding.setSetupFoundingVillagerIds,
    setSetupKeyboardSpot: founding.setSetupKeyboardSpot,
    setSetupLoreTokenBudgetDraft: founding.setSetupLoreTokenBudgetDraft,
    setSetupLorebookDraft: founding.setSetupLorebookDraft,
    setSetupMapBusy: founding.setSetupMapBusy,
    setSetupMapGeneratedKey: founding.setSetupMapGeneratedKey,
    setSetupMapNegativePrompt: founding.setSetupMapNegativePrompt,
    setSetupMapProblem: founding.setSetupMapProblem,
    setSetupMapPrompt: founding.setSetupMapPrompt,
    setSetupMapReviewed: founding.setSetupMapReviewed,
    setSetupMapSource: founding.setSetupMapSource,
    setSetupName: founding.setSetupName,
    setSetupPlacementError: founding.setSetupPlacementError,
    setSetupPlayerBackground: founding.setSetupPlayerBackground,
    setSetupProblem: founding.setSetupProblem,
    setSetupResidentAdmissions: founding.setSetupResidentAdmissions,
    setSetupWorldName: founding.setSetupWorldName,
    setSetupSetting: founding.setSetupSetting,
    setSetupShowIssues: founding.setSetupShowIssues,
    setSetupStep: founding.setSetupStep,
    setSetupVenues: founding.setSetupVenues,
    setSetupWorkspace: founding.setSetupWorkspace,
    setSetupWorldFacts: founding.setSetupWorldFacts,
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
    setVisualLoreDefault: founding.setVisualLoreDefault,
    settingDraft,
    settingsError,
    setupBeginningSourceKey,
    setupEditorOpen: founding.setupEditorOpen,
    setupFocusIssue: founding.setupFocusIssue,

    setupFoundingVillagerIds: founding.setupFoundingVillagerIds,
    setupImageClaim: founding.setupImageClaim,
    setupImageTarget: founding.setupImageTarget,
    setupKeyboardSpot: founding.setupKeyboardSpot,
    setupLoreTokenBudgetDraft: founding.setupLoreTokenBudgetDraft,
    setupLorebookDraft: founding.setupLorebookDraft,
    setupMapBusy: founding.setupMapBusy,
    setupMapGeneratedKey: founding.setupMapGeneratedKey,
    setupMapGenerationKey,
    setupMapImageSource: founding.setupMapImageSource,
    setupMapNegativePrompt: founding.setupMapNegativePrompt,
    setupMapProblem: founding.setupMapProblem,
    setupMapPrompt: founding.setupMapPrompt,
    setupMapRequest: founding.setupMapRequest,
    setupMapReviewed: founding.setupMapReviewed,
    setupMapShape,
    setupMapSize: founding.setupMapSize,
    setupMapSource: founding.setupMapSource,
    setupMapSrc,
    setupName: founding.setupName,
    setupTimeZone: founding.setupTimeZone,
    setSetupTimeZone: founding.setSetupTimeZone,
    setupPlacementError: founding.setupPlacementError,
    setupPlayerBackground: founding.setupPlayerBackground,
    setupProblem: founding.setupProblem,
    setupResidentAdmissions: founding.setupResidentAdmissions,
    setupWorldName: founding.setupWorldName,
    setupSetting: founding.setupSetting,
    setupShowIssues: founding.setupShowIssues,
    setupStep: founding.setupStep,
    setupSuggestionsBusy: founding.setupSuggestionsBusy,
    setupSuggestionsClaim: founding.setupSuggestionsClaim,
    setupSuggestionsKey: founding.setupSuggestionsKey,
    setupVenueBusy: founding.setupVenueBusy,
    setupVenues: founding.setupVenues,
    setupWorkspace: founding.setupWorkspace,
    setupWorldFacts: founding.setupWorldFacts,
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
    visualLoreDefault: founding.visualLoreDefault,
  };
}
