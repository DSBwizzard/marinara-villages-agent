import type { useAddNotice } from "../features/settings/actions.js";

import type { useAddVenue } from "../features/venues/actions.js";

import type { ScenesState } from "../features/scenes/useScenesState.js";

import type { useDecideVenueRequest } from "../features/venues/actions.js";

import type { useDeleteArchivedVisits } from "../features/scenes/actions.js";

import type { useDiscardTownMapDraft } from "../features/exploration/actions.js";

import type { ProjectsState } from "../features/projects/useProjectsState.js";

import type { useGenerateReplacementMap } from "../features/exploration/actions.js";

import type { useNavigationGoHome } from "./navigation-controller.js";

import type { useInsertMacro } from "../features/settings/actions.js";

import type { SettingsState } from "../features/settings/useSettingsState.js";

import type { ExplorationState } from "../features/exploration/useExplorationState.js";

import type { menuCategory } from "./navigation.js";

import type { useResidentsNameOfCharacter } from "../features/residents/controller-hooks.js";

import type { useScenesOpenMenu } from "./navigation-actions.js";

import type { useOpenPlace } from "../features/exploration/actions.js";

import type { useOpenSetup } from "../features/founding/actions.js";

import type { useOpenVisit } from "../features/scenes/actions.js";

import type { FoundingState } from "../features/founding/useFoundingState.js";

import type { usePickTownMap } from "../features/exploration/actions.js";

import type { useRemoveNotice } from "../features/settings/actions.js";

import type { useRemoveVenue } from "../features/venues/actions.js";

import type { useSaveCharacterSpeechColors } from "../features/settings/actions.js";

import type { useSaveSendOnEnter } from "../features/settings/actions.js";

import type { useSaveScenerySettings } from "../features/settings/actions.js";

import type { useSaveSettings } from "../features/settings/actions.js";

import type { useSaveStoryPace } from "../features/settings/actions.js";

import type { useSaveTownMap } from "../features/exploration/actions.js";

import type { useSaveVenue } from "../features/venues/actions.js";

import type { useSaveVisitRetention } from "../features/settings/actions.js";

import type { VenuesState } from "../features/venues/useVenuesState.js";

import type { useStartMapReplacement } from "../features/exploration/actions.js";

import type { useFoundingStartOver } from "../features/founding/setup-controller.js";

import type { useSuggestPlaces } from "../features/founding/actions.js";

import type { useWriteVillageEvent } from "../shared/data-controller.js";

import type { ProjectsController } from "../features/projects/useProjectsController.js";

/** Menu assembly inputs; feature pages own their narrower contracts. */
export type MenuScreenController = {
  readonly projectsController: ProjectsController;
  readonly addNotice: ReturnType<typeof useAddNotice>;
  readonly addVenue: ReturnType<typeof useAddVenue>;
  readonly archiveError: ScenesState["archiveError"];
  readonly archiveOffset: ScenesState["archiveOffset"];
  readonly archiveTotal: ScenesState["archiveTotal"];
  readonly archiveVenueId: ScenesState["archiveVenueId"];
  readonly archiveVillagerId: ScenesState["archiveVillagerId"];
  readonly backgroundPanel: React.JSX.Element;
  readonly busy: boolean;
  readonly catchingUp: boolean;
  readonly debugDiscardEnabled: ScenesState["debugDiscardEnabled"];
  readonly decideVenueRequest: ReturnType<typeof useDecideVenueRequest>;
  readonly deleteArchivedVisits: ReturnType<typeof useDeleteArchivedVisits>;
  readonly discardTownMapDraft: ReturnType<typeof useDiscardTownMapDraft>;
  readonly error: string;
  readonly focusedProjectId: ProjectsState["focusedProjectId"];
  readonly framingMap: boolean;
  readonly generateReplacementMap: ReturnType<typeof useGenerateReplacementMap>;
  readonly goHome: ReturnType<typeof useNavigationGoHome>;
  readonly insertMacro: ReturnType<typeof useInsertMacro>;
  readonly knowledgeDraft: SettingsState["knowledgeDraft"];
  readonly knowledgeRef: SettingsState["knowledgeRef"];
  readonly loreTokenBudgetDraft: SettingsState["loreTokenBudgetDraft"];
  readonly lorebookDraft: SettingsState["lorebookDraft"];
  readonly lorebooks: import("../../shared/contracts/village").VillageLorebookOption[];
  readonly lorebooksError: string;
  readonly mapGenerating: ExplorationState["mapGenerating"];
  readonly mapPinDraft: ExplorationState["mapPinDraft"];
  readonly mapRemoveDraft: ExplorationState["mapRemoveDraft"];
  readonly mapReplaceOpen: ExplorationState["mapReplaceOpen"];
  readonly menuPage: import("../shared/types").MenuPage;
  readonly menuSection: ReturnType<typeof menuCategory>;
  readonly mobile: boolean;
  readonly nameOfCharacter: ReturnType<typeof useResidentsNameOfCharacter>;
  readonly noticeDraft: SettingsState["noticeDraft"];
  readonly openArchivedVisit: ScenesState["openArchivedVisit"];
  readonly openMenu: ReturnType<typeof useScenesOpenMenu>;
  readonly openPlace: ReturnType<typeof useOpenPlace>;
  readonly openSetup: ReturnType<typeof useOpenSetup>;
  readonly openVisit: ReturnType<typeof useOpenVisit>;
  readonly panelMapView: import("../../shared/contracts/village").TownMapView;
  readonly personaDraft: SettingsState["personaDraft"];
  readonly personalizeHomes: FoundingState["personalizeHomes"];
  readonly personas: import("../../shared/contracts/village").PersonaEntry[];
  readonly pickTownMap: ReturnType<typeof usePickTownMap>;
  readonly placeCount: number;
  readonly placingMapVenueId: ExplorationState["placingMapVenueId"];
  readonly progressDebug: import("../../shared/contracts/village").ProgressDebugView;
  readonly reframingMap: ExplorationState["reframingMap"];
  readonly removeNotice: ReturnType<typeof useRemoveNotice>;
  readonly removeVenue: ReturnType<typeof useRemoveVenue>;
  readonly requestEdits: SettingsState["requestEdits"];
  readonly resetArmed: boolean;
  readonly room: import("../../shared/contracts/village").SceneView;
  readonly saveCharacterSpeechColors: ReturnType<typeof useSaveCharacterSpeechColors>;
  readonly saveSendOnEnter: ReturnType<typeof useSaveSendOnEnter>;
  readonly saveScenerySettings: ReturnType<typeof useSaveScenerySettings>;
  readonly saveSettings: ReturnType<typeof useSaveSettings>;
  readonly saveStoryPace: ReturnType<typeof useSaveStoryPace>;
  readonly saveTownMap: ReturnType<typeof useSaveTownMap>;
  readonly saveVenue: ReturnType<typeof useSaveVenue>;
  readonly saveVisitRetention: ReturnType<typeof useSaveVisitRetention>;
  readonly sceneryStyle: FoundingState["sceneryStyle"];
  readonly screen: "room" | "venue" | "home" | "menu" | "setup" | "resume" | "preparing" | "person";
  readonly selectedMapVenueId: ExplorationState["selectedMapVenueId"];
  readonly setArchiveOffset: ScenesState["setArchiveOffset"];
  readonly setArchiveVenueId: ScenesState["setArchiveVenueId"];
  readonly setArchiveVillagerId: ScenesState["setArchiveVillagerId"];
  readonly setBusy: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setFocusedProjectId: ProjectsState["setFocusedProjectId"];
  readonly setKnowledgeDraft: SettingsState["setKnowledgeDraft"];
  readonly setLoreTokenBudgetDraft: SettingsState["setLoreTokenBudgetDraft"];
  readonly setLorebookDraft: SettingsState["setLorebookDraft"];
  readonly setMapPinDraft: ExplorationState["setMapPinDraft"];
  readonly setMapRemoveDraft: ExplorationState["setMapRemoveDraft"];
  readonly setMenuPage: React.Dispatch<React.SetStateAction<import("../shared/types").MenuPage>>;
  readonly setNoticeDraft: SettingsState["setNoticeDraft"];
  readonly setOpenArchivedVisit: ScenesState["setOpenArchivedVisit"];
  readonly setPersonaDraft: SettingsState["setPersonaDraft"];
  readonly setPersonalizeHomes: FoundingState["setPersonalizeHomes"];
  readonly setPlacingMapVenueId: ExplorationState["setPlacingMapVenueId"];
  readonly setPlacingProjectId: ProjectsState["setPlacingProjectId"];
  readonly loadProgressDebug: () => Promise<void>;
  readonly setReframingMap: ExplorationState["setReframingMap"];
  readonly setRequestEdits: SettingsState["setRequestEdits"];
  readonly setResetArmed: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setSceneryStyle: FoundingState["setSceneryStyle"];
  readonly setScreen: React.Dispatch<
    React.SetStateAction<"room" | "venue" | "home" | "menu" | "setup" | "resume" | "preparing" | "person">
  >;
  readonly setSelectedMapVenueId: ExplorationState["setSelectedMapVenueId"];
  readonly setSettingDraft: SettingsState["setSettingDraft"];
  readonly setSettingsError: SettingsState["setSettingsError"];
  readonly setSiteProjectId: ProjectsState["setSiteProjectId"];
  readonly setSnapshot: React.Dispatch<React.SetStateAction<import("../../shared/contracts/village").VillageSnapshot>>;
  readonly setTownMapDraft: ExplorationState["setTownMapDraft"];
  readonly setTownMapPick: ExplorationState["setTownMapPick"];
  readonly setVenueEditDraft: VenuesState["setVenueEditDraft"];
  readonly setVenueSearch: VenuesState["setVenueSearch"];
  readonly setVisualLoreDefault: FoundingState["setVisualLoreDefault"];
  readonly settingDraft: SettingsState["settingDraft"];
  readonly settingsError: SettingsState["settingsError"];
  readonly siteProjectId: ProjectsState["siteProjectId"];
  readonly snapshot: import("../../shared/contracts/village").VillageSnapshot;
  readonly startMapReplacement: ReturnType<typeof useStartMapReplacement>;
  readonly startOver: ReturnType<typeof useFoundingStartOver>;
  readonly suggestPlaces: ReturnType<typeof useSuggestPlaces>;
  readonly townMapAdvice: { tone: "ok" | "warn"; text: string };
  readonly townMapImage: ExplorationState["townMapImage"];
  readonly townMapPick: ExplorationState["townMapPick"];
  readonly townMapShape: import("../shared/types").MapFrameShape;
  readonly townMapSrc: string;
  readonly townMapZoom: import("../shared/types").MapZoomRange;
  readonly venueEditDraft: VenuesState["venueEditDraft"];
  readonly venueSearch: VenuesState["venueSearch"];
  readonly venueVisits: ScenesState["venueVisits"];
  readonly venuesDraft: VenuesState["venuesDraft"];
  readonly visualLoreDefault: FoundingState["visualLoreDefault"];
  readonly writeItUpNow: ReturnType<typeof useWriteVillageEvent>;
  readonly writeUpNote: ScenesState["writeUpNote"];
};
