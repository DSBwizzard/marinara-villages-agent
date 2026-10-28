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
  onDirtyChange,
}: {
  place: VillageVenue;
  zones: VenueDisplayZone[];
  selectedId: string;
  onSelect(id: string): void;
  controller: VenueScreenController;
  onDirtyChange(value: boolean): void;
}) {
  const [draft, setDraft] = useState<(ZoneLayoutChange & { zones: VenueDisplayZone[] }) | null>(null);
  const [problem, setProblem] = useState("");
  const rows = draft?.zones ?? materializeConnections(zones);
  const current = () =>
    draft ?? {
      base: zoneLayoutKey(zones, place.zoneLayout),
      positions: resolveZoneLayout(
        zones.map((z) => z.id),
        place.zoneLayout,
      ),
      connections: [],
      zones: materializeConnections(zones),
    };
  const change = (next: NonNullable<typeof draft>) => {
    setProblem("");
    setDraft(next);
    onDirtyChange(true);
  };
  return (
    <>
      <ZoneMap
        zones={rows}
        positions={draft?.positions ?? place.zoneLayout}
        selectedId={selectedId}
        onSelect={onSelect}
        disabled={controller.venueEditBusy}
        onPositions={(positions) => change({ ...current(), positions })}
        onConnections={place.accessView?.canManage ? (zones) => change({ ...current(), zones }) : undefined}
        labels={(zone) => <ZoneAccessLabels zone={zone} />}
      />
      {problem ? <p role="alert">{problem}</p> : null}
      <div className="villages-zone-map-actions">
        <button
          type="button"
          disabled={!draft || controller.venueEditBusy}
          onClick={() => {
            setProblem("");
            setDraft(null);
            onDirtyChange(false);
          }}
        >
          Cancel layout changes
        </button>
        <button
          type="button"
          disabled={!draft || controller.venueEditBusy}
          onClick={async () => {
            if (!draft) return;
            const problem = connectionProblem(draft.zones);
            setProblem(problem);
            if (problem) return;
            const saved = await controller.saveVenueZoneLayout(place, {
              base: draft.base,
              positions: draft.positions,
              connections: draft.zones.map((zone) => ({ id: zone.id, connectedTo: zone.connectedTo ?? [] })),
            });
            if (saved) {
              setDraft(null);
              onDirtyChange(false);
            }
          }}
        >
          {controller.venueEditBusy ? "Saving…" : "Save layout"}
        </button>
      </div>
    </>
  );
}
