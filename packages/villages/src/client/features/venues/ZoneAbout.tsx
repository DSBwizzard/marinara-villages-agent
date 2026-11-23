import { useEffect, useLayoutEffect, useState } from "react";
import type { ProjectRoomEntry, VillageVenue } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import type { VenueScreenController } from "./screen-contracts.js";

type Zone = NonNullable<VillageVenue["zones"]>[number];
export function planZoneRenovation(
  place: VillageVenue,
  zone: Zone,
  controller: VenueScreenController,
  change: { description?: string; purpose?: string; assignment?: string },
  entries: ProjectRoomEntry[] = [],
) {
  const zones = (place.zones ?? [])
    .filter((row) => row.kind !== "exterior")
    .map((row) =>
      row.id !== zone.id
        ? row
        : {
            ...row,
            ...(change.purpose !== undefined ? { purpose: change.purpose } : {}),
            ...(change.assignment !== undefined
              ? {
                  kind: change.assignment ? ("personal" as const) : ("public" as const),
                  ownerId: change.assignment === "vacant" ? undefined : change.assignment || undefined,
                }
              : {}),
          },
    );
  controller.planVenueRenovation(place, {
    title: `Renovate ${zone.name}`,
    detail: `Update ${zone.name}.`,
    zones,
    base: structuredClone({ zones: place.zones, form: place.form }),
    roomEdits:
      change.description === undefined
        ? []
        : [
            ...entries.map((entry) => ({ zoneId: zone.id, entryId: entry.id, version: entry.version, text: null })),
            ...(change.description.trim() ? [{ zoneId: zone.id, text: change.description.trim() }] : []),
          ],
  });
}

export function ZoneAbout({
  place,
  zone,
  controller,
  onDirtyChange,
}: {
  place: VillageVenue;
  zone: Zone;
  controller: VenueScreenController;
  onDirtyChange(dirty: boolean): void;
}) {
  const [entries, setEntries] = useState<ProjectRoomEntry[] | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const abort = new AbortController();
    void request<{ entries: ProjectRoomEntry[] | null }>(
      `/projects/rooms/${encodeURIComponent(place.id)}/${encodeURIComponent(zone.id)}`,
      { signal: abort.signal },
    ).then(
      (result) => {
        if (abort.signal.aborted) return;
        if (Array.isArray(result.entries)) setEntries(result.entries);
        else setError("Visit this Zone to edit its description.");
      },
      (cause) => {
        if (!abort.signal.aborted) setError(messageFrom(cause, "Room details are unavailable."));
      },
    );
    return () => abort.abort();
  }, [place.id, zone.id]);
  const original = entries?.map((entry) => entry.text).join("\n\n") ?? zone.description;
  const value = description ?? original;
  const usedFor = purpose ?? zone.purpose ?? "";
  const changed = (description !== null && value !== original) || usedFor !== (zone.purpose ?? "");
  useLayoutEffect(() => {
    onDirtyChange(changed);
    return () => onDirtyChange(false);
  }, [changed, onDirtyChange]);
  return (
    <section className="villages-manage" aria-label="Zone details">
      <div className="villages-manage-form villages-zone-fields">
        <label>
          Description
          <textarea
            autoComplete="off"
            aria-label="Description"
            rows={4}
            maxLength={16000}
            readOnly={!entries}
            value={value}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        {zone.kind !== "exterior" && (
          <label>
            Used for
            <textarea
              autoComplete="off"
              aria-label="Used for"
              rows={2}
              maxLength={240}
              value={usedFor}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </label>
        )}
        {error && <p role="status">{error}</p>}
        <button
          type="button"
          disabled={!changed || (description !== null && !entries) || controller.venueEditBusy}
          onClick={() => {
            onDirtyChange(false);
            planZoneRenovation(
              place,
              zone,
              controller,
              {
                ...(description !== null && value !== original ? { description: value } : {}),
                ...(usedFor !== (zone.purpose ?? "") ? { purpose: usedFor } : {}),
              },
              entries ?? [],
            );
          }}
        >
          Plan a renovation
        </button>
      </div>
    </section>
  );
}
