import type { VillageVenue } from "../../../shared/contracts/village.js";
import type { CSSProperties } from "react";
import {
  applyConnectionEdits,
  connectionProblem,
  contactNeighborIds,
  materializeConnections,
} from "../../../shared/helpers/zone-contact.js";
import { resolveZoneLayout, zoneLayoutKey } from "../../../shared/helpers/zone-layout.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";
import { ZoneMap } from "../../shared/ZoneMap.js";
import type { VenueScreenController } from "./screen-contracts.js";
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
  const selected = rows.find((zone) => zone.id === selectedId);
  if (!selected) return null;
  const neighbors = contactNeighborIds(rows, selectedId);
  const canEdit = !!place.accessView?.canManage && !sceneActive && !controller.venueEditBusy && !pending?.saving;
  const problem = draft ? connectionProblem(draft.connections) : "";
  const rowCount = Math.ceil(rows.length / 3);
  const positions = Object.fromEntries(
    rows.map(({ id }, index) => [id, { x: (index % 3) * 34, y: (Math.floor(index / 3) * 100) / rowCount }]),
  );
  const toggle = (id: string, checked: boolean) => {
    const connectedTo = checked ? [...neighbors, id] : neighbors.filter((neighbor) => neighbor !== id);
    const connections = applyConnectionEdits(rows, [{ id: selectedId, connectedTo }]).map((zone) => ({
      id: zone.id,
      connectedTo: zone.connectedTo,
    }));
    controller.stageVenueZoneLayout(place, {
      base: draft?.base ?? zoneLayoutKey(zones, place.zoneLayout),
      // The schematic's arrangement is independent of the saved layout coordinates.
      positions:
        draft?.positions ??
        resolveZoneLayout(
          zones.map((zone) => zone.id),
          place.zoneLayout,
        ),
      connections,
    });
  };
  return (
    <>
      <div style={{ "--venue-diagram-height": `${rowCount * 68}px` } as CSSProperties}>
        <ZoneMap
          zones={rows}
          positions={positions}
          selectedId={selectedId}
          onSelect={onSelect}
          disabled={pending?.saving}
        />
      </div>
      {place.accessView?.canManage ? (
        <>
          <fieldset className={P + "-venue-connection-choices"} disabled={!canEdit}>
            <legend>Connect {selected.name} to</legend>
            {rows
              .filter((zone) => zone.id !== selectedId)
              .map((zone) => (
                <label key={zone.id}>
                  <input
                    type="checkbox"
                    autoComplete="off"
                    checked={neighbors.includes(zone.id)}
                    onChange={(event) => toggle(zone.id, event.target.checked)}
                  />
                  {zone.name}
                </label>
              ))}
          </fieldset>
          {sceneActive ? <p role="status">End the Scene to edit connections.</p> : null}
          {pending?.saving ? <p role="status">Saving layout…</p> : null}
          {problem || pending?.error ? <p role="alert">{problem || pending?.error}</p> : null}
          <button
            type="button"
            className={P + "-venue-primary"}
            disabled={!canEdit || !draft || !!problem}
            onClick={() => void controller.commitVenueZoneLayout(place.id)}
          >
            Save connections
          </button>
        </>
      ) : null}
    </>
  );
}
