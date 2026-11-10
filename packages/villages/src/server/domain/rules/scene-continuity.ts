import type { VenueScene } from "../models/scene-model.js";
import type { VillageState, VillageVenue } from "../models/world.js";
import { capturePlaceContext } from "./places.js";
import { requireSceneZoneId, sceneLayoutVenue } from "./scene-layout.js";
import { contactNeighbors, contactPosition } from "./venue-contact.js";
import { venueZones } from "./venue-zones.js";
import { immutableMemoryValue } from "./memory-integrity.js";

/** Current writer context, never evidence or a public attendance/room disclosure. */
export function sceneLocationContext(scene: VenueScene, venue: VillageVenue, actorIds: readonly string[]) {
  const zones = venueZones(sceneLayoutVenue(venue, scene));
  const origin = requireSceneZoneId(scene);
  const adjacent = contactNeighbors(venue, origin, scene);
  const knownZone = (id: string) => {
    const zone = zones.find((row) => row.id === id);
    return zone && (id === origin || zone.seen) ? { id: zone.id, name: zone.name, kind: zone.kind } : undefined;
  };
  return {
    venue: scene.placeName,
    player: { zone: knownZone(origin) ?? { id: origin } },
    residents: [...new Set(actorIds)]
      .filter((id) => !scene.departedIds?.includes(id))
      .map((characterId) => {
        const position = contactPosition(scene, characterId) || (scene.activeIds.includes(characterId) ? origin : "");
        return {
          characterId,
          name: scene.participants.find((row) => row.characterId === characterId)?.name ?? characterId,
          location: !position
            ? "unrecorded"
            : position === origin
              ? "with player"
              : adjacent.includes(position)
                ? "adjacent Zone, apart from player"
                : "offstage, apart from player",
          ...(knownZone(position) ? { zone: knownZone(position) } : {}),
        };
      }),
  };
}

// Request snapshots contain native circumstances; continuity and accepted history retain their own immutable evidence.
export const sceneContinuityFields = [
  "name",
  "setting",
  "worldName",
  "worldRules",
  "narrative",
  "foundedAt",
  "seed",
  "timeZone",
  "playerName",
  "playerDescription",
  "playerPersonaId",
  "playerPersonaName",
  "playerPersonaIdentity",
  "playerBackground",
  "villagers",
  "venues",
  "residences",
  "projects",
  "residentPlans",
  "opening",
] as const satisfies readonly (keyof VillageState)[];

export type SceneContinuity = {
  version: 4;
  seed: string;
  setupAt: string;
  capturedAt: string;
  facts: Pick<VillageState, (typeof sceneContinuityFields)[number]> & { worldPlaces?: VillageState["worldPlaces"] };
};
export function cloneSceneFacts(facts: SceneContinuity["facts"]): SceneContinuity["facts"] {
  return structuredClone(facts);
}
export function captureSceneContinuity(state: VillageState, scene: VenueScene, now: number): SceneContinuity {
  const facts = cloneSceneFacts(
    Object.fromEntries(sceneContinuityFields.map((key) => [key, state[key]])) as unknown as SceneContinuity["facts"],
  );
  facts.worldPlaces = capturePlaceContext(
    state,
    scene.placeId,
    scene.participants.map((person) => person.characterId),
  );
  return immutableMemoryValue({
    version: 4,
    seed: state.seed,
    setupAt: state.setupAt,
    capturedAt: new Date(now).toISOString(),
    facts,
  });
}

/** Frozen native request circumstances never replace live write authority or individual continuity. */
export function sceneContinuityView(current: VillageState, scene: VenueScene): VillageState {
  const context = scene.continuity;
  if (!context || context.seed !== current.seed || scene.villageSeed !== current.seed) return current;
  return { ...current, ...cloneSceneFacts(context.facts) };
}
