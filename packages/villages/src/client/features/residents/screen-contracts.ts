import type { VillageVenue } from "../../../shared/contracts/village.js";
import type { MenuPage } from "../../shared/types.js";
import type { ExplorationSheet, ExplorationTab } from "../exploration/villages-exploration.js";
import type { DossierNavigation } from "./villages-dossier.js";

import type { ResidentsState } from "./useResidentsState.js";

import type { useApplyVillagerRefresh } from "./actions.js";

import type { useCorrectCompletedWish } from "./actions.js";

import type { useForgetMemory } from "./actions.js";

import type { useLoadMemoryLibrary } from "./actions.js";

import type { usePreviewVillagerRefresh } from "./actions.js";

import type { useRewriteAgenda } from "./actions.js";

import type { useSetAgendaScheduleIngestion } from "./actions.js";

/** Values and actions used by ResidentsScreen; independent of shell implementation. */
export type ResidentsScreenController = {
  readonly setMailboxOpen: (open: boolean) => void;
  readonly agendas: ResidentsState["agendas"];
  readonly applyVillagerRefresh: ReturnType<typeof useApplyVillagerRefresh>;
  readonly busy: boolean;
  readonly correctCompletedWish: ReturnType<typeof useCorrectCompletedWish>;
  readonly element: HTMLElement;
  readonly error: string;
  readonly explorationReturnTab: React.RefObject<ExplorationTab>;
  readonly forgetMemory: ReturnType<typeof useForgetMemory>;
  readonly loadMemoryLibrary: ReturnType<typeof useLoadMemoryLibrary>;
  readonly memoryLibrary: ResidentsState["memoryLibrary"];
  readonly openMenu: (tab: MenuPage) => void;
  readonly openVenue: (place: VillageVenue) => void;
  readonly personProfile: ResidentsState["personProfile"];
  readonly portraits: ResidentsState["portraits"];
  readonly previewVillagerRefresh: ReturnType<typeof usePreviewVillagerRefresh>;
  readonly profileOrigin: ResidentsState["profileOrigin"];
  readonly refreshBusyId: ResidentsState["refreshBusyId"];
  readonly refreshPreviews: ResidentsState["refreshPreviews"];
  readonly rewriteAgenda: ReturnType<typeof useRewriteAgenda>;
  readonly screen: "room" | "venue" | "home" | "menu" | "setup" | "resume" | "preparing" | "person";
  readonly setAgendaScheduleIngestion: ReturnType<typeof useSetAgendaScheduleIngestion>;
  readonly setExploreSheet: React.Dispatch<React.SetStateAction<ExplorationSheet | null>>;
  readonly setFocusedProjectId: (id: string) => void;
  readonly setFocusedRequestId: React.Dispatch<React.SetStateAction<string>>;
  readonly setHousingVenueId: React.Dispatch<React.SetStateAction<string>>;
  readonly setMemoryLibrary: ResidentsState["setMemoryLibrary"];
  readonly setMenuPage: React.Dispatch<React.SetStateAction<import("../../shared/types").MenuPage>>;
  readonly setPersonProfile: ResidentsState["setPersonProfile"];
  readonly setProfileInspection: ResidentsState["setProfileInspection"];
  readonly setScreen: React.Dispatch<
    React.SetStateAction<"room" | "venue" | "home" | "menu" | "setup" | "resume" | "preparing" | "person">
  >;
  readonly setSiteProjectId: React.Dispatch<React.SetStateAction<string>>;
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
  readonly error: string;
  readonly menuPage: import("../../shared/types").MenuPage;
  readonly openPerson: (navigation: DossierNavigation) => void;
  readonly portraits: ResidentsState["portraits"];
  readonly screen: "room" | "venue" | "home" | "menu" | "setup" | "resume" | "preparing" | "person";
  readonly setMenuPage: React.Dispatch<React.SetStateAction<import("../../shared/types").MenuPage>>;
  readonly snapshot: import("../../../shared/contracts/village").VillageSnapshot;
};
