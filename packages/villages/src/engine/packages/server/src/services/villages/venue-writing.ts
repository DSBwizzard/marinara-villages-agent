import type { CapabilityLanguageModelMessage, CapabilityResolvedLanguageModel } from "@marinara-engine/shared";
import type { VillagerCard } from "./catalog.js";
import { badRequest } from "./errors.js";

/** The authored person is complete; circumstances are supplied separately. */
export function venueCardProfile(card: VillagerCard, playerName = "the player", includePostHistory = true): string {
  const fields = [
    ["System prompt", card.systemPrompt],
    ["Description", card.description],
    ["Personality", card.personality],
    ["Backstory", card.backstory],
    ["Appearance", card.appearance],
    ["Card scenario", card.scenario],
    ["Example dialogue", card.exampleDialogue],
    ["Post-history instructions", includePostHistory ? card.postHistoryInstructions : ""],
  ];
  const expand = (text: string) => text.replace(/\{\{char\}\}/gi, card.name).replace(/\{\{user\}\}/gi, playerName);
  return (
    `## Character: ${card.name} (${card.id})\n` +
    fields
      .filter(([, value]) => value?.trim())
      .map(([label, value]) => `${label}:\n${expand(value!)}`)
      .join("\n\n")
  );
}

export const EVENT_MEMORY_GUIDANCE =
  "Record what was said or done in this encounter, with its context. A pause, reserved delivery, temporary uncertainty, or the narrator's interpretation is not a stable personality trait. Preserve explicit preferences and commitments without generalizing a moment into who the character is.";

export type VenueWritingBlock = { text: string; optional?: "history" | "memory" | "lore" };

/** Shared by live generation and isolated evaluations. Never silently shrink a character. */
export function assembleVenueWritingMessages(blocks: readonly VenueWritingBlock[], input: string) {
  return [
    {
      role: "system",
      content: blocks
        .map((block) => block.text)
        .filter(Boolean)
        .join("\n\n"),
    },
    { role: "user", content: input },
  ] satisfies CapabilityLanguageModelMessage[];
}

export function fitVenueWritingMessages(
  model: Pick<CapabilityResolvedLanguageModel, "fitContext">,
  blocks: readonly VenueWritingBlock[],
  input: string,
  maxTokens: number,
  connectionName = "Narration",
) {
  const kept = [...blocks];
  // Old history first, then optional recollections/lore. Essential blocks and the
  // latest player input must survive fitting byte-for-byte before any paid call.
  for (;;) {
    const messages = assembleVenueWritingMessages(kept, input);
    const fitted = model.fitContext(messages, { maxTokens });
    if (JSON.stringify(fitted.messages) === JSON.stringify(messages)) return fitted;
    const optional =
      ["history", "memory", "lore"]
        .map((kind) => kept.findIndex((block) => block.optional === kind))
        .find((index) => index >= 0) ?? -1;
    if (optional < 0)
      throw badRequest(
        `The complete character cards and required context do not fit the ${connectionName} connection. Increase its context limit or choose a connection with a larger context window. No reply was requested.`,
      );
    kept.splice(optional, 1);
  }
}
