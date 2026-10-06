// Active venue writing uses the per-village state below. The older preset
// document and its helpers remain readable for legacy data and regressions,
// but venue generation never reads them.
import { asRecord, asTrimmedString } from "./coerce.js";
import { badRequest } from "./errors.js";
import {
  DEFAULT_VILLAGER_REPLY_GUIDANCE,
  VILLAGER_REPLY_GUIDANCE_MAX_LENGTH,
  WRITING_GUIDANCE_MAX_LENGTH,
  type VillageNarrationStyle,
} from "./narration-style.js";
import {
  coerceNarrationAnswers,
  NARRATION_BUILT_IN_LABEL,
  NARRATION_BUILT_IN_PRESET,
  NARRATION_MAX_TOKENS,
  NARRATION_REPLY_LENGTH_DEFAULT,
  readNarrationPreset,
  readNarrationPresetPicker,
  resolveNarrationChoices,
  type NarrationChoiceAnswers,
  type NarrationPreset,
  type NarrationPresetOption,
  type NarrationReasoningEffort,
  type NarrationReplyLength,
  type NarrationVerbosity,
} from "./narration-preset.js";
import { VILLAGES_PACKAGE_ID, villagesDocuments } from "./package-runtime.js";
import { boundText, MAX_ENGINE_ID_LENGTH } from "./prompt-preset.js";
import { mutateDocument, mutateVillageState, readVillageState, type DocumentSlot } from "./village-store.js";

const NARRATION_DOC_ID = "villages-narration";
const NARRATION_DOC_KIND = "settings";
const NARRATION_DOC_NAME = "Narration settings";
export const VILLAGE_VOICE_GUIDANCE_MAX_LENGTH = VILLAGER_REPLY_GUIDANCE_MAX_LENGTH;

/**
 * The shared rule for how distinct residents stay distinct. This borrows Game
 * Mode's useful voice checks without turning a quiet village visit into a
 * plot-directed scene.
 *
 * TODO: If Villages later gets authored social arcs, keep them in the live
 * village-context block. This guidance protects resident fidelity; it must not
 * make every conversation advance an arc.
 */
export const DEFAULT_VILLAGE_VOICE_GUIDANCE = DEFAULT_VILLAGER_REPLY_GUIDANCE;

export type VillageNarrationSettings = {
  /** The Engine's preset id, or `""` for the shipped preset. */
  presetId: string;
  /** What the player answered to that preset's questions. */
  choices: NarrationChoiceAnswers;
  /** Whether the reply cap is this package's or the preset's own. */
  replyLength: NarrationReplyLength;
  /** Shared, player-editable guardrails that protect each resident's own voice. */
  voiceGuidance: string;
};

export function defaultVillageNarrationSettings(): VillageNarrationSettings {
  return {
    presetId: "",
    choices: {},
    replyLength: NARRATION_REPLY_LENGTH_DEFAULT,
    voiceGuidance: DEFAULT_VILLAGE_VOICE_GUIDANCE,
  };
}

/**
 * A stored document as settings.
 *
 * The length cap is applied on read as well as on write, for the same reason the
 * prompt box's is: a hand-edited document must not be able to slip past what the
 * route enforces. Anything unreadable becomes the default rather than an error,
 * because every field here has a safe answer and none of them is worth refusing
 * a conversation over.
 */
export function coerceVillageNarrationSettings(value: unknown): VillageNarrationSettings {
  const raw = asRecord(value);
  const fallback = defaultVillageNarrationSettings();
  return {
    presetId: boundText(raw.presetId, MAX_ENGINE_ID_LENGTH),
    choices: raw.choices === undefined ? fallback.choices : coerceNarrationAnswers(raw.choices),
    replyLength: raw.replyLength === "preset" ? "preset" : fallback.replyLength,
    voiceGuidance: boundText(raw.voiceGuidance, VILLAGE_VOICE_GUIDANCE_MAX_LENGTH) || fallback.voiceGuidance,
  };
}

const narrationSlot: DocumentSlot<VillageNarrationSettings> = {
  kind: NARRATION_DOC_KIND,
  name: NARRATION_DOC_NAME,
  description: "The preset the player writes their villagers with, and the answers it asked for.",
  coerce: coerceVillageNarrationSettings,
  label: () => NARRATION_DOC_NAME,
};

// ── The stored choice ────────────────────────────────────────────────────────

export async function readVillageNarrationSettings(): Promise<VillageNarrationSettings> {
  const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, NARRATION_DOC_ID);
  return coerceVillageNarrationSettings(record?.data);
}

/**
 * The same read, with an unreachable store read as "nothing chosen yet".
 *
 * The split is the same split the connections module makes, for the same reason.
 * The panel wants to be TOLD when the document store is down, because a settings
 * box that silently shows nothing is a lie. A villager's reply wants the
 * opposite: the shipped preset is already a complete answer, so a store that
 * hiccuped must cost the player a preference and not a conversation.
 */
async function narrationSettingsOrNothing(): Promise<VillageNarrationSettings> {
  try {
    return await readVillageNarrationSettings();
  } catch {
    return defaultVillageNarrationSettings();
  }
}

/** Write the keys that were given and leave the rest alone. */
export async function saveVillageNarrationSettings(
  patch: Partial<VillageNarrationSettings>,
): Promise<VillageNarrationSettings> {
  let next = defaultVillageNarrationSettings();
  await mutateDocument(NARRATION_DOC_ID, narrationSlot, (state) => {
    // The clearing is here rather than in the route so it cannot be forgotten by
    // a second caller. A preset swap that kept the old answers would hand the new
    // preset a Tense it never asked about from a question it never asked, and the
    // player would have no way to see where the wrong value came from.
    if (patch.presetId !== undefined && patch.presetId !== state.presetId) state.choices = {};
    if (patch.presetId !== undefined) state.presetId = patch.presetId;
    if (patch.choices !== undefined) state.choices = patch.choices;
    if (patch.replyLength !== undefined) state.replyLength = patch.replyLength;
    if (patch.voiceGuidance !== undefined) state.voiceGuidance = patch.voiceGuidance;
    next = state;
  });
  return next;
}

// ── What a chat turn needs ───────────────────────────────────────────────────

/**
 * Everything a narration turn takes from the player's preferences.
 *
 * One function rather than four, so a caller cannot import the parameters of a
 * preset that failed to load, or the choices of the last preset, or the cap of
 * whichever reply-length switch was last read. The preset, its answers and its
 * generation parameters all fall out of the same read.
 */
export type VillageNarrationTurn = {
  /** The document to assemble the prompt from. Never null: the shipped preset stands in. */
  preset: NarrationPreset;
  /** The player's Engine id, or `""` when the shipped preset is in use. */
  presetId: string;
  /** Every choice variable the preset asked about, resolved to one string each. */
  choices: Record<string, string>;
  /** How many tokens this turn may take. */
  maxTokens: number;
  /** The preset's temperature, or null when the preset switched it off. */
  temperature: number | null;
  reasoningEffort: NarrationReasoningEffort | null;
  verbosity: NarrationVerbosity | null;
  /** Retained for the retired room helper; venue sessions always use one shared reply. */
  groupReply: "room";
  /**
   * Who writes a turn when the player is talking to more than one villager.
   *
   * Carried here rather than read again by the room, for the same reason the
   * preset is: a room turn that read this for itself would be a second read of a
   * preference the turn is already holding, and the two could disagree inside one
   * line. A one-to-one turn ignores it, which is why it is on the shared type
   * rather than on the room's own.
   */
  voiceGuidance: string;
};

/**
 * The preset to write this turn with, and the numbers to write it under.
 *
 * A stored id that no longer resolves — a preset the player deleted in the
 * Engine, or an Engine that was not up when the read happened — falls back to
 * the shipped preset rather than to an error, and reports itself as the shipped
 * preset so nothing downstream quotes a name for something that was not used.
 *
 * The cap is the one place two answers are possible. `cap` is this package's own
 * 4096; `preset` is whatever the preset asked for, which is the honest reading of
 * "use my preset's cap" and is why the switch exists rather than a second number.
 * Either way the model's own ceiling is applied further down, in the chat turn
 * itself, because that ceiling belongs to the model rather than to either of us.
 */
export async function villageNarrationForTurn(signal?: AbortSignal): Promise<VillageNarrationTurn> {
  const settings = await narrationSettingsOrNothing();
  const chosen = settings.presetId.length > 0 ? await readNarrationPreset(settings.presetId, signal) : null;
  const preset = chosen ?? NARRATION_BUILT_IN_PRESET;
  const parameters = preset.parameters;
  return {
    preset,
    presetId: chosen === null ? "" : settings.presetId,
    choices: resolveNarrationChoices(preset.choiceBlocks, preset.variableValues, settings.choices),
    maxTokens: settings.replyLength === "preset" ? parameters.maxTokens : NARRATION_MAX_TOKENS,
    temperature: parameters.temperatureEnabled ? parameters.temperature : null,
    reasoningEffort: parameters.reasoningEffortEnabled ? parameters.reasoningEffort : null,
    verbosity: parameters.verbosityEnabled ? parameters.verbosity : null,
    groupReply: "room",
    voiceGuidance: settings.voiceGuidance,
  };
}

/**
 * A turn on the shipped preset, with the numbers the caller already has.
 *
 * The scene lane's opening line is not one of the four narration turns and does
 * not read this village's preset. A spin-off is an ordinary Engine roleplay chat
 * whose register is the CHAT's preset, and the opening has to sound like the rest
 * of a chat that preset will write — so it is written on the shipped preset, by
 * the chat's own connection, at the cap and temperature the scene lane has always
 * used. What it takes from this module is the ASSEMBLER, not the settings: one
 * prompt shape for every line a villager says, in both lanes, so the two cannot
 * drift into two different villagers.
 */
export function builtInNarrationTurn(options: { maxTokens: number; temperature: number | null }): VillageNarrationTurn {
  return {
    preset: NARRATION_BUILT_IN_PRESET,
    presetId: "",
    choices: {},
    maxTokens: options.maxTokens,
    temperature: options.temperature,
    reasoningEffort: null,
    verbosity: null,
    // A scene lane is one villager opening one chat, so there is no room here for
    // a group to answer. Named rather than left out, because a field with a
    // default is a field somebody will one day read out of a scene and believe.
    groupReply: "room",
    voiceGuidance: DEFAULT_VILLAGE_VOICE_GUIDANCE,
  };
}

// ── What the panel draws ─────────────────────────────────────────────────────

/** One option of one question, as the panel needs to draw it. */
export type VillageNarrationQuestionOption = { value: string; label: string };

/** One question the chosen preset asks, in the preset's own words. */
export type VillageNarrationQuestion = {
  variableName: string;
  question: string;
  options: VillageNarrationQuestionOption[];
  /** Several answers allowed, so the panel draws checkboxes rather than a radio. */
  multiSelect: boolean;
  /** What several answers are joined with, so the panel can say so. */
  separator: string;
  /** One is picked at random each turn, so "several" does not mean "all". */
  randomPick: boolean;
  /** The control the question asks for, and the order its options come in. */
  displayMode: "auto" | "buttons" | "listbox";
  optionSort: "manual" | "alphabetical";
};

/**
 * Everything the narration panel needs, in one answer.
 *
 * One read rather than four, and deliberately not part of the village snapshot.
 * The settings document is not village state and must survive "Reset the village
 * and start over", so it travels on a route of its own for the same reason the
 * connections do — and the preset itself is read live from the Engine every time
 * this is asked, because a preset the player edited ten seconds ago is the preset
 * they expect to see.
 *
 * `presetMissing` is a real state and not an error: a player can delete a preset
 * in the Engine while a village still names it. The panel says so, the villager
 * falls back to the shipped preset, and the way out is the picker that is already
 * on the screen.
 *
 * `maxTokens` and `presetMaxTokens` both travel because the reply-length switch
 * is a choice between two numbers and the panel has to be able to print both. A
 * switch that only showed the louder of the two would be asking the player to
 * decide without telling them what they were deciding.
 */
export type VillageNarrationView = {
  /** The stored id, or `""` for the shipped preset. */
  presetId: string;
  /** What that id is called, so the panel can name it before the list arrives. */
  presetName: string;
  /** The stored id no longer resolves, and the shipped preset is standing in. */
  presetMissing: boolean;
  /** The questions the CHOSEN preset asks — none for the shipped preset. */
  questions: VillageNarrationQuestion[];
  /** What the player answered to them. */
  choices: NarrationChoiceAnswers;
  replyLength: NarrationReplyLength;
  /** This package's own cap, which is what `cap` means. */
  maxTokens: number;
  /** The chosen preset's own cap, which is what `preset` means. */
  presetMaxTokens: number;
  /** Every preset in the Engine, plus the shipped one represented by `""`. */
  presets: readonly NarrationPresetOption[];
  /** The label the picker gives `""`. */
  builtInLabel: string;
  /** Legacy document's villager reply guidance. */
  voiceGuidance: string;
  /** The shipped villager reply guidance. */
  defaultVoiceGuidance: string;
};

/**
 * The whole panel, read once.
 *
 * Throws when the document store will not answer, which is the opposite of what
 * `villageNarrationForTurn` does with the same failure, and it is the same split
 * the connections module makes: a settings screen that silently shows nothing
 * while claiming to be the truth is worse than one that says it could not read.
 */
export async function readVillageNarration(): Promise<VillageNarrationView> {
  const settings = await readVillageNarrationSettings();
  const [picker, chosen] = await Promise.all([
    readNarrationPresetPicker(),
    settings.presetId.length > 0 ? readNarrationPreset(settings.presetId) : Promise.resolve(null),
  ]);
  const preset = chosen ?? NARRATION_BUILT_IN_PRESET;
  return {
    presetId: settings.presetId,
    presetName: chosen === null ? NARRATION_BUILT_IN_LABEL : chosen.name,
    presetMissing: settings.presetId.length > 0 && chosen === null,
    questions: preset.choiceBlocks.map((block) => ({
      variableName: block.variableName,
      question: block.question,
      options: block.options.map((option) => ({ value: option.value, label: option.label })),
      multiSelect: block.multiSelect,
      separator: block.separator,
      randomPick: block.randomPick,
      displayMode: block.displayMode,
      optionSort: block.optionSort,
    })),
    choices: settings.choices,
    replyLength: settings.replyLength,
    maxTokens: NARRATION_MAX_TOKENS,
    presetMaxTokens: preset.parameters.maxTokens,
    presets: picker.presets,
    builtInLabel: picker.builtInLabel,
    voiceGuidance: settings.voiceGuidance,
    defaultVoiceGuidance: DEFAULT_VILLAGE_VOICE_GUIDANCE,
  };
}

// ── Reading and writing it from the panel ────────────────────────────────────

/**
 * Apply a patch from the panel, leaving out whatever it did not send.
 *
 * Only the shape is checked here. Whether an id names a preset that still exists
 * is the Engine's question and the Engine's answer: it is asked when the preset
 * is read, and an id that does not resolve draws the shipped preset rather than a
 * broken conversation. An empty string is always accepted — that is the shipped
 * preset, and it is how a player undoes a choice.
 */
export async function saveVillageNarration(body: unknown): Promise<VillageNarrationSettings> {
  const patch = asRecord(body);
  const accepted: Partial<VillageNarrationSettings> = {};
  if (patch.presetId !== undefined) {
    const id = asTrimmedString(patch.presetId);
    if (id.length > MAX_ENGINE_ID_LENGTH) throw badRequest("That is not a preset id.");
    accepted.presetId = id;
  }
  if (patch.choices !== undefined) accepted.choices = coerceNarrationAnswers(patch.choices);
  if (patch.replyLength !== undefined) {
    const replyLength = asTrimmedString(patch.replyLength);
    if (replyLength !== "cap" && replyLength !== "preset") throw badRequest("That is not a reply length.");
    accepted.replyLength = replyLength;
  }
  if (patch.voiceGuidance !== undefined) {
    const voiceGuidance = asTrimmedString(patch.voiceGuidance);
    if (voiceGuidance.length > VILLAGE_VOICE_GUIDANCE_MAX_LENGTH) throw badRequest("That voice guidance is too long.");
    accepted.voiceGuidance = voiceGuidance || DEFAULT_VILLAGE_VOICE_GUIDANCE;
  }
  return saveVillageNarrationSettings(accepted);
}

/** The active venue's per-village writing controls. Old preset documents are not read here. */
export type VillageWritingView = Pick<VillageNarrationStyle, "tense" | "person" | "rating"> & {
  writingGuidance: string;
  writingGuidanceMaxLength: number;
};

export async function readVillageWriting(): Promise<VillageWritingView> {
  const style = (await readVillageState()).narrationStyle;
  return {
    tense: style.tense,
    person: style.person,
    rating: style.rating,
    writingGuidance: style.writingGuidance,
    writingGuidanceMaxLength: WRITING_GUIDANCE_MAX_LENGTH,
  };
}

export async function saveVillageWriting(body: unknown): Promise<void> {
  const patch = asRecord(body);
  const accepted: Partial<VillageNarrationStyle> = {};
  if (patch.tense !== undefined) {
    if (patch.tense !== "present" && patch.tense !== "past") throw badRequest("Choose present or past tense.");
    accepted.tense = patch.tense;
  }
  if (patch.person !== undefined) {
    if (patch.person !== "first" && patch.person !== "second" && patch.person !== "third")
      throw badRequest("Choose first, second, or third person.");
    accepted.person = patch.person;
  }
  if (patch.rating !== undefined) {
    if (patch.rating !== "sfw" && patch.rating !== "nsfw") throw badRequest("Choose SFW or NSFW.");
    accepted.rating = patch.rating;
  }
  if (patch.writingGuidance !== undefined) {
    if (typeof patch.writingGuidance !== "string") throw badRequest("Additional writing guidance must be text.");
    const value = patch.writingGuidance.trim();
    if (value.length > WRITING_GUIDANCE_MAX_LENGTH) throw badRequest("Additional writing guidance is too long.");
    accepted.writingGuidance = value;
  }
  if (Object.keys(accepted).length === 0) throw badRequest("No writing setting was supplied.");
  await mutateVillageState((state) => {
    Object.assign(state.narrationStyle, accepted);
  });
}
