import type { VenueScene } from "../models/scene-model.js";
import type { VillageVenue } from "../models/world.js";
import { sceneLayoutVenue } from "./scene-layout.js";
import { venueZones } from "./venue-zones.js";
import { contactNeighbors } from "./venue-contact.js";

export type SoundDelivery = "ordinary" | "call" | "shout" | "exceptional";
export const soundDeliveries: readonly SoundDelivery[] = ["ordinary", "call", "shout", "exceptional"];
export function acousticReach(
  venue: VillageVenue,
  scene: VenueScene,
  origin: string,
  delivery: SoundDelivery,
  outward: boolean,
) {
  const zones = venueZones(sceneLayoutVenue(venue, scene));
  const adjacent = contactNeighbors(venue, origin, scene);
  return {
    sound:
      delivery === "shout" || delivery === "exceptional"
        ? zones.map((zone) => zone.id).filter((id) => id !== origin)
        : adjacent,
    words: delivery === "exceptional" ? [] : delivery === "ordinary" && !outward ? [] : adjacent,
  };
}
