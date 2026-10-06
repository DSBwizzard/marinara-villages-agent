import {
  CHARACTER_FIELD_NAMES,
  characterFieldValue,
  type NarrationPreset,
  type NarrationSection,
  type NarrationWrapFormat,
} from "./narration-preset.js";
import { fillVillageMacros, type VillagePromptValues } from "./prompt-preset.js";
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";

// Villages — a villager's turn, assembled the way the Engine assembles one.
//
// The Engine has one prompt pipeline and it is a good one: a section list in the
// player's own order, each section either written text or a marker that expands
// out of the character, the persona, the transcript or the world; grouped
// sections wrapped together; adjacent messages merged; optional squashing of the
// leading system block; depth sections injected into the transcript; strict role
// folding; and a single-user-message mode on the end. Everything that makes a
// roleplay prompt feel hand-built rather than bolted together lives in that
// pipeline, and a village conversation was not using a word of it.
//
// So this module is that pipeline, ported. It is not a copy of the Engine's
// server function: a package cannot call `assemblePrompt` — it needs a database
// handle, a chat id, and a set of server-private helpers this package cannot
// reach — and it does not need to. What is ported is the ORDER and the RULES,
// which is the part that decides how the prompt reads, over a document this
// package read for itself and content it already knows how to produce.
//
// Four deliberate departures, each one named where it happens rather than
// hidden:
//
//   * Macros are resolved in ONE pass from a plain map. The Engine's macro
//     engine is a server-private module with conditional blocks, variables and
//     dice in it, and it is not importable here; this package's own single-pass
//     resolver is what is used instead. See `fillVillageMacros` for what that
//     buys and what it does not.
//   * The village reads its selected lorebooks itself. The `lorebook` marker
//     expands the village knowledge box and those bounded excerpts. RPG
//     attributes and advanced-prompt entries have no village equivalent.
//   * A preset with no `chat_history` marker still gets the transcript, appended
//     to the leading system block. The Engine would send the preset without it.
//     A villager who cannot see the last thing the player said is not a design
//     decision, it is a broken conversation, and it is the one gap where being
//     faithful to a preset would be worse than being useful.
//   * A preset with no `character` marker still gets the card. Same class of gap,
//     worse failure: the Engine hands a chat's character to its own prompt by
//     paths a package does not have, so a preset built for a roleplay chat can
//     legitimately have no character section in it. Here that would send a
//     villager with no name and no instructions at all.
//
// Both repairs are the SAME KIND of thing — the preset left something out that
// the surface it was written for supplies elsewhere — and neither of them
// overrules a preset that did supply it. A preset that names its own character
// section gets exactly what it asked for.

// ── What goes in, and what comes out ─────────────────────────────────────────

/** One line of the conversation, as the village holds it. */
export type NarrationHistoryEntry = {
  role: "user" | "assistant";
  content: string;
  /**
   * Who said this line, when the transcript can hold more than one voice.
   *
   * Absent on every line of an ordinary conversation, which is one villager and
   * the player: `role` already says which of the two it was, and a line that
   * said it again would be saying nothing. A ROOM is what this exists for — a
   * participant's copy of a room holds the player's lines, their own, and
   * everybody else's, and "assistant" is then three people rather than one.
   *
   * The id is the load-bearing half: it is what `mergeable` and
   * `enforceStrictRoles` read, and without it a preset that folds role runs or
   * forces strict role alternation would splice a room's neighbours into one
   * turn — so the model would read somebody else's answer as its own. The name
   * is the printable half, for a preset with no `chat_history` marker to put the
   * speakers inside.
   */
  speakerId?: string;
  speakerName?: string;
};

/** The card, flattened to the fields a `character` marker can name. */
export type NarrationCard = {
  name: string;
  description: string;
  personality: string;
  scenario: string;
  backstory: string;
  appearance: string;
  systemPrompt: string;
  exampleDialogue: string;
};

/** The player, as the village resolved them: one name and one description. */
export type NarrationPlayer = {
  name: string;
  description: string;
};

export type NarrationAssembleInput = {
  /** The document to build from: the player's preset, or the village's own. */
  preset: NarrationPreset;
  card: NarrationCard;
  player: NarrationPlayer;
  /** The knowledge box, already folded through the village's macros. */
  knowledge: string;
  /** Selected lore for this turn, kept separate so markers inject it once. */
  lore?: string;
  /** The conversation so far, oldest first. */
  history: readonly NarrationHistoryEntry[];
  /** The player's line, or `null` for a turn the player did not speak. */
  message: string | null;
  /**
   * What this turn is, as the very last thing in the prompt.
   *
   * The greeting direction, the goodbye direction, the mode framing, the ruling
   * on a wish — all of it arrives here, and it is deliberately the last content
   * in the prompt rather than the first. The Engine puts a character's
   * post-history instructions last for the same reason: an instruction about
   * what to do with THIS turn is the one thing that must not be buried under the
   * character's own material.
   */
  turnBlock: string;
  /** The resolved value of every preset choice variable. */
  choices: Readonly<Record<string, string>>;
  /** Every other macro the village can answer. */
  values: VillagePromptValues;
  /**
   * Who is speaking, as an id the transcript's lines are tagged with.
   *
   * A village transcript is one villager and the player, so this is the card's
   * own id rather than a roster of speakers — but it still has to be carried,
   * because it is what lets the strict-role pass tell two consecutive villager
   * lines from a villager line followed by the player's. Without it, a preset
   * that forces role alternation would splice the villager's last two answers
   * into one turn and the model would read its own words as the player's.
   *
   * It is the DEFAULT for a line that does not name its own speaker, which is
   * every line of an ordinary turn. A room's lines carry their own id, so this
   * one decides nothing there — the two halves arrive at the same place by the
   * same rule, and there is one reader of it either way.
   */
  speakerId: string;
};

// ── Wrapping ─────────────────────────────────────────────────────────────────

/**
 * A display name as an XML tag slug: "World Info (Before)" → "world_info_before".
 *
 * The Engine's own slug, character for character, because a preset written for
 * the Engine expects the tags the Engine produces. A package that spelled its
 * tags differently would produce a prompt that is the same text inside different
 * brackets and reads to a model as a different prompt.
 */
function nameToXmlTag(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "_")
    .replace(/_+/g, "_");
}

/** A display name as a markdown heading: punctuation dropped, runs collapsed. */
function nameToHeading(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s_-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Four spaces per level, on the lines that have anything on them. */
function indent(text: string, level: number): string {
  const pad = "    ".repeat(level);
  return text
    .split("\n")
    .map((line) => (line.trim().length > 0 ? `${pad}${line}` : line))
    .join("\n");
}

/**
 * One section's text, wrapped the way the preset asked for.
 *
 * `depth` is the heading level the Engine gives a nested block: the top level of
 * a prompt gets `##`, a field inside a card gets `####`, and the scale stops at
 * six because that is where markdown's stops. A name that slugs to nothing —
 * punctuation only, which a player can type — is left unwrapped rather than
 * opened as an empty tag, because `<>\n…\n</>` is worse than no tag at all.
 */
export function wrapContent(content: string, sectionName: string, format: NarrationWrapFormat, depth = 0): string {
  const trimmed = content.trim();
  if (trimmed.length === 0) return "";
  if (format === "none") return trimmed;
  if (format === "markdown") {
    const heading = nameToHeading(sectionName);
    if (heading.length === 0) return trimmed;
    return `${"#".repeat(Math.min(depth + 2, 6))} ${heading}\n${trimmed}`;
  }
  const tag = nameToXmlTag(sectionName);
  if (tag.length === 0) return trimmed;
  return `<${tag}>\n${indent(trimmed, 1)}\n</${tag}>`;
}

/** A group's children under one heading, at the level a top-level block gets. */
export function wrapGroup(children: string, groupName: string, format: NarrationWrapFormat): string {
  const trimmed = children.trim();
  if (trimmed.length === 0) return "";
  if (format === "none") return trimmed;
  if (format === "markdown") {
    const heading = nameToHeading(groupName);
    if (heading.length === 0) return trimmed;
    return `# ${heading}\n${trimmed}`;
  }
  const tag = nameToXmlTag(groupName);
  if (tag.length === 0) return trimmed;
  return `<${tag}>\n${indent(trimmed, 1)}\n</${tag}>`;
}

// ── Messages while they are being built ──────────────────────────────────────

/**
 * Where a message came from, for the three phases that treat history differently.
 *
 * The Engine carries the same three kinds and needs them for the same reasons:
 * `history` is what depth injection anchors against and what a strict-role pass
 * must not fold into the prompt block, `injection` is a depth entry that has been
 * placed, and everything else is `prompt`.
 */
type NarrationContextKind = "prompt" | "history" | "injection";

type WorkingMessage = {
  role: "system" | "user" | "assistant";
  content: string;
  characterId?: string;
  contextKind?: NarrationContextKind;
};

/** One resolved section, with the messages it contributed and where they go. */
type ResolvedSection = {
  id: string;
  groupId: string;
  isChatHistory: boolean;
  depth: number;
  messages: WorkingMessage[];
};

/** A depth entry waiting to be placed into the transcript. */
type DepthEntry = {
  role: "system" | "user" | "assistant";
  content: string;
  depth: number;
};

/**
 * Whether two neighbouring messages are the same speaker saying one thing.
 *
 * Three questions, in the Engine's order. Same role, because a system block and
 * a line of dialogue are never one message. Same speaker, because two villagers
 * talking must not be spliced into one turn that neither of them said. And a
 * compatible context kind, where "compatible" means equal or one of them absent
 * — a message the package has not classified yet is merged rather than left
 * stranded beside its neighbour, which is what keeps a group's output from
 * arriving as one message per wrapped section.
 */
function mergeable(left: WorkingMessage, right: WorkingMessage): boolean {
  if (left.role !== right.role) return false;
  if ((left.characterId ?? null) !== (right.characterId ?? null)) return false;
  const leftKind = left.contextKind ?? null;
  const rightKind = right.contextKind ?? null;
  return leftKind === rightKind || leftKind === null || rightKind === null;
}

/**
 * Fold neighbouring messages of the same speaker into one.
 *
 * This is what stops a preset with eight system sections from arriving as eight
 * system messages. The Engine does it for the same reason and with the same
 * rules; the only thing this version drops is the image and file splicing, which
 * a village has no way to produce.
 */
function mergeAdjacentMessages(messages: readonly WorkingMessage[]): WorkingMessage[] {
  const merged: WorkingMessage[] = [];
  for (const message of messages) {
    if (message.content.trim().length === 0) continue;
    const previous = merged[merged.length - 1];
    if (previous === undefined || !mergeable(previous, message)) {
      merged.push({ ...message });
      continue;
    }
    previous.content = `${previous.content}\n\n${message.content}`;
    // The merged message keeps a kind only when both halves agreed on it. Half
    // history and half prompt is neither, and claiming one of them would put the
    // result on the wrong side of the depth anchor.
    if ((previous.contextKind ?? null) !== (message.contextKind ?? null)) delete previous.contextKind;
  }
  return merged;
}

/**
 * The leading system block, as one message.
 *
 * Only the leading run is squashed. A system message that appears later is
 * deliberately left where it is, because later is the whole reason it is there —
 * it is the turn's own instruction, and folding it up to the top would move the
 * one thing that has to be near the reply as far from it as the prompt allows.
 */
function squashLeadingSystemMessages(messages: readonly WorkingMessage[]): WorkingMessage[] {
  let count = 0;
  while (count < messages.length && messages[count]!.role === "system") count += 1;
  if (count <= 1) return [...messages];
  const leading = messages.slice(0, count);
  const kinds = new Set(
    leading.map((message) => message.contextKind).filter((kind): kind is NarrationContextKind => kind !== undefined),
  );
  const squashed: WorkingMessage = {
    role: "system",
    content: leading.map((message) => message.content).join("\n\n"),
    ...(kinds.size === 1 ? { contextKind: [...kinds][0] } : {}),
  };
  return [squashed, ...messages.slice(count)];
}

/** The first and last index of the transcript, one past the last. */
function findHistoryBounds(messages: readonly WorkingMessage[]): { start: number; end: number } | null {
  let start = -1;
  let last = -1;
  for (let index = 0; index < messages.length; index += 1) {
    if (messages[index]!.contextKind !== "history") continue;
    if (start < 0) start = index;
    last = index;
  }
  return start < 0 ? null : { start, end: last + 1 };
}

/**
 * Put depth entries into the transcript.
 *
 * Every insertion index is computed against the array as it was BEFORE anything
 * is placed, and the inserts then run from the back forwards. Both halves of that
 * matter: computing as we go would make each entry's depth relative to a
 * different array than the last, and inserting front-to-back would shift every
 * later index by however much had already been spliced in.
 *
 * Depth is counted backwards from the anchor — depth 0 is just after the
 * transcript's last line, depth 2 is two lines further up — which is the
 * Engine's meaning and the only one that stays put as a conversation grows.
 */
function injectAtDepth(
  messages: readonly WorkingMessage[],
  entries: readonly DepthEntry[],
  options: { minIndex?: number; anchorIndex?: number } = {},
): WorkingMessage[] {
  const baseLength = messages.length;
  const minIndex = Math.min(Math.max(Math.floor(options.minIndex ?? 0), 0), baseLength);
  const anchorIndex = Math.min(Math.max(Math.floor(options.anchorIndex ?? baseLength), minIndex), baseLength);
  const placed = entries.map((entry, index) => ({
    entry,
    index,
    depth: Math.max(Math.floor(entry.depth), 0),
    at: Math.max(minIndex, anchorIndex - Math.max(Math.floor(entry.depth), 0)),
  }));
  // Later positions first so an earlier splice cannot move a later one, and
  // within one position by depth and then by the order the preset listed them.
  placed.sort((left, right) => left.at - right.at || left.depth - right.depth || left.index - right.index);
  const result = [...messages];
  for (let index = placed.length - 1; index >= 0; index -= 1) {
    const item = placed[index]!;
    result.splice(item.at, 0, { role: item.entry.role, content: item.entry.content, contextKind: "injection" });
  }
  return result;
}

/** Concatenate two messages, keeping the first one's identity. */
function mergeInto(target: WorkingMessage, source: WorkingMessage): void {
  target.content = `${target.content}\n\n${source.content}`;
  if ((target.contextKind ?? null) !== (source.contextKind ?? null)) delete target.contextKind;
}

/**
 * One message per role run, with the system block at the front.
 *
 * Some models are strict about role alternation and some providers reject a
 * prompt that is not system-then-alternating at all. This is the pass that makes
 * any preset legal for them, and it is the Engine's, rule for rule: the leading
 * system messages become one, a later system message joins a system message
 * above it or stands alone, and two dialogue messages join only when they are
 * the same speaker.
 *
 * The speaker check is the one that is easy to get wrong and expensive when you
 * do: without it a villager's reply and the next villager's — or a villager's
 * reply and the player's line — become a single turn, and the model reads its
 * own answer as something the player said.
 */
function enforceStrictRoles(messages: readonly WorkingMessage[]): WorkingMessage[] {
  const result: WorkingMessage[] = [];
  let leadingEnd = 0;
  while (leadingEnd < messages.length && messages[leadingEnd]!.role === "system") leadingEnd += 1;
  if (leadingEnd > 0) {
    const first = messages[0]!;
    result.push({
      ...first,
      content: messages
        .slice(0, leadingEnd)
        .map((message) => message.content)
        .join("\n\n"),
    });
  }
  for (let index = leadingEnd; index < messages.length; index += 1) {
    const message = messages[index]!;
    const previous = result[result.length - 1];
    if (
      previous !== undefined &&
      ((previous.role === "system" && message.role === "system") ||
        (message.role !== "system" &&
          previous.role === message.role &&
          (previous.characterId ?? null) === (message.characterId ?? null)))
    ) {
      mergeInto(previous, message);
      continue;
    }
    result.push({ ...message });
  }
  return result;
}

// ── Markers ──────────────────────────────────────────────────────────────────

/**
 * A field's own name as the heading it is given inside a card.
 *
 * The Engine labels the fields it expands and a preset's author has already read
 * that output, so the labels are spelled the way the Engine spells them. Anything
 * not on this list keeps the name the preset used, because a field this package
 * does not know about is still a field the player asked for.
 */
const FIELD_LABELS: Record<string, string> = {
  description: "Description",
  personality: "Personality",
  scenario: "Scenario",
  backstory: "Backstory",
  appearance: "Appearance",
  system_prompt: "System Prompt",
};

function fieldLabel(field: string): string {
  return FIELD_LABELS[field.toLowerCase()] ?? field;
}

/** One labelled field, macro-folded and wrapped, or nothing when it is empty. */
function labelledBlock(label: string, value: string, format: NarrationWrapFormat, values: VillagePromptValues): string {
  const filled = fillVillageMacros(value, values).trim();
  if (filled.length === 0) return "";
  return wrapContent(filled, label, format, 2);
}

/**
 * A `character` marker: the villager, as the fields the marker named.
 *
 * Every field is wrapped at depth 2 and the whole thing at depth 1 under the
 * villager's own name, which is the Engine's nesting and the reason a markdown
 * preset reads as a properly structured document rather than a flat wall of
 * headings. A field with nothing in it contributes nothing at all — a card with
 * no backstory must not produce an empty `#### Backstory`, which teaches a model
 * that headings mean nothing.
 *
 * The Engine also folds RPG attributes in here. A village has no stats, so there
 * is nothing to fold; a card field called `rpg_attributes` is not a thing a
 * villager can have.
 */
function characterBlock(
  card: NarrationCard,
  fields: readonly string[],
  format: NarrationWrapFormat,
  values: VillagePromptValues,
): string {
  const parts: string[] = [];
  for (const field of fields) {
    const part = labelledBlock(fieldLabel(field), characterFieldValue(card, field), format, values);
    if (part.length > 0) parts.push(part);
  }
  if (parts.length === 0) return "";
  return wrapContent(parts.join("\n\n"), card.name, format, 1);
}

/** Who said a line, as a name the prompt can print. */
function speakerName(
  message: { role: string; speakerName?: string },
  card: NarrationCard,
  player: NarrationPlayer,
): string {
  if (message.role === "system") return "System";
  // A line that named its own speaker is printed with it. This is the room's
  // case and only the room's: two villagers in one transcript are two names, and
  // printing the card's name on a neighbour's line would hand the model an
  // answer it did not write, in the voice of the one it is being asked to be.
  const named = message.speakerName ?? "";
  if (message.role === "assistant" && named.length > 0) return named;
  return message.role === "assistant" ? card.name : player.name;
}

// ── The transcript ───────────────────────────────────────────────────────────

/**
 * The conversation, framed the way the preset asks for.
 *
 * The framing is the Engine's and it is load-bearing. `<chat_history>` opens
 * inside the first line and closes inside the second-to-last, and `<last_message>`
 * wraps the last line whole — so the model sees a closed record of what has been
 * said and then one turn held apart from it, which is the difference between
 * continuing a transcript and answering the sentence on the end of one.
 *
 * Roles are carried through as roles rather than flattened into labels, because
 * a marker's whole purpose is to let the provider do the framing where the
 * provider has a frame. The `characterId` on the villager's lines is what lets
 * the strict-role pass tell two consecutive villager lines from a villager line
 * followed by the player's — and it is taken from the LINE when the line names
 * a speaker of its own, so a room's three villagers stay three speakers instead
 * of collapsing into the card this prompt happens to be framed by.
 */
function historyMessages(
  entries: readonly NarrationHistoryEntry[],
  input: NarrationAssembleInput,
  format: NarrationWrapFormat,
  values: VillagePromptValues,
): WorkingMessage[] {
  const kept = entries
    .map((entry) => ({
      role: entry.role,
      content: fillVillageMacros(entry.content ?? "", values).trim(),
      speakerId: entry.speakerId,
    }))
    .filter((entry) => entry.content.length > 0);
  if (kept.length === 0) return [];
  const messages: WorkingMessage[] = kept.map((entry) => ({
    role: entry.role,
    content: entry.content,
    contextKind: "history" as const,
    ...(entry.role === "assistant" ? { characterId: entry.speakerId ?? input.speakerId } : {}),
  }));
  const last = messages.length - 1;
  const first = messages[0]!;
  const beforeLast = messages[last - 1];
  const final = messages[last]!;
  if (format === "xml") {
    // A transcript of one line is the last message and nothing else. Opening
    // `<chat_history>` and never closing it would be worse than not opening it.
    if (beforeLast !== undefined) {
      first.content = `<chat_history>\n${indent(first.content, 1)}`;
      beforeLast.content = `${beforeLast.content}\n</chat_history>`;
    }
    final.content = `<last_message>\n${indent(final.content, 1)}\n</last_message>`;
  } else if (format === "markdown") {
    if (beforeLast !== undefined) first.content = `## Chat History\n${first.content}`;
    final.content = `## Last Message\n${final.content}`;
  }
  return messages;
}

/**
 * The transcript as plain text, for a preset that has no `chat_history` marker.
 *
 * Villages departs from the Engine here and says so. The Engine would send a
 * preset without the marker and let the character answer a question it cannot
 * see, because the preset is the player's business and the marker is how they
 * say where the history goes. A villager who cannot see the player's last line is
 * not a prompt the player chose, it is a broken conversation, and the honest
 * repair is to hand the transcript over rather than to serve a reply that reads
 * as though the player had said something else.
 */
function transcriptAsText(
  entries: readonly NarrationHistoryEntry[],
  input: NarrationAssembleInput,
  values: VillagePromptValues,
): string {
  const lines: string[] = [];
  for (const entry of entries) {
    const content = fillVillageMacros(entry.content ?? "", values).trim();
    if (content.length === 0) continue;
    lines.push(`${speakerName(entry, input.card, input.player)}: ${content}`);
  }
  return lines.join("\n");
}

/**
 * Hand the transcript to the prompt block, in the Engine's repair position.
 *
 * Appended rather than prepended, so the preset's own instructions stay at the
 * top of the block and the record of what was said reads as material the
 * instructions are about.
 */
function appendTranscriptFallback(messages: WorkingMessage[], transcript: string): WorkingMessage[] {
  if (transcript.trim().length === 0) return messages;
  const leading = messages[0];
  if (leading === undefined) return [{ role: "system", content: transcript }];
  if (leading.role === "system") {
    leading.content = `${leading.content}\n\n${transcript}`;
    return messages;
  }
  return [{ role: "system", content: transcript }, ...messages];
}

// ── Single user message ──────────────────────────────────────────────────────

/**
 * Everything the prompt has to say, as one message from the player.
 *
 * Providers that reject a system role, and models that have been trained on a
 * single user turn, both need this and neither can be argued with. Each speaker
 * gets a label rather than a role, because the one thing this mode gives up is
 * the framing that made roles meaningful — and a model that has just been told
 * there is one speaker reads a bare transcript as a monologue.
 */
function collapseToSingleUserMessage(
  messages: readonly WorkingMessage[],
  input: NarrationAssembleInput,
): WorkingMessage[] {
  const fragments = messages
    .filter((message) => message.content.trim().length > 0)
    .map((message) => `${speakerName(message, input.card, input.player)}:\n${message.content.trim()}`);
  if (fragments.length === 0) return [];
  return [{ role: "user", content: fragments.join("\n\n") }];
}

// ── The pipeline ─────────────────────────────────────────────────────────────

/**
 * A villager's next turn, as messages the provider will accept.
 *
 * The phases are the Engine's, in the Engine's order, and the order is the whole
 * value of the function. Grouping has to happen before merging, because grouping
 * is what puts two sections in one container for merging to join. Squashing has
 * to happen before depth injection, because injection counts backwards from the
 * end of an array that has stopped changing. Depth injection has to happen before
 * the strict-role pass, because that pass is allowed to rewrite the array and is
 * not allowed to move anything into a different position.
 *
 * Two things are deliberate about where they land. The turn block — the greeting
 * direction, the mode framing, the ruling on a wish — is placed after every
 * phase, so nothing can fold it upward or merge it into the card. And a preset
 * that forgot its `chat_history` marker still gets its transcript, because the
 * alternative is a villager answering a question that was never sent.
 */
export function assembleNarrationMessages(input: NarrationAssembleInput): CapabilityLanguageModelMessage[] {
  const preset = input.preset;
  const format = preset.wrapFormat;
  // The village's own macros win a collision. The Engine resolves its named
  // macros before its variable catch-all for the same reason: a player naming a
  // choice `char` meant to name a choice, not to take `{{char}}` away from the
  // character card.
  const values: VillagePromptValues = { ...input.choices, ...input.values };
  const groups = new Map(preset.groups.map((group) => [group.id, group]));

  // Phase 1 — every section, in the preset's order, as the messages it makes.
  const ordered: ResolvedSection[] = [];
  const atDepth: ResolvedSection[] = [];
  let hasChatHistoryMarker = false;
  let hasCharacterMarker = false;
  let loreEmitted = false;
  for (const section of preset.sections) {
    // A section in a group the reader dropped is a section in a group the player
    // switched off, and a group is switched off whole.
    if (section.groupId.length > 0 && !groups.has(section.groupId)) continue;
    const isLoreMarker =
      section.marker?.type === "lorebook" ||
      section.marker?.type === "world_info_before" ||
      section.marker?.type === "world_info_after";
    const hasLoreMacro = section.marker === null && section.content.includes("{{lore}}");
    const sectionValues = { ...values, lore: loreEmitted ? "" : (input.lore ?? values.lore) };
    const resolved = resolveSection(section, input, format, sectionValues);
    if (resolved === null) continue;
    if (isLoreMarker || hasLoreMacro) loreEmitted = true;
    if (resolved.isChatHistory) hasChatHistoryMarker = true;
    if (section.marker?.type === "character") hasCharacterMarker = true;
    if (section.injectionPosition === "depth" && !resolved.isChatHistory && section.injectionDepth >= 0) {
      atDepth.push(resolved);
    } else {
      ordered.push(resolved);
    }
  }
  if (!loreEmitted && input.lore?.trim()) {
    ordered.push({
      id: "villages-lore-fallback",
      groupId: "",
      isChatHistory: false,
      depth: -1,
      messages: [{ role: "system", content: input.lore }],
    });
  }

  // The second repair, and the same kind of thing as the transcript fallback
  // further down. A preset with no character marker sends a villager who is
  // nobody: no name, no description, no card author's instructions, and a
  // regulation preset that was written for a chat whose character the Engine
  // happens to substitute elsewhere will leave this prompt with no idea who is
  // speaking. That is not a design decision, it is a character who does not
  // exist, so the card is put in front of whatever the preset did order. It goes
  // first rather than where the preset would have put it because there is no
  // where, and a card read before the world it is in is the order this package
  // used before presets arrived.
  if (!hasCharacterMarker) {
    const block = characterBlock(input.card, CHARACTER_FIELD_NAMES, format, values);
    if (block.length > 0) {
      ordered.unshift({
        id: "villages-narration-card-fallback",
        groupId: "",
        isChatHistory: false,
        depth: -1,
        messages: [{ role: "system", content: block, contextKind: "prompt" }],
      });
    }
  }

  // Phase 2 — groups, each into the container the preset named.
  //
  // `readGroup` keeps only enabled groups and phase 1 already dropped every
  // section whose group was switched off, so membership here is a lookup into a
  // map that cannot hold a disabled group.
  //
  // A group is emitted at the position of its FIRST member, because that is where
  // the player dragged it to; the group's own row order is a separate thing the
  // editor reads and the prompt does not. The transcript is the one member that
  // is never grouped: wrapping a conversation in a container would put roles the
  // provider has to see inside a heading, so a group holding the history marker
  // is served as its members rather than as a container.
  const historyGroups = new Set(
    ordered.filter((resolved) => resolved.isChatHistory && resolved.groupId.length > 0).map((r) => r.groupId),
  );
  const grouped: ResolvedSection[] = [];
  const emitted = new Set<string>();
  for (const resolved of ordered) {
    const group =
      resolved.groupId.length > 0 && !historyGroups.has(resolved.groupId) ? groups.get(resolved.groupId) : undefined;
    if (group === undefined) {
      grouped.push(resolved);
      continue;
    }
    if (emitted.has(group.id)) continue;
    emitted.add(group.id);
    const children = ordered
      .filter((member) => member.groupId === group.id)
      .flatMap((member) => member.messages.map((message) => message.content))
      .filter((child) => child.trim().length > 0);
    const content = wrapGroup(children.join("\n\n"), group.name, format);
    if (content.trim().length === 0) continue;
    grouped.push({
      id: `group:${group.id}`,
      groupId: group.id,
      isChatHistory: false,
      depth: -1,
      messages: [{ role: resolved.messages[0]?.role ?? "system", content }],
    });
  }

  // Phase 3 — neighbours become one message; empties fall out.
  let messages = mergeAdjacentMessages(grouped.flatMap((resolved) => resolved.messages));

  // Phase 4 — the leading system block, as one message.
  if (preset.parameters.squashSystemMessages) messages = squashLeadingSystemMessages(messages);

  // Phase 5 — depth sections, counted backwards from the end of the transcript.
  const bounds = findHistoryBounds(messages);
  messages = injectAtDepth(
    messages,
    atDepth.flatMap((resolved) =>
      resolved.messages.map((message) => ({
        role: message.role,
        content: message.content,
        depth: resolved.depth,
      })),
    ),
    { minIndex: 0, anchorIndex: bounds?.end ?? messages.length },
  );

  // Phase 6 — one message per role run.
  if (preset.parameters.strictRoleFormatting) messages = enforceStrictRoles(messages);

  // Phase 7 — a preset with no history marker is repaired rather than obeyed.
  if (!hasChatHistoryMarker)
    messages = appendTranscriptFallback(messages, transcriptAsText(input.history, input, values));

  const turn = input.turnBlock.trim();
  // A marker that framed the transcript has already put this line in, inside
  // `<last_message>` where a preset author expects the newest line to be. Without
  // a marker there was nothing to put it in, so it goes on the end.
  if (input.message !== null && !hasChatHistoryMarker) {
    messages = mergeAdjacentMessages([...messages, { role: "user", content: input.message }]);
  }

  // Phase 8 — one message on the end, if the preset asked for one.
  if (!preset.parameters.singleUserMessage && turn.length > 0) {
    // Before the player's last line, so the instruction about this turn is the
    // last thing read before the turn itself. Inserted here, after every pass
    // that could move it, because a turn block folded to the top of the prompt
    // is a turn block the model reads as background.
    const lastIndex = messages.length - 1;
    const beforeLast = input.message !== null && lastIndex >= 0 && messages[lastIndex]!.role === "user";
    messages.splice(beforeLast ? lastIndex : messages.length, 0, { role: "system", content: turn });
  }
  if (preset.parameters.singleUserMessage) {
    const collapsed = collapseToSingleUserMessage(messages, input);
    if (turn.length > 0) {
      // Single-user mode is the one place the turn block goes last, for the same
      // reason as above: it is one message, and the last line of it is the one
      // that gets answered.
      const only = collapsed[0];
      if (only === undefined) collapsed.push({ role: "user", content: turn });
      else only.content = `${only.content}\n\n${turn}`;
    }
    messages = collapsed;
  }

  return messages
    .filter((message) => message.content.trim().length > 0)
    .map((message) => ({ role: message.role, content: message.content }));
}

/**
 * One section as the messages it contributes, or nothing at all.
 *
 * A section with a marker the village cannot fill produces nothing rather than an
 * empty wrapper: `chat_summary` and `agent_data` are Engine concepts with no
 * village equivalent, and a preset that uses them should get the rest of itself
 * rather than a `<chat_summary>` tag with nothing inside it.
 */
function resolveSection(
  section: NarrationSection,
  input: NarrationAssembleInput,
  format: NarrationWrapFormat,
  values: VillagePromptValues,
): ResolvedSection | null {
  const base: Omit<ResolvedSection, "messages" | "isChatHistory"> = {
    id: section.identifier,
    groupId: section.groupId,
    depth: section.injectionDepth,
  };
  if (section.marker !== null && section.marker.type === "chat_history") {
    const framed = historyMessages(
      input.message === null ? input.history : [...input.history, { role: "user" as const, content: input.message }],
      input,
      format,
      values,
    );
    if (framed.length === 0) return null;
    return { ...base, isChatHistory: true, messages: framed };
  }
  const wrapped = wrapContent(sectionText(section, input, format, values), section.name, format);
  if (wrapped.trim().length === 0) return null;
  return { ...base, isChatHistory: false, messages: [{ role: section.role, content: wrapped }] };
}

/**
 * What a section says, before it is wrapped.
 *
 * A section with no marker is the player's own writing and is macro-folded. A
 * marker is expanded from the villager, the player, the transcript or the
 * village's knowledge — and only the parts that came out of a card are folded
 * again, because a card is written material like any other and `{{user}}` in a
 * description means the player.
 *
 * Anything else expands to nothing. `chat_summary`, `agent_data` and
 * `id_macro_cards` are Engine concepts with no village equivalent, and a marker
 * the village cannot fill should cost the prompt its heading rather than leave
 * an empty tag behind, which teaches a model that tags mean nothing.
 */
function sectionText(
  section: NarrationSection,
  input: NarrationAssembleInput,
  format: NarrationWrapFormat,
  values: VillagePromptValues,
): string {
  if (section.marker === null) return fillVillageMacros(section.content, values);
  switch (section.marker.type) {
    case "character":
      return characterBlock(input.card, section.marker.characterFields, format, values);
    case "persona":
      // The player, in the village's own resolved words: a linked Persona's
      // description, or the name and description typed by hand while nothing is
      // linked. Already labelled paragraphs when a Persona supplied it, so it is
      // wrapped once by the section's own name rather than nested a second time
      // under a name the block already carries.
      return fillVillageMacros(input.player.description, values);
    case "dialogue_examples":
      return fillVillageMacros(input.card.exampleDialogue, values);
    case "lorebook":
    case "world_info_before":
    case "world_info_after":
      // The village's knowledge box, which is this village's whole answer to
      // "what does this person know". The Engine scans lorebooks into three
      // separate positions; a village has one knowledge body and one selected
      // lore excerpt set, so the first active marker supplies both.
      return [input.knowledge, values.lore].filter(Boolean).join("\n\n");
    default:
      return "";
  }
}
