import type { ResidentsState } from "./useResidentsState.js";

import type { useApplyVillagerRefresh } from "./actions.js";

import type { useCorrectCompletedWish } from "./actions.js";

import type { ExplorationState } from "../exploration/useExplorationState.js";

import type { useForgetMemory } from "./actions.js";

import type { useLoadMemoryLibrary } from "./actions.js";

import type { useScenesOpenMenu } from "../../shell/navigation-actions.js";

import type { useOpenVenue } from "../venues/actions.js";

import type { usePreviewVillagerRefresh } from "./actions.js";

import type { useRemoveVillager } from "./actions.js";

import type { useResidentsRetryWork } from "../background/actions.js";

import type { useRewriteAgenda } from "./actions.js";

import type { useSetAgendaScheduleIngestion } from "./actions.js";

import type { ProjectsState } from "../projects/useProjectsState.js";

import type { useAddVillager } from "./actions.js";

import type { useNavigationOpenPerson } from "../../shell/navigation-controller.js";

/** Values and actions used by ResidentsScreen; independent of shell implementation. */
export type ResidentsScreenController = {
  readonly agendas: ResidentsState["agendas"];
  readonly applyVillagerRefresh: ReturnType<typeof useApplyVillagerRefresh>;
  readonly busy: boolean;
  readonly correctCompletedWish: ReturnType<typeof useCorrectCompletedWish>;
  readonly element: HTMLElement;
  readonly error: string;
  readonly explorationReturnTab: ExplorationState["explorationReturnTab"];
  readonly forgetMemory: ReturnType<typeof useForgetMemory>;
  readonly loadMemoryLibrary: ReturnType<typeof useLoadMemoryLibrary>;
  readonly memoryLibrary: ResidentsState["memoryLibrary"];
  readonly openMenu: ReturnType<typeof useScenesOpenMenu>;
  readonly openVenue: ReturnType<typeof useOpenVenue>;
  readonly personProfile: ResidentsState["personProfile"];
  readonly portraits: ResidentsState["portraits"];
  readonly previewVillagerRefresh: ReturnType<typeof usePreviewVillagerRefresh>;
  readonly profileOrigin: ResidentsState["profileOrigin"];
  readonly refreshBusyId: ResidentsState["refreshBusyId"];
  readonly refreshPreviews: ResidentsState["refreshPreviews"];
  readonly removeVillager: ReturnType<typeof useRemoveVillager>;
  readonly retryWork: ReturnType<typeof useResidentsRetryWork>;
  readonly rewriteAgenda: ReturnType<typeof useRewriteAgenda>;
  readonly screen: "room" | "venue" | "home" | "menu" | "setup" | "resume" | "preparing" | "person";
  readonly setAgendaScheduleIngestion: ReturnType<typeof useSetAgendaScheduleIngestion>;
  readonly setExploreSheet: ExplorationState["setExploreSheet"];
  readonly setFocusedProjectId: ProjectsState["setFocusedProjectId"];
  readonly setFocusedRequestId: ProjectsState["setFocusedRequestId"];
  readonly setMemoryLibrary: ResidentsState["setMemoryLibrary"];
  readonly setMenuPage: React.Dispatch<React.SetStateAction<import("../../shared/types").MenuPage>>;
  readonly setPersonProfile: ResidentsState["setPersonProfile"];
  readonly setProfileInspection: ResidentsState["setProfileInspection"];
  readonly setScreen: React.Dispatch<
    React.SetStateAction<"room" | "venue" | "home" | "menu" | "setup" | "resume" | "preparing" | "person">
  >;
  readonly setSiteProjectId: ProjectsState["setSiteProjectId"];
  readonly setSnapshot: React.Dispatch<
    React.SetStateAction<import("../../../shared/contracts/village").VillageSnapshot>
  >;
  readonly setSpriteManagerId: ResidentsState["setSpriteManagerId"];
  readonly snapshot: import("../../../shared/contracts/village").VillageSnapshot;
  readonly spriteLeaveGuard: ResidentsState["spriteLeaveGuard"];
  readonly spriteManagerId: ResidentsState["spriteManagerId"];
  readonly spriteProfileScroll: ResidentsState["spriteProfileScroll"];
};

/** Values and actions used by RosterScreen; independent of shell implementation. */
export type RosterScreenController = {
  readonly addVillager: ReturnType<typeof useAddVillager>;
  readonly busy: boolean;
  readonly catalog: import("../../../shared/contracts/village").CatalogEntry[];
  readonly error: string;
  readonly menuPage: import("../../shared/types").MenuPage;
  readonly openPerson: ReturnType<typeof useNavigationOpenPerson>;
  readonly pickerOpen: boolean;
  readonly portraits: ResidentsState["portraits"];
  readonly rosterSearch: ResidentsState["rosterSearch"];
  readonly screen: "room" | "venue" | "home" | "menu" | "setup" | "resume" | "preparing" | "person";
  readonly search: string;
  readonly setMenuPage: React.Dispatch<React.SetStateAction<import("../../shared/types").MenuPage>>;
  readonly setPickerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setRosterSearch: ResidentsState["setRosterSearch"];
  readonly setSearch: React.Dispatch<React.SetStateAction<string>>;
  readonly snapshot: import("../../../shared/contracts/village").VillageSnapshot;
  readonly visibleCatalog: import("../../../shared/contracts/village").CatalogEntry[];
};
