import type { AcceptedEpisode } from "../models/episode-model.js";
import type { VillageState } from "../models/world.js";
import { memoryHash } from "./memory-integrity.js";

export function sceneRetryAuthority(state: VillageState) {
  const { continuity: _continuity, episodes: _episodes, ...authority } = state;
  return memoryHash(authority);
}

export function retryableEpisode(state: VillageState, episode: AcceptedEpisode, authority: string) {
  if (episode.commandReceipts.length || episode.sceneDelta || sceneRetryAuthority(state) !== authority) return false;
  const versions = new Set(episode.continuityVersionIds);
  return !state.continuity.versions.some((row) => versions.has(row.id) && (row.agenda || row.offerEvents?.length));
}
