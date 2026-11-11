import { zoneDayNightDefault } from "../../../shared/helpers/zone-day-night.js";
import type { VillageState, VillageVenue, VillageVenueZone } from "../models/world.js";
import { currentRoomViews, roomParagraphs } from "./continuity-retrieval.js";

export function applyZoneDayNightDefault(zone: VillageVenueZone, inferred: boolean | undefined): void {
  const before = zone.dayNight === true;
  Object.assign(zone, zoneDayNightDefault(inferred));
  if ((zone.dayNight === true) !== before) {
    zone.pictureRevision = (zone.pictureRevision ?? 0) + 1;
    if (zone.picture) zone.picture.claim = undefined;
  }
}

export function observableRoomDescription(
  state: Pick<VillageState, "continuity" | "episodes">,
  placeId: string,
  zoneId: string,
  at: string,
): string {
  return currentRoomViews(state.continuity, state.episodes, { kind: "room", placeId, zoneId }, at)
    .filter(({ version }) => version.room?.visibility === "observable")
    .map(({ version }) => version.text)
    .join("\n\n");
}
export function zoneAppearanceContext(description: string, form?: string): string {
  return JSON.stringify({ description: roomParagraphs(description).join("\n\n"), ...(form ? { form } : {}) });
}
export function zonePictureContext(
  state: Pick<VillageState, "continuity" | "episodes">,
  venue: VillageVenue,
  zone: VillageVenueZone,
  at: string,
): string {
  return zoneAppearanceContext(observableRoomDescription(state, venue.id, zone.id, at), venue.form);
}

export function zonePictureBaseline(context: string): string {
  try {
    const parsed = JSON.parse(context);
    return parsed && typeof parsed.description === "string"
      ? zoneAppearanceContext(parsed.description, typeof parsed.form === "string" ? parsed.form : undefined)
      : "";
  } catch {
    return "";
  }
}
