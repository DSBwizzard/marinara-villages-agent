import { useState, useLayoutEffect } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import type { VenueScreenController } from "./screen-contracts.js";

export function VenueHomePanel({
  place,
  person,
  controller,
  onBack,
  onBusyChange,
}: {
  place: VillageVenue;
  person: string;
  controller: VenueScreenController;
  onBack(): void;
  onBusyChange(busy: boolean): void;
}) {
  const [targetId, setTargetId] = useState(
    place.residentIds?.includes(person) || (person === "player" && place.occupancy.playerHome) ? "" : place.id,
  );
  const [zoneId, setZoneId] = useState("");
  const [busy, setBusy] = useState(false);
  useLayoutEffect(() => {
    onBusyChange(busy);
    return () => onBusyChange(false);
  }, [busy, onBusyChange]);
  const ids = new Set([...(place.occupancy.playerHome ? ["player"] : []), ...(place.residentIds ?? [])]);
  const targets = controller.snapshot.settings.venues.filter(
    (row) => (row.residenceCapacity ?? 0) > 0 && (!ids.has(person ?? "") || row.id !== place.id),
  );
  const target = targets.find((row) => row.id === targetId);
  const openTarget = person === "player" && target?.id !== place.id;
  const zones =
    target?.zones?.filter((zone) => zone.kind !== "exterior" && (!zone.ownerId || zone.ownerId === person)) ?? [];
  const propose = async () => {
    if (!person || !target || (!openTarget && !zoneId) || busy) return;
    if (openTarget) {
      controller.openPlace(target);
      return;
    }
    setBusy(true);
    try {
      if (person === "player") await controller.requestPlayerMove(target.id, zoneId);
      else await controller.proposeResidenceMove(person, target.id, zoneId);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="villages-manage" aria-label="Home arrangements">
      {ids.has(person) && (
        <dl className="villages-manage-details">
          <dt>Home</dt>
          <dd>{place.name}</dd>
          {place.destinations?.[person]?.sleep && (
            <>
              <dt>Sleeps in</dt>
              <dd>{place.zones?.find((zone) => zone.id === place.destinations?.[person]?.sleep)?.name ?? "Zone"}</dd>
            </>
          )}
        </dl>
      )}
      <fieldset disabled={busy || controller.venueEditBusy} className="villages-manage-form">
        <label>
          Move to
          <select
            aria-label="Move to"
            value={targetId}
            onChange={(e) => {
              setTargetId(e.target.value);
              setZoneId("");
            }}
          >
            <option value="">Choose a Venue</option>
            {targets.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </select>
        </label>
        {target && !openTarget && (
          <label>
            Sleeping Zone
            <select aria-label="Sleeping Zone" value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
              <option value="">Choose a Zone</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="villages-manage-actions">
          <button type="button" onClick={onBack}>
            Cancel
          </button>
          <button
            type="button"
            className="villages-manage-primary"
            disabled={!target || (!openTarget && !zoneId)}
            onClick={() => void propose()}
          >
            {openTarget ? "Open Venue" : person === "player" ? "Move here" : "Propose move"}
          </button>
        </div>
      </fieldset>
      {controller.snapshot.residences.some((row) => row.characterId === person && row.status !== "current") && (
        <button type="button" disabled={busy} onClick={() => controller.openVenueRequests(place.id)}>
          View move request
        </button>
      )}
    </section>
  );
}
