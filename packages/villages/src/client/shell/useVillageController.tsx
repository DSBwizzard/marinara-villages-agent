import { residentFoundingProblems } from "../../engine/packages/shared/src/villages/resident-founding-context.js";
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
  useExplorationOutsideClick,
  useMapNavigationReset,
  useRemovedVenueNavigation,
  useTownMapImage,
} from "../features/exploration/controller-hooks.js";
import {
  defaultView,
  pictureAdvice,
  PROJECT_BLUEPRINT_IMAGE,
  STANDING_PIN_STEP,
} from "../features/exploration/MapStage.js";
import { useExplorationState } from "../features/exploration/useExplorationState.js";
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
import { foundingScenario, requestSetupMapReceipt } from "../features/founding/FoundingPanels.js";
import { useFoundingState } from "../features/founding/useFoundingState.js";
import {
  readFoundingDraft,
  removeFoundingDraft,
  type SavedFoundingDraft,
  saveFoundingDraft,
} from "../features/founding/villages-founding-draft.js";
import { personalSpaceDraft } from "../features/founding/villages-founding-editor";
import { emptyFoundingWorkspace } from "../features/founding/villages-founding-workspace-state";
import { draftZonePolicy } from "../features/founding/villages-founding-zones";
import { playerRoleProblem } from "../features/founding/villages-player-role.js";
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
  useResidentAgendaPolling,
  useResidentInspection,
  useResidentsNameOfCharacter,
  useResidentsStandingAt,
} from "../features/residents/controller-hooks.js";
import { readPersonaPortrait, readPortraits } from "../features/residents/ResidentPanels.js";
import { useResidentsState } from "../features/residents/useResidentsState.js";
import type { DossierNavigation } from "../features/residents/villages-dossier.js";
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
import { useScenesState } from "../features/scenes/useScenesState.js";
import { useSceneViewport } from "../features/scenes/villages-scene-viewport.js";
import { createVillagesClientId } from "../features/scenes/villages-venue-send";
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
import { messageFrom, request } from "../shared/api.js";
import { API_PATH, ELEMENT_TAG } from "../shared/constants.js";
import {
  pinText,
  pinTone,
  placeSpot,
  playerDisplayName,
  readFileAsDataUrl,
  SHOW_CATCHING_UP_AFTER_MS,
  VILLAGE_PULSE_MS,
} from "../shared/presentation.js";
import type {
  CatalogEntry,
  CatalogResponse,
  FoundingScenarioId,
  MapFrameShape,
  MapPin,
  MapZoomRange,
  MenuPage,
  PersonaEntry,
  PersonaResponse,
  Portrait,
  ProgressDebugView,
  SceneView,
  SetupMapRequest,
  SetupVenueDraft,
  TownMapView,
  VenueClass,
  VillageLorebookOption,
  VillageSnapshot,
  VillageVenue,
  VillageVenueImage,
  VillageVillagerView,
} from "../shared/types.js";
import { isHouse, venueClassesFor } from "../shared/venue.js";
import { useScenesOpenMenu } from "./navigation-actions.js";
import { menuCategory } from "./navigation.js";
import { type SetStateAction, useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";

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

  useEffect(() => {
    if (venueZoneKey === "exterior") return;
    const venue = snapshot?.settings.venues.find((entry) => entry.id === venueId);
    const available =
      venue?.zones?.some((zone) => zone.id === venueZoneKey) ||
      (venueZoneKey.startsWith("class:")
        ? Boolean(venue && venueClassesFor(venue).includes(venueZoneKey.slice(6) as VenueClass))
        : Boolean(
            venue &&
            venueZoneKey.startsWith("private:") &&
            (
              venue.residentIds ?? (venue.occupancy.residentCharacterId ? [venue.occupancy.residentCharacterId] : [])
            ).includes(venueZoneKey.slice(8)) &&
            venue.privateSpaces?.some((space) => space.ownerId === venueZoneKey.slice(8)),
          ));
    if (!available) setVenueZoneKey("exterior");
  }, [snapshot, venueId, venueZoneKey]);
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

  const openPerson = useCallback(
    (navigation: DossierNavigation) => {
      if (spriteLeaveGuard.current && !spriteLeaveGuard.current()) return;
      const button = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const key = button?.getAttribute("data-exploration-row");
      const label = button?.getAttribute("aria-label");
      const selector = key
        ? `[data-exploration-row="${CSS.escape(key)}"]`
        : label
          ? `[aria-label="${CSS.escape(label)}"]`
          : "";
      const scroll = [
        ...element.querySelectorAll<HTMLElement>(`.${ELEMENT_TAG}-root, .${ELEMENT_TAG}-explore-list`),
      ].map((current) => ({
        selector: current.classList.contains(`${ELEMENT_TAG}-explore-list`)
          ? `.${ELEMENT_TAG}-explore-list`
          : `.${ELEMENT_TAG}-root`,
        top: current.scrollTop,
      }));
      profileOrigin.current = { selector, scroll };
      setError("");
      setProfileInspection(null);
      setSpriteManagerId(null);
      setPersonProfile(navigation);
      setScreen("person");
    },
    [element],
  );
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

  const residentContextProblem =
    !snapshot?.isFounded &&
    Object.values(selectedResidentContexts).some((context) =>
      Object.values(residentFoundingProblems(context)).some(Boolean),
    )
      ? "Complete the highlighted resident background fields in People."
      : "";

  const setupHomeCount = setupFoundingVillagerIds.length;

  const [, setSetupCompletedIds] = useState<string[]>([]);

  const [, setSetupNewVenueId] = useState("");

  const setupBeginningSourceKey = JSON.stringify({
    residentContexts: selectedResidentContexts,
    scenario: setupFoundingReason,
    premise: setupFoundingDetails.trim(),
    direction: setupFoundingGuidance.trim(),
    setting: setupSetting.trim(),
    lorebooks: setupLorebookDraft,
    loreBudget: setupLoreTokenBudgetDraft,
    persona: personaDraft,
    artStyle: sceneryStyle,
    personalityDefault: personalizeHomes,
    visualLoreDefault,
  });

  const setupBeginningSourceKeyRef = useRef(setupBeginningSourceKey);

  const setupImageContextKey = JSON.stringify({
    source: setupBeginningSourceKey,
    name: setupName,
    imprint: setupImprint,
    worldFacts: setupWorldFacts,
    persona: personaDraft,
    personalizeHomes,
    visualLoreDefault,
  });

  const setupImageContextKeyRef = useRef(setupImageContextKey);

  useFoundingImageContext({ setupImageContextKey, setupImageContextKeyRef });

  const setupVenuesRef = useRef(setupVenues);

  useFoundingVenueReference({ setupVenues, setupVenuesRef });

  useFoundingBeginningReference({ setupBeginningSourceKey, setupBeginningSourceKeyRef, snapshot });

  const setupMapGenerationKey = JSON.stringify({
    setting: setupSetting.trim(),
    worldFacts: snapshot?.isFounded ? setupWorldFacts : null,
    lorebooks: setupLorebookDraft,
    artStyle: sceneryStyle,
    useVisualLore: mapVisualLore,
    structure: setupMapPrompt,
    negative: setupMapNegativePrompt,
    options: setupMapOptions,
  });

  const updateSetupMapRequest = useUpdateSetupMapRequest({ setSetupMapRequest, setupMapRequestRef });

  useFoundingMapClock({ setSetupMapClock, setupMapBusy });

  const setupMapSeconds = Math.max(
    0,
    Math.floor((setupMapClock - Date.parse(setupMapRequest?.startedAt ?? new Date().toISOString())) / 1000),
  );

  const setupMapProgress = `Waiting for map artwork — ${Math.floor(setupMapSeconds / 60)}m ${setupMapSeconds % 60}s. Image generation can take several minutes. You can continue editing.`;

  const [resetArmed, setResetArmed] = useState(false);

  /**
   * The framing the village has saved. The map is drawn with this everywhere
   * except in the panel's own preview, which draws the draft being tried out.
   */
  const savedTownMapView: TownMapView = snapshot?.settings.townMapView ?? defaultView("cover");

  /**
   * The shape a map is drawn at, as the settings give it. This is the one place
   * that answers "how big is a map", so the frame the picture is drawn in, the
   * advice beside the file box and the server all agree about it.
   */
  const savedTownMapShape: MapFrameShape | null = snapshot
    ? { width: snapshot.settings.townMapExpectedWidth, height: snapshot.settings.townMapExpectedHeight }
    : null;

  const townMapShape: MapFrameShape | null = townMapPick?.size ?? savedTownMapShape;

  const setupMapShape: MapFrameShape | null = snapshot
    ? setupMapSource === "existing"
      ? { width: snapshot.settings.townMapExpectedWidth, height: snapshot.settings.townMapExpectedHeight }
      : setupMapSize && setupMapImageSource === setupMapSource
        ? setupMapSize
        : { width: snapshot.settings.townMapGenerationWidth, height: snapshot.settings.townMapGenerationHeight }
    : null;

  /** How far the picture may be magnified in the panel, and how far one press moves it. */
  const townMapZoom: MapZoomRange = snapshot
    ? {
        min: snapshot.settings.townMapZoomMin,
        max: snapshot.settings.townMapZoomMax,
        step: snapshot.settings.townMapZoomStep,
      }
    : { min: 1, max: 1, step: 0.1 };

  /**
   * The map as it is drawn: the picture being previewed in the panel, or the
   * village's own picture, or the one the package ships.
   */
  const townMapSrc = mapRemoveDraft ? null : townMapPick ? townMapPick.image : townMapImage || null;

  const setupMapSrc =
    setupMapSource === "none"
      ? null
      : setupMapSource === "existing"
        ? townMapImage || null
        : setupMapImageSource === setupMapSource
          ? setupMapImage || null
          : null;

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

  type SetupDraftData = Omit<typeof setupDraftData, "workspace"> & {
    workspace?: ReturnType<typeof emptyFoundingWorkspace>;
  };

  const persistSetupDraft = useCallback((data: SetupDraftData) => {
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

  useEffect(() => {
    if (draftReady && !snapshot?.isFounded && (screen === "setup" || screen === "resume"))
      void persistSetupDraft(setupDraftData).catch(() => undefined);
  }, [draftReady, persistSetupDraft, setupDraftData, snapshot?.isFounded, screen]);

  const flushSetupDraft = useCallback(async () => {
    if (!draftReady) throw new Error("Draft storage is unavailable. Retry saving before leaving or founding.");
    await persistSetupDraft(setupDraftData);
    if (draftBlocked.current) throw new Error("Draft saving needs attention. Keep this tab open.");
  }, [draftReady, persistSetupDraft, setupDraftData]);

  const restoreSetupDraft = (data: SetupDraftData) => {
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

  const exitSetupDraft = async () => {
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

  const newSetupDraft = async () => {
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

  const retrySetupSaving = async () => {
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

  // Roster changes reconcile only the required graph; existing authored Venues survive.
  useFoundingRosterReconciliation({ catalog, draftReady, screen, setSetupVenues, setupFoundingVillagerIds, snapshot });

  const suggestSetupVenues = async () => {
    if (setupSuggestionsClaim.current || !setupSetting.trim() || !setupFoundingDetails.trim()) return;
    setupSuggestionsClaim.current = true;
    const source = setupBeginningSourceKey;
    const rows = setupVenues;
    setSetupSuggestionsBusy(true);
    setSetupProblem("");
    try {
      const result = await request<{
        venues: Array<{
          id: string;
          name: string;
          form: string;
          description: string;
          layout: "exterior" | "common" | "private" | "both";
          commonName: string;
          commonPurpose?: string;
          venueType?: string;
          commonDescription: string;
          privateName: string;
          privatePurpose: string;
        }>;
      }>("/setup/venues/suggest", {
        method: "POST",
        body: JSON.stringify({
          setting: setupSetting,
          foundingDetails: setupFoundingDetails,
          playerPersonaId: personaDraft,
          selectedLorebookIds: setupLorebookDraft,
          loreTokenBudget: setupLoreTokenBudgetDraft,
          foundingResidentContexts: selectedResidentContexts,
          venues: rows.map((row) => ({
            id: row.id,
            name: row.name,
            form: row.form,
            description: row.description,
            spaceDescription: row.spaces?.[0]?.description ?? "",
            venueClass: row.category === "public-center" ? "gathering" : "residence",
            residentCharacterId: row.occupancy.residentCharacterId ?? "",
          })),
        }),
      });
      if (
        setupBeginningSourceKeyRef.current !== source ||
        rows.some((row) => !setupVenuesRef.current.some((current) => current.id === row.id))
      )
        throw new Error(
          "The people or setting changed while suggestions were prepared. Your existing draft is kept; request fresh suggestions when ready.",
        );
      setSetupVenues((currentRows) =>
        currentRows.map((row) => {
          const proposal = result.venues.find((item) => item.id === row.id);
          const before = rows.find((item) => item.id === row.id);
          if (
            !proposal ||
            !before ||
            setupImageTargetRef.current?.venueId === row.id ||
            JSON.stringify(row.occupancy) !== JSON.stringify(before.occupancy)
          )
            return row;
          const changed: SetupVenueDraft = { ...row };
          for (const key of ["name", "venueType", "form", "description"] as const)
            if (!setupAuthoredFieldsRef.current[row.id]?.includes(key) && row[key] === before[key])
              changed[key] = proposal[key] ?? row[key];
          const layoutEdited = ["layout", "spaces", "privateSpaces"].some((key) =>
            setupAuthoredFieldsRef.current[row.id]?.includes(key),
          );
          if (
            !layoutEdited &&
            ![...(row.spaces ?? []), ...(row.privateSpaces ?? [])].some(
              (zone) => zone.image || !["common:base", "private:base"].includes(zone.id),
            ) &&
            JSON.stringify(row.spaces) === JSON.stringify(before.spaces) &&
            JSON.stringify(row.privateSpaces) === JSON.stringify(before.privateSpaces) &&
            row.layout === before.layout
          ) {
            const role = row.category === "public-center" ? "gathering" : "residence";
            changed.layout = proposal.layout;
            changed.spaces =
              proposal.layout === "common" || proposal.layout === "both"
                ? [
                    {
                      ...personalSpaceDraft(),
                      id: "common:base",
                      ownerId: "",
                      venueClass: role,
                      name: proposal.commonName,
                      purpose:
                        proposal.commonPurpose ||
                        (role === "residence" ? "Everyday home activities" : "Community gatherings"),
                      access: draftZonePolicy(row, { venueClass: role }),
                      description: proposal.commonDescription,
                    },
                  ]
                : [];
            changed.privateSpaces =
              proposal.layout === "private" || proposal.layout === "both"
                ? [
                    {
                      ...personalSpaceDraft(),
                      id: "private:base",
                      venueClass: role,
                      ownerId: row.occupancy.playerHome ? "player" : (row.occupancy.residentCharacterId ?? ""),
                      name: proposal.privateName,
                      purpose: proposal.privatePurpose,
                      access: draftZonePolicy(
                        row,
                        {
                          venueClass: role,
                          ownerId: row.occupancy.playerHome ? "player" : row.occupancy.residentCharacterId || "",
                        },
                        true,
                      ),
                      controllerIds: role === "gathering" ? ["player"] : undefined,
                    },
                  ]
                : [];
          }
          return changed;
        }),
      );
      setSetupSuggestionsKey(source);
    } catch (cause) {
      setSetupProblem(messageFrom(cause, "Suggestions could not be prepared. You can write the details yourself."));
    } finally {
      setupSuggestionsClaim.current = false;
      setSetupSuggestionsBusy(false);
    }
  };

  /** Whether the panel is framing a picture: one just picked, or the saved one under revision. */
  const framingMap = townMapPick !== null || reframingMap;

  /**
   * The framing the panel draws. Everywhere else draws the saved one, so the
   * draft never leaks out of the panel and the village is never seen wearing a
   * framing that has not been agreed to.
   */
  const panelMapView: TownMapView = framingMap ? (townMapDraft ?? savedTownMapView) : savedTownMapView;

  /** What is true of the picture being previewed, if the panel is holding one. */
  const townMapAdvice = townMapPick ? pictureAdvice(townMapPick.size) : null;

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
  const [room, setRoom] = useReducer((current: SceneView | null, next: SetStateAction<SceneView | null>) => {
    const candidate = typeof next === "function" ? next(current) : next;
    if (current?.id && current.id === candidate?.id && (current.sceneRevision ?? 0) > (candidate.sceneRevision ?? 0))
      return current;
    return candidate;
  }, null);

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

  useEffect(() => {
    const caret = pendingCaretRef.current;
    const node = knowledgeRef.current;
    if (caret === null || !node) return;
    pendingCaretRef.current = null;
    node.focus();
    node.setSelectionRange(caret, caret);
  }, [knowledgeDraft]);

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

  useEffect(() => {
    currentSnapshotRef.current = snapshot;
  }, [snapshot]);

  const storyActionRef = useRef<{ id: string; expectedAttempt: number } | null>(null);

  const reconcile = useCallback(async (forceStory = false): Promise<VillageSnapshot | null> => {
    if (reconcilingRef.current) return null;
    reconcilingRef.current = true;
    const notice = setTimeout(() => setCatchingUp(true), SHOW_CATCHING_UP_AFTER_MS);
    try {
      const next = await request<VillageSnapshot>("/reconcile", {
        method: "POST",
        body: forceStory
          ? JSON.stringify({
              forceStory: true,
              ...(storyActionRef.current ??= {
                id: createVillagesClientId(),
                expectedAttempt:
                  currentSnapshotRef.current?.backgroundWork?.find((job) => job.kind === "story")?.attempt ?? 0,
              }),
              actionId: storyActionRef.current.id,
            })
          : undefined,
      });
      setSnapshot(next);
      if (forceStory) storyActionRef.current = null;
      return next;
    } catch {
      // The village keeps whatever news it had and the tab keeps drawing it.
      // Deterministic reconciliation is committed before optional narration;
      // a later creative attempt can retry without replaying required state.
      return null;
    } finally {
      clearTimeout(notice);
      setCatchingUp(false);
      reconcilingRef.current = false;
    }
  }, []);

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
  const writeItUpNow = useCallback(async () => {
    const newest = snapshot?.happenings[0]?.id ?? "";
    setWriteUpNote("Writing...");
    const next = await reconcile(true);
    if (!next) {
      setWriteUpNote(
        "The update request failed. Check the village again before retrying; time catch-up may already have run.",
      );
      return;
    }
    setWriteUpNote(
      next.backgroundWork?.some((job) => job.kind === "story" && ["queued", "running", "paused"].includes(job.status))
        ? "The event is queued. See Background work for progress."
        : (next.happenings[0]?.id ?? "") === newest
          ? "No new happening was added. Other village records may have changed during catch-up."
          : "A new visual event was added. See Events.",
    );
  }, [snapshot, reconcile]);

  /**
   * Read the village.
   *
   * `quiet` is the whole of the difference between the two callers. Opening the
   * tab has nothing to fall back on, so a failure there clears the village and
   * says so; a stumble in a read that runs every minute leaves the last good
   * reading on screen instead of blanking a village that is working perfectly
   * well.
   */
  const loadSnapshot = useCallback(async (options: { signal?: AbortSignal; quiet?: boolean } = {}) => {
    try {
      const next = await request<VillageSnapshot>("", { signal: options.signal });
      setSnapshot(next);
      setError("");
    } catch (cause) {
      if (options.signal?.aborted || options.quiet) return;
      setSnapshot(null);
      setError(messageFrom(cause, "Could not read the village."));
    }
  }, []);

  const presenceSession = useRef("");

  useEffect(() => {
    if (!snapshot?.isFounded) return;
    presenceSession.current ||= createVillagesClientId();
    let heartbeatSequence = 0;
    const heartbeat = async () => {
      const sequence = ++heartbeatSequence;
      const visible = document.visibilityState === "visible" && element.checkVisibility({ checkVisibilityCSS: true });
      try {
        const presence = await request<{ snapshot?: VillageSnapshot }>("/background/presence", {
          method: "POST",
          body: JSON.stringify({ sessionId: presenceSession.current, visible }),
        });
        if (visible && sequence === heartbeatSequence) {
          if (presence.snapshot) setSnapshot(presence.snapshot);
          else {
            await reconcile();
            await loadSnapshot({ quiet: true });
          }
        }
      } catch {
        /* A lost heartbeat expires on the server. */
      }
    };
    void heartbeat();
    const timer = window.setInterval(() => void heartbeat(), 30_000);
    const changed = () => void heartbeat();
    document.addEventListener("visibilitychange", changed);
    const observer = new IntersectionObserver(changed);
    observer.observe(element);
    return () => {
      observer.disconnect();
      heartbeatSequence++;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", changed);
      void request("/background/presence", {
        method: "POST",
        body: JSON.stringify({ sessionId: presenceSession.current, visible: false }),
      }).catch(() => {});
    };
  }, [snapshot?.isFounded, reconcile, loadSnapshot, element]);

  const backgroundPending =
    snapshot?.backgroundWork?.some((job) => ["queued", "running"].includes(job.status)) ?? false;

  useEffect(() => {
    if (!backgroundPending) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadSnapshot({ quiet: true });
    }, 5_000);
    return () => clearInterval(timer);
  }, [backgroundPending, loadSnapshot]);

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
  useEffect(() => {
    const transition = snapshot?.village.nextTransitionAt ?? "";
    if (transition.length === 0 || transition === transitionRef.current) return;
    transitionRef.current = transition;
    if (snapshot?.isFounded) void reconcile();
  }, [snapshot, reconcile]);

  const loadCatalog = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await request<CatalogResponse>("/catalog", { signal });
      setCatalog(response.characters);
      setError("");
    } catch (cause) {
      if (signal?.aborted) return;
      setError(messageFrom(cause, "Could not read your character library."));
    }
  }, []);

  const loadPersonas = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await request<PersonaResponse>("/personas", { signal });
      setPersonas(response.personas);
      setPersonaDraft((current) => current || response.personas.find((persona) => persona.isActive)?.id || "");
    } catch (cause) {
      if (signal?.aborted) return;
      // A failed read settles on "none" rather than staying unsettled forever:
      // the picker then offers the fields the player can still type into, and
      // the message says what went wrong. A spinner that never resolves would
      // hide the way out along with the problem.
      setPersonas([]);
      setError(messageFrom(cause, "Could not read your Personas."));
    }
  }, []);

  const loadLorebooks = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await request<{ books: VillageLorebookOption[] }>("/lorebooks", { signal });
      setLorebooks(response.books);
      setLorebooksError("");
    } catch (cause) {
      if (signal?.aborted) return;
      setLorebooksError(
        messageFrom(cause, "Could not read Engine lorebooks. Selected books will be skipped until available."),
      );
    }
  }, []);

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

  useEffect(() => {
    const controller = new AbortController();
    void loadSnapshot({ signal: controller.signal });
    return () => controller.abort();
  }, [loadSnapshot]);

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
  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden) void loadSnapshot({ quiet: true });
    };
    const timer = setInterval(() => {
      if (document.hidden || reconcilingRef.current) return;
      void loadSnapshot({ quiet: true });
    }, VILLAGE_PULSE_MS);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loadSnapshot]);

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

  useEffect(() => {
    if (!pickerOpen) return;
    const controller = new AbortController();
    void loadCatalog(controller.signal);
    return () => controller.abort();
  }, [pickerOpen, loadCatalog]);

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

  const goHome = useCallback(() => {
    if (spriteLeaveGuard.current && !spriteLeaveGuard.current()) return;
    setSpriteManagerId(null);
    setExploreSheet(null);
    setPickerOpen(false);
    setSettingsError("");
    setOpenPlaceId(null);
    setScreen("home");
  }, []);

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

  const generateSetupTownMap = useCallback(async () => {
    if (setupMapRequestRef.current?.phase === "starting" || setupMapRequestRef.current?.phase === "waiting") return;
    if (setupSetting.trim().length === 0) {
      setSetupMapProblem("Describe what the village is like before generating its map.");
      return;
    }
    setSetupMapBusy(true);
    setSetupMapProblem("");
    setSetupProblem("");
    const pending: SetupMapRequest = {
      id: createVillagesClientId(),
      sourceKey: setupMapGenerationKey,
      startedAt: new Date().toISOString(),
      phase: "starting",
    };
    updateSetupMapRequest(pending);
    setSetupMapClock(Date.now());
    let dispatched = false;
    try {
      // Keep the receipt ID before the paid request, so a reload only retrieves it.
      await persistSetupDraft({ ...setupDraftData, mapRequest: pending, mapProblem: "", interruptedGeneration: false });
      dispatched = true;
      const receipt = await requestSetupMapReceipt("/setup/town-map/generate", {
        method: "POST",
        body: JSON.stringify({
          actionId: pending.id,
          sourceKey: pending.sourceKey,
          structure: setupMapPrompt === snapshot?.settings.townMapLayoutPrompt ? undefined : setupMapPrompt,
          negative:
            setupMapNegativePrompt === snapshot?.settings.townMapNegativePrompt ? undefined : setupMapNegativePrompt,
          setting: setupSetting,
          options: setupMapOptions,
          selectedLorebookIds: setupLorebookDraft,
          sceneryArtStyle: sceneryStyle,
          useVisualLore: mapVisualLore,
          scenarioImprint: snapshot?.isFounded
            ? { origin: "", worldFacts: setupWorldFacts, openingConditions: [], visualCues: [] }
            : null,
        }),
      });
      updateSetupMapRequest({
        id: receipt.id,
        sourceKey: receipt.sourceKey,
        startedAt: receipt.startedAt,
        phase: "waiting",
      });
    } catch (cause) {
      setSetupMapProblem(
        `${messageFrom(cause, "The village map could not be requested.")}${dispatched ? " Check map status before starting another attempt." : ""}`,
      );
      updateSetupMapRequest(dispatched ? { ...pending, phase: "paused" } : null);
      setSetupMapBusy(false);
    }
  }, [
    setupLorebookDraft,
    setupMapNegativePrompt,
    setupMapPrompt,
    setupSetting,
    setupMapOptions,
    setupMapGenerationKey,
    sceneryStyle,
    mapVisualLore,
    setupWorldFacts,
    snapshot?.isFounded,
    snapshot?.settings.townMapLayoutPrompt,
    snapshot?.settings.townMapNegativePrompt,
    persistSetupDraft,
    setupDraftData,
    updateSetupMapRequest,
  ]);

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
  const placeCount =
    (snapshot?.settings.venues.length ?? 0) +
    venuesDraft.filter((draft) => !snapshot?.settings.venues.some((saved) => saved.id === draft.id)).length;

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

  const chooseSetupScenario = (value: FoundingScenarioId) => {
    if (snapshot?.isFounded) return;
    if (value === setupFoundingReason) return;
    const previousStarter = foundingScenario(setupFoundingReason).premise;
    const keepPlayerText = !!setupFoundingDetails.trim() && setupFoundingDetails !== previousStarter;
    setSetupFoundingReason(value);
    if (!keepPlayerText) setSetupFoundingDetails(foundingScenario(value).premise);
    setSetupFoundingGuidance("");
    setSetupProblem("");
  };

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

  const gotoSetupStep = (step: number) => {
    if (step === 3 && (setupVenueBusy || setupSuggestionsBusy)) {
      setSetupProblem("Wait for the pending Venue request before Review.");
      return;
    }
    if (step > setupStep) {
      const peopleProblem =
        !personaDraft || !personas?.some((persona) => persona.id === personaDraft)
          ? "Choose an available Persona."
          : residentContextProblem ||
            connectionSetupProblem ||
            (!snapshot?.isFounded ? playerRoleProblem(setupPlayerRole) : "") ||
            (!snapshot?.isFounded &&
            (setupHomeCount < 1 ||
              setupHomeCount > 3 ||
              setupFoundingVillagerIds.some((id) => !catalog?.some((person) => person.id === id)))
              ? "Choose one to three available founding villagers."
              : "");
      const placeProblem = !setupName.trim()
        ? "Give the village a name."
        : !setupSetting.trim()
          ? "Describe where we are."
          : !snapshot?.isFounded && !setupFoundingDetails.trim()
            ? "Describe what brings you together."
            : "";
      const problem = peopleProblem || (step >= 2 ? placeProblem : "") || (step >= 3 ? setupBlocker() : "");
      if (problem) {
        setSetupProblem(problem);
        return;
      }
    }
    setSetupProblem("");
    setSetupStep(step);
    setSetupEditorOpen(false);
    void loadPersonas();
    void loadCatalog();
    void loadLorebooks();
    setPlacingHome(false);
    setPlacingPublicCenter(false);
    setMovingSetupVenueId(null);
  };

  const setupDraftRow = (venue: SetupVenueDraft) => ({
    id: venue.id,
    name: venue.name,
    venueType: venue.venueType,
    form: venue.form ?? "",
    description: venue.description,
    spaceDescription: venue.spaces?.[0]?.description ?? "",
    layout: venue.layout,
    layoutVersion: venue.layoutVersion,
    areas: [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].map((area) => ({
      id: area.id,
      name: "name" in area ? area.name : "Common Space",
      purpose: "purpose" in area ? area.purpose : "",
      venueClass: area.venueClass,
    })),
    venueClass: venue.classes?.includes("gathering") ? "gathering" : "residence",
    residentCharacterId: venue.occupancy.residentCharacterId ?? "",
  });

  const generateSetupImage = async (
    venue: SetupVenueDraft,
    area: "exterior" | "interior" | "private",
    zoneId?: string,
  ) => {
    if (setupImageClaim.current) return;
    const selectedArea = [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].find((zone) => zone.id === zoneId);
    const description = selectedArea
      ? selectedArea.description
      : area === "private"
        ? (venue.privateSpaces?.find((room) => room.ownerId === "player")?.description ?? "")
        : area === "exterior"
          ? venue.description
          : (venue.spaces?.[0]?.description ?? "");
    if (!description.trim()) {
      setSelectedSetupVenueId(venue.id);
      setSetupProblem(`Add an ${area} description before generating its image.`);
      window.setTimeout(
        () => element.querySelector<HTMLElement>(`#${ELEMENT_TAG}-setup-${area}-description`)?.focus(),
        0,
      );
      return;
    }
    const sourceKey = setupImageContextKey;
    const physicalImageKey = (row: VillageVenue | undefined) =>
      row &&
      JSON.stringify({
        name: row.name,
        venueType: row.venueType,
        form: row.form,
        description: row.description,
        occupancy: row.occupancy,
        imageContext: row.imageContext,
        zone: [...(row.spaces ?? []), ...(row.privateSpaces ?? [])]
          .filter((zone) => zone.id === zoneId)
          .map(({ id, name, purpose, description, state }) => ({ id, name, purpose, description, state })),
      });
    const venueKey = physicalImageKey(venue);
    setupImageClaim.current = true;
    setupImageTargetRef.current = { venueId: venue.id, zoneId: zoneId ?? "exterior" };
    setSetupImageTarget(setupImageTargetRef.current);
    setSetupVenueBusy(true);
    setSetupProblem("");
    try {
      const image = await request<VillageVenueImage>("/setup/venue-image/generate", {
        method: "POST",
        body: JSON.stringify({
          venue: setupDraftRow(venue),
          area,
          zoneId,
          zoneName: selectedArea?.name,
          zonePurpose: selectedArea?.purpose,
          zoneAppearance: selectedArea?.description,
          privateOwnerId: area === "private" ? "player" : undefined,
          privateDescription: description,
          residentFoundingContext: venue.occupancy.residentCharacterId
            ? selectedResidentContexts[venue.occupancy.residentCharacterId]
            : undefined,
          playerPersonaId: personaDraft,
          sceneryArtStyle: sceneryStyle,
          useAssignedVillagerContext: venue.imageContext?.useAssignedVillagerContext ?? personalizeHomes,
          useVisualLore: venue.imageContext?.useVisualLore ?? visualLoreDefault,
          villageName: setupName,
          setting: setupSetting,
          foundingDetails: setupFoundingDetails,
          scenarioImprint: snapshot?.isFounded ? setupImprint : null,
          worldFacts: snapshot?.isFounded ? setupWorldFacts : [],
          selectedLorebookIds: setupLorebookDraft,
        }),
      });
      if (
        setupImageContextKeyRef.current !== sourceKey ||
        physicalImageKey(setupVenuesRef.current.find((row) => row.id === venue.id)) !== venueKey
      ) {
        setSetupProblem("The venue changed while its image was generated. Generate again.");
        return;
      }
      setSetupVenues((rows) =>
        rows.map((row) =>
          row.id === venue.id && physicalImageKey(row) === venueKey ? withSetupImage(row, area, image, zoneId) : row,
        ),
      );
    } catch (cause) {
      setSetupProblem(messageFrom(cause, "Venue art could not be generated."));
    } finally {
      setSetupVenueBusy(false);
      setupImageClaim.current = false;
      setSetupImageTarget(null);
      setupImageTargetRef.current = null;
    }
  };

  const uploadSetupImage = async (
    venue: SetupVenueDraft,
    area: "exterior" | "interior" | "private",
    file?: File,
    zoneId?: string,
  ) => {
    if (!file || setupImageClaim.current) return;
    if (file.size > (snapshot?.settings.maxVenueImageBytes ?? 8_000_000)) {
      setSetupProblem("That venue image is too large. Choose a smaller file.");
      return;
    }
    setupImageClaim.current = true;
    setupImageTargetRef.current = { venueId: venue.id, zoneId: zoneId ?? "exterior" };
    setSetupImageTarget(setupImageTargetRef.current);
    const sourceKey = setupBeginningSourceKey;
    setSetupVenueBusy(true);
    setSetupProblem("");
    try {
      const image = await request<VillageVenueImage>("/setup/venue-image", {
        method: "PUT",
        body: JSON.stringify({ name: venue.name, image: await readFileAsDataUrl(file) }),
      });
      if (
        setupBeginningSourceKeyRef.current !== sourceKey ||
        !setupVenuesRef.current.some(
          (row) =>
            row.id === venue.id &&
            (!zoneId || [...(row.spaces ?? []), ...(row.privateSpaces ?? [])].some((zone) => zone.id === zoneId)),
        )
      )
        return;
      patchSetupVenue(venue.id, (row) => withSetupImage(row, area, image, zoneId));
    } catch (cause) {
      setSetupProblem(messageFrom(cause, "That venue image could not be uploaded."));
    } finally {
      setSetupVenueBusy(false);
      setupImageClaim.current = false;
      setSetupImageTarget(null);
      setupImageTargetRef.current = null;
    }
  };

  const withSetupImage = (
    venue: SetupVenueDraft,
    area: "exterior" | "interior" | "private",
    image: VillageVenueImage,
    zoneId?: string,
  ): SetupVenueDraft =>
    area === "exterior"
      ? { ...venue, presentation: { ...venue.presentation, image } }
      : area === "private"
        ? {
            ...venue,
            privateSpaces: (venue.privateSpaces ?? [personalSpaceDraft()]).map((room) =>
              (zoneId ? room.id === zoneId : room.ownerId === "player") ? { ...room, image } : room,
            ),
          }
        : {
            ...venue,
            spaces: venue.spaces?.map((space, index) =>
              (zoneId ? space.id === zoneId : index === 0) ? { ...space, image } : space,
            ),
          };

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
  const startOver = useCallback(async () => {
    setBusy(true);
    setSettingsError("");
    try {
      const next = await request<VillageSnapshot>("/setup/reset", { method: "POST" });
      setSnapshot(next);
      setCatalog(null);
      // The offer to found the village is made again by hand: the player asked
      // for the wizard by asking to start over.
      await draftSaveQueue.current;
      await removeFoundingDraft(API_PATH);
      draftRevision.current = 0;
      setSavedSetupDraft(null);
      setDraftReady(true);
      openSetup(true, next);
    } catch (cause) {
      setSettingsError(messageFrom(cause, "The village could not be reset."));
    } finally {
      setBusy(false);
      setResetArmed(false);
    }
  }, [openSetup]);

  useEffect(() => {
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
  }, [openSetup, snapshot, loadPersonas, loadCatalog]);

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

  const needle = search.trim().toLowerCase();

  const visibleCatalog = (catalog ?? []).filter(
    (entry) =>
      needle.length === 0 ||
      entry.name.toLowerCase().includes(needle) ||
      entry.comment.toLowerCase().includes(needle) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(needle)),
  );

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
  const portraitWanted = [
    ...(snapshot?.villagers ?? []).map((villager) => villager.characterId),
    ...(pickerOpen ? visibleCatalog.map((entry) => entry.id) : []),
    ...(screen === "setup" && setupStep === 0 ? (catalog ?? []).map((entry) => entry.id) : []),
  ].join("\n");

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
  useEffect(() => {
    const missing = portraitWanted.split("\n").filter((id) => id.length > 0 && !portraitsAsked.current.has(id));
    if (missing.length === 0) return;
    for (const id of missing) portraitsAsked.current.add(id);
    const controller = new AbortController();
    void (async () => {
      try {
        const read = await readPortraits(missing, controller.signal);
        if (!controller.signal.aborted) setPortraits((current) => ({ ...current, ...read }));
      } catch {
        // The initial is already on screen, and it is the whole fallback.
      }
    })();
    return () => controller.abort();
  }, [portraitWanted]);

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
  const personaPortraitId = snapshot?.settings.playerPersonaId ?? "";

  useEffect(() => {
    setPersonaPortrait(null);
    if (personaPortraitId.length === 0) return;
    const controller = new AbortController();
    void (async () => {
      try {
        const read = await readPersonaPortrait(personaPortraitId, controller.signal);
        if (!controller.signal.aborted) setPersonaPortrait(read);
      } catch {
        // No Persona, no portrait, or nobody to ask: the mark is the fallback
        // and it is already what is drawn.
      }
    })();
    return () => controller.abort();
  }, [personaPortraitId]);

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
  const venueExplorationActions = (place: VillageVenue): { label: string; onSelect: () => void }[] => {
    const project = snapshot?.projects.find(
      (entry) => entry.venueId === place.id && entry.lifecycle?.phase !== "complete",
    );
    return [
      ...(project?.kind === "new-venue"
        ? []
        : [
            { label: "Visit", onSelect: () => void openRoom(place) },
            { label: "View venue", onSelect: () => openPlace(place) },
          ]),
      ...(project
        ? [
            {
              label: "View Project",
              onSelect: () => {
                setExploreSheet(null);
                openMenu("projects");
                setFocusedProjectId(project.id);
                setSiteProjectId(project.id);
              },
            },
          ]
        : []),
    ];
  };

  const savedPins: MapPin[] = (() => {
    const places = snapshot?.settings.venues ?? [];
    const pins: MapPin[] = [];
    // Everybody's current place, grouped by which place it is, so that two people
    // at the harbour hang under the harbour rather than on top of each other.
    const standing = new Map<string, VillageVillagerView[]>();
    for (const villager of snapshot?.villagers ?? []) {
      const id = villager.place?.id;
      if (!id) continue;
      const group = standing.get(id);
      if (group) group.push(villager);
      else standing.set(id, [villager]);
    }
    for (const place of places) {
      const spot = placeSpot(place);
      if (!spot) continue;
      const project = snapshot?.projects.find(
        (entry) => entry.venueId === place.id && entry.lifecycle?.phase !== "complete",
      );
      const occupant = place.occupancy.residentCharacterId;
      const house = isHouse(place);
      // Who the place is named after. A villager's own name, or the player's: the
      // player's house is the one house with no villager in it, so the Persona is
      // what stands in the same place rather than a rule of its own. See
      // `houseLabel`, which is the one reader of what a name does to "house".
      const resident = place.occupancy.playerHome ? playerDisplayName(snapshot) : nameOfCharacter(occupant);
      pins.push({
        id: place.id,
        x: spot.x,
        y: spot.y,
        text: mobile ? place.name : house ? pinText(resident) : place.name,
        image: project ? PROJECT_BLUEPRINT_IMAGE : (place.presentation.image?.url ?? null),
        tone: house ? pinTone({ isPlayerHome: place.occupancy.playerHome, occupant }) : "venue",
        selected: openPlaceId === place.id,
        onSelect: () => openVenue(place),
      });
      // Who is here, under the building they are at. Drawn as a label rather than
      // a button, because the place is what you walk into: who happens to be
      // standing in it at this hour is a fact about the place and not a second
      // door into it.
      (standing.get(place.id) ?? []).forEach((villager, index) => {
        pins.push({
          id: `villager:${villager.characterId}`,
          x: spot.x,
          y: spot.y,
          dy: STANDING_PIN_STEP * (index + 1),
          text: villager.name,
          tone: "resident",
          kind: "person",
          venueId: place.id,
          selected: mobile && openPlaceId === place.id,
          onSelect: mobile ? () => openVenue(place) : undefined,
        });
      });
    }
    return pins;
  })();

  const draftPins: MapPin[] = setupVenues.flatMap((venue, index) => {
    const spot = placeSpot(venue);
    if (!spot) return [];
    return [
      {
        id: venue.id,
        x: spot.x,
        y: spot.y,
        text: venue.name || (venue.category === "public-center" ? "Gathering Place" : "Residence"),
        label: `${index + 1}. ${venue.name || (venue.category === "public-center" ? "Gathering Place" : "Residence")}`,
        image: venue.presentation.image?.url ?? null,
        tone: venue.category === "public-center" ? "venue" : venue.occupancy.playerHome ? "player" : "resident",
        selected: selectedSetupVenueId === venue.id,
        onSelect: () => {
          setupEditorOriginal.current = structuredClone(venue);
          setupEditorAuthoredOriginal.current = [...(setupAuthoredFields[venue.id] ?? [])];
          setupEditorZoneOriginal.current = structuredClone(setupZoneDrafts.current[venue.id]);
          setSelectedSetupVenueId(venue.id);
          setSetupEditorOpen(false);
          setMovingSetupVenueId(null);
          setSetupWorkspace((current) => ({ ...current, paused: true, view: "details" }));
        },
      },
    ];
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
export type VillageController = ReturnType<typeof useVillageController>;
