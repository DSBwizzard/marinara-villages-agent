import type { VillageVenue } from "../../../shared/contracts/village.js";
import type { MenuPage, PortraitMap } from "../../shared/types.js";
import type { DossierNavigation } from "../residents/villages-dossier.js";

import type { useCloseRoom } from "./actions.js";

import type { ScenesState } from "./useScenesState.js";

import type { useContinueRoomWithoutGreeting } from "./actions.js";

import type { useDiscardRoomDebug } from "./actions.js";

import type { useDismissRoomNotice } from "./actions.js";

import type { useGreetRoom } from "./actions.js";

import type { useLeaveRoom } from "./actions.js";

import type { useLoadVillageSnapshot } from "../../shared/data-controller.js";

import type { useMoveRoom } from "./actions.js";

import type { useOpenRoom } from "./actions.js";

import type { useRetrySavedScene } from "./actions.js";

import type { useSendRoom } from "./actions.js";

/** Values and actions used by SceneScreen; independent of shell implementation. */
export type SceneScreenController = {
  readonly sceneReading: ScenesState["sceneReading"];
  readonly closeRoom: ReturnType<typeof useCloseRoom>;
  readonly composerEditVersionRef: ScenesState["composerEditVersionRef"];
  readonly continueRoomWithoutGreeting: ReturnType<typeof useContinueRoomWithoutGreeting>;
  readonly debugDiscardEnabled: ScenesState["debugDiscardEnabled"];
  readonly discardRoomDebug: ReturnType<typeof useDiscardRoomDebug>;
  readonly dismissRoomNotice: ReturnType<typeof useDismissRoomNotice>;
  readonly goHome: () => void;
  readonly greetRoom: ReturnType<typeof useGreetRoom>;
  readonly leaveRoom: ReturnType<typeof useLeaveRoom>;
  readonly loadSnapshot: ReturnType<typeof useLoadVillageSnapshot>;
  readonly mailboxOpen: ScenesState["mailboxOpen"];
  readonly mobile: boolean;
  readonly moveRoom: ReturnType<typeof useMoveRoom>;
  readonly nameOfCharacter: (characterId: string | null) => string;
  readonly openMenu: (tab: MenuPage) => void;
  readonly openPerson: (navigation: DossierNavigation) => void;
  readonly openRoom: ReturnType<typeof useOpenRoom>;
  readonly personaPortrait: import("../../shared/types").Portrait;
  readonly portraits: PortraitMap;
  readonly retrySavedScene: ReturnType<typeof useRetrySavedScene>;
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
  readonly saveSpriteCardFlip: (spriteCardFlipEnabled: boolean) => Promise<void>;
  readonly sendRoom: ReturnType<typeof useSendRoom>;
  readonly setMailboxOpen: ScenesState["setMailboxOpen"];
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
  readonly setScreen: React.Dispatch<
    React.SetStateAction<"room" | "venue" | "home" | "menu" | "setup" | "resume" | "preparing" | "person">
  >;
  readonly setSnapshot: React.Dispatch<
    React.SetStateAction<import("../../../shared/contracts/village").VillageSnapshot>
  >;
  readonly setVenueEditDraft: React.Dispatch<React.SetStateAction<VillageVenue | null>>;
  readonly setVenueId: React.Dispatch<React.SetStateAction<string | null>>;
  readonly snapshot: import("../../../shared/contracts/village").VillageSnapshot;
  readonly spriteFlipDraft: boolean | null;
  readonly spriteFlipError: string;
  readonly spriteFlipSaving: boolean;
};
