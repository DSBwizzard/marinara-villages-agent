import { useState, useLayoutEffect, useCallback } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import { messageFrom } from "../../shared/api.js";
import { playerDisplayName } from "../../shared/presentation.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import {
  ArrangementRoster,
  VisitorsScope,
  arrangementIds,
  arrangementLabel,
  type ArrangementPage,
} from "./ArrangementNavigation.js";
import { VenueZoneRow } from "../../shared/VenueNavigation.js";
import { VenueAccessPanel } from "./VenueAccessPanel.js";
import { VenueHomePanel } from "./VenueHomePanel.js";
import { VenueWorkPanel } from "./VenueWorkPanel.js";
import type { VenueScreenController } from "./screen-contracts.js";

type Zone = NonNullable<VillageVenue["zones"]>[number];
function VisitorRoleEditor({
  place,
  zone,
  person,
  controller,
  onBack,
  onBusyChange,
  kind,
}: {
  place: VillageVenue;
  zone?: Zone;
  person: string;
  controller: VenueScreenController;
  onBack(): void;
  onBusyChange(busy: boolean): void;
  kind: "rules" | "invite";
}) {
  const policy = zone?.accessView?.policy;
  const managers = zone
    ? policy
      ? (policy.managerIds ?? place.accessView?.managerIds ?? [])
      : []
    : (place.accessView?.managerIds ?? []);
  const initialActive = managers.includes(person) || (kind === "invite" && !!policy?.inviterIds.includes(person));
  const [active, setActive] = useState(initialActive);
  const inherited = kind === "invite" && managers.includes(person);
  const [busy, setBusy] = useState(false);
  useLayoutEffect(() => {
    onBusyChange(busy);
    return () => onBusyChange(false);
  }, [busy, onBusyChange]);
  const [error, setError] = useState("");
  const canRecover = kind === "rules" && (zone ? zone.accessView?.decision.canRecover : place.accessView?.canRecover);
  const canManage = (zone ? !!policy : !!place.accessView?.canManage) || canRecover;
  const save = async () => {
    if (!canManage || !place.accessView || busy || inherited || active === initialActive) return;
    setBusy(true);
    setError("");
    const managerIds = active ? [...new Set([...managers, person])] : managers.filter((id) => id !== person);
    try {
      if (
        await controller.changeVenueAccess(place.id, {
          operationId: createVillagesClientId(),
          expectedRevision: place.accessView.revision,
          zoneId: zone?.id ?? null,
          ...(canRecover
            ? { action: "recover-managers", managerIds }
            : policy
              ? {
                  action: "zone-policy",
                  policy: {
                    ...policy,
                    ...(kind === "invite"
                      ? {
                          inviterIds: active
                            ? [...new Set([...policy.inviterIds, person])]
                            : policy.inviterIds.filter((id) => id !== person),
                        }
                      : { managerIds }),
                  },
                }
              : { action: "venue-policy", managerIds, visitorHours: place.accessView.visitorHours ?? null }),
        })
      )
        onBack();
    } catch (cause) {
      setError(messageFrom(cause, "Could not save visitor rules."));
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
          disabled={!canManage || inherited || (kind === "rules" && initialActive && managers.length === 1)}
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        {arrangementLabel(kind)}
      </label>
      {error && <p role="alert">{error}</p>}
      <div className="villages-manage-actions">
        <button type="button" onClick={onBack}>
          Cancel
        </button>
        <button
          type="button"
          className="villages-manage-primary"
          disabled={!canManage || inherited || active === initialActive}
          onClick={() => void save()}
        >
          Save visitor rules
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
  const [visitorsBusy, setVisitorsBusy] = useState(false);
  const visitorBusyChange = useCallback(
    (busy: boolean) => {
      setVisitorsBusy(busy);
      onBusyChange(busy);
    },
    [onBusyChange],
  );
  const scopeZone =
    page.kind === "rules" || page.kind === "invite" ? place.zones?.find((row) => row.id === page.zoneId) : zone;
  const people = [
    { id: "player", name: playerDisplayName(controller.snapshot) },
    ...controller.snapshot.villagers.map((row) => ({
      id: row.characterId,
      name: row.name,
      portrait: controller.portraits?.[row.characterId],
    })),
  ];
  const person = people.find((row) => row.id === page.personId);
  const back = () => onPage({ kind: page.kind, zoneId: page.zoneId });
  if (page.kind === "visitors" || page.kind === "guests")
    return (
      <section className="villages-manage">
        {!zone && page.kind === "visitors" && (
          <VisitorsScope
            disabled={visitorsBusy}
            place={place}
            zoneId={page.zoneId}
            onZone={(zoneId) => onPage({ ...page, zoneId })}
          />
        )}
        <VenueAccessPanel
          key={place.id + (page.zoneId ?? "venue") + place.accessView?.revision}
          place={place}
          zone={place.zones?.find((row) => row.id === page.zoneId)}
          controller={controller}
          onClose={() => onPage(page)}
          onBusyChange={visitorBusyChange}
          invitationsOnly={page.kind === "guests"}
        >
          {page.kind === "visitors" && (
            <>
              {page.zoneId !== "exterior" &&
                (page.zoneId
                  ? !!place.zones?.find((row) => row.id === page.zoneId)?.accessView?.policy ||
                    !!place.zones?.find((row) => row.id === page.zoneId)?.accessView?.decision.canRecover
                  : place.accessView?.canManage || place.accessView?.canRecover) && (
                  <nav className="marinara-capability-villages-venue-zone-picker villages-arrangement-summary villages-visitor-roles">
                    {(["rules", ...(page.zoneId ? ["invite"] : [])] as const).map((kind: "rules" | "invite") => (
                      <VenueZoneRow
                        key={kind}
                        name={arrangementLabel(kind)}
                        accessLabel={String(arrangementIds(place, kind, page.zoneId).length)}
                        disabled={visitorsBusy}
                        onOpen={() => onPage({ ...page, kind })}
                      />
                    ))}
                  </nav>
                )}
              {place.zones?.find((row) => row.id === page.zoneId)?.accessView?.decision.canInvite && (
                <nav className="marinara-capability-villages-venue-zone-picker villages-arrangement-summary">
                  <VenueZoneRow
                    name="Invitations"
                    disabled={visitorsBusy}
                    onOpen={() => onPage({ ...page, kind: "guests" })}
                  />
                </nav>
              )}
            </>
          )}
        </VenueAccessPanel>
      </section>
    );
  if (!person)
    return <ArrangementRoster place={place} zoneId={scopeZone?.id} people={people} page={page} onPage={onPage} />;
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
    <VisitorRoleEditor
      kind={page.kind === "invite" ? "invite" : "rules"}
      key={person.id + String(place.accessView?.revision)}
      place={place}
      zone={scopeZone}
      person={person.id}
      controller={controller}
      onBack={back}
      onBusyChange={onBusyChange}
    />
  );
}
