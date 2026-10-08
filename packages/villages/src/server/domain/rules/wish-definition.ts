import type { VillageWish } from "../models/world.js";
import { WorkFailureError } from "./work-failure.js";
import { createHash } from "node:crypto";

export type WishSize = "everyday" | "modest" | "larger";
export const WISH_SYSTEM_VERSION = 3;
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
export const wishRetained = (wish: VillageWish): boolean => !!wish.learnedAt && wishSize(wish.size) !== "everyday";
export function wishExpired(wish: VillageWish, now: number): boolean {
  if (wishRetained(wish)) return false;
  return !!wish.expiresAt && Number.isFinite(Date.parse(wish.expiresAt)) && Date.parse(wish.expiresAt) <= now;
}

/** Generation examples belong in tests, never in a resident's choice context. */
export function wishGenerationDirection(size: WishSize): string {
  const scale = {
    everyday: "One small everyday want with a clear, limited outcome and little preparation.",
    modest:
      "A modest undertaking with a bounded outcome; some preparation may help, without a required route or step count.",
    larger:
      "An occasional larger personal wish with an achievable, understandable outcome; it may require sustained effort or cooperation.",
  }[size];
  return `Write a ${size} wish. ${scale} A wish is a stable desired result, not a solution plan or vague life aspiration. Choose independently from this resident's authored personality, interests, present circumstances and established setting facts. Emotional importance is independent of size. Write the wish text as a neutral description of the resident's desired outcome, using third-person possessives only when needed. Do not address the resident or player, use first-person wording, or write an instruction to the player. Character dialogue examples inform identity and voice, not a menu of wishes to copy. Asking for ordinary help is natural, not a compulsory player errand. No secret prerequisites or prescribed steps. Harmless personal circumstances may be introduced consistently with the character and setting. Never create inventory, people, Venues, injuries, debts, obligations or completed physical changes. Objects or physical problems to be changed must be established world facts. An empty wish is a valid quiet day.`;
}

/** Check only newly generated goals; stored evidence and authored dialogue retain their exact text. */
export function validateGeneratedWishWording(wish: string): void {
  if (/\b(?:i|me|my|mine|myself|we|us|our|ours|ourselves|you|your|yours|yourself|yourselves)\b/iu.test(wish))
    throw new WorkFailureError({
      cause: "unsupported_outcome",
      stage: "wish-generation",
      message:
        "Wish text must describe the resident\'s desired outcome neutrally, without first-person or second-person wording; explicit retry required.",
    });
}
