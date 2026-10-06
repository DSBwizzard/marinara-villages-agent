import type { useAddNotice } from "../settings/actions.js";

import type { useAddVenue } from "../venues/actions.js";

import type { useAddVillager } from "../residents/actions.js";

import type { ResidentsState } from "../residents/useResidentsState.js";

import type { useApplyVillagerRefresh } from "../residents/actions.js";

import type { ScenesState } from "../scenes/useScenesState.js";

import type { createFoundingChooseSetupScenario } from "../founding/setup-controller.js";

import type { useCloseExploration } from "./actions.js";

import type { useCloseRoom } from "../scenes/actions.js";

import type { FoundingState } from "../founding/useFoundingState.js";

import type { useContinueRoomWithoutGreeting } from "../scenes/actions.js";

import type { useCorrectCompletedWish } from "../residents/actions.js";

import type { useDecideVenueRequest } from "../venues/actions.js";

import type { useDeleteArchivedVisits } from "../scenes/actions.js";

import type { useDiscardRoomDebug } from "../scenes/actions.js";

import type { useDiscardTownMapDraft } from "./actions.js";

import type { useDismissRoomNotice } from "../scenes/actions.js";

import type { useDrawPlaceImage } from "./actions.js";

import type { useDropPlaceImage } from "./actions.js";

import type { createFoundingExitSetupDraft } from "../founding/draft-controller.js";

import type { ExplorationState } from "./useExplorationState.js";

import type { ProjectsState } from "../projects/useProjectsState.js";

import type { useForgetMemory } from "../residents/actions.js";

import type { useFoundVillage } from "../founding/actions.js";

import type { useGenerateReplacementMap } from "./actions.js";

import type { createFoundingGenerateSetupImage } from "../founding/image-controller.js";

import type { useFoundingGenerateSetupTownMap } from "../founding/image-controller.js";

import type { useNavigationGoHome } from "../../shell/navigation-controller.js";

import type { createFoundingGotoSetupStep } from "../founding/setup-controller.js";

import type { useGreetRoom } from "../scenes/actions.js";

import type { useInsertMacro } from "../settings/actions.js";

import type { useKeepPlaceImage } from "./actions.js";

import type { SettingsState } from "../settings/useSettingsState.js";

import type { useLeaveRoom } from "../scenes/actions.js";

import type { useLeaveVenue } from "../venues/actions.js";

import type { useLoadMemoryLibrary } from "../residents/actions.js";

import type { useLoadVillageSnapshot } from "../../shared/data-controller.js";

import type { menuCategory } from "../../shell/navigation.js";

import type { VenuesState } from "../venues/useVenuesState.js";

import type { useMoveRoom } from "../scenes/actions.js";

import type { useResidentsNameOfCharacter } from "../residents/controller-hooks.js";

import type { createFoundingNewSetupDraft } from "../founding/draft-controller.js";

import type { useScenesOpenMenu } from "../../shell/navigation-actions.js";

import type { useNavigationOpenPerson } from "../../shell/navigation-controller.js";

import type { useOpenPlace } from "./actions.js";

import type { useOpenRoom } from "../scenes/actions.js";

import type { useOpenSetup } from "../founding/actions.js";

import type { useOpenVenue } from "../venues/actions.js";

import type { useOpenVisit } from "../scenes/actions.js";

import type { usePatchSetupVenue } from "../founding/actions.js";

import type { usePickSetupTownMap } from "../founding/actions.js";

import type { usePickTownMap } from "./actions.js";

import type { usePlaceSetupPin } from "../founding/actions.js";

import type { usePreviewVillagerRefresh } from "../residents/actions.js";

import type { useRemoveNotice } from "../settings/actions.js";

import type { useRemoveVenue } from "../venues/actions.js";

import type { useRemoveVillager } from "../residents/actions.js";

import type { createFoundingRestoreSetupDraft } from "../founding/draft-controller.js";

import type { useRetryPreparation } from "../founding/actions.js";

import type { useRetrySavedScene } from "../scenes/actions.js";

import type { createFoundingRetrySetupSaving } from "../founding/draft-controller.js";

import type { useResidentsRetryWork } from "../background/actions.js";

import type { useRewriteAgenda } from "../residents/actions.js";

import type { useSaveCharacterSpeechColors } from "../settings/actions.js";

import type { useSaveSendOnEnter } from "../settings/actions.js";

import type { useSaveSettings } from "../settings/actions.js";

import type { useSaveSpriteCardFlip } from "../settings/actions.js";

import type { useSaveStoryPace } from "../settings/actions.js";

import type { useSaveTownMap } from "./actions.js";

import type { useSaveVenue } from "../venues/actions.js";

import type { useSaveVisitRetention } from "../settings/actions.js";

import type { useFoundingSelectedResidentContexts } from "../founding/controller-hooks.js";

import type { useSendRoom } from "../scenes/actions.js";

import type { useSetAgendaScheduleIngestion } from "../residents/actions.js";

import type { useResidentsStandingAt } from "../residents/controller-hooks.js";

import type { useStartMapReplacement } from "./actions.js";

import type { useFoundingStartOver } from "../founding/setup-controller.js";

import type { useSuggestPlaces } from "../founding/actions.js";

import type { createFoundingSuggestSetupVenues } from "../founding/setup-controller.js";

import type { useUpdateSetupMapRequest } from "../founding/actions.js";

import type { createFoundingUploadSetupImage } from "../founding/image-controller.js";

import type { createVenueExplorationActions } from "./venue-actions.js";

import type { useWriteVillageEvent } from "../../shared/data-controller.js";

/** Values and actions used by ExplorationScreen; independent of shell implementation. */
export type ExplorationScreenController = {
  readonly addNotice: ReturnType<typeof useAddNotice>;
  readonly addVenue: ReturnType<typeof useAddVenue>;
  readonly addVillager: ReturnType<typeof useAddVillager>;
  readonly agendas: ResidentsState["agendas"];
  readonly applyVillagerRefresh: ReturnType<typeof useApplyVillagerRefresh>;
  readonly archiveError: ScenesState["archiveError"];
  readonly archiveOffset: ScenesState["archiveOffset"];
  readonly archiveTotal: ScenesState["archiveTotal"];
  readonly archiveVenueId: ScenesState["archiveVenueId"];
  readonly archiveVillagerId: ScenesState["archiveVillagerId"];
  readonly backgroundPanel: React.JSX.Element;
  readonly busy: boolean;
  readonly catalog: import("../../../shared/contracts/village").CatalogEntry[];
  readonly catchingUp: boolean;
  readonly chooseSetupScenario: ReturnType<typeof createFoundingChooseSetupScenario>;
  readonly closeExploration: ReturnType<typeof useCloseExploration>;
  readonly closeRoom: ReturnType<typeof useCloseRoom>;
  readonly composerEditVersionRef: ScenesState["composerEditVersionRef"];
  readonly connectionSetupProblem: FoundingState["connectionSetupProblem"];
  readonly continueRoomWithoutGreeting: ReturnType<typeof useContinueRoomWithoutGreeting>;
  readonly correctCompletedWish: ReturnType<typeof useCorrectCompletedWish>;
  readonly debugDiscardEnabled: ScenesState["debugDiscardEnabled"];
  readonly decideVenueRequest: ReturnType<typeof useDecideVenueRequest>;
  readonly deleteArchivedVisits: ReturnType<typeof useDeleteArchivedVisits>;
  readonly discardRoomDebug: ReturnType<typeof useDiscardRoomDebug>;
  readonly discardTownMapDraft: ReturnType<typeof useDiscardTownMapDraft>;
  readonly dismissRoomNotice: ReturnType<typeof useDismissRoomNotice>;
  readonly draftPins: import("../../shared/types").MapPin[];
  readonly draftSaveError: FoundingState["draftSaveError"];
  readonly draftSavedAt: FoundingState["draftSavedAt"];
  readonly draftSaving: FoundingState["draftSaving"];
  readonly drawPlaceImage: ReturnType<typeof useDrawPlaceImage>;
  readonly dropPlaceImage: ReturnType<typeof useDropPlaceImage>;
  readonly error: string;
  readonly exitSetupDraft: ReturnType<typeof createFoundingExitSetupDraft>;
  readonly explorationOrigin: ExplorationState["explorationOrigin"];
  readonly explorationReturnTab: ExplorationState["explorationReturnTab"];
  readonly explorationSearch: ExplorationState["explorationSearch"];
  readonly exploreSheet: ExplorationState["exploreSheet"];
  readonly focusedProjectId: ProjectsState["focusedProjectId"];
  readonly forgetMemory: ReturnType<typeof useForgetMemory>;
  readonly foundVillage: ReturnType<typeof useFoundVillage>;
  readonly framingMap: boolean;
  readonly generateReplacementMap: ReturnType<typeof useGenerateReplacementMap>;
  readonly generateSetupImage: ReturnType<typeof createFoundingGenerateSetupImage>;
  readonly generateSetupTownMap: ReturnType<typeof useFoundingGenerateSetupTownMap>;
  readonly goHome: ReturnType<typeof useNavigationGoHome>;
  readonly gotoSetupStep: ReturnType<typeof createFoundingGotoSetupStep>;
  readonly greetRoom: ReturnType<typeof useGreetRoom>;
  readonly homeBuildings: readonly import("../../../shared/contracts/village").VillageBuildingOption[];
  readonly insertMacro: ReturnType<typeof useInsertMacro>;
  readonly keepPlaceImage: ReturnType<typeof useKeepPlaceImage>;
  readonly knowledgeDraft: SettingsState["knowledgeDraft"];
  readonly knowledgeRef: SettingsState["knowledgeRef"];
  readonly lastSceneEnding: ScenesState["lastSceneEnding"];
  readonly leaveRoom: ReturnType<typeof useLeaveRoom>;
  readonly leaveVenue: ReturnType<typeof useLeaveVenue>;
  readonly loadMemoryLibrary: ReturnType<typeof useLoadMemoryLibrary>;
  readonly loadSnapshot: ReturnType<typeof useLoadVillageSnapshot>;
  readonly loreTokenBudgetDraft: SettingsState["loreTokenBudgetDraft"];
  readonly lorebookDraft: SettingsState["lorebookDraft"];
  readonly lorebooks: import("../../../shared/contracts/village").VillageLorebookOption[];
  readonly lorebooksError: string;
  readonly mailboxOpen: ScenesState["mailboxOpen"];
  readonly mapGenerating: ExplorationState["mapGenerating"];
  readonly mapPinDraft: ExplorationState["mapPinDraft"];
  readonly mapRemoveDraft: ExplorationState["mapRemoveDraft"];
  readonly mapReplaceOpen: ExplorationState["mapReplaceOpen"];
  readonly mapVisualLore: FoundingState["mapVisualLore"];
  readonly memoryLibrary: ResidentsState["memoryLibrary"];
  readonly menuPage: import("../../shared/types").MenuPage;
  readonly menuSection: ReturnType<typeof menuCategory>;
  readonly mobile: boolean;
  readonly movePrivateZoneId: VenuesState["movePrivateZoneId"];
  readonly moveRoom: ReturnType<typeof useMoveRoom>;
  readonly moveTargetId: VenuesState["moveTargetId"];
  readonly movingSetupVenueId: FoundingState["movingSetupVenueId"];
  readonly nameOfCharacter: ReturnType<typeof useResidentsNameOfCharacter>;
  readonly navigationView: ExplorationState["navigationView"];
  readonly newSetupDraft: ReturnType<typeof createFoundingNewSetupDraft>;
  readonly noticeDraft: SettingsState["noticeDraft"];
  readonly openArchivedVisit: ScenesState["openArchivedVisit"];
  readonly openMenu: ReturnType<typeof useScenesOpenMenu>;
  readonly openPerson: ReturnType<typeof useNavigationOpenPerson>;
  readonly openPlace: ReturnType<typeof useOpenPlace>;
  readonly openPlaceId: ExplorationState["openPlaceId"];
  readonly openRoom: ReturnType<typeof useOpenRoom>;
  readonly openSetup: ReturnType<typeof useOpenSetup>;
  readonly openVenue: ReturnType<typeof useOpenVenue>;
  readonly openVisit: ReturnType<typeof useOpenVisit>;
  readonly panelMapView: import("../../../shared/contracts/village").TownMapView;
  readonly patchSetupVenue: ReturnType<typeof usePatchSetupVenue>;
  readonly personProfile: ResidentsState["personProfile"];
  readonly personaDraft: SettingsState["personaDraft"];
  readonly personaPortrait: import("../../shared/types").Portrait;
  readonly personalizeHomes: FoundingState["personalizeHomes"];
  readonly personas: import("../../../shared/contracts/village").PersonaEntry[];
  readonly pickSetupTownMap: ReturnType<typeof usePickSetupTownMap>;
  readonly pickTownMap: ReturnType<typeof usePickTownMap>;
  readonly pickerOpen: boolean;
  readonly placeBusyId: VenuesState["placeBusyId"];
  readonly placeCount: number;
  readonly placeProblem: VenuesState["placeProblem"];
  readonly placeSetupPin: ReturnType<typeof usePlaceSetupPin>;
  readonly placingMapVenueId: ExplorationState["placingMapVenueId"];
  readonly placingProjectId: ProjectsState["placingProjectId"];
  readonly playerMovePrivateZoneId: VenuesState["playerMovePrivateZoneId"];
  readonly portraits: ResidentsState["portraits"];
  readonly preparationProblem: FoundingState["preparationProblem"];
  readonly previewVillagerRefresh: ReturnType<typeof usePreviewVillagerRefresh>;
  readonly profileOrigin: ResidentsState["profileOrigin"];
  readonly progressDebug: import("../../../shared/contracts/village").ProgressDebugView;
  readonly reframingMap: ExplorationState["reframingMap"];
  readonly refreshBusyId: ResidentsState["refreshBusyId"];
  readonly refreshPreviews: ResidentsState["refreshPreviews"];
  readonly removeNotice: ReturnType<typeof useRemoveNotice>;
  readonly removeVenue: ReturnType<typeof useRemoveVenue>;
  readonly removeVillager: ReturnType<typeof useRemoveVillager>;
  readonly requestEdits: SettingsState["requestEdits"];
  readonly resetArmed: boolean;
  readonly restoreSetupDraft: ReturnType<typeof createFoundingRestoreSetupDraft>;
  readonly retryPreparation: ReturnType<typeof useRetryPreparation>;
  readonly retrySavedScene: ReturnType<typeof useRetrySavedScene>;
  readonly retrySetupSaving: ReturnType<typeof createFoundingRetrySetupSaving>;
  readonly retryWork: ReturnType<typeof useResidentsRetryWork>;
  readonly rewriteAgenda: ReturnType<typeof useRewriteAgenda>;
  readonly room: import("../../../shared/contracts/village").SceneView;
  readonly roomBusy: ScenesState["roomBusy"];
  readonly roomChangeStatus: ScenesState["roomChangeStatus"];
  readonly roomContactBoundary: ScenesState["roomContactBoundary"];
  readonly roomDraft: ScenesState["roomDraft"];
  readonly roomEnded: ScenesState["roomEnded"];
  readonly roomError: ScenesState["roomError"];
  readonly roomGreetingError: ScenesState["roomGreetingError"];
  readonly roomGreetingNotice: ScenesState["roomGreetingNotice"];
  readonly roomLeaveSubmissionIdRef: ScenesState["roomLeaveSubmissionIdRef"];
  readonly roomMode: ScenesState["roomMode"];
  readonly roomMoveOperationIdRef: ScenesState["roomMoveOperationIdRef"];
  readonly roomMoveZoneId: ScenesState["roomMoveZoneId"];
  readonly roomNotices: ScenesState["roomNotices"];
  readonly roomOpen: ScenesState["roomOpen"];
  readonly roomRuling: ScenesState["roomRuling"];
  readonly roomSubmissionIdRef: ScenesState["roomSubmissionIdRef"];
  readonly roomTargetId: ScenesState["roomTargetId"];
  readonly roomUnresolvedChanges: ScenesState["roomUnresolvedChanges"];
  readonly rosterSearch: ResidentsState["rosterSearch"];
  readonly saveCharacterSpeechColors: ReturnType<typeof useSaveCharacterSpeechColors>;
  readonly saveSendOnEnter: ReturnType<typeof useSaveSendOnEnter>;
  readonly saveSettings: ReturnType<typeof useSaveSettings>;
  readonly saveSpriteCardFlip: ReturnType<typeof useSaveSpriteCardFlip>;
  readonly saveStoryPace: ReturnType<typeof useSaveStoryPace>;
  readonly saveTownMap: ReturnType<typeof useSaveTownMap>;
  readonly saveVenue: ReturnType<typeof useSaveVenue>;
  readonly saveVisitRetention: ReturnType<typeof useSaveVisitRetention>;
  readonly savedPins: import("../../shared/types").MapPin[];
  readonly savedSetupDraft: import("../founding/villages-founding-draft").SavedFoundingDraft<
    import("../founding/draft-model").SetupDraftData
  >;
  readonly savedTownMapShape: import("../../shared/types").MapFrameShape;
  readonly savedTownMapView: import("../../../shared/contracts/village").TownMapView;
  readonly sceneryStyle: FoundingState["sceneryStyle"];
  readonly screen: "room" | "venue" | "home" | "menu" | "setup" | "resume" | "preparing" | "person";
  readonly search: string;
  readonly selectedMapVenueId: ExplorationState["selectedMapVenueId"];
  readonly selectedResidentContexts: ReturnType<typeof useFoundingSelectedResidentContexts>;
  readonly selectedSetupVenueId: FoundingState["selectedSetupVenueId"];
  readonly sendRoom: ReturnType<typeof useSendRoom>;
  readonly setAgendaScheduleIngestion: ReturnType<typeof useSetAgendaScheduleIngestion>;
  readonly setArchiveOffset: ScenesState["setArchiveOffset"];
  readonly setArchiveVenueId: ScenesState["setArchiveVenueId"];
  readonly setArchiveVillagerId: ScenesState["setArchiveVillagerId"];
  readonly setBusy: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setConnectionSetupProblem: FoundingState["setConnectionSetupProblem"];
  readonly setError: React.Dispatch<React.SetStateAction<string>>;
  readonly setExplorationSearch: ExplorationState["setExplorationSearch"];
  readonly setExploreSheet: ExplorationState["setExploreSheet"];
  readonly setFocusedProjectId: ProjectsState["setFocusedProjectId"];
  readonly setFocusedRequestId: ProjectsState["setFocusedRequestId"];
  readonly setKnowledgeDraft: SettingsState["setKnowledgeDraft"];
  readonly setLoreTokenBudgetDraft: SettingsState["setLoreTokenBudgetDraft"];
  readonly setLorebookDraft: SettingsState["setLorebookDraft"];
  readonly setMailboxOpen: ScenesState["setMailboxOpen"];
  readonly setMapPinDraft: ExplorationState["setMapPinDraft"];
  readonly setMapRemoveDraft: ExplorationState["setMapRemoveDraft"];
  readonly setMapVisualLore: FoundingState["setMapVisualLore"];
  readonly setMemoryLibrary: ResidentsState["setMemoryLibrary"];
  readonly setMenuPage: React.Dispatch<React.SetStateAction<import("../../shared/types").MenuPage>>;
  readonly setMovePrivateZoneId: VenuesState["setMovePrivateZoneId"];
  readonly setMoveTargetId: VenuesState["setMoveTargetId"];
  readonly setMovingSetupVenueId: FoundingState["setMovingSetupVenueId"];
  readonly setNavigationView: ExplorationState["setNavigationView"];
  readonly setNoticeDraft: SettingsState["setNoticeDraft"];
  readonly setOpenArchivedVisit: ScenesState["setOpenArchivedVisit"];
  readonly setOpenPlaceId: ExplorationState["setOpenPlaceId"];
  readonly setPersonProfile: ResidentsState["setPersonProfile"];
  readonly setPersonaDraft: SettingsState["setPersonaDraft"];
  readonly setPersonalizeHomes: FoundingState["setPersonalizeHomes"];
  readonly setPickerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setPlaceProblem: VenuesState["setPlaceProblem"];
  readonly setPlacingMapVenueId: ExplorationState["setPlacingMapVenueId"];
  readonly setPlacingProjectId: ProjectsState["setPlacingProjectId"];
  readonly setPlayerMovePrivateZoneId: VenuesState["setPlayerMovePrivateZoneId"];
  readonly setProfileInspection: ResidentsState["setProfileInspection"];
  readonly setProgressDebug: React.Dispatch<
    React.SetStateAction<import("../../../shared/contracts/village").ProgressDebugView>
  >;
  readonly setReframingMap: ExplorationState["setReframingMap"];
  readonly setRequestEdits: SettingsState["setRequestEdits"];
  readonly setResetArmed: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setRoom: React.ActionDispatch<
    [next: React.SetStateAction<import("../../../shared/contracts/village").SceneView>]
  >;
  readonly setRoomBusy: ScenesState["setRoomBusy"];
  readonly setRoomContactBoundary: ScenesState["setRoomContactBoundary"];
  readonly setRoomContactKind: ScenesState["setRoomContactKind"];
  readonly setRoomDraft: ScenesState["setRoomDraft"];
  readonly setRoomError: ScenesState["setRoomError"];
  readonly setRoomMode: ScenesState["setRoomMode"];
  readonly setRoomMoveZoneId: ScenesState["setRoomMoveZoneId"];
  readonly setRoomTargetId: ScenesState["setRoomTargetId"];
  readonly setRosterSearch: ResidentsState["setRosterSearch"];
  readonly setSceneryStyle: FoundingState["setSceneryStyle"];
  readonly setScreen: React.Dispatch<
    React.SetStateAction<"room" | "venue" | "home" | "menu" | "setup" | "resume" | "preparing" | "person">
  >;
  readonly setSearch: React.Dispatch<React.SetStateAction<string>>;
  readonly setSelectedMapVenueId: ExplorationState["setSelectedMapVenueId"];
  readonly setSelectedSetupVenueId: FoundingState["setSelectedSetupVenueId"];
  readonly setSettingDraft: SettingsState["setSettingDraft"];
  readonly setSettingsError: SettingsState["setSettingsError"];
  readonly setSetupEditorOpen: FoundingState["setSetupEditorOpen"];
  readonly setSetupFocusIssue: FoundingState["setSetupFocusIssue"];
  readonly setSetupFoundingDetails: FoundingState["setSetupFoundingDetails"];
  readonly setSetupFoundingGuidance: FoundingState["setSetupFoundingGuidance"];
  readonly setSetupFoundingVillagerIds: FoundingState["setSetupFoundingVillagerIds"];
  readonly setSetupKeyboardSpot: FoundingState["setSetupKeyboardSpot"];
  readonly setSetupLoreTokenBudgetDraft: FoundingState["setSetupLoreTokenBudgetDraft"];
  readonly setSetupLorebookDraft: FoundingState["setSetupLorebookDraft"];
  readonly setSetupMapBusy: FoundingState["setSetupMapBusy"];
  readonly setSetupMapGeneratedKey: FoundingState["setSetupMapGeneratedKey"];
  readonly setSetupMapNegativePrompt: FoundingState["setSetupMapNegativePrompt"];
  readonly setSetupMapOptions: FoundingState["setSetupMapOptions"];
  readonly setSetupMapProblem: FoundingState["setSetupMapProblem"];
  readonly setSetupMapPrompt: FoundingState["setSetupMapPrompt"];
  readonly setSetupMapReviewed: FoundingState["setSetupMapReviewed"];
  readonly setSetupMapSource: FoundingState["setSetupMapSource"];
  readonly setSetupName: FoundingState["setSetupName"];
  readonly setSetupPlacementError: FoundingState["setSetupPlacementError"];
  readonly setSetupPlayerRole: FoundingState["setSetupPlayerRole"];
  readonly setSetupProblem: FoundingState["setSetupProblem"];
  readonly setSetupResidentContexts: FoundingState["setSetupResidentContexts"];
  readonly setSetupRoleExpanded: FoundingState["setSetupRoleExpanded"];
  readonly setSetupSetting: FoundingState["setSetupSetting"];
  readonly setSetupShowIssues: FoundingState["setSetupShowIssues"];
  readonly setSetupStep: FoundingState["setSetupStep"];
  readonly setSetupVenues: FoundingState["setSetupVenues"];
  readonly setSetupWorkspace: FoundingState["setSetupWorkspace"];
  readonly setSetupWorldFacts: FoundingState["setSetupWorldFacts"];
  readonly setSiteProjectId: ProjectsState["setSiteProjectId"];
  readonly setSnapshot: React.Dispatch<
    React.SetStateAction<import("../../../shared/contracts/village").VillageSnapshot>
  >;
  readonly setSpriteManagerId: ResidentsState["setSpriteManagerId"];
  readonly setTownMapDraft: ExplorationState["setTownMapDraft"];
  readonly setTownMapPick: ExplorationState["setTownMapPick"];
  readonly setVenueEditBusy: VenuesState["setVenueEditBusy"];
  readonly setVenueEditDraft: VenuesState["setVenueEditDraft"];
  readonly setVenueEditError: VenuesState["setVenueEditError"];
  readonly setVenueEditNotice: VenuesState["setVenueEditNotice"];
  readonly setVenueId: VenuesState["setVenueId"];
  readonly setVenuePage: VenuesState["setVenuePage"];
  readonly setVenueProposalDraft: VenuesState["setVenueProposalDraft"];
  readonly setVenueSearch: VenuesState["setVenueSearch"];
  readonly setVenueZoneKey: VenuesState["setVenueZoneKey"];
  readonly setVisualLoreDefault: FoundingState["setVisualLoreDefault"];
  readonly settingDraft: SettingsState["settingDraft"];
  readonly settingsError: SettingsState["settingsError"];
  readonly setupBeginningSourceKey: string;
  readonly setupEditorOpen: FoundingState["setupEditorOpen"];
  readonly setupFocusIssue: FoundingState["setupFocusIssue"];
  readonly setupFoundingDetails: FoundingState["setupFoundingDetails"];
  readonly setupFoundingGuidance: FoundingState["setupFoundingGuidance"];
  readonly setupFoundingReason: FoundingState["setupFoundingReason"];
  readonly setupFoundingVillagerIds: FoundingState["setupFoundingVillagerIds"];
  readonly setupImageClaim: FoundingState["setupImageClaim"];
  readonly setupImageTarget: FoundingState["setupImageTarget"];
  readonly setupKeyboardSpot: FoundingState["setupKeyboardSpot"];
  readonly setupLoreTokenBudgetDraft: FoundingState["setupLoreTokenBudgetDraft"];
  readonly setupLorebookDraft: FoundingState["setupLorebookDraft"];
  readonly setupMapBusy: FoundingState["setupMapBusy"];
  readonly setupMapGeneratedKey: FoundingState["setupMapGeneratedKey"];
  readonly setupMapGenerationKey: string;
  readonly setupMapImageSource: FoundingState["setupMapImageSource"];
  readonly setupMapNegativePrompt: FoundingState["setupMapNegativePrompt"];
  readonly setupMapOptions: FoundingState["setupMapOptions"];
  readonly setupMapProblem: FoundingState["setupMapProblem"];
  readonly setupMapProgress: string;
  readonly setupMapPrompt: FoundingState["setupMapPrompt"];
  readonly setupMapRequest: FoundingState["setupMapRequest"];
  readonly setupMapReviewed: FoundingState["setupMapReviewed"];
  readonly setupMapShape: import("../../shared/types").MapFrameShape;
  readonly setupMapSize: FoundingState["setupMapSize"];
  readonly setupMapSource: FoundingState["setupMapSource"];
  readonly setupMapSrc: string;
  readonly setupName: FoundingState["setupName"];
  readonly setupPlacementError: FoundingState["setupPlacementError"];
  readonly setupPlayerRole: FoundingState["setupPlayerRole"];
  readonly setupProblem: FoundingState["setupProblem"];
  readonly setupResidentContexts: FoundingState["setupResidentContexts"];
  readonly setupRoleExpanded: FoundingState["setupRoleExpanded"];
  readonly setupSetting: FoundingState["setupSetting"];
  readonly setupShowIssues: FoundingState["setupShowIssues"];
  readonly setupStep: FoundingState["setupStep"];
  readonly setupSuggestionsBusy: FoundingState["setupSuggestionsBusy"];
  readonly setupSuggestionsClaim: FoundingState["setupSuggestionsClaim"];
  readonly setupSuggestionsKey: FoundingState["setupSuggestionsKey"];
  readonly setupVenueBusy: FoundingState["setupVenueBusy"];
  readonly setupVenues: FoundingState["setupVenues"];
  readonly setupWorkspace: FoundingState["setupWorkspace"];
  readonly setupWorldFacts: FoundingState["setupWorldFacts"];
  readonly siteProjectId: ProjectsState["siteProjectId"];
  readonly snapshot: import("../../../shared/contracts/village").VillageSnapshot;
  readonly spriteFlipDraft: ResidentsState["spriteFlipDraft"];
  readonly spriteFlipError: ResidentsState["spriteFlipError"];
  readonly spriteFlipSaving: ResidentsState["spriteFlipSaving"];
  readonly spriteLeaveGuard: ResidentsState["spriteLeaveGuard"];
  readonly spriteManagerId: ResidentsState["spriteManagerId"];
  readonly spriteProfileScroll: ResidentsState["spriteProfileScroll"];
  readonly standingAt: ReturnType<typeof useResidentsStandingAt>;
  readonly startMapReplacement: ReturnType<typeof useStartMapReplacement>;
  readonly startOver: ReturnType<typeof useFoundingStartOver>;
  readonly suggestPlaces: ReturnType<typeof useSuggestPlaces>;
  readonly suggestSetupVenues: ReturnType<typeof createFoundingSuggestSetupVenues>;
  readonly townMapAdvice: { tone: "ok" | "warn"; text: string };
  readonly townMapImage: ExplorationState["townMapImage"];
  readonly townMapPick: ExplorationState["townMapPick"];
  readonly townMapShape: import("../../shared/types").MapFrameShape;
  readonly townMapSrc: string;
  readonly townMapZoom: import("../../shared/types").MapZoomRange;
  readonly updateSetupMapRequest: ReturnType<typeof useUpdateSetupMapRequest>;
  readonly uploadSetupImage: ReturnType<typeof createFoundingUploadSetupImage>;
  readonly venueEditBusy: VenuesState["venueEditBusy"];
  readonly venueEditDraft: VenuesState["venueEditDraft"];
  readonly venueEditError: VenuesState["venueEditError"];
  readonly venueEditNotice: VenuesState["venueEditNotice"];
  readonly venueExplorationActions: ReturnType<typeof createVenueExplorationActions>;
  readonly venueId: VenuesState["venueId"];
  readonly venuePage: VenuesState["venuePage"];
  readonly venueProposalDraft: VenuesState["venueProposalDraft"];
  readonly venueSearch: VenuesState["venueSearch"];
  readonly venueVisits: ScenesState["venueVisits"];
  readonly venueZoneKey: VenuesState["venueZoneKey"];
  readonly venuesDraft: VenuesState["venuesDraft"];
  readonly visibleCatalog: import("../../../shared/contracts/village").CatalogEntry[];
  readonly visualLoreDefault: FoundingState["visualLoreDefault"];
  readonly writeItUpNow: ReturnType<typeof useWriteVillageEvent>;
  readonly writeUpNote: ScenesState["writeUpNote"];
};
