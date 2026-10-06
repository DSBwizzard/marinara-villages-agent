import type { useDrawPlaceImage } from "../exploration/actions.js";

import type { useDropPlaceImage } from "../exploration/actions.js";

import type { useKeepPlaceImage } from "../exploration/actions.js";

import type { useLeaveVenue } from "./actions.js";

import type { VenuesState } from "./useVenuesState.js";

import type { useResidentsNameOfCharacter } from "../residents/controller-hooks.js";

import type { useOpenRoom } from "../scenes/actions.js";

import type { useResidentsRetryWork } from "../background/actions.js";

import type { ScenesState } from "../scenes/useScenesState.js";

import type { SettingsState } from "../settings/useSettingsState.js";

import type { useResidentsStandingAt } from "../residents/controller-hooks.js";

/** Values and actions used by VenueScreen; independent of shell implementation. */
export type VenueScreenController = {
  readonly busy: boolean;
  readonly drawPlaceImage: ReturnType<typeof useDrawPlaceImage>;
  readonly dropPlaceImage: ReturnType<typeof useDropPlaceImage>;
  readonly homeBuildings: readonly import("../../../shared/contracts/village").VillageBuildingOption[];
  readonly keepPlaceImage: ReturnType<typeof useKeepPlaceImage>;
  readonly leaveVenue: ReturnType<typeof useLeaveVenue>;
  readonly movePrivateZoneId: VenuesState["movePrivateZoneId"];
  readonly moveTargetId: VenuesState["moveTargetId"];
  readonly nameOfCharacter: ReturnType<typeof useResidentsNameOfCharacter>;
  readonly openRoom: ReturnType<typeof useOpenRoom>;
  readonly placeBusyId: VenuesState["placeBusyId"];
  readonly placeProblem: VenuesState["placeProblem"];
  readonly playerMovePrivateZoneId: VenuesState["playerMovePrivateZoneId"];
  readonly retryWork: ReturnType<typeof useResidentsRetryWork>;
  readonly room: import("../../../shared/contracts/village").SceneView;
  readonly roomBusy: ScenesState["roomBusy"];
  readonly screen: "room" | "venue" | "home" | "menu" | "setup" | "resume" | "preparing" | "person";
  readonly setBusy: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setMovePrivateZoneId: VenuesState["setMovePrivateZoneId"];
  readonly setMoveTargetId: VenuesState["setMoveTargetId"];
  readonly setPlaceProblem: VenuesState["setPlaceProblem"];
  readonly setPlayerMovePrivateZoneId: VenuesState["setPlayerMovePrivateZoneId"];
  readonly setScreen: React.Dispatch<
    React.SetStateAction<"room" | "venue" | "home" | "menu" | "setup" | "resume" | "preparing" | "person">
  >;
  readonly setSettingsError: SettingsState["setSettingsError"];
  readonly setSnapshot: React.Dispatch<
    React.SetStateAction<import("../../../shared/contracts/village").VillageSnapshot>
  >;
  readonly setVenueEditBusy: VenuesState["setVenueEditBusy"];
  readonly setVenueEditDraft: VenuesState["setVenueEditDraft"];
  readonly setVenueEditError: VenuesState["setVenueEditError"];
  readonly setVenueEditNotice: VenuesState["setVenueEditNotice"];
  readonly setVenuePage: VenuesState["setVenuePage"];
  readonly setVenueProposalDraft: VenuesState["setVenueProposalDraft"];
  readonly setVenueZoneKey: VenuesState["setVenueZoneKey"];
  readonly snapshot: import("../../../shared/contracts/village").VillageSnapshot;
  readonly standingAt: ReturnType<typeof useResidentsStandingAt>;
  readonly venueEditBusy: VenuesState["venueEditBusy"];
  readonly venueEditDraft: VenuesState["venueEditDraft"];
  readonly venueEditError: VenuesState["venueEditError"];
  readonly venueEditNotice: VenuesState["venueEditNotice"];
  readonly venueId: VenuesState["venueId"];
  readonly venuePage: VenuesState["venuePage"];
  readonly venueProposalDraft: VenuesState["venueProposalDraft"];
  readonly venueZoneKey: VenuesState["venueZoneKey"];
};
