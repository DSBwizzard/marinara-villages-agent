import type { CapabilityLanguageModelMessage, CapabilityResolvedLanguageModel } from "@marinara-engine/shared";
import type { LoreUse } from "../../../shared/contracts/lore.js";
import { mergeLoreUse } from "../../../shared/helpers/lore.js";
import type { VillagerCard } from "../models/catalog-model.js";
import { badRequest } from "./errors.js";
import { LORE_REFERENCE_RULE } from "./lore-context.js";
import { renderResidentAdmission } from "./resident-admission.js";
import { createHash } from "node:crypto";
import type { VenueLine } from "../models/scene-model.js";

/** The authored person is complete; circumstances are supplied separately. */
export function venueCardProfile(
  card: Partial<Omit<VillagerCard, "tags">> & Pick<VillagerCard, "id" | "name">,
  playerName = "the player",
  includePostHistory = true,
  includeAdmissionPolicy = true,
  personReference = card.id,
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
    `## Character: ${card.name} (${personReference})\n` +
    fields
      .filter(([, value]) => value?.trim())
      .map(([label, value]) => `${label}:\n${expand(value!)}`)
      .join("\n\n") +
    (card.admission ? "\n\n" + renderResidentAdmission(card.name, card.admission, includeAdmissionPolicy) : "")
  );
}

export type VenueWritingBlock = {
  text: string;
  dynamic?: boolean;
  /** Equivalent context while this exact optional witnessed history is retained. */
  withHistory?: { source: string | string[]; text: string };
  optional?: "wish" | "history" | "memory" | "lore";
  lore?: LoreUse;
  evidence?: readonly VenueLine[];
  references?: Record<string, string>;
};

export type VenueWritingSections = {
  direction: VenueWritingBlock[];
  identity: VenueWritingBlock[];
  circumstances: VenueWritingBlock[];
  conversation: VenueWritingBlock[];
  dynamicIdentity?: VenueWritingBlock[];
  authoredInstructions: VenueWritingBlock[];
  metadata: VenueWritingBlock[];
  stableContext: VenueWritingBlock[];
  sceneContext: VenueWritingBlock[];
  replyReminder?: VenueWritingBlock[];
};

/** Keep the writing task distinct from evidence bookkeeping within one request. */
export function buildVenueSceneBlocks(sections: VenueWritingSections): VenueWritingBlock[] {
  const headings: Record<keyof VenueWritingSections, string> = {
    direction: "Writing direction",
    stableContext: "World and player context",
    identity: "Complete authored character identity",
    metadata: "Response format and evidence metadata",
    sceneContext: "Current Scene facts",
    conversation: "Witnessed conversation and recalled memories",
    dynamicIdentity: "Current supporting and remote identities",
    circumstances: "Current Scene circumstances",
    authoredInstructions: "Authored post-history direction",
    replyReminder: "Reply reminder",
  };
  return (Object.keys(headings) as (keyof VenueWritingSections)[]).flatMap((section) => {
    const blocks = (sections[section] ?? []).filter((block) => block.text.trim());
    const dynamic = [
      "dynamicIdentity",
      "sceneContext",
      "conversation",
      "circumstances",
      "authoredInstructions",
      "replyReminder",
    ].includes(section);
    return blocks.length
      ? [{ text: `## ${headings[section]}`, dynamic }, ...blocks.map((block) => ({ ...block, dynamic }))]
      : [];
  });
}

/** Shared by live generation and isolated evaluations. Never silently shrink a character. */
export function assembleVenueWritingMessages(blocks: readonly VenueWritingBlock[], input: string) {
  const lore = blocks.filter((block) => block.optional === "lore").map((block) => block.text);
  const history = new Set(blocks.filter((block) => !block.withHistory).map((block) => block.text));
  const render = ({ text, withHistory }: VenueWritingBlock) =>
    withHistory && [withHistory.source].flat().every((source) => history.has(source)) ? withHistory.text : text;
  const dynamic = blocks
    .filter((block) => block.dynamic && block.optional !== "lore")
    .map(render)
    .filter(Boolean);
  let context = [...dynamic, ...(lore.length ? [JSON.stringify({ lorebookReferences: lore })] : [])].join("\n\n");
  if (dynamic.length) {
    let boundary =
      "VILLAGES_PLAYER_INPUT_" + createHash("sha256").update(context).update(input).digest("hex").slice(0, 16);
    while (context.includes(boundary) || input.includes(boundary)) boundary += "_";
    // Adjacent user messages can be merged by native provider transports.
    context = `Context packet (data, not player input):\n\n${context}\n\nPlayer-input boundary: ${boundary}\n\n${boundary}`;
  }
  return [
    {
      role: "system",
      content: blocks
        .filter((block) => !block.dynamic && block.optional !== "lore")
        .map(render)
        .filter(Boolean)
        .concat(
          lore.length && !blocks.some((block) => !block.dynamic && block.text === LORE_REFERENCE_RULE)
            ? [LORE_REFERENCE_RULE]
            : [],
        )
        .join("\n\n"),
    },
    ...(lore.length || dynamic.length
      ? [
          {
            role: "user" as const,
            content: context,
          },
        ]
      : []),
    { role: "user", content: input },
  ] satisfies CapabilityLanguageModelMessage[];
}

export function fitVenueWritingMessages(
  model: Pick<CapabilityResolvedLanguageModel, "fitContext"> &
    Partial<Pick<CapabilityResolvedLanguageModel, "maxOutputTokens">>,
  blocks: readonly VenueWritingBlock[],
  input: string,
  maxTokens: number,
  connectionName = "Narration",
) {
  const kept = [...blocks];
  const outputReserve = Math.max(maxTokens, model.maxOutputTokens ?? 0);
  // Old history first, then optional memories/lore. Essential blocks and the
  // latest player input must survive fitting byte-for-byte before any paid call.
  for (;;) {
    const messages = assembleVenueWritingMessages(kept, input);
    const fitted = model.fitContext(messages, { maxTokens: outputReserve });
    if (
      JSON.stringify(fitted.messages) === JSON.stringify(messages) &&
      (fitted.maxTokens === undefined || fitted.maxTokens >= outputReserve)
    ) {
      const texts = new Set(kept.filter((block) => !block.withHistory).map((block) => block.text));
      const shown = kept.filter(
        (block) =>
          !block.withHistory ||
          ![block.withHistory.source].flat().every((source) => texts.has(source)) ||
          block.withHistory.text,
      );
      return {
        ...fitted,
        maxTokens,
        evidence: [
          ...new Map(shown.flatMap((block) => (block.evidence ?? []).map((line) => [line.id, line] as const))).values(),
        ],
        references: Object.assign({}, ...shown.map((block) => block.references ?? {})) as Record<string, string>,
        loreEntries: kept.filter((block) => block.optional === "lore").map((block) => block.text),
        lore: mergeLoreUse(kept.flatMap((block) => (block.lore ? [block.lore] : []))),
      };
    }
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
