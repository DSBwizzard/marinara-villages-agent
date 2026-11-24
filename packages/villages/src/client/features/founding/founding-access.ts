import type { SetupVenueDraft } from "../../shared/types.js";
import type { VenueAccessState } from "../../../shared/helpers/venue-access.js";
export function foundingAccess(venue: SetupVenueDraft): VenueAccessState {
  return (
    venue.access ?? {
      version: 1,
      revision: 0,
      managerIds: [],
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
