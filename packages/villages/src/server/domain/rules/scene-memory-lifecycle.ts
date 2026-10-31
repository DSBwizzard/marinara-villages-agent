import type { VillageState } from "../models/world.js";
import type { VenueScene } from "../models/scene-model.js";
import { unfinishedExchange } from "../decoding/exchange-codec.js";
import { pendingProgressTurns } from "./scene-record.js";
export function releaseSceneMemories(state: VillageState, scene: VenueScene) {
  if (
    state.seed !== scene.villageSeed ||
    scene.status !== "closed" ||
    scene.submissions.some(
      (turn) =>
        (turn.processing && unfinishedExchange(turn.processing)) ||
        (turn.semanticProvenance?.version === 2 &&
          (!turn.semanticReady || !state.socialPublications?.[scene.id + ":" + turn.id])),
    ) ||
    pendingProgressTurns(scene, state.foundedAt).length
  )
    return;
  delete state.memoryScenes[scene.id];
}
