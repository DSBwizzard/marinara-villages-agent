import type { VillageVenue } from "../../../shared/contracts/village.js";
import { materializeConnections } from "../../../shared/helpers/zone-contact.js";
import { resolveZoneLayout, zoneLayoutKey, type ZoneLayoutChange } from "../../../shared/helpers/zone-layout.js";
import { ZoneMap } from "../../shared/ZoneMap.js";
import type { VenueScreenController } from "./screen-contracts.js";
import { ZoneAccessLabels } from "./VenueLayout.js";
import type { VenueDisplayZone } from "./venue-view.js";

export function VenueLayoutEditor({
  place,
  zones,
  selectedId,
  onSelect,
  controller,
}: {
  place: VillageVenue;
  zones: VenueDisplayZone[];
  selectedId: string;
  onSelect(id: string): void;
  controller: VenueScreenController;
}) {
  const pending = controller.venueLayouts[place.id];
  const sceneActive = !!controller.room && controller.room.status !== "closed";
  const draft = pending?.change;
  const rows = materializeConnections(zones).map((zone) => ({
    ...zone,
    connectedTo: draft?.connections.find((entry) => entry.id === zone.id)?.connectedTo ?? zone.connectedTo,
  }));
  const current: ZoneLayoutChange = draft ?? {
    base: zoneLayoutKey(zones, place.zoneLayout),
    positions: resolveZoneLayout(
      zones.map((zone) => zone.id),
      place.zoneLayout,
    ),
    connections: rows.map((zone) => ({ id: zone.id, connectedTo: zone.connectedTo ?? [] })),
  };
  const change = (next: ZoneLayoutChange) => {
    controller.stageVenueZoneLayout(place, next);
  };
  return (
    <>
      <ZoneMap
        modifyConnections
        key={sceneActive ? "scene" : "editing"}
        zones={rows}
        positions={draft?.positions ?? place.zoneLayout}
        selectedId={selectedId}
        onSelect={onSelect}
        disabled={controller.venueEditBusy || pending?.saving}
        onPositions={sceneActive ? undefined : (positions) => change({ ...current, positions })}
        onConnections={
          place.accessView?.canManage && !sceneActive
            ? (zones) =>
                change({
                  ...current,
                  connections: zones.map((zone) => ({ id: zone.id, connectedTo: zone.connectedTo ?? [] })),
                })
            : undefined
        }
        labels={(zone) => <ZoneAccessLabels zone={zone} />}
      />
      {sceneActive ? <p role="status">End the Scene to edit the layout.</p> : null}
      {pending?.saving ? <p role="status">Saving layout…</p> : null}
      {pending?.error ? <p role="alert">{pending.error}</p> : null}
    </>
  );
}
