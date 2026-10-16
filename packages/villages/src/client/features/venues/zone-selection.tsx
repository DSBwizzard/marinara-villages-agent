import type { VenueClass } from "../../../shared/contracts/village.js";
import { venueClassesFor } from "../../shared/venue.js";
import type { VenuesState } from "./useVenuesState.js";
import { useEffect } from "react";

export function useVenueZoneSelection(ports: {
  readonly setVenueZoneKey: VenuesState["setVenueZoneKey"];
  readonly snapshot: import("../../../shared/contracts/village").VillageSnapshot;
  readonly venueId: VenuesState["venueId"];
  readonly venueZoneKey: VenuesState["venueZoneKey"];
}) {
  useEffect(() => {
    const { setVenueZoneKey, snapshot, venueId, venueZoneKey } = ports;

    if (venueZoneKey === "exterior") return;
    const venue = snapshot?.settings.venues.find((entry) => entry.id === venueId);
    const available =
      venue?.zones?.some((zone) => zone.id === venueZoneKey) ||
      (venueZoneKey.startsWith("class:")
        ? Boolean(venue && venueClassesFor(venue).includes(venueZoneKey.slice(6) as VenueClass))
        : Boolean(
            venue &&
            venueZoneKey.startsWith("private:") &&
            (
              venue.residentIds ?? (venue.occupancy.residentCharacterId ? [venue.occupancy.residentCharacterId] : [])
            ).includes(venueZoneKey.slice(8)) &&
            venue.privateSpaces?.some((space) => space.ownerId === venueZoneKey.slice(8)),
          ));
    if (!available) setVenueZoneKey("exterior");
  }, [ports.snapshot, ports.venueId, ports.venueZoneKey]);
}
