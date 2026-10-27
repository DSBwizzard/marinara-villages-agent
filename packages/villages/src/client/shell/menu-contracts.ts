import type { VenueRequestsPagePorts } from "../features/venues/page-contracts.js";

import type { ScenesState } from "../features/scenes/useScenesState.js";

import type { useDecideVenueRequest } from "../features/venues/actions.js";

import type { useDeleteArchivedVisits } from "../features/scenes/actions.js";

import type { ProjectsState } from "../features/projects/useProjectsState.js";

import type { useNavigationGoHome } from "./navigation-controller.js";

import type { SettingsState } from "../features/settings/useSettingsState.js";

import type { menuCategory } from "./navigation.js";

import type { useResidentsNameOfCharacter } from "../features/residents/controller-hooks.js";

import type { useScenesOpenMenu } from "./navigation-actions.js";

import type { useOpenPlace } from "../features/exploration/actions.js";

import type { useOpenVisit } from "../features/scenes/actions.js";

import type { FoundingState } from "../features/founding/useFoundingState.js";

import type { useSaveCharacterSpeechColors } from "../features/settings/actions.js";

import type { useSaveSendOnEnter } from "../features/settings/actions.js";

import type { useSaveScenerySettings } from "../features/settings/actions.js";

import type { useSaveSettings } from "../features/settings/actions.js";

import type { useSaveBackgroundPace } from "../features/settings/actions.js";

import type { useSaveVisitRetention } from "../features/settings/actions.js";

import type { useFoundingStartOver } from "../features/founding/setup-controller.js";

import type { ProjectsController } from "../features/projects/useProjectsController.js";

/** Menu assembly inputs; feature pages own their narrower contracts. */
export type MenuScreenController = {
  readonly repairController: import("../features/repair/useRepairController.js").RepairController;
  readonly housingVenueId: string;
  readonly setHousingVenueId: (id: string) => void;
  readonly projectsController: ProjectsController;
  readonly archiveError: ScenesState["archiveError"];
  readonly archiveOffset: ScenesState["archiveOffset"];
  readonly archiveTotal: ScenesState["archiveTotal"];
  readonly archiveVenueId: ScenesState["archiveVenueId"];
  readonly archiveVillagerId: ScenesState["archiveVillagerId"];
  readonly backgroundPanel: React.JSX.Element;
  readonly writing: ReturnType<typeof import("../features/settings/WritingSettings.js").useVillageWriting>;
  readonly busy: boolean;
  readonly debugDiscardEnabled: ScenesState["debugDiscardEnabled"];
  readonly decideVenueRequest: ReturnType<typeof useDecideVenueRequest>;
  readonly generateRequestDescription: VenueRequestsPagePorts["generateRequestDescription"];
  readonly completeResidenceMove: VenueRequestsPagePorts["completeResidenceMove"];
  readonly decideResidenceMove: VenueRequestsPagePorts["decideResidenceMove"];
  readonly deleteArchivedVisits: ReturnType<typeof useDeleteArchivedVisits>;
  readonly error: string;
  readonly focusedProjectId: ProjectsState["focusedProjectId"];
  readonly goHome: ReturnType<typeof useNavigationGoHome>;
  readonly loreTokenBudgetDraft: SettingsState["loreTokenBudgetDraft"];
  readonly lorebookDraft: SettingsState["lorebookDraft"];
  readonly lorebooks: import("../../shared/contracts/village").VillageLorebookOption[];
  readonly lorebooksError: string;
  readonly menuPage: import("../shared/types").MenuPage;
  readonly menuSection: ReturnType<typeof menuCategory>;
  readonly mobile: boolean;
  readonly nameOfCharacter: ReturnType<typeof useResidentsNameOfCharacter>;
  readonly openArchivedVisit: ScenesState["openArchivedVisit"];
  readonly openMenu: ReturnType<typeof useScenesOpenMenu>;
  readonly openPlace: ReturnType<typeof useOpenPlace>;
  readonly openVisit: ReturnType<typeof useOpenVisit>;
  readonly personalizeHomes: FoundingState["personalizeHomes"];
  readonly progressDebug: import("../../shared/contracts/village").ProgressDebugView;
  readonly requestEdits: SettingsState["requestEdits"];
  readonly resetArmed: boolean;
  readonly room: import("../../shared/contracts/village").SceneView;
  readonly saveCharacterSpeechColors: ReturnType<typeof useSaveCharacterSpeechColors>;
  readonly saveSendOnEnter: ReturnType<typeof useSaveSendOnEnter>;
  readonly saveScenerySettings: ReturnType<typeof useSaveScenerySettings>;
  readonly saveSettings: ReturnType<typeof useSaveSettings>;
  readonly saveBackgroundPace: ReturnType<typeof useSaveBackgroundPace>;
  readonly saveVisitRetention: ReturnType<typeof useSaveVisitRetention>;
  readonly sceneryStyle: FoundingState["sceneryStyle"];
  readonly sceneryStyleProfileId: FoundingState["sceneryStyleProfileId"];
  readonly screen: "room" | "venue" | "home" | "menu" | "setup" | "resume" | "preparing" | "person";
  readonly setArchiveOffset: ScenesState["setArchiveOffset"];
  readonly setArchiveVenueId: ScenesState["setArchiveVenueId"];
  readonly setArchiveVillagerId: ScenesState["setArchiveVillagerId"];
  readonly setBusy: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setFocusedProjectId: ProjectsState["setFocusedProjectId"];
  readonly setLoreTokenBudgetDraft: SettingsState["setLoreTokenBudgetDraft"];
  readonly setLorebookDraft: SettingsState["setLorebookDraft"];
  readonly setMenuPage: React.Dispatch<React.SetStateAction<import("../shared/types").MenuPage>>;
  readonly setOpenArchivedVisit: ScenesState["setOpenArchivedVisit"];
  readonly setPersonalizeHomes: FoundingState["setPersonalizeHomes"];
  readonly setPlacingProjectId: ProjectsState["setPlacingProjectId"];
  readonly loadProgressDebug: () => Promise<void>;
  readonly setRequestEdits: SettingsState["setRequestEdits"];
  readonly setResetArmed: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setSceneryStyle: FoundingState["setSceneryStyle"];
  readonly setSceneryStyleProfileId: FoundingState["setSceneryStyleProfileId"];
  readonly setScreen: React.Dispatch<
    React.SetStateAction<"room" | "venue" | "home" | "menu" | "setup" | "resume" | "preparing" | "person">
  >;
  readonly setSettingsError: SettingsState["setSettingsError"];
  readonly setSiteProjectId: ProjectsState["setSiteProjectId"];
  readonly setSnapshot: React.Dispatch<React.SetStateAction<import("../../shared/contracts/village").VillageSnapshot>>;
  readonly setVisualLoreDefault: FoundingState["setVisualLoreDefault"];
  readonly settingsError: SettingsState["settingsError"];
  readonly siteProjectId: ProjectsState["siteProjectId"];
  readonly snapshot: import("../../shared/contracts/village").VillageSnapshot;
  readonly startOver: ReturnType<typeof useFoundingStartOver>;
  readonly venueVisits: ScenesState["venueVisits"];
  readonly visualLoreDefault: FoundingState["visualLoreDefault"];
};
