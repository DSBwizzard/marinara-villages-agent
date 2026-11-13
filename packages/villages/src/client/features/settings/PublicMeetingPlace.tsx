import { useState } from "react";
import type { VillageSnapshot } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";
import { useVillageMutationLifetime } from "../../shared/mutation-lifetime.js";
import { createVillagesClientId } from "../../shared/request-id.js";

export function PublicMeetingPlace({
  snapshot,
  onSnapshot,
}: {
  snapshot: VillageSnapshot;
  onSnapshot(next: VillageSnapshot): void;
}) {
  const [replacementId, setReplacementId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const lifetime = useVillageMutationLifetime(snapshot.isFounded, setSaving);
  const current = snapshot.settings.venues.find((venue) => venue.id === snapshot.settings.communityVenueId);
  const eligible = snapshot.settings.venues.filter((venue) => venue.accessView?.canDesignateCommunity);
  const replacement = eligible.find((venue) => venue.id === replacementId);
  if (!current?.accessView || !eligible.length) return null;
  const currentRevision = current.accessView.revision;
  const save = async () => {
    if (!replacement?.accessView || saving) return;
    const claim = lifetime.begin();
    if (!claim) return;
    claim.onRetire = () => setSaving(false);
    setSaving(true);
    setError("");
    try {
      const next = await request<VillageSnapshot>(`/venues/${encodeURIComponent(replacement.id)}/access`, {
        method: "POST",
        body: JSON.stringify({
          action: "community-venue",
          operationId: createVillagesClientId(),
          zoneId: null,
          expectedRevision: replacement.accessView.revision,
          previousVenueId: current.id,
          previousRevision: currentRevision,
        }),
      });
      if (lifetime.owns(claim)) {
        setReplacementId("");
        onSnapshot(next);
      }
    } catch (cause) {
      if (lifetime.owns(claim)) setError(messageFrom(cause, "The meeting place could not be changed."));
    } finally {
      if (lifetime.finish(claim)) setSaving(false);
    }
  };
  return (
    <details className={P + "-field"}>
      <summary>Public meeting place</summary>
      <label>
        Replacement for {current.name}
        <select value={replacementId} disabled={saving} onChange={(event) => setReplacementId(event.target.value)}>
          <option value="">Choose Venue</option>
          {eligible.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>
      </label>
      <button className={P + "-button"} type="button" disabled={saving || !replacement} onClick={() => void save()}>
        {saving ? "Saving…" : "Save meeting place"}
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </details>
  );
}
