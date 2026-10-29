import type { VillageState, VillageVenue, VillageVenueZone } from "../models/world.js";

/** Automatic artwork follows the saved physical account. */
export function zonePicturePhysicalRecord(zone: VillageVenueZone) {
  return {
    description: zone.description,
  };
}
export function zonePictureContext(_state: VillageState, _venue: VillageVenue, zone: VillageVenueZone): string {
  return JSON.stringify(zonePicturePhysicalRecord(zone));
}

export function zonePictureBaseline(context: string): string {
  try {
    const parsed = JSON.parse(context);
    return parsed && typeof parsed.description === "string" ? JSON.stringify({ description: parsed.description }) : "";
  } catch {
    return "";
  }
}
