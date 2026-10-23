import { asRecord, asTrimmedString } from "./coerce.js";
import { venueResidentIds } from "./venue-model.js";
import { venueZones, zoneControllerIds } from "./venue-zones.js";
import type { VillageVenue, VillageVenueImage, VillageProjectLifecycle } from "../models/world.js";

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

export function validImage(value: unknown): VillageVenueImage | null {
  const row = asRecord(value);
  const ref = asTrimmedString(row.ref),
    url = asTrimmedString(row.url),
    id = asTrimmedString(row.id);
  return /^global-gallery:[^\s]{1,200}$/u.test(ref) && url.startsWith("/") && id ? { ref, url, id } : null;
}

export function renovationAffectedIds(venue: VillageVenue, change?: VillageProjectLifecycle["change"]): string[] {
  const zones = venueZones(venue),
    oldUpgrade = change?.slot !== undefined ? venue.improvements?.[change.slot] : undefined;
  const changed = (draft: import("../models/world.js").VillageZoneDraft) => {
    const old = zones.find((zone) => zone.id === draft.id);
    return (
      !old ||
      draft.name !== old.name ||
      draft.purpose !== (old.purpose ?? "") ||
      (!draft.preserveDescription && draft.description !== old.description) ||
      (draft.roomSpecification ?? "") !== (old.roomSpecification ?? "") ||
      draft.kind !== old.kind ||
      draft.venueClass !== old.venueClass ||
      (draft.ownerId ?? "") !== (old.ownerId ?? "") ||
      JSON.stringify([...(draft.controllerIds ?? [])].sort()) !== JSON.stringify([...(old.controllerIds ?? [])].sort())
    );
  };
  const broad =
    !change ||
    (!!change.improvement && !change.improvement.spaceId) ||
    !!change.classes ||
    change.capacity !== undefined ||
    change.homeKind !== undefined ||
    !!change.baseZones?.some((draft) => {
      const old = zones.find((zone) => zone.id === draft.id);
      return !old || JSON.stringify(old.connectedTo) !== JSON.stringify(draft.connectedTo) || old.kind !== draft.kind;
    }) ||
    (!!change.baseZones &&
      zones.some(
        (zone) =>
          zone.kind !== "exterior" && !zone.upgradeId && !change.baseZones!.some((draft) => draft.id === zone.id),
      ));
  const touched = zones.filter(
    (zone) =>
      broad ||
      (oldUpgrade?.id === zone.upgradeId && !!oldUpgrade) ||
      change?.improvement?.spaceId === zone.id ||
      change?.improvement?.spaceId === zone.venueClass ||
      change?.baseZones?.some((draft) => draft.id === zone.id && changed(draft)),
  );
  return [
    ...new Set([
      ...(venue.access?.managerIds ?? []),
      ...(broad
        ? venueResidentIds(venue)
        : touched.some((zone) => zone.kind === "shared-residence")
          ? venueResidentIds(venue)
          : touched.flatMap((zone) => (zone.ownerId ? [zone.ownerId] : []))),
      ...(broad || touched.some((zone) => zone.venueClass === "workplace") ? (venue.workerIds ?? []) : []),
      ...touched.flatMap((zone) => zoneControllerIds(venue, zone)),
      ...(change?.baseZones ?? [])
        .filter(changed)
        .flatMap((zone) => [...(zone.controllerIds ?? []), ...(zone.ownerId ? [zone.ownerId] : [])]),
      ...(change?.improvement?.zones ?? []).flatMap((zone) => zone.controllerIds ?? []),
    ]),
  ].filter((id) => id !== "player");
}
