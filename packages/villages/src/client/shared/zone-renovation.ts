import type { ProjectRoomEdit, VillageVenue, VillageZoneDraft } from "../../shared/contracts/village.js";

export type ZoneRenovationDraft = {
  title: string;
  detail: string;
  zones: VillageZoneDraft[];
  base: Pick<VillageVenue, "zones" | "form">;
  roomEdits: (ProjectRoomEdit & { version?: string })[];
};

/** Submit only deliberate edits; projected private or stale fields are not authority. */
export function renovationZoneChanges(zones: VillageZoneDraft[], base: VillageZoneDraft[]) {
  return zones.map((zone) => {
    const previous = base.find((row) => row.id === zone.id);
    if (!previous) return zone;
    const changes: Record<string, unknown> = { id: zone.id };
    for (const key of [
      "name",
      "kind",
      "purpose",
      "ownerId",
      "controllerIds",
      "connectedTo",
      "roomSpecification",
    ] as const) {
      if (JSON.stringify(zone[key]) !== JSON.stringify(previous[key]))
        changes[key] = zone[key] ?? (key === "controllerIds" || key === "connectedTo" ? [] : "");
    }
    return changes;
  });
}
