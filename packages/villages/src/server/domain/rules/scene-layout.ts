import { asRecord } from "./coerce.js";
import { conflict } from "./errors.js";
import { connectionProblem } from "../../../shared/helpers/zone-contact.js";
import type { VenueScene } from "../models/scene-model.js";
import type { VillageVenue } from "../models/world.js";
import { defaultVenueSpace } from "./venue-model.js";
import { venueZones } from "./venue-zones.js";
import { materializeConnections } from "../../../shared/helpers/zone-contact.js";

/** Preserve active layout while allowing current access revocations to remain authoritative. */
export function sceneLayoutVenue(venue: VillageVenue, scene?: VenueScene): VillageVenue {
  const layout = scene?.sceneAttendance?.layout;
  // Already admitted pre-v5 work keeps its purchased type-inferred routing contract.
  if (scene?.operation?.kind === "turn" && ![5, 6].includes(Number(scene.operation.input.interactionScopeVersion)))
    return { ...venue, zones: venueZones(venue).map((zone) => ({ ...zone, connectedTo: undefined })) };
  if (!layout) return venue;
  const current = venueZones(venue);
  return {
    ...venue,
    zones: layout.map((saved) => {
      const live = current.find((zone) => zone.id === saved.id);
      return {
        ...defaultVenueSpace(saved.venueClass),
        ...saved,
        ...(live ?? {}),
        id: saved.id,
        kind: saved.kind,
        name: saved.name,
        venueClass: saved.venueClass,
        connectedTo: saved.connectedTo,
        ...(!live ? { closed: true } : {}),
      };
    }),
  };
}
export function captureSceneLayout(venue: VillageVenue) {
  return structuredClone(
    materializeConnections(venueZones(venue)).map((zone) => ({
      id: zone.id,
      kind: zone.kind,
      name: zone.name,
      venueClass: zone.venueClass,
      connectedTo: zone.connectedTo,
    })),
  );
}

export function readSceneLayout(value: unknown): NonNullable<VenueScene["sceneAttendance"]>["layout"] {
  if (value === undefined) return undefined;
  const fail = () => conflict("This saved Scene has an invalid connection map. Its history is preserved.");
  if (!Array.isArray(value) || !value.length || value.length > 64) throw fail();
  const rows = value.map((value) => {
    const row = asRecord(value);
    if (
      typeof row.id !== "string" ||
      !row.id ||
      row.id.length > 200 ||
      typeof row.name !== "string" ||
      row.name.length > 100 ||
      !["exterior", "public", "shared-residence", "private-residence", "staff", "restricted"].includes(
        String(row.kind),
      ) ||
      !["residence", "workplace", "community", "other"].includes(String(row.venueClass)) ||
      !Array.isArray(row.connectedTo) ||
      row.connectedTo.length > 64 ||
      row.connectedTo.some((id) => typeof id !== "string")
    )
      throw fail();
    return { id: row.id, name: row.name, kind: row.kind, venueClass: row.venueClass, connectedTo: row.connectedTo };
  }) as NonNullable<NonNullable<VenueScene["sceneAttendance"]>["layout"]>;
  if (connectionProblem(rows)) throw fail();
  return rows;
}
