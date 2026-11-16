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
  role?: "user";
  cacheBreakpoint?: true;
  transcript?: true;
  transcriptAt?: string;
  transcriptAudience?: string[];
  evidenceId?: string;
  /** Each group needs at least one retained source. */
  requiresEvidence?: string[][];
  pruningPriority?: number;
  optional?: "history" | "memory" | "lore";
  lore?: LoreUse;
};

export const hasWritingEvidence = (block: VenueWritingBlock, retained: ReadonlySet<string | undefined>) =>
  block.requiresEvidence?.every((group) => group.some((id) => retained.has(id))) ?? true;

export type VenueWritingSections = {
  direction: VenueWritingBlock[];
  identity: VenueWritingBlock[];
  transcript?: VenueWritingBlock[];
  frame?: VenueWritingBlock[];
  circumstances: VenueWritingBlock[];
  conversation: VenueWritingBlock[];
  authoredInstructions: VenueWritingBlock[];
  metadata: VenueWritingBlock[];
};

/** Stable rules and complete identities precede all changing Scene facts. */
export function buildVenueSceneBlocks(sections: VenueWritingSections): VenueWritingBlock[] {
  const headings: Record<keyof VenueWritingSections, string> = {
    direction: "Writing direction",
    metadata: "Response format and evidence metadata",
    identity: "Complete authored character identity",
    authoredInstructions: "Authored post-history direction",
    frame: "Current Scene reference",
    transcript: "Witnessed Scene transcript",
    conversation: "Witnessed conversation and recalled memories",
    circumstances: "Current Scene circumstances",
  };
  return (Object.keys(headings) as (keyof VenueWritingSections)[]).flatMap((section) => {
    const blocks = (sections[section] ?? []).filter((block) => block.text.trim());
    const breakpoint =
      section === "metadata" ||
      section === "frame" ||
      section ===
        (sections.authoredInstructions.some((block) => block.text.trim()) ? "authoredInstructions" : "identity");
    if (breakpoint && blocks.length) blocks[blocks.length - 1] = { ...blocks.at(-1)!, cacheBreakpoint: true };
    if (!blocks.length) return [];
    const titled = [{ text: `## ${headings[section]}` }, ...blocks];
    return ["transcript", "conversation", "circumstances"].includes(section)
      ? titled.map((block) => ({ ...block, role: "user" as const }))
      : titled;
  });
}

/** Shared by live generation and isolated evaluations. Never silently shrink a character. */
export function assembleVenueWritingMessages(blocks: readonly VenueWritingBlock[], input: string) {
  const lore = blocks.filter((block) => block.optional === "lore").map((block) => block.text);
  const transcriptEnd = blocks.findLast((block) => block.transcript);
  const messages: CapabilityLanguageModelMessage[] = [];
  let text: string[] = [];
  let role: "system" | "user" = "system";
  let transcriptAt: string | undefined;
  let transcriptAudience: string | undefined;
  for (const block of blocks) {
    if (block.optional === "lore") continue;
    const blockRole = block.role ?? "system";
    if (blockRole !== role && text.length) {
      messages.push({ role, content: text.join("\n\n") });
      text = [];
    }
    role = blockRole;
    if (block.transcript) {
      const at = block.transcriptAt === transcriptAt ? undefined : block.transcriptAt;
      const audience = block.transcriptAudience && JSON.stringify(block.transcriptAudience);
      const audienceChanged = audience !== undefined && audience !== transcriptAudience;
      if (at || audienceChanged)
        text.push(JSON.stringify({ at, audience: audienceChanged ? block.transcriptAudience : undefined }));
      transcriptAt = block.transcriptAt;
      if (audience !== undefined) transcriptAudience = audience;
    }
    if (block.text) text.push(block.text);
    if ((block.cacheBreakpoint || block.transcript) && text.length) {
      messages.push({
        role,
        content: text.join("\n\n"),
        ...(block.cacheBreakpoint || block === transcriptEnd ? { cacheBreakpoint: true } : {}),
      });
      text = [];
    }
  }
  if (lore.length) text.push(LORE_REFERENCE_RULE);
  if (text.length) messages.push({ role, content: text.join("\n\n") });
  return [
    ...messages,
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
    ...(role === "user" ? [{ role: "user" as const, content: "## Current player submission" }] : []),
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
  let kept = [...blocks];
  // Prune optional recall, memories and lore before rebuilding the Scene transcript.
  // Essential blocks and the latest player input must survive fitting byte-for-byte.
  for (;;) {
    const evidence = new Set(kept.map((block) => block.evidenceId));
    kept = kept.filter((block) => hasWritingEvidence(block, evidence));
    const messages = assembleVenueWritingMessages(kept, input);
    // shortcut: reserve JSON object headroom with a fit-only message until the public fitter accepts responseFormat.
    const probe = messages.slice();
    probe.splice(-1, 0, { role: "user", content: "." });
    const fitted = model.fitContext(probe, { maxTokens });
    if (JSON.stringify(fitted.messages) === JSON.stringify(probe)) {
      const measured = model.fitContext(messages, { maxTokens: fitted.maxTokens ?? maxTokens });
      return {
        ...fitted,
        messages,
        estimatedTokensBefore: measured.estimatedTokensBefore,
        estimatedTokensAfter: measured.estimatedTokensAfter,
        trimmed: fitted.trimmed || kept.length < blocks.length,
        evidenceIds: kept.flatMap((block) => (block.evidenceId ? [block.evidenceId] : [])),
        loreEntries: kept.filter((block) => block.optional === "lore").map((block) => block.text),
        lore: mergeLoreUse(kept.flatMap((block) => (block.lore ? [block.lore] : []))),
      };
    }
    const optional =
      ["history", "memory", "lore", "transcript"]
        .map((kind) =>
          kept
            .map((block, index) => ({ block, index }))
            .filter(({ block }) => (block.transcript ? "transcript" : block.optional) === kind)
            .sort((a, b) =>
              kind === "lore"
                ? b.index - a.index
                : (a.block.pruningPriority ?? 0) - (b.block.pruningPriority ?? 0) || a.index - b.index,
            ),
        )
        .find((rows) => rows.length) ?? [];
    if (!optional.length)
      throw badRequest(
        `The complete character cards and required context do not fit the ${connectionName} connection. Increase its context limit or choose a connection with a larger context window. No reply was requested.`,
      );
    // Drop whole low-priority rows in batches: fitting a long Scene must not scan it once per line.
    const count = optional[0].block.optional === "history" ? Math.ceil(optional.length / 4) : 1;
    const remove = new Set(optional.slice(0, count).map(({ block }) => block));
    kept = kept.filter((block) => !remove.has(block));
  }
}
