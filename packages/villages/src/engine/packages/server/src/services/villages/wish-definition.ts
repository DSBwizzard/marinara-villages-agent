import { createHash } from "node:crypto";
import type { VillageWish } from "./types.js";

export type WishSize = "everyday" | "modest" | "larger";
export const WISH_SYSTEM_VERSION = 2;
const roll = (key: string) => createHash("sha256").update(key).digest().readUInt32BE(0);
export const wishSize = (value: unknown): WishSize => (value === "modest" || value === "larger" ? value : "everyday");
/** The attempt owns the roll, so retries and saved replies keep their size. */
export function selectWishSize(attemptId: string): WishSize {
  const value = roll(attemptId) % 100;
  return value < 65 ? "everyday" : value < 90 ? "modest" : "larger";
}
export function sizedWishLifetime(id: string, size: WishSize, everydayDays: number): number {
  return size === "everyday" ? everydayDays : size === "modest" ? 7 + (roll(id) % 8) : 14 + (roll(id) % 15);
}
export function wishExpired(wish: VillageWish, now: number): boolean {
  if (wish.learnedAt && wishSize(wish.size) !== "everyday") return false;
  return !!wish.expiresAt && Number.isFinite(Date.parse(wish.expiresAt)) && Date.parse(wish.expiresAt) <= now;
}
export function wishGenerationDirection(size: WishSize): string {
  const scale = {
    everyday:
      "One small everyday want: chocolate, identifying a tune, help moving an established rock, borrowing a pencil, or one pleasant shared experience. Usually one clear result.",
    modest:
      "A modest undertaking: repair a favorite chair, cook one new dish, or arrange a picnic. Some preparation may help, but there is no required route or step count.",
    larger:
      "An occasional larger personal wish, expressed as an achievable outcome: experience swimming, perform a song, or reconnect with an established friend. Emotional motives may be deep, but the desired result must be understandable.",
  }[size];
  return `Write a ${size} wish. ${scale} A wish is a stable desired result, not a solution plan or vague life aspiration. Personality influences choice and reaction; a solemn scholar can want chocolate. Vary objects, information, practical help, small repairs, company and experiences. Asking for ordinary help is natural, not a compulsory player errand. Emotional importance is independent of size. No secret prerequisites or prescribed steps. Harmless personal circumstances (a tune stuck in their head, a small concern) may be introduced consistently with the setting. Never create inventory, people, Venues, injuries, debts, obligations or completed physical changes. Objects or physical problems to be changed must be established world facts. An empty wish is a valid quiet day.`;
}
