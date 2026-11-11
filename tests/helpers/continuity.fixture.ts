import type { VillageState } from "../../packages/villages/src/server/domain/models/world.js";
import { nativeEpisodeId } from "../../packages/villages/src/server/domain/rules/episode-sources.js";
import { retainNativeFact } from "../../packages/villages/src/server/domain/rules/native-continuity.js";
import { emptyContinuity } from "../../packages/villages/src/server/domain/rules/continuity.js";
import { emptyEpisodes } from "../../packages/villages/src/server/domain/rules/episodes.js";
import { assertContinuityRetention } from "../../packages/villages/src/server/domain/rules/continuity-retention.js";

export function retainAuthoredNote(
  state: VillageState,
  id: string,
  text: string,
  witnesses: string[],
  at: string,
  meaning?: Parameters<typeof retainNativeFact>[3],
) {
  retainNativeFact(
    state,
    { id, kind: "initialization", targetId: witnesses[0], revision: 1, text, witnesses },
    at,
    meaning,
  );
  return state.continuity.receipts[nativeEpisodeId(state.seed, id) + ":fact"].roots[0];
}

export function nativeHistoryFixture(state: VillageState, count: number) {
  const world = { ...state };
  const continuity = emptyContinuity(),
    episodes = emptyEpisodes();
  // Independent facts need no earlier context. Validate their combined closure once.
  for (let i = 0; i < count; i++) {
    world.continuity = { ...emptyContinuity(), revision: i };
    world.episodes = { ...emptyEpisodes(), revision: i };
    retainNativeFact(
      world,
      {
        id: "history-" + i,
        kind: "initialization",
        targetId: "history-" + i,
        revision: 1,
        text: "Retained native account " + i + ": a brass telescope, a star chart, café 🌼 and a quiet visit.",
        witnesses: ["player"],
      },
      new Date(Date.parse(world.setupAt) + i * 60000).toISOString(),
    );
    continuity.records.push(...world.continuity.records);
    continuity.versions.push(...world.continuity.versions);
    Object.assign(continuity.receipts, world.continuity.receipts);
    episodes.records.push(...world.episodes.records);
  }
  continuity.revision = count;
  episodes.revision = count;
  assertContinuityRetention(continuity, episodes);
  return { continuity, episodes };
}
