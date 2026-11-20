import type { VillageVenue } from "../../../shared/contracts/village.js";
import {
  applyConnectionEdits,
  changedConnectionIds,
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
  const projectActive = controller.snapshot.projects.some(
    (project) =>
      project.venueId === place.id && project.lifecycle && !["complete", "cancelled"].includes(project.lifecycle.phase),
  );
  const busy = controller.venueEditBusy || !!pending?.saving;
  const canArrange = !busy && !sceneActive && place.constructionStatus !== "worksite";
  const canManage = (id: string) =>
    id === "exterior"
      ? !!place.accessView?.canManage
      : !!rows.find((zone) => zone.id === id)?.accessView?.decision.canManage;
  const canEdit =
    !!place.accessView?.canManage && canManage(selectedId) && !sceneActive && !projectActive && canArrange;
  const changedIds = draft ? changedConnectionIds(zones, draft.connections) : [];
  const canSave =
    canArrange &&
    (!changedIds.length ||
      (!!place.accessView?.canManage && !sceneActive && !projectActive && changedIds.every(canManage)));
  const problem = draft ? connectionProblem(draft.connections) : "";
  const positions =
    draft?.positions ??
    resolveZoneLayout(
      rows.map((zone) => zone.id),
      place.zoneLayout,
    );
  const toggle = (id: string, checked: boolean) => {
    const connectedTo = checked ? [...neighbors, id] : neighbors.filter((neighbor) => neighbor !== id);
    const connections = applyConnectionEdits(rows, [{ id: selectedId, connectedTo }]).map((zone) => ({
      id: zone.id,
      connectedTo: zone.connectedTo,
    }));
    controller.stageVenueZoneLayout(place, {
      base: draft?.base ?? zoneLayoutKey(zones, place.zoneLayout),
      positions,
      connections,
    });
  };
  return (
    <>
      <ZoneMap
        angular
        zones={rows}
        positions={positions}
        selectedId={selectedId}
        onSelect={onSelect}
        disabled={busy}
        onPositions={
          canArrange
            ? (positions) =>
                controller.stageVenueZoneLayout(place, {
                  base: draft?.base ?? zoneLayoutKey(zones, place.zoneLayout),
                  positions,
                  connections: rows.map((zone) => ({ id: zone.id, connectedTo: zone.connectedTo })),
                })
            : undefined
        }
      />
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
                    disabled={!canManage(zone.id)}
                    checked={neighbors.includes(zone.id)}
                    onChange={(event) => toggle(zone.id, event.target.checked)}
                  />
                  {zone.name}
                </label>
              ))}
          </fieldset>
          {projectActive ? <p role="status">Finish the Venue project to edit connections.</p> : null}
        </>
      ) : null}
      {sceneActive ? <p role="status">End the Scene to edit the layout.</p> : null}
      {pending?.saving ? <p role="status">Saving layout…</p> : null}
      {problem || pending?.error ? <p role="alert">{problem || pending?.error}</p> : null}
      <button
        type="button"
        className={P + "-venue-primary"}
        disabled={!canSave || !draft || !!problem}
        onClick={() => void controller.commitVenueZoneLayout(place.id)}
      >
        Save layout
      </button>
    </>
  );
}
