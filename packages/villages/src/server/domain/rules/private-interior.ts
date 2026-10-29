import type { VillageVenueZone } from "../models/world.js";
import { conflict } from "./errors.js";

export function isPrivateInterior(zone: Pick<VillageVenueZone, "kind">): boolean {
  return ["private-residence", "staff", "restricted"].includes(zone.kind);
}

/** Physical prose only; administrative revisions never request a redraw. */
export function privateInteriorKey(zone: Pick<VillageVenueZone, "description" | "state">): string {
  return JSON.stringify([zone.description]);
}

export function observePrivateInterior(
  zone: VillageVenueZone,
  observedAt: string,
  observed: Pick<VillageVenueZone, "description" | "state"> = zone,
): void {
  zone.seen = true;
  if (!isPrivateInterior(zone)) return;
  zone.lastObserved = { description: observed.description, state: structuredClone(observed.state), observedAt };
}

/** Finishing changes constraints; preparation reconciles the saved interior once. */
export function prepareRenovatedPrivateInterior(zone: VillageVenueZone, previous?: VillageVenueZone): void {
  if (!isPrivateInterior(zone)) return;
  if (
    previous &&
    zone.ownerId !== previous.ownerId &&
    (zone.kind === "private-residence" || previous.kind === "private-residence")
  )
    throw conflict("Resident moves assign Private Spaces; Renovations cannot transfer occupied rooms.");
  if (zone.ownerId === "player") return;
  if (!previous) {
    zone.roomSpecification ??= zone.description;
    zone.description = "";
    zone.preparation = { status: "pending" };
    return;
  }
  const specificationChanged =
    zone.roomSpecification !== previous.roomSpecification &&
    !(previous.roomSpecification === undefined && zone.roomSpecification === previous.description);
  if (specificationChanged || zone.description !== previous.description) {
    zone.description = previous.description;
    zone.preparation = { status: "pending", mode: "renovation" };
  }
}
