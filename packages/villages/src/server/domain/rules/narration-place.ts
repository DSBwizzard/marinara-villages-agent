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
import { projectSpeechTerms } from "./project-interpretation.js";

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
type Request =
  | { type: "place.discover"; existingId?: string; place?: unknown }
  | { type: "place.establish"; project: string; objective: string; quote: string; met: true };
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
  if (command.type === "place.establish") {
    const project = state.projects.find((project) => project.id === command.project),
      captured = readset.projects.find((project) => project.projectId === command.project);
    const objective = project?.establishment?.objectives.find((objective) => objective.id === command.objective);
    memoryRequire(
      project &&
        captured &&
        objective &&
        project.lifecycle?.revision === captured.revision &&
        memoryHash(projectSpeechTerms(state, project)) === memoryHash(captured.terms) &&
        ["planning", "working", "paused"].includes(project.status),
      "the current establishment objective was not supplied",
    );
    memoryRequire(
      sources.some((source) =>
        context.lines.some(
          (line) =>
            line.id === source.unitId &&
            line.role === "assistant" &&
            line.content.includes(command.quote) &&
            !line.contactHidden &&
            !line.contactReport &&
            !line.soundOnly?.player &&
            (line.kind !== "whisper" || line.targetId === "player"),
        ),
      ),
      "the establishment outcome needs its exact current witnessed quote",
    );
    objective.met = true;
    objective.evidence = [...objective.evidence, { source: receiptId, quote: command.quote }].slice(-8);
    project.updatedAt = at;
    return {
      id: receiptId,
      kind: "establishment",
      targetId: project.id,
      revision: project.lifecycle.revision,
      text: "Established objective: " + objective.text,
      witnesses,
    };
  }
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
