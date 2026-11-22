import { narrationWitnesses } from "./narration-sources.js";
import type { VillageState } from "../models/world.js";
import type { NarrationReadset } from "../models/narration-model.js";
import type { ContinuityEvidence } from "../models/continuity-model.js";
import type { AcceptedEpisode } from "../models/episode-model.js";
import type { NarrationSourceContext } from "./narration-sources.js";
import { establishPlace } from "./place-discovery.js";
import { findLocation } from "./places.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { initializeRoomContinuity } from "./native-continuity.js";

export function narrationPlaceContext(state: VillageState, actors: string[]) {
  return Object.values(state.worldPlaces.places)
    .filter((place) => !place.disabled && place.knownBy.some((id) => actors.includes(id)))
    .map((place) => ({
      id: place.id,
      name: place.location.name,
      revision: place.revision,
      fingerprint: memoryHash(place),
    }));
}
export function narrationPlacePrompt(places: ReturnType<typeof narrationPlaceContext>) {
  return places.length
    ? "Existing native Place identities, not private contents or character knowledge: " +
        JSON.stringify(places.map(({ id, name }) => ({ id, name })))
    : "";
}
type Request = { type: "place.discover"; existingId?: string; place?: unknown };
export function applyNarrationPlace(
  state: VillageState,
  command: Request,
  readset: NarrationReadset,
  context: NarrationSourceContext,
  sources: ContinuityEvidence[],
  receiptId: string,
  at: string,
): AcceptedEpisode["commandReceipts"][number] {
  memoryRequire(
    sources.length > 0 &&
      sources.every(
        (source) =>
          source.episodeId === context.episodeId &&
          ["speech", "observation"].includes(source.kind) &&
          source.perceptions.some((row) => row.actorId === "player" && ["words", "sight"].includes(row.channel)),
      ),
    "a Place outcome needs an actual current Player-witnessed source",
  );
  const witnesses = narrationWitnesses(sources);
  memoryRequire(
    Boolean(command.existingId) !== Boolean(command.place),
    "discover an existing Place or one new draft, never both",
  );
  let place;
  if (command.existingId) {
    const captured = readset.places.find((place) => place.id === command.existingId);
    place = state.worldPlaces.places[command.existingId];
    memoryRequire(
      place && !place.disabled && captured && captured.fingerprint === memoryHash(place),
      "the supplied Place identity changed or is unavailable",
    );
    place.knownBy = [...new Set([...place.knownBy, ...witnesses])];
    place.revision++;
    state.worldPlaces.revision++;
  } else {
    const id = "place:" + memoryHash([state.seed, context.episodeId, receiptId]),
      mapId = findLocation(state, context.scene.placeId)?.presentation.mapId ?? state.maps[0]?.id;
    memoryRequire(
      mapId &&
        state.maps.some((map) => map.id === mapId) &&
        !state.worldPlaces.places[id] &&
        !state.venues.some((venue) => venue.id === id),
      "the new Place needs its current native map and an unused identity",
    );
    place = establishPlace(state, command.place, id, mapId, receiptId, at, false);
    place.knownBy = witnesses;
    for (const zone of place.location.zones ?? [])
      initializeRoomContinuity(state, place.id, zone.id, zone.description, receiptId, at);
  }
  return {
    id: receiptId,
    kind: "discovery",
    targetId: place.id,
    revision: place.revision,
    text: "Discovered Place: " + place.location.name + ". " + place.location.description,
    witnesses,
  };
}
