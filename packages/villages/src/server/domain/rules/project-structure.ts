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
export function changedZoneIds(venue: VillageVenue, change?: VillageProjectChange | null): string[] {
  if (!change?.zones) return [];
  const old = (venue.zones ?? []).filter((zone) => zone.kind !== "exterior");
  const next = change.zones.map((zone) => {
    const previous = old.find((saved) => saved.id === zone.id);
    return {
      ...zone,
      description: zone.preserveDescription && previous ? previous.description : zone.description,
      roomSpecification: zone.roomSpecification ?? previous?.roomSpecification,
    };
  });
  return [...new Set([...old, ...next].map((zone) => zone.id))].filter(
    (id) =>
      JSON.stringify(old.find((zone) => zone.id === id) && shape(old.find((zone) => zone.id === id)!)) !==
      JSON.stringify(next.find((zone) => zone.id === id) && shape(next.find((zone) => zone.id === id)!)),
  );
}
export function venueDesignHash(venue: VillageVenue, zoneIds: readonly string[] = []): string {
  return createHash("sha256")
    .update(
      JSON.stringify([
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
            return shape(privateInterior ? { ...zone, name: "", description: "" } : zone);
          }),
      ]),
    )
    .digest("hex");
}
