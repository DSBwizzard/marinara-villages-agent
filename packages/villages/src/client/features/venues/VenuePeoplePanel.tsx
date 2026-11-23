import { useState, useLayoutEffect } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import { messageFrom } from "../../shared/api.js";
import { playerDisplayName } from "../../shared/presentation.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { ArrangementRoster, type ArrangementPage } from "./ArrangementNavigation.js";
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
        <input
          autoComplete="off"
          type="checkbox"
          disabled={!canManage}
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
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
  page,
  onPage,
  onBusyChange,
}: {
  place: VillageVenue;
  zone?: Zone;
  controller: VenueScreenController;
  page: ArrangementPage;
  onPage(page: ArrangementPage): void;
  onBusyChange(busy: boolean): void;
}) {
  const people = [
    { id: "player", name: playerDisplayName(controller.snapshot) },
    ...controller.snapshot.villagers.map((row) => ({
      id: row.characterId,
      name: row.name,
      portrait: controller.portraits?.[row.characterId],
    })),
  ];
  const person = people.find((row) => row.id === page.personId);
  const back = () => onPage({ kind: page.kind });
  if (!person) return <ArrangementRoster place={place} zoneId={zone?.id} people={people} page={page} onPage={onPage} />;
  return page.kind === "home" ? (
    <VenueHomePanel
      place={place}
      zoneId={zone?.id}
      person={person.id}
      controller={controller}
      onBack={back}
      onBusyChange={onBusyChange}
    />
  ) : page.kind === "work" ? (
    <VenueWorkPanel
      place={place}
      zoneId={zone?.id}
      person={person.id}
      controller={controller}
      onBack={back}
      onBusyChange={onBusyChange}
    />
  ) : (
    <Management
      key={person.id + String(place.accessView?.revision)}
      place={place}
      zone={zone}
      person={person.id}
      controller={controller}
      onBack={back}
      onBusyChange={onBusyChange}
    />
  );
}
