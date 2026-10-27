import type { VillageState } from "../models/world.js";
export type { KnownWish } from "../../../shared/contracts/wishes.js";
export { knownSocialWishes as knownWishes } from "./social-wishes.js";
export function wishCheckKnowledge(state: VillageState, actorId: string, wishId: string) {
  const wish = state.villagers.find((r) => r.characterId === actorId)?.wishes.find((w) => w.id === wishId);
  return { conditions: wish?.conditions ?? [], history: wish?.history ?? [] };
}
