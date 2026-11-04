import {
  coerceVillageState,
  defaultVillageState,
} from "../../packages/villages/src/server/domain/decoding/village-codec.js";
import { newSocialWish } from "../../packages/villages/src/server/domain/rules/social-wishes.js";
export const wishTime = (hour = 0) => new Date(Date.UTC(2026, 9, 26, hour)).toISOString();
export const fixtureWish = (raw: { wish: string; reason?: string }, id = "company", at = wishTime()) =>
  newSocialWish({ wish: raw.wish, reason: raw.reason ?? "Wants this shared experience." }, id, at, {
    kind: "preparation",
    sourceId: "fixture:" + id,
    lineIds: [],
  });
export function wishWorld() {
  return coerceVillageState({
    ...defaultVillageState(),
    seed: "social-wishes",
    foundedAt: wishTime(),
    timeZone: "UTC",
    villagers: ["a", "b"].map((characterId) => ({
      characterId,
      addedAt: wishTime(),
      wishes: [],
      cardSnapshot: {
        id: characterId,
        name: characterId === "a" ? "Ada" : "Bryn",
        capturedAt: wishTime(),
        revision: 1,
        sourceStatus: "available",
      },
    })),
  });
}
