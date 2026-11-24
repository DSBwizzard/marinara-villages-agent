import type { VillageVenue } from "../../../shared/contracts/village.js";
import { playerDisplayName } from "../../shared/presentation.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { ArrangementRoster, type ArrangementPage } from "./ArrangementNavigation.js";
import { VenueRunners } from "./VenueRunners.js";
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
