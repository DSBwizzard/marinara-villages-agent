import type { CapabilityLanguageModelMessage, CapabilityResolvedLanguageModel } from "@marinara-engine/shared";
import type { LoreUse } from "../../../shared/contracts/lore.js";
import { mergeLoreUse } from "../../../shared/helpers/lore.js";
import type { VillagerCard } from "../models/catalog-model.js";
import { badRequest } from "./errors.js";
import { LORE_REFERENCE_RULE } from "./lore-context.js";
import { renderResidentAdmission } from "./resident-admission.js";

/** The authored person is complete; circumstances are supplied separately. */
export function venueCardProfile(
  card: Partial<Omit<VillagerCard, "tags">> & Pick<VillagerCard, "id" | "name">,
  playerName = "the player",
  includePostHistory = true,
  includeAdmissionPolicy = true,
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
    (card.admission ? "\n\n" + renderResidentAdmission(card.name, card.admission, includeAdmissionPolicy) : "")
  );
}

export type VenueWritingBlock = {
  text: string;
  /** Equivalent context while this exact optional witnessed history is retained. */
  withHistory?: { source: string; text: string };
  optional?: "wish" | "history" | "memory" | "lore";
  lore?: LoreUse;
};

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
    conversation: "Witnessed conversation and recalled memories",
    circumstances: "Current Scene circumstances",
    authoredInstructions: "Authored post-history direction",
    metadata: "Response format and evidence metadata",
  };
  return (Object.keys(headings) as (keyof VenueWritingSections)[]).flatMap((section) => {
    const blocks = sections[section].filter((block) => block.text.trim());
    return blocks.length ? [{ text: `## ${headings[section]}` }, ...blocks] : [];
  });
}

/** Shared by live generation and isolated evaluations. Never silently shrink a character. */
export function assembleVenueWritingMessages(blocks: readonly VenueWritingBlock[], input: string) {
  const lore = blocks.filter((block) => block.optional === "lore").map((block) => block.text);
  const history = new Set(blocks.filter((block) => block.optional === "history").map((block) => block.text));
  return [
    {
      role: "system",
      content: blocks
        .filter((block) => block.optional !== "lore")
        .map(({ text, withHistory }) => (withHistory && history.has(withHistory.source) ? withHistory.text : text))
        .filter(Boolean)
        .concat(lore.length ? [LORE_REFERENCE_RULE] : [])
        .join("\n\n"),
    },
    ...(lore.length
      ? [
          {
            role: "user" as const,
            content: JSON.stringify({
              lorebookReferences: lore,
            }),
          },
        ]
      : []),
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
  // Old history first, then optional memories/lore. Essential blocks and the
  // latest player input must survive fitting byte-for-byte before any paid call.
  for (;;) {
    const messages = assembleVenueWritingMessages(kept, input);
    const fitted = model.fitContext(messages, { maxTokens });
    if (JSON.stringify(fitted.messages) === JSON.stringify(messages))
      return {
        ...fitted,
        loreEntries: kept.filter((block) => block.optional === "lore").map((block) => block.text),
        lore: mergeLoreUse(kept.flatMap((block) => (block.lore ? [block.lore] : []))),
      };
    const optional =
      ["wish", "history", "memory", "lore"]
        .map((kind) =>
          kind === "lore"
            ? kept.findLastIndex((block) => block.optional === kind)
            : kept.findIndex((block) => block.optional === kind),
        )
        .find((index) => index >= 0) ?? -1;
    if (optional < 0)
      throw badRequest(
        `The complete character cards and required context do not fit the ${connectionName} connection. Increase its context limit or choose a connection with a larger context window. No reply was requested.`,
      );
    kept.splice(optional, 1);
  }
}
