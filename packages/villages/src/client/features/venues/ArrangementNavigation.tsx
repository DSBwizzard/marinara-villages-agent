import type { VillageVenue } from "../../../shared/contracts/village.js";
import { VenueZoneRow } from "../../shared/VenueNavigation.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";
import { VenuePeoplePicker, type VenuePerson } from "./VenueManage.js";

export type ArrangementKind = "home" | "work" | "management";
export type ArrangementPage = { kind: ArrangementKind; personId?: string; adding?: boolean };
export const arrangementLabel = (kind: ArrangementKind, zone = false) =>
  kind === "home"
    ? zone
      ? "Sleeps here"
      : "Residents"
    : kind === "work"
      ? zone
        ? "Works here"
        : "Workers"
      : "Managers";
export function arrangementIds(place: VillageVenue, kind: ArrangementKind, zoneId?: string): string[] {
  if (kind === "management") {
    const zone =
      place.zones?.find((row) => row.id === zoneId) ??
      [...(place.spaces ?? []), ...(place.privateSpaces ?? [])].find((row) => row.id === zoneId);
    return (
      zone?.accessView?.policy?.managerIds ??
      zone?.access?.managerIds ??
      place.accessView?.managerIds ??
      place.access?.managerIds ??
      []
    );
  }
  if (kind === "home")
    return [...(place.occupancy.playerHome ? ["player"] : []), ...(place.residentIds ?? [])].filter(
      (id) => !zoneId || place.destinations?.[id]?.sleep === zoneId,
    );
  const work = place.access?.work ?? place.accessView?.work ?? [];
  return [...new Set([...(place.workerIds ?? []), ...work.map((row) => row.characterId)])].filter(
    (id) => !zoneId || work.some((row) => row.characterId === id && row.zoneId === zoneId),
  );
}
export function ArrangementSummary({
  place,
  zoneId,
  disabled,
  onOpen,
}: {
  place: VillageVenue;
  zoneId?: string;
  disabled?: boolean;
  onOpen(kind: ArrangementKind): void;
}) {
  return (
    <nav className={P + "-venue-zone-picker villages-arrangement-summary"} aria-label="Arrangements">
      {(["home", "work"] as const).map((kind) => (
        <VenueZoneRow
          key={kind}
          name={arrangementLabel(kind, !!zoneId)}
          accessLabel={String(arrangementIds(place, kind, zoneId).length)}
          disabled={disabled}
          onOpen={() => onOpen(kind)}
        />
      ))}
    </nav>
  );
}
export function ArrangementRoster({
  place,
  zoneId,
  people,
  page,
  onPage,
  disabled,
}: {
  place: VillageVenue;
  zoneId?: string;
  people: readonly VenuePerson[];
  page: ArrangementPage;
  onPage(page: ArrangementPage): void;
  disabled?: boolean;
}) {
  const assigned = arrangementIds(place, page.kind, zoneId);
  const owner =
    place.zones?.find((row) => row.id === zoneId)?.ownerId ??
    place.privateSpaces?.find((row) => row.id === zoneId)?.ownerId;
  return (
    <section className="villages-manage">
      <VenuePeoplePicker
        key={String(page.adding)}
        title={arrangementLabel(page.kind, !!zoneId)}
        people={people
          .filter((row) => page.kind !== "work" || row.id !== "player")
          .filter((row) => !!page.adding !== assigned.includes(row.id))}
        onSelect={(personId) => onPage({ ...page, personId })}
        onAdd={
          !page.adding && !(page.kind === "management" && owner) ? () => onPage({ ...page, adding: true }) : undefined
        }
        addLabel={page.kind === "home" ? "Add resident" : page.kind === "work" ? "Add worker" : "Add manager"}
        disabled={disabled}
      />
    </section>
  );
}
