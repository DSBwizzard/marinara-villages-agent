import { findLocation } from "./places.js";
import { asRecord } from "./coerce.js";
import { conflict } from "./errors.js";
import { connectionProblem } from "../../../shared/helpers/zone-contact.js";
import type { VenueScene } from "../models/scene-model.js";
import type { VillageState, VillageVenue } from "../models/world.js";
import { defaultVenueSpace } from "./venue-model.js";
import { venueZones } from "./venue-zones.js";

export function requireSceneZoneId(scene: Pick<VenueScene, "zoneId">): string {
  if (!scene.zoneId) throw conflict("That Scene has no captured Zone.");
  return scene.zoneId;
}

/** Only captured access inputs; persistent effects still validate against the current world. */
export function sceneAccessState(state: VillageState, scene: VenueScene): VillageState {
  const facts = scene.continuity?.facts;
  return facts && scene.villageSeed === state.seed
    ? {
        ...state,
        venues: facts.venues,
        worldPlaces: facts.worldPlaces ?? state.worldPlaces,
        projects: facts.projects,
        narrative: facts.narrative,
      }
    : state;
}

/** Scene layout and authority follow its captured world and witnessed developments. */
export function sceneLayoutVenue(venue: VillageVenue, scene?: VenueScene): VillageVenue {
  venue = findLocation(scene?.continuity?.facts, venue.id) ?? venue;
  const layout = scene?.sceneAttendance?.layout;
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
  const zones = venueZones(venue);
  if (connectionProblem(zones))
    throw conflict("The Venue connection map is invalid. Review it before opening a Scene.");
  return structuredClone(
    zones.map((zone) => ({
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
