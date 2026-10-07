import type { useCloseRoom } from "./actions.js";

import type { ScenesState } from "./useScenesState.js";

import type { useContinueRoomWithoutGreeting } from "./actions.js";

import type { useDiscardRoomDebug } from "./actions.js";

import type { useDismissRoomNotice } from "./actions.js";

import type { useNavigationGoHome } from "../../shell/navigation-controller.js";

import type { useGreetRoom } from "./actions.js";

import type { useLeaveRoom } from "./actions.js";

import type { useLoadVillageSnapshot } from "../../shared/data-controller.js";

import type { useMoveRoom } from "./actions.js";

import type { useResidentsNameOfCharacter } from "../residents/controller-hooks.js";

import type { useScenesOpenMenu } from "../../shell/navigation-actions.js";

import type { useNavigationOpenPerson } from "../../shell/navigation-controller.js";

import type { useOpenRoom } from "./actions.js";

import type { ResidentsState } from "../residents/useResidentsState.js";

import type { useRetrySavedScene } from "./actions.js";

import type { useSaveSpriteCardFlip } from "../settings/actions.js";

import type { useSendRoom } from "./actions.js";

import type { VenuesState } from "../venues/useVenuesState.js";

/** Values and actions used by SceneScreen; independent of shell implementation. */
export type SceneScreenController = {
  readonly sceneReading: ScenesState["sceneReading"];
  readonly closeRoom: ReturnType<typeof useCloseRoom>;
  readonly composerEditVersionRef: ScenesState["composerEditVersionRef"];
  readonly continueRoomWithoutGreeting: ReturnType<typeof useContinueRoomWithoutGreeting>;
  readonly debugDiscardEnabled: ScenesState["debugDiscardEnabled"];
  readonly discardRoomDebug: ReturnType<typeof useDiscardRoomDebug>;
  readonly dismissRoomNotice: ReturnType<typeof useDismissRoomNotice>;
  readonly goHome: ReturnType<typeof useNavigationGoHome>;
  readonly greetRoom: ReturnType<typeof useGreetRoom>;
  readonly leaveRoom: ReturnType<typeof useLeaveRoom>;
  readonly loadSnapshot: ReturnType<typeof useLoadVillageSnapshot>;
  readonly mailboxOpen: ScenesState["mailboxOpen"];
  readonly mobile: boolean;
  readonly moveRoom: ReturnType<typeof useMoveRoom>;
  readonly nameOfCharacter: ReturnType<typeof useResidentsNameOfCharacter>;
  readonly openMenu: ReturnType<typeof useScenesOpenMenu>;
  readonly openPerson: ReturnType<typeof useNavigationOpenPerson>;
  readonly openRoom: ReturnType<typeof useOpenRoom>;
  readonly personaPortrait: import("../../shared/types").Portrait;
  readonly portraits: ResidentsState["portraits"];
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
  readonly saveSpriteCardFlip: ReturnType<typeof useSaveSpriteCardFlip>;
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
  readonly setVenueEditDraft: VenuesState["setVenueEditDraft"];
  readonly setVenueId: VenuesState["setVenueId"];
  readonly snapshot: import("../../../shared/contracts/village").VillageSnapshot;
  readonly spriteFlipDraft: ResidentsState["spriteFlipDraft"];
  readonly spriteFlipError: ResidentsState["spriteFlipError"];
  readonly spriteFlipSaving: ResidentsState["spriteFlipSaving"];
};
