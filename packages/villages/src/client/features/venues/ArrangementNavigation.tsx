import type { VillageVenue } from "../../../shared/contracts/village.js";
import { VenueZoneRow } from "../../shared/VenueNavigation.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";
import { VenuePeoplePicker, type VenuePerson } from "./VenueManage.js";

export type ArrangementKind = "home" | "work" | "rules" | "invite" | "visitors" | "guests";
export type ArrangementPage = { kind: ArrangementKind; personId?: string; adding?: boolean; zoneId?: string };
export function arrangementBack(page: ArrangementPage): ArrangementPage | null {
  if (page.personId || page.adding) return { kind: page.kind, zoneId: page.zoneId };
  return page.kind === "rules" || page.kind === "invite" || page.kind === "guests"
    ? { kind: "visitors", zoneId: page.zoneId }
    : null;
}
export const arrangementAddLabel = (kind: ArrangementKind) =>
  kind === "home" ? "Add resident" : kind === "work" ? "Add worker" : "Add person";
export const arrangementLabel = (kind: ArrangementKind, zone = false) =>
  kind === "home"
    ? zone
      ? "Sleeps here"
      : "Residents"
    : kind === "work"
      ? zone
        ? "Works here"
        : "Workers"
      : kind === "rules"
        ? "Change visitor rules"
        : kind === "invite"
          ? "Invite guests"
          : kind === "guests"
            ? "Invitations"
            : "Visitors";
export function visitorZones(place: VillageVenue) {
  if (place.accessView && place.zones) return place.zones;
  return [
    ...(place.zones?.filter((zone) => zone.kind === "exterior") ?? []),
    ...(place.spaces?.length || place.privateSpaces?.length
      ? [
          ...(place.spaces ?? []).map((zone) => ({ ...zone, kind: "public" as const })),
          ...(place.privateSpaces ?? []).map((zone) => ({ ...zone, kind: "personal" as const })),
        ]
      : (place.zones?.filter((zone) => zone.kind !== "exterior") ?? [])),
  ];
}
export function visitorDefault(place: VillageVenue) {
  const zones = visitorZones(place).filter((zone) => zone.kind !== "exterior");
  return (zones.find((zone) => !zone.ownerId) ?? zones[0])?.id;
}
export function VisitorsScope({
  place,
  zoneId,
  disabled,
  onZone,
}: {
  place: VillageVenue;
  zoneId?: string;
  disabled?: boolean;
  onZone(id?: string): void;
}) {
  return (
    <label>
      Zone
      <select
        aria-label="Visitor Zone"
        value={zoneId ?? ""}
        disabled={disabled}
        onChange={(e) => onZone(e.target.value || undefined)}
      >
        {visitorZones(place)
          .filter((zone) => zone.kind !== "exterior")
          .map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.name || "Zone"}
            </option>
          ))}
        <option value="">Venue defaults</option>
      </select>
    </label>
  );
}
export function arrangementIds(place: VillageVenue, kind: ArrangementKind, zoneId?: string): string[] {
  if (kind === "rules" || kind === "invite") {
    const zone = visitorZones(place).find((row) => row.id === zoneId);
    if (zone?.accessView?.decision.canRecover) return [];
    const managers =
      zone?.accessView?.policy?.managerIds ??
      zone?.access?.managerIds ??
      place.accessView?.managerIds ??
      place.access?.managerIds ??
      (!place.accessView && !place.access
        ? [...(place.occupancy.playerHome ? ["player"] : []), ...(place.residentIds ?? [])].length
          ? [...(place.occupancy.playerHome ? ["player"] : []), ...(place.residentIds ?? [])]
          : ["player"]
        : []);
    return kind === "rules"
      ? managers
      : [...new Set([...managers, ...(zone?.accessView?.policy?.inviterIds ?? zone?.access?.inviterIds ?? [])])];
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
      {(zoneId === "exterior" ? [] : (["home", "work"] as const)).map((kind) => (
        <VenueZoneRow
          key={kind}
          name={arrangementLabel(kind, !!zoneId)}
          accessLabel={String(arrangementIds(place, kind, zoneId).length)}
          disabled={disabled}
          onOpen={() => onOpen(kind)}
        />
      ))}
      <VenueZoneRow
        name="Visitors"
        accessLabel={(() => {
          const zones = visitorZones(place).filter((zone) => (zoneId ? zone.id === zoneId : zone.kind !== "exterior"));
          const modes = new Set(
            zones.map((zone) =>
              zone.kind === "exterior"
                ? "public"
                : (zone.accessView?.decision.mode ??
                  zone.access?.mode ??
                  (zone.ownerId ? "permission-required" : "public")),
            ),
          );
          return modes.size > 1 ? "Mixed" : modes.has("permission-required") ? "By permission" : "Public";
        })()}
        disabled={disabled}
        onOpen={() => onOpen("visitors")}
      />
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
  return (
    <section className="villages-manage">
      <VenuePeoplePicker
        key={String(page.adding)}
        title={arrangementLabel(page.kind, !!zoneId)}
        people={people
          .filter((row) => page.kind !== "work" || row.id !== "player")
          .filter((row) => !!page.adding !== assigned.includes(row.id))}
        onSelect={(personId) => onPage({ ...page, personId })}
        disabled={disabled}
      />
    </section>
  );
}
