import { createHash } from "node:crypto";
import type { VillageVenue, VillageProjectChange, VillageZoneDraft } from "../models/world.js";
export function shape(zone: VillageZoneDraft) {
  return [
    zone.id,
    zone.name,
    zone.purpose ?? "",
    zone.kind,
    zone.venueClass,
    zone.ownerId ?? "",
    [...(zone.controllerIds ?? [])].sort(),
    [...(zone.connectedTo ?? [])].sort(),
    zone.description,
    zone.roomSpecification ?? "",
  ];
}
/** Current physical prose can change without changing the recorded structure. */
export function structuralShape(zone: VillageZoneDraft) {
  return shape({ ...zone, description: "" });
}
export function changedZoneIds(venue: VillageVenue, change?: VillageProjectChange | null): string[] {
  if (!change) return [];
  const old = (venue.zones ?? []).filter((zone) => zone.kind !== "exterior");
  const next = (change.zones ?? old).map((zone) => {
    const previous = old.find((saved) => saved.id === zone.id);
    return {
      ...zone,
      roomSpecification: zone.roomSpecification ?? previous?.roomSpecification,
    };
  });
  const changed = [...new Set([...old, ...next].map((zone) => zone.id))].filter(
    (id) =>
      JSON.stringify(old.find((zone) => zone.id === id) && structuralShape(old.find((zone) => zone.id === id)!)) !==
      JSON.stringify(next.find((zone) => zone.id === id) && structuralShape(next.find((zone) => zone.id === id)!)),
  );
  if (change.form !== undefined) changed.push("exterior");
  return [...new Set([...changed, ...(change.roomEdits ?? []).map(({ zoneId }) => zoneId)])];
}
export function venueDesignHash(
  venue: VillageVenue,
  zoneIds: readonly string[] = [],
  change?: VillageProjectChange | null,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify([
        ...(change?.form !== undefined ? [venue.form ?? ""] : []),
        [...(venue.classes ?? [])].sort(),
        venue.residenceCapacity,
        (venue.zones ?? []).map((zone) => zone.id).sort(),
        zoneIds
          .slice()
          .sort()
          .map((id) => {
            const zone = venue.zones?.find((zone) => zone.id === id);
            if (!zone) return [id, null];
            const privateInterior = ["private-residence", "staff", "restricted"].includes(zone.kind);
            return structuralShape(privateInterior ? { ...zone, name: "" } : zone);
          }),
      ]),
    )
    .digest("hex");
}
