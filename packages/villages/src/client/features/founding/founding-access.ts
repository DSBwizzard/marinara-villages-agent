import type { SetupVenueDraft } from "../../shared/types.js";
import type { VenueAccessState } from "../../../shared/helpers/venue-access.js";
import { foundingHomeMembers } from "./founding-homes.js";
export function foundingAccess(venue: SetupVenueDraft): VenueAccessState {
  return (
    venue.access ?? {
      version: 1,
      revision: 0,
      managerIds: foundingHomeMembers(venue).length ? foundingHomeMembers(venue) : ["player"],
      visitorHours: null,
      permissions: [],
      bans: [],
      exceptions: [],
      changes: [],
      visitDenials: [],
      receipts: {},
    }
  );
}
