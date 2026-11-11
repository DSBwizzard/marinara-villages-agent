import type { VillageState } from "../../packages/villages/src/server/domain/models/world.js";
import { nativeEpisodeId } from "../../packages/villages/src/server/domain/rules/episode-sources.js";
import { retainNativeFact } from "../../packages/villages/src/server/domain/rules/native-continuity.js";

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
