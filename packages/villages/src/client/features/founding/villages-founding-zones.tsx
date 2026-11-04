import { ZoneMap } from "../../shared/ZoneMap.js";
import { resolveZoneLayout } from "../../../shared/helpers/zone-layout.js";
import { connectionProblem, materializeConnections } from "../../../shared/helpers/zone-contact.js";
import type { VillageVenue } from "../../../shared/contracts/village.js";

function foundingLayoutZones(venue: VillageVenue) {
  return materializeConnections([
    { id: "exterior", name: "Entrance", kind: "exterior", connectedTo: undefined as string[] | undefined },
    ...(venue.spaces ?? []).map((zone) => ({ ...zone, kind: "public" })),
    ...(venue.privateSpaces ?? []).map((zone) => ({ ...zone, kind: "restricted" })),
  ]);
}

export function foundingLayoutProblem(venue: VillageVenue): string {
  return connectionProblem(foundingLayoutZones(venue));
}

export function removeFoundingZone(venue: VillageVenue, id: string): VillageVenue {
  if (id === "exterior" || ![...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].some((zone) => zone.id === id))
    return venue;
  const connections = new Map(foundingLayoutZones(venue).map((zone) => [zone.id, zone.connectedTo]));
  const prune = <T extends { id: string; connectedTo?: string[] }>(rows: T[]) =>
    rows
      .filter((zone) => zone.id !== id)
      .map((zone) => ({ ...zone, connectedTo: connections.get(zone.id)!.filter((other) => other !== id) }));
  const spaces = prune(venue.spaces ?? []),
    privateSpaces = prune(venue.privateSpaces ?? []);
  return {
    ...venue,
    spaces,
    privateSpaces,
    destinations: venue.destinations
      ? Object.fromEntries(
          Object.entries(venue.destinations).map(([actor, roles]) => [
            actor,
            Object.fromEntries(Object.entries(roles).filter(([, zoneId]) => zoneId !== id)),
          ]),
        )
      : undefined,
    layout: spaces.length ? (privateSpaces.length ? "both" : "common") : privateSpaces.length ? "private" : "exterior",
    zoneLayout: venue.zoneLayout
      ? resolveZoneLayout(["exterior", ...spaces.map((z) => z.id), ...privateSpaces.map((z) => z.id)], venue.zoneLayout)
      : undefined,
  };
}

export function foundingZoneProblem(venue: VillageVenue): string {
  if (
    [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].some(
      (zone) => zone.access && (!zone.name?.trim() || !zone.purpose?.trim()),
    )
  )
    return "Give each Zone a name and describe what it is used for.";
  if ([...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].some((zone) => !zone.description.trim()))
    return "Add long-term details for each Zone.";
  return foundingLayoutProblem(venue);
}

export { draftZonePolicy } from "../../../shared/helpers/founding-zone-policy.js";
/** Founding Zone layout editor. */
export function FoundingConnections({
  venue,
  onPatch,
  selectedZoneId,
  onSelect,
  onAdd,
  allowAdd = false,
  busy = false,
  readOnly = false,
}: {
  venue: VillageVenue;
  onPatch(venue: VillageVenue): void;
  selectedZoneId?: string;
  onSelect?(id: string): void;
  onAdd?(personal: boolean): void;
  allowAdd?: boolean;
  busy?: boolean;
  readOnly?: boolean;
}) {
  const zones = foundingLayoutZones(venue);
  const remove = () => {
    if (!selectedZoneId || selectedZoneId === "exterior") return;
    onPatch(removeFoundingZone(venue, selectedZoneId));
    onSelect?.("exterior");
  };
  if (readOnly)
    return (
      <ZoneMap
        compact
        zones={zones}
        positions={venue.zoneLayout}
        selectedId={selectedZoneId}
        onSelect={onSelect}
        disabled={busy}
      />
    );
  return (
    <ZoneMap
      compact
      zones={zones}
      positions={venue.zoneLayout}
      selectedId={selectedZoneId}
      onSelect={onSelect}
      disabled={busy}
      modifyConnections
      toolbar={
        allowAdd ? (
          <>
            <button type="button" disabled={busy || zones.length >= 7} onClick={() => onAdd?.(false)}>
              Add Zone
            </button>
            <button type="button" disabled={busy || !selectedZoneId || selectedZoneId === "exterior"} onClick={remove}>
              Remove Zone
            </button>
          </>
        ) : undefined
      }
      onPositions={(zoneLayout) => onPatch({ ...venue, zoneLayout })}
      onConnections={(rows) =>
        onPatch({
          ...venue,
          spaces: venue.spaces?.map((zone) => ({
            ...zone,
            connectedTo: rows.find((row) => row.id === zone.id)?.connectedTo,
          })),
          privateSpaces: venue.privateSpaces?.map((zone) => ({
            ...zone,
            connectedTo: rows.find((row) => row.id === zone.id)?.connectedTo,
          })),
        })
      }
    />
  );
}
