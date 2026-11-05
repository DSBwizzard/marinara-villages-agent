import { zoneDayNightDefault } from "../../../shared/helpers/zone-day-night.js";
import type { VillageState, VillageVenue, VillageVenueZone } from "../models/world.js";

export function applyZoneDayNightDefault(zone: VillageVenueZone, inferred: boolean | undefined): void {
  const before = zone.dayNight === true;
  Object.assign(zone, zoneDayNightDefault(zone, inferred));
  if ((zone.dayNight === true) !== before) {
    zone.pictureRevision = (zone.pictureRevision ?? 0) + 1;
    if (zone.picture) zone.picture.claim = undefined;
  }
}

/** Automatic artwork follows the saved physical account. */
export function zonePicturePhysicalRecord(zone: VillageVenueZone) {
  return {
    description: zone.description,
  };
}
export function zonePictureContext(
  _state: Pick<VillageState, never>,
  venue: VillageVenue,
  zone: VillageVenueZone,
): string {
  return JSON.stringify({ ...zonePicturePhysicalRecord(zone), ...(venue.form ? { form: venue.form } : {}) });
}

export function zonePictureBaseline(context: string): string {
  try {
    const parsed = JSON.parse(context);
    return parsed && typeof parsed.description === "string"
      ? JSON.stringify({
          description: parsed.description,
          ...(typeof parsed.form === "string" && parsed.form ? { form: parsed.form } : {}),
        })
      : "";
  } catch {
    return "";
  }
}
