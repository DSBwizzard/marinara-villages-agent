import { useState, useLayoutEffect } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import { messageFrom } from "../../shared/api.js";
import { playerDisplayName } from "../../shared/presentation.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { VenuePeopleFlow, type VenueArrangement } from "./VenueManage.js";
import { VenueHomePanel } from "./VenueHomePanel.js";
import { VenueWorkPanel } from "./VenueWorkPanel.js";
import type { VenueScreenController } from "./screen-contracts.js";

type Zone = NonNullable<VillageVenue["zones"]>[number];
function Management({
  place,
  zone,
  person,
  controller,
  onBack,
  onBusyChange,
}: {
  place: VillageVenue;
  zone?: Zone;
  person: string;
  controller: VenueScreenController;
  onBack(): void;
  onBusyChange(busy: boolean): void;
}) {
  const policy = zone?.accessView?.policy;
  const managers = zone
    ? policy
      ? (policy.managerIds ?? place.accessView?.managerIds ?? [])
      : []
    : (place.accessView?.managerIds ?? []);
  const [active, setActive] = useState(managers.includes(person));
  const [busy, setBusy] = useState(false);
  useLayoutEffect(() => {
    onBusyChange(busy);
    return () => onBusyChange(false);
  }, [busy, onBusyChange]);
  const [error, setError] = useState("");
  const canManage = zone ? !!policy : !!place.accessView?.canManage;
  const save = async () => {
    if (!canManage || !place.accessView || busy) return;
    setBusy(true);
    setError("");
    const managerIds = active ? [...new Set([...managers, person])] : managers.filter((id) => id !== person);
    try {
      if (
        await controller.changeVenueAccess(place.id, {
          operationId: createVillagesClientId(),
          expectedRevision: place.accessView.revision,
          zoneId: zone?.id ?? null,
          ...(policy
            ? { action: "zone-policy", policy: { ...policy, managerIds } }
            : { action: "venue-policy", managerIds, visitorHours: place.accessView.visitorHours ?? null }),
        })
      )
        onBack();
    } catch (cause) {
      setError(messageFrom(cause, "Could not save management."));
    } finally {
      setBusy(false);
    }
  };
  return (
    <fieldset disabled={busy}>
      <label className="villages-manage-check">
        <input type="checkbox" disabled={!canManage} checked={active} onChange={(e) => setActive(e.target.checked)} />
        Manages this place
      </label>
      {error && <p role="alert">{error}</p>}
      <div className="villages-manage-actions">
        <button type="button" onClick={onBack}>
          Cancel
        </button>
        <button type="button" className="villages-manage-primary" disabled={!canManage} onClick={() => void save()}>
          Save management
        </button>
      </div>
    </fieldset>
  );
}

export function VenuePeoplePanel({
  place,
  zone,
  controller,
}: {
  place: VillageVenue;
  zone?: Zone;
  controller: VenueScreenController;
}) {
  const people = [
    { id: "player", name: playerDisplayName(controller.snapshot) },
    ...controller.snapshot.villagers.map((row) => ({
      id: row.characterId,
      name: row.name,
      portrait: controller.portraits?.[row.characterId],
    })),
  ];
  const members = new Set([
    ...(place.residentIds ?? []),
    ...(place.occupancy.residentCharacterId ? [place.occupancy.residentCharacterId] : []),
    ...(place.occupancy.playerHome ? ["player"] : []),
  ]);
  const managers = zone
    ? zone.accessView?.policy
      ? (zone.accessView.policy.managerIds ?? place.accessView?.managerIds ?? [])
      : []
    : (place.accessView?.managerIds ?? []);
  const roles = (id: string): VenueArrangement[] => [
    ...(members.has(id) && (!zone || place.destinations?.[id]?.sleep === zone.id) ? ["home" as const] : []),
    ...(place.accessView?.work?.some(
      (row) => row.characterId === id && (!zone || row.zoneId === zone.id || row.accessZoneIds.includes(zone.id)),
    ) ||
    (!zone && place.workerIds?.includes(id)) ||
    place.accessView?.workOffers?.some(
      (row) =>
        row.characterId === id &&
        (!zone || row.terms?.zoneId === zone.id || row.terms?.accessZoneIds.includes(zone.id)),
    )
      ? ["work" as const]
      : []),
    ...(managers.includes(id) || zone?.ownerId === id ? ["management" as const] : []),
  ];
  return (
    <section className="villages-manage" aria-label="Venue people">
      <VenuePeopleFlow
        people={people}
        assignedIds={people.filter((row) => roles(row.id).length).map((row) => row.id)}
        roles={roles}
        renderEditor={(person, arrangement, onBack, onBusyChange) =>
          arrangement === "home" ? (
            <VenueHomePanel
              key={person.id}
              place={place}
              person={person.id}
              controller={controller}
              onBack={onBack}
              onBusyChange={onBusyChange}
            />
          ) : arrangement === "work" ? (
            <VenueWorkPanel
              key={person.id}
              place={place}
              person={person.id}
              controller={controller}
              onBack={onBack}
              onBusyChange={onBusyChange}
            />
          ) : (
            <Management
              key={person.id + String(place.accessView?.revision)}
              place={place}
              zone={zone}
              person={person.id}
              controller={controller}
              onBack={onBack}
              onBusyChange={onBusyChange}
            />
          )
        }
      />
    </section>
  );
}
