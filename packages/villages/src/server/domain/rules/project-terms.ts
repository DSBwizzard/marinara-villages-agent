import type { VillageProjectLifecycle } from "../models/world.js";

export function renovationTerms(change: NonNullable<VillageProjectLifecycle["change"]>): string {
  return [
    change.detail,
    change.classes ? "Base Classes: " + change.classes.join(", ") : "",
    change.capacity !== undefined ? "Residence capacity: " + change.capacity : "",
    change.baseZones
      ? "Base zones: " +
        change.baseZones
          .map(
            (zone) =>
              `${zone.name} (${zone.kind}, ${zone.venueClass})${zone.ownerId ? " assigned to " + zone.ownerId : ""}: ${zone.description || zone.purpose || ""}`,
          )
          .join("; ")
      : "",
    change.homeKind ? "Home tier: " + change.homeKind : "",
    change.slot !== undefined ? "Upgrade slot " + (change.slot + 1) : "",
    change.improvement === null
      ? "Remove the existing Upgrade and archive its zones."
      : change.improvement
        ? [
            change.improvement.title + ": " + change.improvement.description,
            "Contributed Class: " + (change.improvement.classContribution ?? "none"),
            "Extra beds: " + change.improvement.extraBeds,
            change.improvement.spaceId ? "Modify existing zone: " + change.improvement.spaceId : "",
            ...(change.improvement.zones ?? []).map(
              (zone) =>
                zone.name + " [" + zone.id + "; " + zone.kind + "; " + zone.venueClass + "]: " + zone.description,
            ),
          ]
            .filter(Boolean)
            .join("\n")
        : "",
  ]
    .filter(Boolean)
    .join("\n");
}
