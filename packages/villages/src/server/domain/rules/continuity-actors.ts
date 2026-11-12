import type { VillageState } from "../models/world.js";
import type { ContinuityEvidence, ContinuityHolder } from "../models/continuity-model.js";
import { findNpc } from "./places.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { capturedSceneCalendar } from "./scene-calendar.js";

export function continuityActor(
  state: VillageState,
  id: string,
): Extract<ContinuityHolder, { kind: "actor" }> | undefined {
  if (id === "player") return { kind: "actor", id, incarnation: memoryHash([state.seed, state.setupAt, "player"]) };
  const resident = state.villagers.find((row) => row.characterId === id);
  if (resident) {
    memoryRequire(resident.incarnation, "missing resident incarnation");
    return { kind: "actor", id, incarnation: resident.incarnation };
  }
  // Registry NPC identities are never reused or deleted within a world.
  if (findNpc(state, id)) return { kind: "actor", id, incarnation: memoryHash([state.seed, state.setupAt, id]) };
}

export function relationshipActors(state: VillageState) {
  return [
    continuityActor(state, "player")!,
    ...state.villagers.map(({ characterId: id, incarnation }) => ({ id, incarnation })),
  ];
}

export function relationshipCalendar(
  state: VillageState,
  calendar: { date: string; timeZone: string },
  historical: Record<string, ContinuityEvidence>,
) {
  const fitted = new Set(Object.values(historical).map((source) => source.episodeId));
  return {
    date: calendar.date,
    historical: Object.fromEntries(
      state.episodes.records
        .filter((episode) => fitted.has(episode.id))
        .map((episode) => [
          episode.id,
          capturedSceneCalendar({ startedAt: episode.capturedAt }, calendar.timeZone).date,
        ]),
    ),
  };
}
