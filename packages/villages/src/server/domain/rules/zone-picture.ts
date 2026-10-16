import type { VillageState, VillageVenue, VillageVenueZone } from "../models/world.js";
import { sceneryCharacterContext } from "./scenery-context.js";
import type { VenueScene } from "../models/scene-model.js";

export function claimZonePictureEntry(scene: Pick<VenueScene, "pictureEvaluatedZoneIds">, zoneId: string): boolean {
  scene.pictureEvaluatedZoneIds ??= [];
  if (scene.pictureEvaluatedZoneIds.includes(zoneId)) return false;
  scene.pictureEvaluatedZoneIds.push(zoneId);
  return true;
}

/** Only saved visible facts and assigned identity drive automatic picture work. */
export function zonePicturePhysicalRecord(zone: VillageVenueZone) {
  return {
    description: zone.description,
    condition: zone.state.condition,
    items: zone.state.items,
    facts: zone.state.publicFacts,
    features: zone.state.features.map((feature) => feature.text),
    traces: zone.state.traces
      .filter(
        (trace) =>
          ["stain", "open-window", "dropped-object", "damage", "decoration", "repair"].includes(trace.kind) &&
          (!trace.recipientId || trace.recipientId === "player"),
      )
      .map((trace) => `${trace.kind}: ${trace.text}`),
  };
}
export function zonePictureContext(state: VillageState, venue: VillageVenue, zone: VillageVenueZone): string {
  return JSON.stringify({
    ...zonePicturePhysicalRecord(zone),
    resident: zone.kind === "exterior" ? "" : sceneryCharacterContext(state, venue, zone.ownerId ?? ""),
  });
}

export function zonePictureBaseline(context: string): string {
  return JSON.stringify({ ...JSON.parse(context), resident: "" });
}

/** Complete changes only: never truncate away a removal or a late-listed addition. */
export function zonePictureChanges(previous: string, current: string): string {
  const before = JSON.parse(previous) as Record<string, unknown>;
  const after = JSON.parse(current) as Record<string, unknown>;
  const changes: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(after)) {
    if (JSON.stringify(before[key]) === JSON.stringify(value)) continue;
    if (Array.isArray(value) && Array.isArray(before[key])) {
      const old = before[key] as unknown[];
      changes[key] = {
        added: value.filter((item) => !old.includes(item)),
        removed: old.filter((item) => !value.includes(item)),
      };
    } else changes[key] = { from: before[key], to: value };
  }
  return JSON.stringify(changes);
}
