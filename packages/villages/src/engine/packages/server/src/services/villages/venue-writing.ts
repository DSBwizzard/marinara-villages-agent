import type { VillagerCard } from "./catalog.js";
import { badRequest } from "./errors.js";
import { renderResidentFoundingContext } from "./resident-founding-context.js";
import type { CapabilityLanguageModelMessage, CapabilityResolvedLanguageModel } from "@marinara-engine/shared";

/** The authored person is complete; circumstances are supplied separately. */
export function venueCardProfile(
  card: Partial<Omit<VillagerCard, "tags">> & Pick<VillagerCard, "id" | "name">,
  playerName = "the player",
  includePostHistory = true,
): string {
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
      .join("\n\n") +
    (card.foundingContext ? "\n\n" + renderResidentFoundingContext(card.name, card.foundingContext) : "")
  );
}

export const EVENT_MEMORY_GUIDANCE =
  "Record what was said or done in this encounter, with its context. A pause, reserved delivery, temporary uncertainty, or the narrator's interpretation is not a stable personality trait. Preserve explicit preferences and commitments without generalizing a moment into who the character is.";

export type VenueWritingBlock = { text: string; optional?: "history" | "memory" | "lore" };

export type VenueWritingSections = {
  direction: VenueWritingBlock[];
  identity: VenueWritingBlock[];
  circumstances: VenueWritingBlock[];
  conversation: VenueWritingBlock[];
  authoredInstructions: VenueWritingBlock[];
  metadata: VenueWritingBlock[];
};

/** Keep the writing task distinct from evidence bookkeeping within one request. */
export function buildVenueSceneBlocks(sections: VenueWritingSections): VenueWritingBlock[] {
  const headings: Record<keyof VenueWritingSections, string> = {
    direction: "Writing direction",
    identity: "Complete authored character identity",
    circumstances: "Current Scene circumstances",
    conversation: "Witnessed conversation and contextual recollections",
    authoredInstructions: "Authored post-history direction",
    metadata: "Response format and evidence metadata",
  };
  return (Object.keys(headings) as (keyof VenueWritingSections)[]).flatMap((section) => {
    const blocks = sections[section].filter((block) => block.text.trim());
    return blocks.length ? [{ text: `## ${headings[section]}` }, ...blocks] : [];
  });
}

export const VENUE_RESIDENT_REQUESTS =
  "Capture spontaneous resident proposals only when they actually occur in spoken dialogue, using speakerId and an exact quote. residenceRequest also needs an available venueId for a requested move; residenceDecision needs approved for acceptance/refusal of a pending player move request. upgradeRequest identifies one concrete structural improvement to this Venue. venueRequest needs name and classes (one or two of workplace, gathering, other) for a NEW public venue, rather than an upgrade here. If a required resident approves or declines a listed exact edit proposal, editApproval needs proposalId and approved. Omit unused fields. Player requests, hypothetical speech, silence, or a different speaker are never resident consent. Approval starts planning, not construction. Existing accepted commitments remain binding until explicitly withdrawn.";

export const VENUE_DEPARTURE_METADATA =
  'For an explicitly departing resident return departures:[{speakerId,quote:"exact spoken departure"}]. Return sceneEnded:{speakerId,quote:"exact spoken ending"} only when dialogue ends the whole encounter, never for player silence or ordinary company.';

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
