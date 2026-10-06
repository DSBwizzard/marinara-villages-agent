import { asRecord, asString, asTrimmedString } from "./coerce.js";
import { villageEngineJson } from "./engine-transport.js";
import { boundText, MAX_ENGINE_ID_LENGTH } from "./prompt-preset.js";
import { villagesLogger } from "./runtime-host.js";

// Villages — the player's own Engine preset, read as the voice of a villager.
//
// A village conversation used to be written by two prompt boxes: one for how
// anyone here talks and one for what they know. That was the right shape with
// the wrong author. The Engine already has a preset system — the player has one
// they have tuned for their own chats, with their own sections, their own order,
// their own choices and their own generation parameters — and a villager is a
// character in a conversation. So the honest answer to "how do these people
// talk" is the preset the player already chose rather than a second box that
// lives inside a package and can never be as good as the thing they wrote.
//
// This module reads that preset. It reads it over the Engine's own loopback HTTP
// API, exactly as the spin-off picker has since 0.4.43, because there is no
// preset accessor on any capability host a package can reach: between them,
// `CapabilityRuntimeHost` and `CapabilityResourceHost` expose characters,
// personas, lorebooks and language models, and nothing else. `GET
// /api/prompts/:id/full` is the only door and it asks for no permission the
// package does not already hold.
//
// What comes back is RAW SQLITE ROWS rather than the shape the Engine's own
// assembler sees, so three things have to be undone before any of it is usable:
//
//   * `preset.parameters`, `preset.sectionOrder`, `preset.groupOrder`,
//     `preset.variableValues` and `section.markerConfig` are JSON *strings*.
//   * Booleans arrive as real booleans from this route, while the Engine's own
//     prompt path compares `section.enabled !== "true"` — a string against a
//     string. Both spellings have to be accepted, because a coercion that
//     followed only one of them would silently drop every section of a preset
//     and hand the model a villager with no character card at all.
//   * A section's marker is a JSON blob in a single column, and one that will not
//     parse has to read as "no marker" rather than throwing the preset away.
//
// Nothing here calls a model, nothing here writes anything, and a preset that
// cannot be read is `null` rather than an error: a village whose preset was
// deleted from the library still has to be able to hold a conversation, and the
// shipped preset at the bottom of this file is what it falls back to.

// ── Caps ─────────────────────────────────────────────────────────────────────

/**
 * The cap every narration turn is asked with when the player has not chosen
 * otherwise.
 *
 * It is the Engine's own default for a preset (`generationParametersSchema`
 * defaults `maxTokens` to 4096), so a village that changes nothing here is
 * asking for the same room the player's own chats get rather than a package
 * number. The old per-turn caps — 700 for a reply, 800 for a greeting — were
 * sized for a village that guessed, and a villager who thinks before they answer
 * spends most of 700 on the thinking and then has nothing left to say.
 */
export const NARRATION_MAX_TOKENS = 4096;

/** The two things the reply-length switch can say. */
export type NarrationReplyLength = "cap" | "preset";

/** What the reply-length switch says when the player has never touched it. */
export const NARRATION_REPLY_LENGTH_DEFAULT: NarrationReplyLength = "cap";

/** The label the narration preset picker gives the shipped preset. */
export const NARRATION_BUILT_IN_LABEL = "The village's own";

/**
 * What the shipped preset asks for, and only the shipped preset.
 *
 * Unchanged from the constant it replaces. A player who has not chosen a preset
 * is in the same village they were in before there was a picker, and the one
 * thing this release must not do is quietly rewrite how their villagers talk
 * while telling them nothing moved.
 */
export const NARRATION_BUILT_IN_TEMPERATURE = 0.85;

const MAX_NARRATION_SECTIONS = 200;
const MAX_NARRATION_GROUPS = 60;
const MAX_NARRATION_CHOICE_BLOCKS = 60;
const MAX_NARRATION_CHOICE_OPTIONS = 60;
const MAX_NARRATION_SECTION_LENGTH = 200_000;
const MAX_NARRATION_CHOICE_ANSWER_LENGTH = 600;
const MAX_NARRATION_CHOICE_ANSWERS = 24;
const MAX_NARRATION_PRESETS = 200;
const MAX_NARRATION_PRESET_NAME_LENGTH = 120;
/** What the Engine joins a multi-select choice with when it names no separator. */
const DEFAULT_CHOICE_SEPARATOR = ", ";

// ── What a preset is, as a village uses one ──────────────────────────────────

export type NarrationPresetRole = "system" | "user" | "assistant";
export type NarrationWrapFormat = "xml" | "markdown" | "none";

/**
 * The markers a village can fill in, out of the ten the Engine defines.
 *
 * The three this list leaves out are left out on purpose rather than by
 * omission. `chat_summary` and `agent_data` are the Engine's own bookkeeping for
 * a chat it assembled: a village has no summary of a chat it does not own, and
 * the only agent data here is the village snapshot, which is already the
 * knowledge box. `id_macro_cards` is a library-wide lookup a package cannot do.
 * All three resolve to nothing, so a player's preset that contains them reads
 * exactly as it does in a chat with no summary yet.
 */
export type NarrationMarkerType =
  | "character"
  | "lorebook"
  | "persona"
  | "chat_history"
  | "dialogue_examples"
  | "world_info_before"
  | "world_info_after";

const MARKER_TYPES: readonly NarrationMarkerType[] = [
  "character",
  "lorebook",
  "persona",
  "chat_history",
  "dialogue_examples",
  "world_info_before",
  "world_info_after",
];

/**
 * The card fields a `character` marker expands when it names none.
 *
 * Exported because the assembler needs the same list for the one case the preset
 * cannot supply it — see the character fallback in `narration-prompt.ts`. Two
 * copies of six strings would be two answers to "what is a character".
 */
export const CHARACTER_FIELD_NAMES: readonly string[] = [
  "description",
  "personality",
  "scenario",
  "backstory",
  "appearance",
  "system_prompt",
];

export type NarrationMarkerConfig = {
  type: NarrationMarkerType;
  /**
   * Which of the card's fields a `character` marker should expand.
   *
   * `name` and `post_history_instructions` are never among them. The name is the
   * wrapper rather than a field inside it, and a card's post-history
   * instructions are the one part of a card the Engine treats as an override
   * rather than as material — which is the same reason the village's own turn
   * block is the last thing in this prompt.
   */
  characterFields: readonly string[];
};

export type NarrationSection = {
  identifier: string;
  name: string;
  content: string;
  role: NarrationPresetRole;
  marker: NarrationMarkerConfig | null;
  groupId: string;
  /** `depth` sections are injected into the transcript; `ordered` sections are the prompt. */
  injectionPosition: "ordered" | "depth";
  injectionDepth: number;
};

export type NarrationGroup = {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
};

export type NarrationChoiceOption = {
  value: string;
  label: string;
};

export type NarrationChoiceBlock = {
  variableName: string;
  question: string;
  options: readonly NarrationChoiceOption[];
  multiSelect: boolean;
  separator: string;
  randomPick: boolean;
  /**
   * How the Engine asked for this question to be drawn, resolved to its three
   * values.
   *
   * Carried although the assembler never reads it, because the settings panel
   * does: the question control is the one the spin-off popup already uses, and
   * that control decides between a row of pills and a list from exactly these
   * two fields. Dropping them here would not make the question simpler to ask,
   * it would make the panel invent a fourth answer to a question the preset's
   * author already answered.
   */
  displayMode: "auto" | "buttons" | "listbox";
  /** The order the Engine lists the options in. Only `alphabetical` reorders. */
  optionSort: "manual" | "alphabetical";
};

/** One answered choice: a value, or the values of a multi-select. */
export type NarrationChoiceAnswer = string | string[];
/** Every answer a village has stored, keyed by the preset's variable name. */
export type NarrationChoiceAnswers = Record<string, NarrationChoiceAnswer>;

/** The reasoning effort a preset may ask for, in the capability host's own words. */
export type NarrationReasoningEffort = "none" | "low" | "medium" | "high" | "xhigh" | "max";

/** The verbosity a preset may ask for. */
export type NarrationVerbosity = "low" | "medium" | "high";

/**
 * The generation settings a village takes from the player's preset.
 *
 * This is a deliberate subset of the Engine's `generationParametersSchema`, and
 * the subset is set by what a capability package can actually pass through. The
 * Engine's package-facing completion call accepts temperature, a token cap,
 * reasoning effort and verbosity, and nothing else — no top-p, no penalties, no
 * stop sequences, no assistant prefill — so reading those out of the preset
 * would be reading values that could never reach the model. What is here is what
 * survives the trip.
 */
export type NarrationParameters = {
  temperature: number;
  maxTokens: number;
  reasoningEffort: NarrationReasoningEffort | null;
  verbosity: NarrationVerbosity | null;
  temperatureEnabled: boolean;
  reasoningEffortEnabled: boolean;
  verbosityEnabled: boolean;
  squashSystemMessages: boolean;
  strictRoleFormatting: boolean;
  singleUserMessage: boolean;
};

export type NarrationPreset = {
  /** The Engine's preset id, or `""` for the shipped preset. */
  id: string;
  name: string;
  wrapFormat: NarrationWrapFormat;
  parameters: NarrationParameters;
  sections: readonly NarrationSection[];
  groups: readonly NarrationGroup[];
  choiceBlocks: readonly NarrationChoiceBlock[];
  /** The preset's own saved answers, used when the village has not answered. */
  variableValues: Readonly<NarrationChoiceAnswers>;
};

export type NarrationPresetOption = {
  id: string;
  name: string;
};

export type NarrationPresetPicker = {
  presets: readonly NarrationPresetOption[];
  builtInLabel: string;
};

// ── Raw-row coercion ─────────────────────────────────────────────────────────

/** A column the Engine stores as JSON text, read back into a value. */
function readJsonColumn(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const text = value.trim();
  if (text.length === 0) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    // A row this package cannot parse is a row it uses the default for. The
    // alternative — throwing — would make a corrupt preset take the whole
    // conversation with it, and the player has no way to see or fix the column.
    return null;
  }
}

/**
 * A boolean that arrives in either of the two spellings the Engine uses.
 *
 * The Engine's assembler compares `section.enabled !== "true"`, so a real `true`
 * reaching it would read as disabled. This route hands over real booleans. Both
 * have to be believed here, because believing only `"true"` drops every section
 * of every preset the panel wrote, and believing only `true` drops every preset
 * the Engine's own service layer wrote.
 */
function asFlag(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function asIdentifier(value: unknown): string {
  // Rows carry text ids, but a database that has been through more than one
  // migration can hand over an integer primary key, and an id this package
  // silently discarded would be a section that could not be placed in the order
  // the player arranged.
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return boundText(value, MAX_ENGINE_ID_LENGTH);
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}

function readMarker(value: unknown): NarrationMarkerConfig | null {
  const raw = asRecord(readJsonColumn(value));
  const type = asString(raw.type);
  if (!MARKER_TYPES.includes(type as NarrationMarkerType)) return null;
  const declared = raw.characterFields;
  const fields =
    Array.isArray(declared) && declared.length > 0
      ? declared.filter((field): field is string => typeof field === "string")
      : [];
  return {
    type: type as NarrationMarkerType,
    // A marker with no field list of its own gets the Engine's default list,
    // which is these six fields in this order.
    characterFields: fields.length > 0 ? fields : [...CHARACTER_FIELD_NAMES],
  };
}

function readSection(value: unknown): NarrationSection | null {
  const raw = asRecord(value);
  // The Engine's own path skips a disabled section, a section belonging to a
  // disabled group and a section with an unreadable marker. All three are
  // decided here instead of at assembly time, so the assembler runs over the
  // prompt the player actually described and nothing else.
  if (!asFlag(raw.enabled)) return null;
  const name = boundText(raw.name, MAX_NARRATION_PRESET_NAME_LENGTH);
  const marker = readMarker(raw.markerConfig);
  const content = asTrimmedString(raw.content);
  // A section with neither text nor a marker contributes nothing, and keeping it
  // would let an empty section open and close an empty wrapper in the prompt.
  if (name.length === 0 && content.length === 0 && marker === null) return null;
  const role = asString(raw.role);
  const position = asString(raw.injectionPosition);
  const depth = raw.injectionDepth;
  return {
    // The section's own row id, because that is what `preset.sectionOrder`
    // holds: the Engine walks the order and looks each id up in a map keyed by
    // exactly this column. `identifier` is the fallback for a row that has one
    // and no id, which is a shape older documents were written in.
    identifier: asIdentifier(raw.id !== undefined && raw.id !== null ? raw.id : raw.identifier),
    name: name.length > 0 ? name : marker !== null ? marker.type : "Prompt",
    content: content.slice(0, MAX_NARRATION_SECTION_LENGTH),
    role: role === "user" || role === "assistant" ? role : "system",
    marker,
    groupId: asIdentifier(raw.groupId),
    injectionPosition: position === "depth" ? "depth" : "ordered",
    injectionDepth: typeof depth === "number" && Number.isFinite(depth) && depth >= 0 ? Math.floor(depth) : -1,
  };
}

function readGroup(value: unknown): NarrationGroup | null {
  const raw = asRecord(value);
  // A disabled group takes its sections with it, which is what the Engine does:
  // it reads the group's `enabled` flag before it will read any of its members.
  if (!asFlag(raw.enabled)) return null;
  const id = asIdentifier(raw.id);
  if (id.length === 0) return null;
  return {
    id,
    name: boundText(raw.name, MAX_NARRATION_PRESET_NAME_LENGTH),
    enabled: true,
    order: typeof raw.order === "number" && Number.isFinite(raw.order) ? raw.order : 0,
  };
}

function readChoiceOptions(value: unknown): NarrationChoiceOption[] {
  const parsed = readJsonColumn(value);
  if (!Array.isArray(parsed)) return [];
  const options: NarrationChoiceOption[] = [];
  for (const entry of parsed) {
    if (options.length >= MAX_NARRATION_CHOICE_OPTIONS) break;
    const option = asRecord(entry);
    const optionValue = asTrimmedString(option.value);
    // The Engine keeps only options whose `value` is a string, and so does this:
    // an option with no value has nothing to store as an answer and nothing for
    // the macro engine to resolve a preset variable to.
    if (optionValue.length === 0) continue;
    const label = asTrimmedString(option.label);
    options.push({
      value: optionValue.slice(0, MAX_NARRATION_CHOICE_ANSWER_LENGTH),
      label: (label.length > 0 ? label : optionValue).slice(0, MAX_NARRATION_PRESET_NAME_LENGTH),
    });
  }
  return options;
}

function readChoiceBlock(value: unknown): NarrationChoiceBlock | null {
  const raw = asRecord(value);
  const variableName = asTrimmedString(raw.variableName);
  const options = readChoiceOptions(raw.options);
  // A question with nothing to choose between is not a question. The Engine
  // renders it as a listbox with a first-option fallback, which is a control the
  // player can see and cannot use.
  if (variableName.length === 0 || options.length === 0) return null;
  const separator = asString(raw.separator);
  return {
    variableName: variableName.slice(0, MAX_ENGINE_ID_LENGTH),
    question: boundText(raw.question, MAX_NARRATION_PRESET_NAME_LENGTH),
    options,
    multiSelect: asFlag(raw.multiSelect),
    separator: separator.length > 0 ? separator : DEFAULT_CHOICE_SEPARATOR,
    randomPick: asFlag(raw.randomPick),
    // Two values that cannot survive are the default rather than a fourth mode
    // nobody implements: the Engine's own reader makes the same call.
    displayMode: raw.displayMode === "buttons" || raw.displayMode === "listbox" ? raw.displayMode : "auto",
    optionSort: raw.optionSort === "alphabetical" ? "alphabetical" : "manual",
  };
}

// ── Generation parameters ────────────────────────────────────────────────────

/**
 * The Engine's shipped defaults, repeated here rather than imported.
 *
 * `DEFAULT_GENERATION_PARAMS` and `generationParametersSchema` both live in
 * `@marinara-engine/shared`, and this package cannot reach them: the module is
 * aliased at build time but is not resolvable where these sources actually run,
 * which is why every import of it in this package is a type-only import. So the
 * handful of values that matter are written out, and the one that is policy
 * rather than a number names `NARRATION_MAX_TOKENS` so the two provably agree.
 */
const PARAMETER_DEFAULTS = {
  temperature: 1,
  maxTokens: NARRATION_MAX_TOKENS,
  squashSystemMessages: true,
  strictRoleFormatting: true,
  singleUserMessage: false,
};

const REASONING_EFFORTS = ["none", "low", "medium", "high", "xhigh", "max"] as const;
const VERBOSITIES = ["low", "medium", "high"] as const;

/**
 * The Engine's reasoning-effort words as the words a capability call takes.
 *
 * The two enums differ by exactly one member and it is the biggest one: a preset
 * stores `maximum` and the package-facing completion option stores `max`. Read
 * across unchanged, "maximum" is not in the option's union, so the effort the
 * player chose is dropped at the exact setting where dropping it costs the most.
 */
function toReasoningEffort(value: unknown): NarrationParameters["reasoningEffort"] {
  if (value === "maximum") return "max";
  if (typeof value !== "string") return null;
  return (REASONING_EFFORTS as readonly string[]).includes(value)
    ? (value as NarrationParameters["reasoningEffort"])
    : null;
}

function toVerbosity(value: unknown): NarrationParameters["verbosity"] {
  if (typeof value !== "string") return null;
  return (VERBOSITIES as readonly string[]).includes(value) ? (value as NarrationParameters["verbosity"]) : null;
}

/**
 * A preset's generation parameters, with every bad field replaced rather than
 * the whole object.
 *
 * This is the Engine's own posture — it parses the merged object and, on
 * failure, falls back field by field — and it matters here because the column
 * arrives as text written by hand, by an older build, or by a build that spelled
 * an enum differently. One unreadable number should cost the player that number,
 * not their temperature, their effort and their cap together.
 *
 * `enabledParameters` is read as a veto rather than as a whitelist: the Engine
 * ships it empty, which means everything on, so a key that is not `false` is on.
 */
export function parseNarrationParameters(value: unknown): NarrationParameters {
  const raw = asRecord(readJsonColumn(value));
  const enabled = asRecord(raw.enabledParameters);
  const on = (key: string): boolean => enabled[key] !== false;
  return {
    temperature: clampNumber(raw.temperature, 0, 2, PARAMETER_DEFAULTS.temperature),
    maxTokens: Math.round(clampNumber(raw.maxTokens, 1, 200_000, PARAMETER_DEFAULTS.maxTokens)),
    reasoningEffort: toReasoningEffort(raw.reasoningEffort),
    verbosity: toVerbosity(raw.verbosity),
    temperatureEnabled: on("temperature"),
    reasoningEffortEnabled: on("reasoningEffort"),
    verbosityEnabled: on("verbosity"),
    // The three structural switches are not gated by `enabledParameters` in the
    // Engine either: they decide how the assembled messages are shaped, and the
    // shape is the package's business rather than the model's.
    squashSystemMessages:
      raw.squashSystemMessages === undefined
        ? PARAMETER_DEFAULTS.squashSystemMessages
        : asFlag(raw.squashSystemMessages),
    strictRoleFormatting:
      raw.strictRoleFormatting === undefined
        ? PARAMETER_DEFAULTS.strictRoleFormatting
        : asFlag(raw.strictRoleFormatting),
    singleUserMessage:
      raw.singleUserMessage === undefined ? PARAMETER_DEFAULTS.singleUserMessage : asFlag(raw.singleUserMessage),
  };
}

function readWrapFormat(value: unknown): NarrationWrapFormat {
  const format = asString(value);
  return format === "markdown" || format === "none" ? format : "xml";
}

// ── Reading a preset ─────────────────────────────────────────────────────────

/**
 * One preset's full document, or `null` when it cannot be read.
 *
 * Everything that can go wrong goes wrong quietly and in the same way: a preset
 * deleted between the picker being drawn and the turn being sent, an Engine that
 * is not answering, a marker column that will not parse. In all of them the
 * caller wants the village's own preset, because the alternative is a villager
 * who cannot speak at all — and the one thing that must never happen is a failed
 * preset read surfacing as a failed reply.
 */
export async function readNarrationPreset(presetId: string, signal?: AbortSignal): Promise<NarrationPreset | null> {
  const id = asTrimmedString(presetId).slice(0, MAX_ENGINE_ID_LENGTH);
  if (id.length === 0) return null;
  try {
    const body = await villageEngineJson<unknown>(`/api/prompts/${encodeURIComponent(id)}/full`, { signal });
    const envelope = asRecord(body);
    // The route answers `{preset, sections, groups, choiceBlocks}` and every one
    // of the four is read defensively: a response missing three of them is a
    // preset with no sections, which is a village with no character card, so the
    // shape is checked rather than assumed.
    const presetRow = asRecord(envelope.preset);
    const sections: NarrationSection[] = [];
    for (const entry of Array.isArray(envelope.sections) ? envelope.sections : []) {
      if (sections.length >= MAX_NARRATION_SECTIONS) break;
      const section = readSection(entry);
      if (section !== null) sections.push(section);
    }
    const groups: NarrationGroup[] = [];
    for (const entry of Array.isArray(envelope.groups) ? envelope.groups : []) {
      if (groups.length >= MAX_NARRATION_GROUPS) break;
      const group = readGroup(entry);
      if (group !== null) groups.push(group);
    }
    const choiceBlocks: NarrationChoiceBlock[] = [];
    for (const entry of Array.isArray(envelope.choiceBlocks) ? envelope.choiceBlocks : []) {
      if (choiceBlocks.length >= MAX_NARRATION_CHOICE_BLOCKS) break;
      const block = readChoiceBlock(entry);
      if (block !== null) choiceBlocks.push(block);
    }
    // A preset with no readable sections is not a prompt. Falling back here as
    // well as in the caller means no future caller can assemble a turn out of an
    // empty document and get a villager with no card and no world.
    if (sections.length === 0) return null;
    return {
      id,
      name: boundText(presetRow.name, MAX_NARRATION_PRESET_NAME_LENGTH),
      wrapFormat: readWrapFormat(presetRow.wrapFormat),
      parameters: parseNarrationParameters(presetRow.parameters),
      sections: orderSections(sections, readJsonColumn(presetRow.sectionOrder)),
      groups,
      choiceBlocks,
      variableValues: coerceNarrationAnswers(readJsonColumn(presetRow.variableValues)),
    };
  } catch (cause) {
    signal?.throwIfAborted();
    villagesLogger().debug("villages: could not read narration preset %s: %s", id, String(cause));
    return null;
  }
}

/**
 * A preset's sections in the order the player arranged them.
 *
 * The rows come back in whatever order the table holds them, and the order that
 * matters is a separate JSON column — the same split the Engine's own assembler
 * works with, where it walks `sectionOrder` and looks each id up in a map. A
 * preset whose sections were read in row order would put a player's character
 * card after their jailbreak, which is a different prompt wearing the same text.
 *
 * The order names ids. Anything the order does not name is kept and put at the
 * end rather than dropped: an unlisted section is a section the player can see
 * in the editor, and a package that silently deleted it would be the worst
 * possible reading of a column it could not fully parse. An order that is empty
 * or unreadable falls back to row order, which is the only other thing it could
 * sensibly mean.
 */
function orderSections(sections: readonly NarrationSection[], order: unknown): NarrationSection[] {
  if (!Array.isArray(order) || order.length === 0) return [...sections];
  const byId = new Map(sections.map((section) => [section.identifier, section]));
  const ordered: NarrationSection[] = [];
  const seen = new Set<string>();
  for (const entry of order) {
    const id = asIdentifier(entry);
    if (id.length === 0 || seen.has(id)) continue;
    const section = byId.get(id);
    if (section === undefined) continue;
    ordered.push(section);
    seen.add(id);
  }
  for (const section of sections) if (!seen.has(section.identifier)) ordered.push(section);
  return ordered;
}

/**
 * Every preset the player has, for the narration picker.
 *
 * Deliberately its own read rather than the spin-off picker's. The two lists are
 * the same rows and want different words around them — the spin-off one names the
 * default "The chat's own default" because a spin-off is a chat, and this one
 * names it "The village's own" because a village is not — and the spin-off
 * reader is private to a module that would then have to be imported by the
 * settings store. One small read with its own label is cheaper than a cycle.
 */
export async function readNarrationPresetPicker(): Promise<NarrationPresetPicker> {
  try {
    const body = await villageEngineJson<unknown>("/api/prompts/");
    const envelope = asRecord(body);
    const rows = Array.isArray(body) ? body : Array.isArray(envelope.presets) ? (envelope.presets as unknown[]) : [];
    const presets: NarrationPresetOption[] = [];
    for (const entry of rows) {
      if (presets.length >= MAX_NARRATION_PRESETS) break;
      const row = asRecord(entry);
      const id = asIdentifier(row.id);
      const name = boundText(row.name, MAX_NARRATION_PRESET_NAME_LENGTH);
      // A preset with no name cannot be offered: the picker would draw a button
      // with nothing written on it, and the player would have no way to tell it
      // from the next one.
      if (id.length === 0 || name.length === 0) continue;
      presets.push({ id, name });
    }
    return { presets, builtInLabel: NARRATION_BUILT_IN_LABEL };
  } catch (cause) {
    villagesLogger().debug("villages: could not list narration presets: %s", String(cause));
    return { presets: [], builtInLabel: NARRATION_BUILT_IN_LABEL };
  }
}

// ── Choices ──────────────────────────────────────────────────────────────────

/**
 * A stored answer, filtered down to the options that still exist.
 *
 * `undefined` means "this source has not answered", and the ways of
 * not-answering have to stay distinguishable from answering: no value at all, a
 * value naming an option the preset has since renamed, and a multi-select whose
 * every entry is gone. All of them come back `undefined` so the caller falls
 * through to the next source, which is what the Engine does with
 * `sanitizeChoiceSelection` and what makes a renamed option optional rather than
 * fatal.
 */
function sanitizeChoiceSelection(
  value: unknown,
  options: readonly NarrationChoiceOption[],
  multiSelect: boolean,
): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  const valid = new Set(options.map((option) => option.value));
  if (Array.isArray(value)) {
    const kept: string[] = [];
    for (const entry of value) {
      if (typeof entry !== "string" || !valid.has(entry) || kept.includes(entry)) continue;
      kept.push(entry);
    }
    if (kept.length === 0) return undefined;
    // A multi-select answered with a list is answered. One answered with a
    // single value is still one answer: a checkbox group and a preset's stored
    // default are written by different hands, and both are meant.
    return multiSelect ? kept : kept.slice(0, 1);
  }
  if (typeof value !== "string") return undefined;
  return valid.has(value) ? [value] : undefined;
}

/**
 * Coerce whatever a village has stored into the answers map.
 *
 * Unknown keys are kept rather than dropped, for the same reason the spin-off
 * lane keeps them: a preset's question can be renamed, the player's answer to the
 * old name is still the only thing they ever said about it, and the alternative
 * is a village that forgets a choice because a preset was edited.
 */
export function coerceNarrationAnswers(value: unknown): NarrationChoiceAnswers {
  const raw = readJsonColumn(value);
  // An array is not an answers map, and `asRecord` would happily turn one into
  // `{"0": ...}`. Anything that is not a plain object reads as no answers.
  if (Array.isArray(raw)) return {};
  const record = asRecord(raw);
  const answers: NarrationChoiceAnswers = {};
  let kept = 0;
  for (const [key, entry] of Object.entries(record)) {
    if (kept >= MAX_NARRATION_CHOICE_ANSWERS) break;
    const name = asIdentifier(key);
    if (name.length === 0) continue;
    if (Array.isArray(entry)) {
      const values: string[] = [];
      for (const item of entry) {
        if (values.length >= MAX_NARRATION_CHOICE_OPTIONS) break;
        const text = boundText(item, MAX_NARRATION_CHOICE_ANSWER_LENGTH);
        if (text.length > 0 && !values.includes(text)) values.push(text);
      }
      if (values.length === 0) continue;
      answers[name] = values;
      kept += 1;
      continue;
    }
    const text = boundText(entry, MAX_NARRATION_CHOICE_ANSWER_LENGTH);
    if (text.length === 0) continue;
    answers[name] = text;
    kept += 1;
  }
  return answers;
}

/**
 * The value every choice variable resolves to for one turn.
 *
 * The precedence is the player's stored answer, then the preset's own saved
 * default, then the first option — and the third step is not a fallback added
 * here, it is the behaviour the Engine has: its injection loop writes
 * `options[0].value` whenever nothing was selected, so a choice variable that
 * appears in a section always reads as SOMETHING. Reproducing that rather than
 * leaving the variable unresolved is the difference between a villager who
 * tenses correctly and a villager whose prompt contains the literal text
 * `{{tense}}`.
 */
export function resolveNarrationChoices(
  blocks: readonly NarrationChoiceBlock[],
  presetDefaults: Readonly<NarrationChoiceAnswers>,
  answers: Readonly<NarrationChoiceAnswers>,
): Record<string, string> {
  const resolved: Record<string, string> = {};
  for (const block of blocks) {
    const selected =
      sanitizeChoiceSelection(answers[block.variableName], block.options, block.multiSelect) ??
      sanitizeChoiceSelection(presetDefaults[block.variableName], block.options, block.multiSelect);
    if (selected === undefined) {
      const first = block.options[0];
      if (first !== undefined) resolved[block.variableName] = first.value;
      continue;
    }
    if (block.multiSelect) {
      // The Engine's order, and for the Engine's reason: a random pick is a pick,
      // so it happens before anything is joined, and an empty multi-select is the
      // first option rather than an empty string.
      const picked = block.randomPick ? [selected[Math.floor(Math.random() * selected.length)] ?? ""] : selected;
      resolved[block.variableName] = picked.length > 0 ? picked.join(block.separator) : (block.options[0]?.value ?? "");
      continue;
    }
    // A single-select answered with several values takes the first, which is
    // what the Engine's `sanitizeChoiceSelection` does with a stored array.
    resolved[block.variableName] = selected[0] ?? block.options[0]?.value ?? "";
  }
  return resolved;
}

// ── The shipped preset ───────────────────────────────────────────────────────

/**
 * The one line of the shipped preset that is not a marker.
 *
 * It exists because a block of a character's own past dialogue sitting in a
 * prompt with nothing said about it is read as a template, and a villager who
 * answers by reaching for lines the card already contains is the parroting
 * failure the Engine names outright in its own default preset. It is short
 * because the examples do the rest of the work.
 */
const NARRATION_REGISTER_NOTE = [
  "The lines below are things this character has said before, written the way they talk.",
  "They show the register to write in rather than lines to reuse: never echo or paraphrase them, and let new sentences come out in your own way.",
].join("\n");

/**
 * What a villager is told when the player has chosen no preset.
 *
 * A real preset in every sense that matters — the same section shape, the same
 * markers, the same wrap format — rather than a hand-written string, so there is
 * exactly ONE code path that assembles a narration prompt. A village that never
 * opens this setting and a village that picks a preset are the same assembler
 * over different documents, which is what makes the player's preset a
 * replacement rather than a second mode that can rot.
 *
 * Five sections, and each stands where it does for a reason:
 *
 *   * the village first, because where somebody is and who else is there is the
 *     frame every other sentence in the prompt is read inside;
 *   * the card second, including its own `systemPrompt` as one of its fields,
 *     which is where a card author's instructions belong — inside the character
 *     rather than loose in the prompt where they read as the host talking;
 *   * the register note third, because its whole job is to introduce the lines
 *     under it, and a note about example lines that arrives before the character
 *     has been described has nothing to attach to;
 *   * the card's example dialogue fourth;
 *   * the conversation LAST, nearest the line being answered.
 *
 * The history marker is not decoration and it is not the same as having none.
 * Without it the conversation is pasted into the system message as text; with it
 * the turns are real user and assistant messages framed in `<chat_history>` and the
 * new line lands in `<last_message>`, which is what the Engine sends and what a
 * model reads as a conversation rather than as a transcript. This package's own
 * preset takes the better of the two even though the repair exists for presets
 * that leave the marker out.
 *
 * The wrap format is `xml`, the Engine's own default, so the knowledge box's
 * macros land inside a named tag and the card's fields arrive with the labels
 * that tell the model which is which. Under `none` the six fields of a card run
 * together into one paragraph with nothing marking where personality ended and
 * backstory began.
 */
export const NARRATION_BUILT_IN_PRESET: NarrationPreset = {
  id: "",
  name: NARRATION_BUILT_IN_LABEL,
  wrapFormat: "xml",
  // Everything else is the Engine's own default; the temperature is the one this
  // package used before the preset existed, and it stays the fallback's value so
  // that a village which never picks a preset gets exactly the replies it got
  // before there was a picker. Changing the temperature of the no-preset path
  // would be a silent rewrite of somebody's villagers.
  parameters: { ...parseNarrationParameters(null), temperature: NARRATION_BUILT_IN_TEMPERATURE },
  groups: [],
  choiceBlocks: [],
  variableValues: {},
  sections: [
    {
      identifier: "villages-narration-village",
      name: "Village",
      content: "",
      role: "system",
      marker: { type: "lorebook", characterFields: [...CHARACTER_FIELD_NAMES] },
      groupId: "",
      injectionPosition: "ordered",
      injectionDepth: -1,
    },
    {
      identifier: "villages-narration-character",
      name: "Character",
      content: "",
      role: "system",
      marker: { type: "character", characterFields: [...CHARACTER_FIELD_NAMES] },
      groupId: "",
      injectionPosition: "ordered",
      injectionDepth: -1,
    },
    {
      identifier: "villages-narration-speak",
      name: "How they speak",
      content: NARRATION_REGISTER_NOTE,
      role: "system",
      marker: null,
      groupId: "",
      injectionPosition: "ordered",
      injectionDepth: -1,
    },
    {
      identifier: "villages-narration-examples",
      name: "Things they have said",
      content: "",
      role: "system",
      marker: { type: "dialogue_examples", characterFields: [...CHARACTER_FIELD_NAMES] },
      groupId: "",
      injectionPosition: "ordered",
      injectionDepth: -1,
    },
    // Named for the drawer's sake only. The assembler frames this marker with the
    // Engine's own `<chat_history>` and `<last_message>` tags rather than with the
    // section name, because those are the tags the model has been trained to read
    // and a name of the player's choosing is not a place to be clever.
    {
      identifier: "villages-narration-history",
      name: "Chat History",
      content: "",
      role: "user",
      marker: { type: "chat_history", characterFields: [...CHARACTER_FIELD_NAMES] },
      groupId: "",
      injectionPosition: "ordered",
      injectionDepth: -1,
    },
  ],
};

/**
 * One of a card's fields, as a `character` marker names it.
 *
 * `name` and `post_history_instructions` are refused here rather than at the
 * call site, so a preset that names them gets nothing instead of the character's
 * name printed inside their own card.
 */
export function characterFieldValue(
  card: {
    description: string;
    personality: string;
    scenario: string;
    backstory: string;
    appearance: string;
    systemPrompt: string;
  },
  field: string,
): string {
  switch (field) {
    case "description":
      return card.description;
    case "personality":
      return card.personality;
    case "scenario":
      return card.scenario;
    case "backstory":
      return card.backstory;
    case "appearance":
      return card.appearance;
    case "system_prompt":
    case "systemPrompt":
      return card.systemPrompt;
    default:
      return "";
  }
}
