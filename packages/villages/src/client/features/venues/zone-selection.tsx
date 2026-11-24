import type { VenuesState } from "./useVenuesState.js";
import { useEffect } from "react";

export function useVenueZoneSelection(ports: {
  readonly setVenueZoneKey: VenuesState["setVenueZoneKey"];
  readonly snapshot: import("../../../shared/contracts/village").VillageSnapshot;
  readonly venueId: VenuesState["venueId"];
  readonly venueZoneKey: VenuesState["venueZoneKey"];
}) {
  const { setVenueZoneKey, snapshot, venueId, venueZoneKey } = ports;

  useEffect(() => {
    if (venueZoneKey === "exterior") return;
    const venue = snapshot?.settings.venues.find((entry) => entry.id === venueId);
    if (!venue) return;
    const available = venue.zones?.some((zone) => zone.id === venueZoneKey);
    if (!available) setVenueZoneKey("exterior");
  }, [setVenueZoneKey, snapshot, venueId, venueZoneKey]);
}
