import type { VenueDisplayZone } from "./venue-view.js";

export function ZoneAccessLabels({ zone, hideOpen = false }: { zone: VenueDisplayZone; hideOpen?: boolean }) {
  return (
    <>
      {zone.isPrivate ? <small>Private</small> : null}
      {!hideOpen || zone.accessLabel !== "Open to you" ? <small>{zone.accessLabel}</small> : null}
      {zone.restricted && zone.allowed ? <small>Permission needed</small> : null}
    </>
  );
}
