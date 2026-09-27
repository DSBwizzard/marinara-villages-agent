// Confirmed outcomes outrank durable character lore when writing new wishes and routines.
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { villagesConnectionIdFor } from "./connections.js";
import { completeWithRoom, villagesDebugAgentsEnabled, villagesLanguageModels } from "./package-runtime.js";
import type { VillageCompletedWish, VillageWish } from "./types.js";

function normal(text: string): string {
  return text
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function completedWishFacts(completed: readonly VillageCompletedWish[], lore: readonly string[]): string[] {
  const terms = new Set(
    normal(lore.join(" "))
      .split(" ")
      .filter((part) => part.length > 3),
  );
  return completed
    .map((entry, index) => ({
      entry,
      index,
      relevance: normal(entry.wish.wish)
        .split(" ")
        .filter((part) => terms.has(part)).length,
    }))
    .sort((a, b) => b.relevance - a.relevance || a.index - b.index)
    .slice(0, 12)
    .map(({ entry }) => `- Already fulfilled: ${entry.wish.wish}`);
}

/** Reject the same unmet need, while allowing a new consequence of an achieved wish. */
export async function wishRepeatsKnownNeed(
  candidate: VillageWish,
  active: readonly VillageWish[],
  completed: readonly VillageCompletedWish[],
  signal?: AbortSignal,
): Promise<boolean> {
  const known = [...active.map((entry) => entry.wish), ...completed.map((entry) => entry.wish.wish)];
  const phrase = normal(candidate.wish);
  if (known.some((entry) => normal(entry) === phrase)) return true;
  if (!known.length) return false;
  const model = await villagesLanguageModels().resolveForRequest({
    connectionId: await villagesConnectionIdFor("system"),
  });
  // Check every recorded wish in small batches. A completion does not stop
  // mattering merely because it has become old.
  for (let start = 0; start < known.length; start += 16) {
    const chunk = known.slice(start, start + 16);
    const messages: CapabilityLanguageModelMessage[] = [
      {
        role: "system",
        content: [
          "Decide whether the candidate wish asks for the same unmet need as ANY listed wish.",
          "Listed wishes may be active or already fulfilled. Getting a boat again after owning one is the same need; repairing, sailing, or improving that boat is a new need.",
          'Answer JSON only: {"sameNeed":true} or {"sameNeed":false}.',
        ].join("\n"),
      },
      { role: "user", content: JSON.stringify({ candidate: candidate.wish, known: chunk }) },
    ];
    const requested = Math.min(model.maxOutputTokens ?? 400, 400);
    const fitted = model.fitContext(messages, { maxTokens: requested });
    const answer = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? requested, {
      temperature: 0,
      debugMode: villagesDebugAgentsEnabled(),
      signal,
    });
    const match = /"sameNeed"\s*:\s*(true|false)/u.exec(answer.content ?? "");
    // An uncertain verdict cannot safely revive a previously settled wish.
    if (!match || match[1] === "true") return true;
  }
  return false;
}
