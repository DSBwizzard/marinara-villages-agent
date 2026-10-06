// Villages — the spin-off lane: one villager, in a chat the Engine owns, one way.
//
// Everywhere else in this package a villager's conversation is the village's own
// document. That is not an accident and it is not going to change: a village of
// sixty people cannot be sixty Engine chats, the drawer's conversation works with
// the agent's own connection and its own prompt, and the whole point of keeping
// the transcript is that the player can forget it without losing anything of the
// Engine's. A SPIN-OFF is the one deliberate exception, and it exists because the
// two channels are good at different things.
//
// The drawer is a private conversation: short turns, a narrator-free prompt, a
// record that survives the player clearing it. A spin-off is a real roleplay chat
// — the Engine's own preset, the Engine's own history, the Engine's own prose
// controls, swipes, editing, the lot. The player asked for the villager they have
// been getting to know to be *someone they can write with*, and there is no way
// to give them that except by opening a chat, because a chat is the only thing in
// Marinara that is one.
//
// WHAT CHANGED IN 0.4.43, and it is the whole of this file's design.
//
// The lane used to be two halves joined by a document that said which chat
// belonged to which villager, and it stayed joined: the package contributed the
// villager's live state to every turn of that chat, held the rest of the village
// shut while a chat was open, and read the chat back into the villager's memory
// when the player brought it home. All of that is gone. A spin-off is now ONE
// WAY. The package takes a SNAPSHOT — the village, the villager and the drawer
// conversation as they stand at the instant the player presses the button — and
// builds an ordinary Engine roleplay out of it. After that it does not care. It
// does not track the chat, it does not talk to the Engine on the chat's behalf,
// it does not wait for it, and nothing about the village changes because of what
// gets written in it. The player takes the villager somewhere; the village is
// where they left it.
//
// That is why there is no record of a spin-off in the village's documents, and
// why nothing in this file reads one back. There is exactly ONE fact the package
// still needs after the button — which villager a chat came from, and which
// village they came from — and it is stamped into the CHAT's own metadata rather
// than kept here. The chat is the player's; a village-side copy of its name or its
// contents would be a second truth about something the player can rename, edit or
// delete without asking anybody, and keeping it in step would mean the package
// watching a chat it has no business watching.
//
// The lane is now two steps and only the first one has anything in it:
//
//   1. SPAWN. The package asks the Engine to make an ordinary roleplay chat for
//      the village's chosen character and the player's own Persona, in the same
//      shape the roleplay tab makes one — same defaults, same seeding, same chat
//      in the list, reachable from the chat list like any other. Then it writes
//      the villager's first line into it, using the ENGINE's connection for that
//      chat rather than the village's own, so the opening is in the same voice as
//      everything that follows it.
//
//   2. WHAT THE VILLAGER KNOWS. One frozen block, written once, at spawn, into the
//      chat itself: a constant lorebook entry scoped to that chat alone, plus the
//      same text as a single system line at the top of its transcript. See
//      `spinoff-snapshot.ts` for why both, and for what "frozen" buys.
//
//      This used to be a live `prompt-context` contributor, and the reason it is
//      not one any more is the whole of the change. A contributor is a drip from
//      a village that is still happening: the villager in the chat would learn
//      things the player never told them, would change their week under the
//      player's hands, and would be answering to a village that is off-screen
//      doing things. That is not taking somebody somewhere, it is the village
//      following them there. A snapshot is a snapshot precisely because it stops.
//
// What the package will not do is take over. It never renames the chat after the
// player has it, never moves it, never changes its preset or its connection, and
// never deletes it — not when the player uninstalls the package. There is no
// operation left in this file that could: the only two things it ever asks the
// Engine for after the chat exists are the villager's opening line and one
// question about a chat's own metadata, and neither of them writes over anything
// the player owns.
import { listResidents, readEffectiveVillagerCard, type VillagerCard } from "./catalog.js";
import {
  buildPromptContext,
  buildSceneOpeningMessages,
  EMPTY_PROMPT_CONTEXT,
  MAX_MESSAGE_LENGTH,
  type VillagePromptContext,
} from "./chat.js";
import { badRequest, notFound, VillagesRequestError } from "./errors.js";
import { villageEngineJson } from "./engine-loopback.js";
import { builtInNarrationTurn } from "./narration-settings.js";
import {
  completeWithRoom,
  villagesDebugAgentsEnabled,
  villagesLanguageModels,
  villagesLogger,
  villagesPersistence,
} from "./package-runtime.js";
import { boundText, MAX_ENGINE_ID_LENGTH, MAX_SPINOFF_NAME_LENGTH, prependHappenings } from "./prompt-preset.js";
import { spinOffMessageId, writeSpinOffSnapshot } from "./spinoff-snapshot.js";
import type {
  VillageScene,
  VillageSceneLockView,
  VillageSpinOffChoiceSelections,
  VillageSpinOffOriginView,
  VillageSpinOffPresetOption,
  VillageSpinOffPresetPickerView,
  VillageSpinOffSpawnResult,
  VillageSpinOffVariable,
  VillageSpinOffVariableList,
  VillageSpinOffVariableOption,
  VillageState,
} from "./types.js";
import { readPlayerIdentity } from "./village.js";
import { listVillageScenes, readVillageState } from "./village-store.js";

/**
 * A spin-off's chat is a roleplay chat. Not a constant the Engine reads, just the
 * package's word for the mode it asks for and the mode it answers in.
 */
const SPINOFF_CHAT_MODE = "roleplay";

/**
 * Room and heat for the opening line.
 *
 * The same numbers `greetVillager` uses, duplicated on purpose rather than
 * shared. The two turns are the same turn — this is the greeting's prompt with
 * one extra direction block — but they are allowed to drift: a spin-off opening
 * is the first line of something the player will keep writing in, and if it ever
 * wants more room than a hello does, that must be a change to one of them.
 */
const SPINOFF_OPENING_MAX_TOKENS = 800;
const SPINOFF_OPENING_TEMPERATURE = 0.9;

/** What a spin-off is called before the player has said otherwise. */
const SPINOFF_NAME_PREFIX = "A roleplay with ";

/**
 * What the spawn picker calls the choice of NO preset.
 *
 * Named here rather than in the tab so there is one place that decides what the
 * empty choice is called. The village has no preset of its own to offer beside
 * the Engine's — see the header — so this label and the Engine's own list are
 * the whole of the picker.
 */
const DEFAULT_PRESET_LABEL = "The chat's own default";

/**
 * Bounds for a preset's own questions, which are the only part of a spawn the
 * package COPIES out of the Engine rather than referring to by id.
 *
 * A preset itself travels as an id and the Engine resolves it, so its size is
 * the Engine's business. Its questions cannot: the popup has to draw them in the
 * browser, and the answers have to be written into the chat as `presetChoices`,
 * which is metadata the Engine parses on every load of that chat. So the shape
 * crosses the wire and gets caps. They are generous — a preset inside them
 * behaves exactly as it does anywhere else in the app — and what falls outside
 * them is trimmed rather than refused, because a trimmed answer is still the
 * player's answer and a refused question list is a chat that cannot be opened.
 */
const MAX_SPINOFF_VARIABLES = 24;
const MAX_SPINOFF_VARIABLE_OPTIONS = 60;
const MAX_SPINOFF_VARIABLE_QUESTION_LENGTH = 240;
const MAX_SPINOFF_VARIABLE_VALUE_LENGTH = 600;

/**
 * The id the Engine activates agents by, which for this package is the package's
 * own id. Spelled here rather than imported so this lane names the ONE fact it
 * writes into a chat's metadata beside the three Engine keys it writes with.
 */
const VILLAGES_AGENT_ID = "villages";

/**
 * The key under which a chat remembers which villager it came from.
 *
 * This is the whole of what the package keeps after a spawn, and it is kept in
 * the CHAT rather than in a village document on purpose. The one question that
 * outlives the button is "is this chat one of ours, and whose?" — which the two
 * in-chat surfaces have to answer about a chat they were handed and have no other
 * way to look up — and the answer belongs to the chat, because the chat is what
 * the player can delete, rename or copy. A village-side record of the same fact
 * would be a second copy that could disagree, and keeping it in step means the
 * package reading a chat forever, which is the thing this release stops doing.
 *
 * Stamping a package's own fact into a record the player owns is a real cost and
 * it is worth naming: it survives the package being uninstalled, where it will
 * mean nothing to anybody. `SPINOFF_STAMP_VERSION` is there so a future release
 * can recognise and ignore a stamp it no longer understands rather than
 * misreading an older shape, and the shape is deliberately three flat strings.
 */
const SPINOFF_METADATA_KEY = "villagesSpinoff";
const SPINOFF_STAMP_VERSION = 1;

/** A row out of the Engine, as a record, or an empty one. */
function asSpinOffRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

/**
 * A stored boolean, read the way the Engine reads its own.
 *
 * `multiSelect` and `randomPick` are TEXT columns, so they arrive as `"true"`
 * rather than as `true` — and a reader that only accepted the boolean would turn
 * every multi-select preset in the library into a single-select one. The same
 * leniency the Engine's own selector has is copied here rather than invented.
 */
function readSpinOffFlag(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

/**
 * One preset variable's options, in the shape the popup draws them.
 *
 * The column is a JSON STRING in the database and an array in every shape the
 * Engine has ever handed back, so both are accepted — the same one-line
 * tolerance `readSpinOffPresetOptions` already applies to "the list came back as
 * an array" and "the list came back in an object".
 *
 * Options with no `value` are dropped and duplicates are dropped by value, not
 * by label. The value is what the Engine injects and what a selection is keyed
 * by, so an option without one is an option the player cannot choose, and two
 * options sharing a value are two buttons that write the same thing. The label
 * falls back to the value because a button has to say something.
 */
function coerceSpinOffVariableOptions(value: unknown): VillageSpinOffVariableOption[] {
  let rows: unknown = value;
  if (typeof rows === "string") {
    try {
      rows = JSON.parse(rows) as unknown;
    } catch {
      return [];
    }
  }
  if (!Array.isArray(rows)) return [];
  const options: VillageSpinOffVariableOption[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    if (options.length >= MAX_SPINOFF_VARIABLE_OPTIONS) break;
    const record = asSpinOffRecord(row);
    const optionValue = boundText(record.value, MAX_SPINOFF_VARIABLE_VALUE_LENGTH);
    if (optionValue.length === 0 || seen.has(optionValue)) continue;
    seen.add(optionValue);
    options.push({
      value: optionValue,
      label: boundText(record.label, MAX_SPINOFF_VARIABLE_QUESTION_LENGTH) || optionValue,
    });
  }
  return options;
}

/**
 * The questions a preset asks, which the spawn popup draws before a chat exists.
 *
 * Read through the Engine's own route for a preset's choice blocks rather than
 * from the preset record, because that route returns them in the order the
 * player arranged them and that order is the point of arranging them. It is
 * proxied through the package rather than fetched from the browser for the same
 * reason every other Engine read is: the package's own route is the one place
 * that knows what the Engine is called, and a tab that reached over it would be a
 * second client of an API the package already fronts.
 *
 * A failure answers "this preset asks nothing" rather than throwing. That is the
 * same call `readScenePresetOptions` makes about an empty preset list, and for the
 * same reason: the scene still opens. A variable nobody answered falls back to the
 * Engine's own first option, which is exactly what every scene before this release
 * did — so refusing to open a chat over an unreadable question list would be
 * blocking a working feature to protect a cosmetic one.
 */
export async function readSpinOffPresetVariables(presetId: unknown): Promise<VillageSpinOffVariableList> {
  const id = boundText(presetId, MAX_ENGINE_ID_LENGTH);
  if (id.length === 0) return { presetId: "", variables: [] };
  try {
    const answer = await villageEngineJson<unknown>(`/api/prompts/${encodeURIComponent(id)}/variables`);
    const rows = Array.isArray(answer)
      ? answer
      : Array.isArray((answer as { variables?: unknown })?.variables)
        ? ((answer as { variables: unknown[] }).variables as unknown[])
        : [];
    const variables: VillageSpinOffVariable[] = [];
    for (const row of rows) {
      if (variables.length >= MAX_SPINOFF_VARIABLES) break;
      const record = asSpinOffRecord(row);
      const variableName = boundText(record.variableName ?? record.variable_name, MAX_ENGINE_ID_LENGTH);
      if (variableName.length === 0) continue;
      const options = coerceSpinOffVariableOptions(record.options);
      // A question with nothing to choose from is not a question. Dropped rather
      // than drawn as an empty list, which is the same judgement the preset
      // picker makes about a preset with no name.
      if (options.length === 0) continue;
      variables.push({
        variableName,
        // The variable's name is a readable fallback for a question the player
        // never wrote: a macro called POV is better as a heading than a blank.
        question: boundText(record.question, MAX_SPINOFF_VARIABLE_QUESTION_LENGTH) || variableName,
        options,
        multiSelect: readSpinOffFlag(record.multiSelect ?? record.multi_select),
        randomPick: readSpinOffFlag(record.randomPick ?? record.random_pick),
        // Resolved here so the tab has one shape to draw: the Engine's three
        // display modes and its "auto" default are the only values that can
        // survive this, and a value that cannot is the default rather than a
        // fourth mode nobody implements.
        displayMode: record.displayMode === "buttons" || record.displayMode === "listbox" ? record.displayMode : "auto",
        optionSort: record.optionSort === "alphabetical" ? "alphabetical" : "manual",
      });
    }
    return { presetId: id, variables };
  } catch (error) {
    villagesLogger().debug("[villages] could not read preset %s for the spin-off popup: %s", id, String(error));
    return { presetId: id, variables: [] };
  }
}

/**
 * The answers the browser sent for a preset's questions, bounded to what the
 * package will write into a chat's metadata.
 *
 * Null when there is nothing to write, which is not the same as an empty object:
 * a spawn for a preset with no questions must leave the `presetChoices` key of a
 * chat it re-opens alone, and `{}` would be the package asserting the player
 * answered nothing when in fact they answered nothing because they were asked
 * nothing.
 *
 * The values are NOT checked against the preset's own option list. The Engine
 * does that itself when it resolves a choice — an unknown value falls back to the
 * first option — and doing it here would mean a second Engine read on the spawn
 * path to re-derive a fact the Engine refuses to trust from anyone but itself.
 * What IS bounded is the size, because this text lands in a chat's metadata and
 * metadata is parsed on every load of that chat.
 */
function coerceSpinOffChoices(value: unknown): VillageSpinOffChoiceSelections | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const choices: VillageSpinOffChoiceSelections = {};
  let kept = 0;
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (kept >= MAX_SPINOFF_VARIABLES) break;
    const name = boundText(key, MAX_ENGINE_ID_LENGTH);
    if (name.length === 0) continue;
    const single = boundText(raw, MAX_SPINOFF_VARIABLE_VALUE_LENGTH);
    if (single.length > 0) {
      choices[name] = single;
      kept += 1;
      continue;
    }
    if (!Array.isArray(raw)) continue;
    const values: string[] = [];
    for (const entry of raw) {
      if (values.length >= MAX_SPINOFF_VARIABLE_OPTIONS) break;
      const text = boundText(entry, MAX_SPINOFF_VARIABLE_VALUE_LENGTH);
      if (text.length === 0 || values.includes(text)) continue;
      values.push(text);
    }
    if (values.length === 0) continue;
    choices[name] = values;
    kept += 1;
  }
  return kept === 0 ? null : choices;
}

// ── Reading the Engine's side ────────────────────────────────────────────────

/** The two fields of an Engine chat this package has any business naming. */
type EngineChatResponse = {
  id?: unknown;
  name?: unknown;
  connectionId?: unknown;
};

/**
 * Everything the Engine would let the player bind to a new chat, as a picker.
 *
 * Read from the Engine on every listing rather than cached, for the same reason
 * the presets themselves are the Engine's: a preset the player renamed, deleted
 * or replaced must not be offered as it was an hour ago. Both shapes the route
 * has ever answered with are accepted, because "the list came back as an array"
 * and "the list came back as an object with a list in it" are one line apart and
 * only one of them can be right.
 *
 * A failure returns an empty list rather than throwing. The presets are the one
 * optional part of this screen — the player can open a chat with the chat's own
 * default and never miss them — so an Engine that will not answer this question
 * must not take the whole panel down with it.
 */
async function readSpinOffPresetOptions(): Promise<VillageSpinOffPresetOption[]> {
  try {
    const answer = await villageEngineJson<unknown>("/api/prompts/");
    const rows = Array.isArray(answer)
      ? answer
      : Array.isArray((answer as { presets?: unknown })?.presets)
        ? ((answer as { presets: unknown[] }).presets as unknown[])
        : [];
    const options: VillageSpinOffPresetOption[] = [];
    for (const row of rows) {
      if (!row || typeof row !== "object") continue;
      const record = row as { id?: unknown; name?: unknown };
      const id = boundText(record.id, MAX_ENGINE_ID_LENGTH);
      const name = boundText(record.name, MAX_SPINOFF_NAME_LENGTH);
      // An unnamed preset is dropped rather than offered as a blank row: the
      // picker is a list of things to choose between and one of the choices has
      // to be readable for the choice to mean anything.
      if (id.length === 0 || name.length === 0) continue;
      options.push({ id, name });
    }
    return options;
  } catch (error) {
    villagesLogger().debug("[villages] could not read the Engine's presets for the spin-off picker: %s", String(error));
    return [];
  }
}

/**
 * Everything the spawn popup needs before there is a chat to put it in.
 *
 * One route rather than two, because the popup is one dialog and a dialog that
 * drew its preset list before it knew what the ceiling on the name was would be a
 * dialog that reflowed under the player's hands. It is also the only read on this
 * lane that does not need a villager, because the player may want to see what the
 * picker offers before deciding who to take.
 *
 * Never throws: `readSpinOffPresetOptions` answers an empty list rather than
 * failing, and the other two fields are constants of the package's own. That
 * matters because this is on the path to opening the dialog — an error here would
 * be a button that does nothing, where an empty preset list is a button that
 * works and offers the chat's own default.
 */
export async function readSpinOffPresetPicker(): Promise<VillageSpinOffPresetPickerView> {
  return {
    presets: await readSpinOffPresetOptions(),
    defaultPresetLabel: DEFAULT_PRESET_LABEL,
    maxNameLength: MAX_SPINOFF_NAME_LENGTH,
  };
}

// ── RETIRED 0.4.43 — the scene lane's return path. Kept, not called. ─────────
//
// Every declaration from here down to `respondWithScene` belongs to the two-way
// lane that 0.4.43 replaced: reading the Engine's copy of a chat, counting its
// lines, and drawing the listing a panel of open scenes needed. They are correct,
// they are exported or reachable from something that is, and nothing calls any of
// them: `spawnVillagerSpinOff` no longer takes the idempotency branch that used
// `readSceneChat`, and nothing anywhere builds a listing any more.
//
// They are kept rather than deleted, and the reason is that they are the only
// written account of how the package used to read a chat it does not own — which
// is the part of the old lane that could be wanted again. Removing them would
// remove the account, not the risk.

/**
 * Whether the Engine still holds a scene's chat, and what it is called now.
 *
 * Two questions, one call, and both answered live because both are statements
 * about the ENGINE's state rather than about the village's record. The player may
 * have renamed the chat, and they may have deleted it — a chat tab is theirs to
 * tidy up, and a village that kept offering to open one that is gone would be
 * showing the player a door to a wall.
 *
 * Never throws. A missing `chat-read` grant, or an Engine too old to expose this,
 * reads as "not there", which is the safe direction: the row goes read-only and
 * the player is told why instead of being shown an error where a button was.
 */
async function readSceneChat(chatId: string): Promise<{ live: boolean; name: string }> {
  try {
    const chat = await villagesPersistence().getChat(chatId);
    if (!chat) return { live: false, name: "" };
    return {
      live: true,
      name: typeof chat.name === "string" ? boundText(chat.name, MAX_SPINOFF_NAME_LENGTH) : "",
    };
  } catch (error) {
    villagesLogger().debug("[villages] could not read the chat behind a scene: %s", String(error));
    return { live: false, name: "" };
  }
}

/**
 * The scene the player is in the middle of, or null.
 *
 * A scene is OPEN while nobody has filed it — `endedAt` is only ever stamped by
 * bringing it home or by forgetting it — and CLOSED once it has been. That is why
 * this reads the record rather than asking the chat: the chat keeps living after
 * the player has filed the scene, and a player who goes back into it is a player
 * with a chat, not a player in a scene.
 *
 * A scene whose chat is gone from the Engine is not a lock either. There is
 * nowhere to send the player, so holding the village shut over a deleted chat
 * would be a lock with no key: the only door left would be the Forget button, and
 * a package that traps a player into pressing it has decided something that was
 * not its to decide.
 *
 * Deliberately cheap, because this is asked on every mutating route AND on every
 * build of the scene listing. The store is read once — or not at all, when the
 * caller already has the document map in hand — plus one `getChat` per OPEN
 * scene, normally none, and never the message count, which is a question about a
 * row nobody is drawing.
 *
 * One rule and two callers rather than two rules: the routes refuse work on this
 * answer and the tab draws its gate from it, so an answer that disagreed with
 * itself would be a village that let one door open while telling the player every
 * door was shut.
 */
export async function readVillageSceneLock(scenes?: Map<string, VillageScene>): Promise<VillageSceneLockView | null> {
  for (const scene of (scenes ?? (await listVillageScenes())).values()) {
    if (scene.endedAt.length > 0) continue;
    if (!(await readSceneChat(scene.chatId)).live) continue;
    const residents = await listResidents([scene.characterId]);
    return {
      characterId: scene.characterId,
      name: residents.names.get(scene.characterId) ?? "",
      chatId: scene.chatId,
    };
  }
  return null;
}

// ── Opening one ──────────────────────────────────────────────────────────────

/**
 * The three optional fields of a spawn, and what each one is for.
 *
 * Named separately from the route's body type so that the ceilings and the
 * fallbacks live with the code that applies them rather than in the route table,
 * which is where a hand-written `.slice()` eventually disagrees with the one the
 * service does.
 */
export type VillageSpinOffSpawnInput = {
  /** An Engine preset to bind to the new chat, or blank for the chat's own default. */
  presetId?: unknown;
  /** What to call the chat, or blank for "A roleplay with <name>". */
  name?: unknown;
  /** Answers to that preset's own questions, as the popup collected them. */
  presetChoices?: unknown;
};

/**
 * A chat's metadata as a record, or null when it will not parse.
 *
 * Null is a refusal and not an empty object, and the difference is the whole
 * reason this exists. The Engine's metadata writer REPLACES the blob — it does
 * not merge — so writing an activation into a chat whose metadata could not be
 * read is writing over whatever was in there. A package that did that to add a
 * button would be trading something the player owns for something the package
 * wants, which is the wrong way round every single time it could come up. Null
 * means "leave this chat alone", and the caller says so in the log.
 *
 * Both a JSON string and an already-parsed object are accepted because the
 * Engine's own reader accepts both, and `{}` is a legitimate value: a chat with
 * no metadata is a chat with nothing to lose.
 */
function parseSpinOffChatMetadata(value: unknown): Record<string, unknown> | null {
  if (typeof value === "string") {
    if (value.trim().length === 0) return {};
    try {
      return asSpinOffRecord(JSON.parse(value) as unknown);
    } catch {
      return null;
    }
  }
  if (value === null || value === undefined) return {};
  return asSpinOffRecord(value);
}

/**
 * Which villager a chat came from, read out of the chat's own metadata.
 *
 * This is the only thing the package still knows about a spin-off after the
 * button, and it is asked by the two surfaces that are drawn INSIDE the chat —
 * the toolbar chip and the panel — because neither of them is handed anything but
 * a chat id. That is the whole reason the stamp is in the chat: the alternative is
 * a village-side list of every chat the package ever made, which is a record of
 * the player's reading that the package would then have to keep in step with
 * renames and deletions it is not watching.
 *
 * The villager's NAME is not stored, only their id: a card can be renamed or
 * replaced, and a stored name would be the package remembering somebody under a
 * name they no longer have. The name is looked up live from the library, and
 * `resident` says whether the village still holds them at all, which is the one
 * fact the in-chat panel genuinely needs and the one it cannot derive — a
 * villager can be moved out of the village while their chat lives on.
 *
 * The `villageName` is the exception, and it is stored deliberately. It is
 * provenance rather than identity: it records where the player was standing when
 * they left, which is a fact about the past that does not change when the player
 * renames the village later, and re-deriving it from the current village would
 * make every old chat claim it came from a place it did not.
 *
 * Never throws, for the reason every reader on this lane never throws. A chat
 * without a stamp, a chat whose metadata will not parse, a stamp from a release
 * that wrote a shape this one does not know, a stamp naming a villager whose card
 * is gone — all of them answer null, which is what the callers draw as "this is an
 * ordinary chat and villages has nothing to say about it".
 */
export async function readChatSpinOff(chatId: string): Promise<VillageSpinOffOriginView | null> {
  const id = boundText(chatId, MAX_ENGINE_ID_LENGTH);
  if (id.length === 0) return null;
  try {
    const chat = await villagesPersistence().getChat(id);
    const metadata = parseSpinOffChatMetadata(chat?.metadata);
    if (!metadata) return null;
    const stamp = asSpinOffRecord(metadata[SPINOFF_METADATA_KEY]);
    if (stamp.version !== SPINOFF_STAMP_VERSION) return null;
    const characterId = boundText(stamp.characterId, MAX_ENGINE_ID_LENGTH);
    if (characterId.length === 0) return null;
    const village = await readVillageState();
    const residents = await listResidents([characterId]);
    return {
      characterId,
      name: residents.names.get(characterId) ?? "",
      room: typeof chat?.name === "string" ? boundText(chat.name, MAX_SPINOFF_NAME_LENGTH) : "",
      villageName: boundText(stamp.villageName, MAX_SPINOFF_NAME_LENGTH) || village.name,
      resident: village.villagers.some((entry) => entry.characterId === characterId),
    };
  } catch (error) {
    villagesLogger().debug("[villages] could not read a chat's spin-off stamp: %s", String(error));
    return null;
  }
}

/**
 * What the package writes into the chat it just made, in one pass.
 *
 * Four things, and they are one write rather than four because the Engine's
 * metadata writer REPLACES the whole blob — see below — so four writes would be
 * four chances to lose the others.
 *
 *   * `enableAgents` and `activeAgentIds`, which is how the Engine switches a
 *     package on inside a chat. The Engine reads the id list ONLY when the flag is
 *     true, and it is the list that IS the activation: every surface this package
 *     contributes to a conversation sits behind that gate, so a package that makes
 *     a chat and does not activate itself in it owns a chat it can never put a
 *     control on. 0.4.40 made the chat and left the gate to a screen the package
 *     cannot reach — Chat Settings — which is why its toolbar chip existed in four
 *     manifest releases and was never once drawn. The package's own id is appended
 *     rather than set, so switching villages on inside a spin-off cannot switch
 *     anything else off, and it is de-duplicated, because a chat that already
 *     lists the package must not end up listing it twice.
 *
 *   * `activeLorebookIds`, which is where the frozen snapshot lives. The snapshot
 *     itself is written by `spinoff-snapshot.ts`; this is the half of it the
 *     Engine has to be told about, and it is joined to the books the player
 *     already had rather than replacing them, for the same reason as above.
 *
 *   * `presetChoices`, the player's answers to the preset's own questions, and it
 *     is written BEFORE the opening line is asked for so the villager's first
 *     words are already written with them in view rather than arriving at a chat
 *     that then changes its mind.
 *
 *   * `villagesSpinoff`, the stamp. Three flat strings: which release wrote it,
 *     which villager it came from, and which village they were in. This is the
 *     whole of what the package keeps after a spawn, and it is in the chat rather
 *     than in a village document because the two in-chat surfaces are handed a
 *     chat id and nothing else and have no other way to look up whose it is.
 *
 * The read-merge-write is not paranoia. `updateChatMetadata` replaces the WHOLE
 * blob — the Engine's own source says so — so a package that sent these keys would
 * silently delete the chat's branch lineage, its pinned settings, everything. And
 * the read is taken under the Engine's own per-chat metadata lock, because the
 * player's other tab, the chat's own settings panel and this spawn can all be
 * writing that column at once.
 *
 * Every failure is swallowed and logged. The chat already exists and is already
 * the player's; a chat without the village's chrome is a worse chat, and an
 * exception here would be an error dialog in front of a working one.
 */
async function activateSpinOffChat(
  characterId: string,
  chatId: string,
  presetChoices: VillageSpinOffChoiceSelections | null,
  villageName: string,
  lorebookId: string,
): Promise<void> {
  const persistence = villagesPersistence();
  const logger = villagesLogger();
  try {
    await persistence.withChatLock(chatId, async () => {
      const chat = await persistence.getChat(chatId);
      const current = parseSpinOffChatMetadata(chat?.metadata);
      if (!current) {
        logger.warn(
          "[villages] spin-off chat %s has metadata that will not parse, so the village is leaving it alone rather than writing over it",
          chatId,
        );
        return;
      }
      const active = Array.isArray(current.activeAgentIds)
        ? current.activeAgentIds.filter((entry): entry is string => typeof entry === "string" && entry.length > 0)
        : [];
      const next = active.filter((entry) => entry !== VILLAGES_AGENT_ID);
      next.push(VILLAGES_AGENT_ID);
      // The snapshot book joins whatever the player already had switched on in
      // this chat. A brand-new chat has none, but this write is also the repair
      // path for a chat whose metadata was unreadable the first time round, and
      // there is no case where dropping the player's own books would be right.
      const books = Array.isArray(current.activeLorebookIds)
        ? current.activeLorebookIds.filter((entry): entry is string => typeof entry === "string" && entry.length > 0)
        : [];
      const nextBooks = lorebookId.length > 0 && !books.includes(lorebookId) ? [...books, lorebookId] : books;
      await persistence.updateChatMetadata({
        chatId,
        metadata: {
          ...current,
          enableAgents: true,
          activeAgentIds: next,
          ...(books.length > 0 || nextBooks.length > 0 ? { activeLorebookIds: nextBooks } : {}),
          ...(presetChoices ? { presetChoices } : {}),
          [SPINOFF_METADATA_KEY]: {
            version: SPINOFF_STAMP_VERSION,
            characterId,
            villageName: boundText(villageName, MAX_SPINOFF_NAME_LENGTH),
            at: new Date().toISOString(),
          },
        },
        updatedAt: new Date().toISOString(),
      });
    });
  } catch (error) {
    logger.warn("[villages] could not switch the village on inside spin-off chat %s: %s", chatId, String(error));
  }
}

/**
 * Open a spin-off: a real roleplay chat, plus a villager's first line in it.
 *
 * The chat is made by the Engine through the same route the roleplay tab uses,
 * with the same fields it sends, so what comes out is indistinguishable from a
 * chat the player made themselves — which is the point. Anything the package
 * chose to leave out is therefore a real decision and there are two of them:
 *
 *   * NO CONNECTION. A new chat's connection is the Engine's to seed, exactly as
 *     it is when the player presses "new chat". Handing it the village's own
 *     narration connection instead would quietly override the player's roleplay
 *     default with the model they picked for the village's narration, and the
 *     spin-off would then run on a model they never chose for it.
 *   * NO GROUP. A spin-off is one villager and the player. A group id would put
 *     the villager in a room with other characters, which is the narrator's job
 *     and not this lane's.
 *
 * The Persona is the player's own, so the chat list, the avatar and the name in
 * the transcript are the ones they already use everywhere else. The villager is
 * the only character in it, so the Engine's roleplay pipeline has exactly one
 * speaker to write as.
 *
 * NOT IDEMPOTENT, deliberately. This used to refuse to make a second chat for a
 * villager who already had one, because the package kept the link and so could
 * recognise a second press. It keeps no link any more, so there is nothing to
 * recognise: pressing the button twice makes two chats. That is the honest
 * consequence of the rule that villages has no association with a spin-off once
 * it is made, and the tab's part in it is to hold the button still while a spawn
 * is in flight and to say plainly which chat it just made, so that a second press
 * is always something the player did on purpose.
 *
 * The order of the four things below is load-bearing, and each one says why:
 * the chat first, because everything else is about it; the snapshot second,
 * because the book it returns has to travel in the same metadata write as
 * everything else; the write third, because the opening line has to be asked for
 * with the player's preset answers already in the chat; the line last. Nothing
 * below the chat's creation throws — see `writeSpinOffOpening` — because the
 * player already has a chat by then, and a chat with no first line in it is a
 * thing players make on purpose where an error dialog in front of a working chat
 * is not.
 */
export async function spawnVillagerSpinOff(
  characterId: string,
  input: VillageSpinOffSpawnInput = {},
): Promise<VillageSpinOffSpawnResult> {
  const village = await readVillageState();
  if (!village.villagers.some((entry) => entry.characterId === characterId)) {
    throw notFound("That villager does not live here.");
  }
  const card = await readEffectiveVillagerCard(village.villagers.find((entry) => entry.characterId === characterId)!);
  if (!card) throw notFound("That villager's card is no longer in the library.");

  const presets = await readSpinOffPresetOptions();
  const presetId = boundText(input.presetId, MAX_ENGINE_ID_LENGTH);
  // Only rejected when the list actually came back. An Engine that would not
  // answer the list question cannot be used to say a preset is gone, and a spawn
  // refused on the strength of an empty list would be the package blaming the
  // player for its own failed read.
  if (presetId.length > 0 && presets.length > 0 && !presets.some((preset) => preset.id === presetId)) {
    throw badRequest("That preset is no longer in the library.");
  }
  const presetChoices = coerceSpinOffChoices(input.presetChoices);

  const chatName = boundText(input.name, MAX_SPINOFF_NAME_LENGTH) || `${SPINOFF_NAME_PREFIX}${card.name}`;
  const personaId = boundText(village.playerPersonaId, MAX_ENGINE_ID_LENGTH);
  const created = await villageEngineJson<EngineChatResponse>("/api/chats", {
    body: {
      name: chatName,
      mode: SPINOFF_CHAT_MODE,
      characterIds: [characterId],
      groupId: null,
      personaId: personaId.length > 0 ? personaId : null,
      personaCharacterId: null,
      promptPresetId: presetId.length > 0 ? presetId : null,
    },
  });
  const chatId = boundText(created.id, MAX_ENGINE_ID_LENGTH);
  if (chatId.length === 0) {
    throw new VillagesRequestError(502, "The Engine made the roleplay's chat but did not say which chat it was.");
  }

  // THE SNAPSHOT. Resolved from the village as it stands right now, and then
  // never looked at again. `writeSpinOffSnapshot` is itself best-effort and
  // answers an empty book id rather than throwing, so the try/catch here is only
  // for the two reads that feed it: a player who has never set a Persona, or a
  // village whose prompt blocks will not render, must still get their chat with
  // the villager's first line in it. A spin-off with no snapshot is a spin-off
  // that knows as much as the Engine's own material tells it, which is a working
  // roleplay and not a broken one.
  const logger = villagesLogger();
  let resolved: VillageState = { ...village, playerName: "", playerDescription: "" };
  let context: VillagePromptContext | null = null;
  let lorebookId = "";
  try {
    const player = readPlayerIdentity(village);
    resolved = { ...village, playerName: player.name, playerDescription: player.description };
    context = await buildPromptContext(resolved, characterId);
    lorebookId = await writeSpinOffSnapshot({ chatId, card, village: resolved, context });
  } catch (error) {
    logger.warn("[villages] could not take a snapshot of %s for their new roleplay: %s", card.name, String(error));
  }

  // The village switches itself on inside the chat it just made, and it does so
  // between the two writes that matter: the snapshot is already in the Engine,
  // and the opening line is asked for with the player's answers already in the
  // chat's metadata. Nothing here throws — `activateSpinOffChat` swallows and
  // logs — so a chat whose metadata could not be written still gets its
  // villager's first line.
  await activateSpinOffChat(characterId, chatId, presetChoices, village.name, lorebookId);

  const beatAt = await writeSpinOffOpening(characterId, card, resolved, context, chatId, created.connectionId);
  return { characterId, name: card.name, chatId, chatName, beatAt };
}

/**
 * Ask the villager to open the spin-off, and put what they say in the chat.
 *
 * Returns the timestamp the line was written at, or a blank string when there is
 * no line — which is a normal outcome and not an error. This is the one place in
 * the package where the alternative to a failure is nothing at all: unlike a
 * greeting, there is no fallback line, because a canned sentence written
 * permanently into a chat the player is about to write in is worse than an empty
 * chat. An empty roleplay chat is something players make on purpose.
 *
 * The model is resolved against the CHAT's connection and not the village's. The
 * Engine just told us what that chat will use for every turn after this one, and
 * an opening written by a different model than the rest of the spin-off is a
 * spin-off that changes voice on the second line for no reason the player can see.
 *
 * The village's context is passed IN rather than built here, because the spawn
 * already had to build it for the snapshot and building it twice would be two
 * reads of the same documents for one answer. Null is the case where that build
 * failed, and it is answered with an empty context rather than with no line: see
 * the call site for why a villager who cannot be told where they are still says
 * hello.
 */
async function writeSpinOffOpening(
  characterId: string,
  card: VillagerCard,
  resolved: VillageState,
  context: VillagePromptContext | null,
  chatId: string,
  engineConnectionId: unknown,
): Promise<string> {
  const logger = villagesLogger();
  let line = "";
  try {
    const connectionId =
      typeof engineConnectionId === "string" && engineConnectionId.length > 0 ? engineConnectionId : null;
    const model = await villagesLanguageModels().resolveForRequest({ connectionId });
    const requestedMaxTokens = Math.min(
      model.maxOutputTokens ?? SPINOFF_OPENING_MAX_TOKENS,
      SPINOFF_OPENING_MAX_TOKENS,
    );
    // An empty context rather than no opening when the snapshot could not be
    // built: the villager still says something, and what they say is simply not
    // informed by the village. Refusing to write a first line because the
    // package failed to read its own prompt blocks would be turning a cosmetic
    // failure into a chat the player has to start themselves.
    const fitted = model.fitContext(
      buildSceneOpeningMessages(
        card,
        resolved,
        context ?? EMPTY_PROMPT_CONTEXT,
        // The shipped preset and the scene lane's OWN numbers, not this village's
        // narration settings. A spin-off is an ordinary roleplay chat whose
        // register is the CHAT's preset, and an opening written in the village's
        // drawer preset would be the first line of a chat that then changes
        // voice on the second. See `builtInNarrationTurn` for the long version.
        builtInNarrationTurn({ maxTokens: SPINOFF_OPENING_MAX_TOKENS, temperature: SPINOFF_OPENING_TEMPERATURE }),
      ),
      { maxTokens: requestedMaxTokens },
    );
    const debugEnabled = villagesDebugAgentsEnabled();
    logger.debugOverride(
      debugEnabled,
      "[villages] %s spin-off opening prompt for card %s: %s",
      model.model,
      characterId,
      JSON.stringify(fitted.messages),
    );
    const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? requestedMaxTokens, {
      temperature: SPINOFF_OPENING_TEMPERATURE,
      debugMode: debugEnabled,
    });
    line = boundText(completion.content ?? "", MAX_MESSAGE_LENGTH);
    if (line.length === 0) {
      logger.warn(
        "[villages] %s opened a spin-off with nothing: %s answered nothing twice (finish reason %s), so the chat is left for the player to start",
        card.name,
        model.model,
        completion.finishReason,
      );
    }
  } catch (error) {
    // Swallowed for the same reason the greeting's is: the chat already exists
    // and the player is already looking at it. An error here would be an error
    // dialog in front of a working chat.
    logger.warn("[villages] %s could not open the spin-off: %s", card.name, String(error));
    return "";
  }
  if (line.length === 0) return "";

  const at = new Date().toISOString();
  try {
    await villagesPersistence().createMessageWithSwipe({
      id: spinOffMessageId(),
      swipeId: spinOffMessageId(),
      chatId,
      role: "assistant",
      characterId,
      content: line,
      extra: {},
      createdAt: at,
    });
  } catch (error) {
    // `chat-write` refused, or a chat that vanished between the two calls. The
    // line is dropped rather than retried: it is a nice-to-have and the player
    // is looking at an empty chat they can write in.
    logger.warn("[villages] could not write %s's opening line into the spin-off: %s", card.name, String(error));
    return "";
  }
  return at;
}
