import type { CapabilityResolvedLanguageModel } from "@marinara-engine/shared";
import type { SocialWish } from "../../../shared/contracts/wishes.js";
import { isImmutableMemoryValue } from "./memory-integrity.js";
import { badRequest } from "./errors.js";

type Model = Pick<CapabilityResolvedLanguageModel, "fitContext">;
const BUDGET = 2048;
const INTRO = "Optional retained personal desires (a partial catalogue, not a required topic or action): ";
const RENDER_LIMIT = 64 * 1024;
const renderLimit = new Error("Optional Wish rendering limit");
const rendered = new Map<SocialWish, string>();
const oversized = new WeakSet<SocialWish>();
let cachedBytes = 0;
function render(wish: SocialWish): string | undefined {
  if (oversized.has(wish)) return undefined;
  const known = rendered.get(wish);
  if (known !== undefined) return known;
  let remaining = RENDER_LIMIT,
    text: string;
  try {
    text = JSON.stringify(wish, (_key, value) => {
      // Charge minimum JSON cost before descending, so optional enrichment never walks an unlimited history.
      if (typeof value === "string") {
        if (value.length > remaining) throw renderLimit;
        remaining -= Buffer.byteLength(value, "utf8") + 2;
      } else if (Array.isArray(value)) remaining -= 2 + Math.max(0, value.length - 1);
      else if (value && typeof value === "object")
        remaining -= Object.keys(value).reduce((bytes, key) => bytes + key.length + 4, 2);
      if (remaining < 0) throw renderLimit;
      return value;
    });
    if (Buffer.byteLength(text, "utf8") > RENDER_LIMIT) throw renderLimit;
  } catch (error) {
    if (error !== renderLimit) throw error;
    if (isImmutableMemoryValue(wish)) oversized.add(wish);
    return undefined;
  }
  const bytes = Buffer.byteLength(text, "utf8");
  if (isImmutableMemoryValue(wish)) {
    rendered.set(wish, text);
    cachedBytes += bytes;
    while (rendered.size > 32 || cachedBytes > 128 * 1024) {
      const first = rendered.keys().next().value!;
      cachedBytes -= Buffer.byteLength(rendered.get(first)!, "utf8");
      rendered.delete(first);
    }
  }
  return text;
}

/** Optional writing enrichment only. Captured System authority remains complete and independently fitted. */
export function fitWishWritingContext(
  model: Model,
  actors: readonly { actorId: string; wishes: readonly SocialWish[] }[],
): string {
  const kept: string[] = [];
  const finish = () => (kept.length ? INTRO + "[" + kept.join(",") + "]" : "");
  let bytes = Buffer.byteLength(INTRO, "utf8") + 2;
  function fits(text: string) {
    const tokens = [text, JSON.stringify({ wishContext: text })].map(
      (content) => model.fitContext([{ role: "system", content }], { maxTokens: 0 }).estimatedTokensBefore,
    );
    if (tokens.some((count) => !Number.isFinite(count) || count <= 0))
      throw badRequest("The connection could not estimate optional Wish context. No reply was requested.");
    return tokens.every((count) => count <= BUDGET);
  }
  for (const actor of actors) {
    for (const wish of actor.wishes) {
      if (wish.status !== "open") continue;
      const value = render(wish);
      if (value === undefined) return finish();
      const row = `{"actorId":${JSON.stringify(actor.actorId)},"wish":${value}}`;
      bytes += Buffer.byteLength(row, "utf8") + 1;
      // Ordered whole-unit selection stops at the first limit; it never searches an unbounded catalogue for filler.
      if (bytes > RENDER_LIMIT) return finish();
      const text = INTRO + "[" + [...kept, row].join(",") + "]";
      if (!fits(text)) return finish();
      kept.push(row);
    }
  }
  return finish();
}
