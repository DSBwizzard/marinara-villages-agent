import type { VenueClass, VillageVenue } from "../../../shared/contracts/village.js";
import { venueSpaceFor } from "../../shared/venue.js";
/** The editor's existing comparison includes the current Venue's class order. */
export const editableVenueFields = (venue: VillageVenue, classes: readonly VenueClass[]) => ({
  name: venue.name,
  venueType: venue.venueType,
  form: venue.form,
  workerIds: venue.workerIds,
  position: { x: venue.presentation.x, y: venue.presentation.y },
  spaces: (venue.layoutVersion === 1 ? (venue.spaces ?? []).map((space) => space.venueClass) : classes).map((item) => {
    const space = venueSpaceFor(venue, item);
    return {
      description: space.description,
      condition: space.state.condition,
      items: space.state.items,
      publicFacts: space.state.publicFacts,
      features: space.state.features.map(({ id, text, locked }) => ({ id, text, locked })),
    };
  }),
  privateSpaces: venue.privateSpaces?.map((space) => ({
    ownerId: space.ownerId,
    description: space.description,
    condition: space.state.condition,
    items: space.state.items,
    publicFacts: space.state.publicFacts,
    features: space.state.features.map(({ id, text, locked }) => ({ id, text, locked })),
  })),
});
