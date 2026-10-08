import type { VenueScene } from "../models/scene-model.js";
import type { VillageState, VillageVenue } from "../models/world.js";
import { relationshipZoneController } from "./relationship-rules.js";
import { contactNeighbors } from "./venue-contact.js";
import { canOccupyZone, venueZones, zoneClosed } from "./venue-zones.js";

/** Choose an adjacent admitted Zone, preferring the entry route, then a shortest path toward Exterior. */
export function dismissalDestination(village: VillageState, venue: VillageVenue, scene: VenueScene): string | null {
  const zones = venueZones(venue),
    from = scene.zoneId ?? "exterior";
  const admitted = (id: string) => {
    const zone = zones.find((entry) => entry.id === id);
    return (
      !!zone &&
      !zoneClosed(village, venue, zone) &&
      !scene.dismissedZoneIds?.includes(id) &&
      (canOccupyZone(venue, zone, "player") ||
        !!relationshipZoneController(village.relationshipContext, village, venue, zone, "player") ||
        !!scene.grantedZoneIds?.includes(id))
    );
  };
  if (
    scene.enteredFromZoneId &&
    contactNeighbors(venue, from).includes(scene.enteredFromZoneId) &&
    admitted(scene.enteredFromZoneId)
  )
    return scene.enteredFromZoneId;
  const queue = [[from]],
    seen = new Set([from]);
  while (queue.length) {
    const path = queue.shift()!,
      last = path.at(-1)!;
    if (zones.find((zone) => zone.id === last)?.kind === "exterior") return path[1] ?? null;
    for (const next of contactNeighbors(venue, last))
      if (!seen.has(next) && admitted(next)) {
        seen.add(next);
        queue.push([...path, next]);
      }
  }
  return null;
}
