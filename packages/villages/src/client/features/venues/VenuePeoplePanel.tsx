import { useState, useCallback } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import { playerDisplayName } from "../../shared/presentation.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { ArrangementRoster, VisitorsOverview, type ArrangementPage } from "./ArrangementNavigation.js";
import { VenueRunners } from "./VenueRunners.js";
import { VenueZoneRow } from "../../shared/VenueNavigation.js";
import { VenueAccessPanel } from "./VenueAccessPanel.js";
import { VenueHomePanel } from "./VenueHomePanel.js";
import { VenueWorkPanel } from "./VenueWorkPanel.js";
import type { VenueScreenController } from "./screen-contracts.js";
export function VenuePeoplePanel({
  place,
  controller,
  page,
  onPage,
  onBusyChange,
}: {
  place: VillageVenue;
  controller: VenueScreenController;
  page: ArrangementPage;
  onPage(page: ArrangementPage | null): void;
  onBusyChange(busy: boolean): void;
}) {
  const [busy, setBusy] = useState(false);
  const busyChange = useCallback(
    (value: boolean) => {
      setBusy(value);
      onBusyChange(value);
    },
    [onBusyChange],
  );
  const people = [
    { id: "player", name: playerDisplayName(controller.snapshot) },
    ...controller.snapshot.villagers.map((row) => ({
      id: row.characterId,
      name: row.name,
      portrait: controller.portraits?.[row.characterId],
    })),
  ];
  const person = people.find((row) => row.id === page.personId),
    zone = place.zones?.find((row) => row.id === page.zoneId);
  const back = () => onPage({ kind: page.kind });
  if (page.kind === "runners")
    return (
      <VenueRunners
        key={place.id + controller.snapshot.worldScope + place.accessView?.revision}
        ids={place.accessView?.runnerIds ?? place.accessView?.managerIds ?? []}
        people={people}
        disabled={!place.accessView?.canManage}
        onBusyChange={onBusyChange}
        onBack={() => onPage(null)}
        onSave={(ids) =>
          controller.changeVenueAccess(place.id, {
            action: "venue-policy",
            managerIds: ids,
            operationId: createVillagesClientId(),
            expectedRevision: place.accessView!.revision,
            zoneId: null,
          })
        }
      />
    );
  if (page.kind === "visitors" && !zone)
    return <VisitorsOverview place={place} disabled={busy} onOpen={(zoneId) => onPage({ ...page, zoneId })} />;
  if (page.kind === "visitors" || page.kind === "guests")
    return (
      <section className="villages-manage">
        <VenueAccessPanel
          key={place.id + (page.zoneId ?? "") + place.accessView?.revision}
          place={place}
          zone={zone}
          controller={controller}
          onClose={() => onPage(page.kind === "guests" ? page : { kind: "visitors" })}
          onBusyChange={busyChange}
          invitationsOnly={page.kind === "guests"}
        >
          {page.kind === "visitors" && zone?.accessView?.decision.canInvite && (
            <nav className="marinara-capability-villages-venue-zone-picker villages-arrangement-summary">
              <VenueZoneRow name="Invitations" disabled={busy} onOpen={() => onPage({ ...page, kind: "guests" })} />
            </nav>
          )}
        </VenueAccessPanel>
      </section>
    );
  if (!person) return <ArrangementRoster place={place} people={people} page={page} onPage={onPage} />;
  return page.kind === "home" ? (
    <VenueHomePanel
      place={place}
      person={person.id}
      controller={controller}
      onBack={back}
      onBusyChange={onBusyChange}
    />
  ) : (
    <VenueWorkPanel
      place={place}
      person={person.id}
      controller={controller}
      onBack={back}
      onBusyChange={onBusyChange}
    />
  );
}
