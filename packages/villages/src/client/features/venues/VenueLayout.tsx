import { ZoneMap } from "../../shared/ZoneMap.js";
import type { ZoneLayout } from "../../../shared/helpers/zone-layout.js";
import type { VenueDisplayZone } from "./venue-view.js";

export function ZoneAccessLabels({ zone }: { zone: VenueDisplayZone }) {
  return (
    <>
      {zone.isPrivate ? <small>Private</small> : null}
      <small>{zone.accessLabel}</small>
      {zone.restricted && zone.allowed ? <small>Permission needed</small> : null}
    </>
  );
}
/** Selection never enters or discovers a Zone. */
export function VenueLayout({
  zones,
  positions,
  selectedId,
  onSelect,
  disabled = false,
}: {
  zones: VenueDisplayZone[];
  positions?: ZoneLayout;
  selectedId: string;
  onSelect(id: string): void;
  disabled?: boolean;
}) {
  return (
    <ZoneMap
      zones={zones}
      positions={positions}
      selectedId={selectedId}
      onSelect={onSelect}
      disabled={disabled}
      labels={(zone) => <ZoneAccessLabels zone={zone} />}
    />
  );
}
