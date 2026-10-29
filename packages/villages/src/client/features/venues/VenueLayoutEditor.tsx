import { useState } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import { connectionProblem, materializeConnections } from "../../../shared/helpers/zone-contact.js";
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
  const [problem, setProblem] = useState("");
  const pending = controller.venueLayouts[place.id];
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
    const error = connectionProblem(next.connections);
    setProblem(error);
    if (!error) controller.saveVenueZoneLayout(place, next);
  };
  return (
    <>
      <ZoneMap
        zones={rows}
        positions={draft?.positions ?? place.zoneLayout}
        selectedId={selectedId}
        onSelect={onSelect}
        disabled={controller.venueEditBusy}
        onPositions={(positions) => change({ ...current, positions })}
        onConnections={
          place.accessView?.canManage
            ? (zones) =>
                change({
                  ...current,
                  connections: zones.map((zone) => ({ id: zone.id, connectedTo: zone.connectedTo ?? [] })),
                })
            : undefined
        }
        labels={(zone) => <ZoneAccessLabels zone={zone} />}
      />
      {problem ? <p role="alert">{problem}</p> : null}
      {pending?.saving ? <p role="status">Saving layout…</p> : null}
      {pending?.error ? (
        <div role="alert">
          {pending.error}{" "}
          <button type="button" onClick={() => controller.retryVenueZoneLayout(place.id)}>
            Retry
          </button>
        </div>
      ) : null}
    </>
  );
}
