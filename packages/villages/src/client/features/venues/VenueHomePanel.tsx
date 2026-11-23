import { useState, useLayoutEffect } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import { HomeFields } from "../../shared/HomeFields.js";
import { messageFrom } from "../../shared/api.js";
import { useArrangementRequest, type ArrangementController } from "./arrangement-request.js";
export function VenueHomePanel({
  place,
  person,
  zoneId,
  fixedVenue = true,
  controller,
  onBack,
  onBusyChange,
}: {
  place: VillageVenue;
  person: string;
  zoneId?: string;
  fixedVenue?: boolean;
  controller: ArrangementController;
  onBack(): void;
  onBusyChange(busy: boolean): void;
}) {
  const [targetId, setTargetId] = useState(place.id);
  const [sleep, setSleep] = useState(zoneId ?? place.destinations?.[person]?.sleep ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useLayoutEffect(() => {
    onBusyChange(busy);
    return () => onBusyChange(false);
  }, [busy, onBusyChange]);
  const venues = controller.snapshot.settings.venues.filter(
    (row) => row.constructionStatus !== "worksite" && row.zones?.some((zone) => zone.kind !== "exterior"),
  );
  const target = venues.find((row) => row.id === targetId);
  const zones = target?.zones?.filter((row) => row.kind !== "exterior") ?? [];
  const send = useArrangementRequest(controller, person, targetId);
  const save = async () => {
    if (busy || !target || !sleep) return;
    setBusy(true);
    setError("");
    try {
      if (
        await send(
          person === "player"
            ? "/locations/venue/" + encodeURIComponent(target.id) + "/player-move"
            : "/residences/proposals",
          person === "player"
            ? { privateZoneId: sleep }
            : { characterId: person, venueId: target.id, privateZoneId: sleep },
        )
      )
        onBack();
    } catch (cause) {
      setError(messageFrom(cause, "Could not propose these arrangements."));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="villages-manage" aria-label="Home arrangements">
      <h2>Home</h2>
      <fieldset disabled={busy}>
        <HomeFields
          fixedVenue={fixedVenue}
          fixedZone={!!zoneId}
          venues={venues}
          venueId={targetId}
          zoneId={sleep}
          zones={zones}
          onVenue={(id) => {
            setTargetId(id);
            setSleep("");
          }}
          onZone={setSleep}
        />
        {error && <p role="alert">{error}</p>}
        <div className="villages-manage-actions">
          <button type="button" onClick={onBack}>
            Cancel
          </button>
          <button
            type="button"
            className="villages-manage-primary"
            disabled={!target || !zones.some((row) => row.id === sleep)}
            onClick={() => void save()}
          >
            Propose changes
          </button>
        </div>
      </fieldset>
    </section>
  );
}
