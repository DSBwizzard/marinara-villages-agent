import { changedZoneIds, shape } from "./project-structure.js";
export { changedZoneIds } from "./project-structure.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import { venueResidentIds } from "./venue-model.js";
import { venueZones, zoneControllerIds } from "./venue-zones.js";
import type { VillageVenue, VillageVenueImage, VillageProject, VillageProjectChange } from "../models/world.js";

export function validImage(value: unknown): VillageVenueImage | null {
  const row = asRecord(value),
    ref = asTrimmedString(row.ref),
    url = asTrimmedString(row.url),
    id = asTrimmedString(row.id);
  return /^global-gallery:[^\\s]{1,200}$/u.test(ref) && url.startsWith("/") && id ? { ref, url, id } : null;
}
export function renovationTerms(change: VillageProjectChange): string {
  return [
    change.detail,
    change.classes ? "Classes: " + change.classes.join(", ") : "",
    change.capacity !== undefined ? "Residence capacity: " + change.capacity : "",
    ...(change.zones ?? []).map((zone) => zone.name + ": " + (zone.description || zone.purpose || "")),
  ]
    .filter(Boolean)
    .join("\n");
}
function globalChange(venue: VillageVenue, change: VillageProjectChange) {
  const classes =
    change.classes && JSON.stringify([...change.classes].sort()) !== JSON.stringify([...(venue.classes ?? [])].sort());
  const capacity = change.capacity !== undefined && change.capacity !== (venue.residenceCapacity ?? 1);
  return { classes: classes ? change.classes : undefined, capacity: capacity ? change.capacity : undefined };
}
export function renovationAffectedIds(
  venue: VillageVenue,
  change?: VillageProjectChange | null,
  approvedZoneIds?: string[],
): string[] {
  if (!change) return [];
  const ids = approvedZoneIds ?? changedZoneIds(venue, change);
  const touched = venueZones(venue).filter((zone) => ids.includes(zone.id));
  const added = (change.zones ?? []).filter((zone) => ids.includes(zone.id));
  const global = globalChange(venue, change);
  const residence =
    global.classes ||
    global.capacity !== undefined ||
    [...touched, ...added].some((zone) => zone.kind === "shared-residence");
  const workplace = global.classes || [...touched, ...added].some((zone) => zone.venueClass === "workplace");
  if (!ids.length && !global.classes && global.capacity === undefined) return [];
  return [
    ...new Set([
      ...(venue.access?.managerIds ?? []),
      ...(residence ? venueResidentIds(venue) : []),
      ...(workplace ? (venue.workerIds ?? []) : []),
      ...touched.flatMap((zone) => [...zoneControllerIds(venue, zone), ...(zone.ownerId ? [zone.ownerId] : [])]),
      ...added.flatMap((zone) => [...(zone.controllerIds ?? []), ...(zone.ownerId ? [zone.ownerId] : [])]),
    ]),
  ].filter((id) => id !== "player");
}
export function approvalScope(
  venue: VillageVenue,
  change: VillageProjectChange,
  actorId: string,
  approvedZoneIds?: string[],
): string {
  const changed = approvedZoneIds ?? changedZoneIds(venue, change);
  const manager = venue.access?.managerIds.includes(actorId);
  const resident = venueResidentIds(venue).includes(actorId);
  const worker = venue.workerIds?.includes(actorId);
  const relevant = changed.filter((id) => {
    const old = venueZones(venue).find((zone) => zone.id === id);
    const next = change.zones?.find((zone) => zone.id === id);
    return (
      manager ||
      [old, next].some(
        (zone) =>
          zone &&
          (zone.ownerId === actorId ||
            zone.controllerIds?.includes(actorId) ||
            (resident && zone.kind === "shared-residence") ||
            (worker && zone.venueClass === "workplace") ||
            (old && zoneControllerIds(venue, old).includes(actorId))),
      )
    );
  });
  return JSON.stringify([
    globalChange(venue, change),
    relevant
      .sort()
      .map((id) => [
        id,
        change.zones?.find((zone) => zone.id === id) && shape(change.zones.find((zone) => zone.id === id)!),
      ]),
  ]);
}
export function projectDesignKey(project: VillageProject): string {
  const plan = project.plan;
  return JSON.stringify([
    project.kind,
    project.kind === "renovation" ? project.venueId : "",
    project.venueDraft?.classes,
    project.venueDraft?.description,
    project.venueDraft?.position,
    plan
      ? [
          plan.form,
          plan.venueType,
          plan.exteriorDescription,
          plan.capacity,
          plan.layout,
          [...plan.spaces, ...plan.privateSpaces].map(shape),
        ]
      : null,
    project.lifecycle?.change,
  ]);
}
