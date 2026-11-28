import type { useVenueScreenCommands } from "./screen-commands.js";
import type { BackgroundWork, VillageVenue, VillageVillagerView } from "../../../shared/contracts/village.js";

import type { useLeaveVenue } from "./actions.js";

import type { VenuesState } from "./useVenuesState.js";

/** Values and actions used by VenueScreen; independent of shell implementation. */
export type VenueScreenController = {
  readonly setSnapshot: (value: import("../../../shared/contracts/village.js").VillageSnapshot) => void;
  readonly portraits: import("../../shared/types.js").PortraitMap;
  readonly loadSnapshot: () => Promise<unknown>;
  readonly beginPlaceAdmission: (place: import("../../../shared/contracts/places.js").PlaceSummary) => void;
  readonly goHome: () => void;
  readonly openMenu: (page: import("../../shared/types.js").MenuPage) => void;
  readonly openPlace: (place: VillageVenue) => void;
  readonly venueSection: VenuesState["venueSection"];
  readonly setVenueSection: VenuesState["setVenueSection"];
  readonly planVenueRenovation: (
    place: VillageVenue,
    draft?: import("../../shared/zone-renovation.js").ZoneRenovationDraft,
  ) => void;
  readonly openVenueProject: (id: string) => void;
  readonly openVenueRequests: (venueId: string) => void;
  readonly busy: boolean;
  readonly drawPlaceImage: (venueId: string, zoneId: string) => Promise<void>;
  readonly dropPlaceImage: (venueId: string, zoneId: string) => Promise<void>;
  readonly homeBuildings: readonly import("../../../shared/contracts/village").VillageBuildingOption[];
  readonly keepPlaceImage: import("../../shared/ZoneImageControls.js").ZoneArtworkCommands["keepPlaceImage"];
  readonly leaveVenue: ReturnType<typeof useLeaveVenue>;
  readonly mobile: boolean;
  readonly movePrivateZoneId: VenuesState["movePrivateZoneId"];
  readonly moveTargetId: VenuesState["moveTargetId"];
  readonly nameOfCharacter: (characterId: string | null) => string;
  readonly openRoom: (place: VillageVenue, zoneId?: string) => Promise<void>;
  readonly placeBusyId: VenuesState["placeBusyId"];
  readonly placeProblem: VenuesState["placeProblem"];
  readonly playerMovePrivateZoneId: VenuesState["playerMovePrivateZoneId"];
  readonly retryWork: (job: BackgroundWork) => Promise<void>;
  readonly room: import("../../../shared/contracts/village").SceneView;
  readonly roomBusy: boolean;
  readonly screen: "room" | "venue" | "home" | "menu" | "setup" | "preparing" | "person";
  readonly setMovePrivateZoneId: VenuesState["setMovePrivateZoneId"];
  readonly setMoveTargetId: VenuesState["setMoveTargetId"];
  readonly setPlayerMovePrivateZoneId: VenuesState["setPlayerMovePrivateZoneId"];
  readonly setScreen: React.Dispatch<
    React.SetStateAction<"room" | "venue" | "home" | "menu" | "setup" | "preparing" | "person">
  >;
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
} & ReturnType<typeof useVenueScreenCommands>;
