import type {
  BackgroundWork,
  VenueClass,
  VillageVenue,
  VillageVillagerView,
} from "../../../shared/contracts/village.js";

import type { useLeaveVenue } from "./actions.js";

import type { VenuesState } from "./useVenuesState.js";

/** Values and actions used by VenueScreen; independent of shell implementation. */
export type VenueScreenController = {
  readonly busy: boolean;
  readonly drawPlaceImage: (
    venueId: string,
    spaceClass?: VenueClass,
    privateOwnerId?: string,
    zoneId?: string,
  ) => Promise<void>;
  readonly dropPlaceImage: (
    venueId: string,
    spaceClass?: VenueClass,
    privateOwnerId?: string,
    zoneId?: string,
  ) => Promise<void>;
  readonly homeBuildings: readonly import("../../../shared/contracts/village").VillageBuildingOption[];
  readonly keepPlaceImage: (
    venueId: string,
    file: File | undefined,
    spaceClass?: VenueClass,
    privateOwnerId?: string,
    zoneId?: string,
  ) => Promise<void>;
  readonly leaveVenue: ReturnType<typeof useLeaveVenue>;
  readonly movePrivateZoneId: VenuesState["movePrivateZoneId"];
  readonly moveTargetId: VenuesState["moveTargetId"];
  readonly nameOfCharacter: (characterId: string | null) => string;
  readonly openRoom: (
    place: VillageVenue,
    spaceClass?: VenueClass,
    privateOwnerId?: string,
    entryArea?: "outside" | "shared" | "private" | "public",
    zoneId?: string,
  ) => Promise<void>;
  readonly placeBusyId: VenuesState["placeBusyId"];
  readonly placeProblem: VenuesState["placeProblem"];
  readonly playerMovePrivateZoneId: VenuesState["playerMovePrivateZoneId"];
  readonly retryWork: (job: BackgroundWork) => Promise<void>;
  readonly room: import("../../../shared/contracts/village").SceneView;
  readonly roomBusy: boolean;
  readonly screen: "room" | "venue" | "home" | "menu" | "setup" | "resume" | "preparing" | "person";
  readonly setBusy: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setMovePrivateZoneId: VenuesState["setMovePrivateZoneId"];
  readonly setMoveTargetId: VenuesState["setMoveTargetId"];
  readonly setPlaceProblem: VenuesState["setPlaceProblem"];
  readonly setPlayerMovePrivateZoneId: VenuesState["setPlayerMovePrivateZoneId"];
  readonly setScreen: React.Dispatch<
    React.SetStateAction<"room" | "venue" | "home" | "menu" | "setup" | "resume" | "preparing" | "person">
  >;
  readonly setSettingsError: React.Dispatch<React.SetStateAction<string>>;
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
  readonly standingAt: (placeId: string) => VillageVillagerView[];
  readonly venueEditBusy: VenuesState["venueEditBusy"];
  readonly venueEditDraft: VenuesState["venueEditDraft"];
  readonly venueEditError: VenuesState["venueEditError"];
  readonly venueEditNotice: VenuesState["venueEditNotice"];
  readonly venueId: VenuesState["venueId"];
  readonly venuePage: VenuesState["venuePage"];
  readonly venueProposalDraft: VenuesState["venueProposalDraft"];
  readonly venueZoneKey: VenuesState["venueZoneKey"];
};
