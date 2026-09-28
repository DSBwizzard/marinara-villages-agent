// Villages — reading library cards.
//
// The card is the authoritative answer to "who is this person": it supplies the
// name, the voice and the history. The village only decides where they live and
// who they talk to. Nothing here mutates a card, and nothing here caches one —
// every read goes back to the library so edits show up on the next render.
import type {
  CapabilityCharacterRecord,
  CapabilityPersonaRecord,
  CapabilityResourceHost,
} from "@marinara-engine/shared";
import { asRecord, asString, asStringArray, asTrimmedString, condense } from "./coerce.js";
import { villagesResources } from "./package-runtime.js";
import type { VillageCatalogEntry, VillagePersona, VillageVillager, VillageVillagerCardSnapshot } from "./types.js";

/** Everything the village needs off one card, flattened and defaulted. */
export type VillagerCard = {
  id: string;
  /** Player-facing name; falls back to the user note so a tile is never blank. */
  name: string;
  /** The user-only note, used for disambiguation between similar cards. */
  comment: string;
  /** One-line blurb for tiles. */
  summary: string;
  tags: string[];
  systemPrompt: string;
  description: string;
  personality: string;
  scenario: string;
  /**
   * The card's backstory, when it has one.
   *
   * A card keeps this in `extensions` rather than at the top level, and it is
   * read for the same reason the description is: an author who wrote a
   * character's history wrote it to be read, and a villager who never sees it
   * has that much less of themselves to speak from. The Engine sends the same
   * field to the model by default, so leaving it out was the one place the
   * package gave a card less than the Engine does.
   */
  backstory: string;
  /**
   * The card's appearance, read from `extensions` for the same reason.
   *
   * It is here because how somebody looks is part of how they carry themselves
   * and what they notice, and a card author who described it meant it to count.
   */
  appearance: string;
  /** Example dialogue, used to prime run-on replies. */
  exampleDialogue: string;
};

export function villagerCardFromSnapshot(snapshot: VillageVillagerCardSnapshot): VillagerCard {
  return {
    id: snapshot.id,
    name: snapshot.name,
    comment: snapshot.comment,
    summary: snapshot.summary,
    tags: [...snapshot.tags],
    systemPrompt: snapshot.systemPrompt,
    description: snapshot.description,
    personality: snapshot.personality,
    scenario: snapshot.scenario,
    backstory: snapshot.backstory,
    appearance: snapshot.appearance,
    exampleDialogue: snapshot.exampleDialogue,
  };
}

/** Runtime reads use the adopted snapshot. Live cards are only read by refresh/capture flows. */
export function readEffectiveVillagerCard(villager: VillageVillager): VillagerCard {
  return villagerCardFromSnapshot(villager.cardSnapshot);
}

/**
 * A card's own opening line is deliberately NOT read here, and the field is
 * deliberately not on the type.
 *
 * `first_mes` is written for the Engine's own chat surfaces: it addresses the
 * player by name through macros, it stages a scene, and it assumes the reader
 * has just pressed New Chat. None of that is what a villager says when the
 * player walks across a square and says hello, and every one of those surfaces
 * has a setting the card author tuned for THEM — which the village would be
 * reusing without the setting, in a context the author never wrote for.
 *
 * Leaving it off the type rather than merely leaving it unread is the point: an
 * unread field is a field the next feature reaches for. This way the card's
 * opening line cannot get into a transcript, a prompt or a tile by accident,
 * and the only greeting in the package is the one the villager writes for
 * themselves in the room they are actually standing in.
 */

/**
 * A stored body as an object.
 *
 * A card's body is a JSON *text* column — every reader inside the Engine calls
 * `parseCharacterData` before touching a field — while a Persona is handed over
 * as an already-decoded database row. Treating that string as an object reads as
 * an empty card, which is how a whole library turns into nameless villagers. A
 * string is parsed, an already-decoded object is used as-is, and anything else
 * reads as empty rather than throwing.
 */
function readRowObject(value: unknown): Record<string, unknown> {
  if (typeof value !== "string") return asRecord(value);
  try {
    return asRecord(JSON.parse(value));
  } catch {
    return {};
  }
}

export function readVillagerCard(record: CapabilityCharacterRecord): VillagerCard {
  const data = readRowObject(record.data);
  // Backstory and appearance live under `extensions` rather than beside the
  // other prose fields. An absent `extensions` is an ordinary card, not a
  // broken one, so it reads as an empty object and both fields go empty.
  const extensions = readRowObject(data.extensions);
  const comment = asTrimmedString(record.comment);
  const name = asTrimmedString(data.name) || comment || "Unnamed villager";
  // Card prose is authored with the Engine's macros. Resolve them here, once,
  // so no consumer can leak a raw `{{char}}` into a tile or a prompt.
  const expand = (value: unknown) => expandCardMacros(asString(value), name);
  const summary = asTrimmedString(data.summary) || condense(expand(data.description), 180);
  return {
    id: record.id,
    name,
    comment,
    summary,
    tags: asStringArray(data.tags),
    systemPrompt: expand(data.system_prompt).trim(),
    description: expand(data.description),
    personality: expand(data.personality),
    scenario: expand(data.scenario),
    backstory: expand(extensions.backstory),
    appearance: expand(extensions.appearance),
    exampleDialogue: expand(data.mes_example).trim(),
  };
}

/** Every card in the library, name-ordered for the picker. */
export async function listVillagerCards(characterIds?: string[]): Promise<VillagerCard[]> {
  if (characterIds?.length === 0) return [];
  const records = await villagesResources().listCharacters(characterIds);
  return records
    .map(readVillagerCard)
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: "base" }));
}

/** One card by id, or null when the player has deleted it. */
export async function findVillagerCard(characterId: string): Promise<VillagerCard | null> {
  const records = await villagesResources().listCharacters([characterId]);
  const record = records.find((entry) => entry.id === characterId) ?? records[0];
  return record ? readVillagerCard(record) : null;
}

/**
 * Who lives here, as the prompt needs them: a short label for the roster and
 * the plain name for anywhere someone is described as living.
 */
export type ResidentDirectory = {
  /** e.g. "Hana — apiarist". Used to tell a villager who else is around. */
  labels: Map<string, string>;
  /** Just the name, for the places someone is said to live. */
  names: Map<string, string>;
};

/** Names used during village runtime come from the card adopted at move-in. */
export function residentsFromSnapshots(villagers: readonly VillageVillager[]): ResidentDirectory {
  const labels = new Map<string, string>();
  const names = new Map<string, string>();
  for (const villager of villagers) {
    const card = villager.cardSnapshot;
    labels.set(card.id, card.comment ? `${card.name} — ${card.comment}` : card.name);
    names.set(card.id, card.name);
  }
  return { labels, names };
}

/**
 * Who lives here, keyed by card id: a short label for the roster, e.g.
 * "Hana — apiarist", and the plain name for anywhere someone is described as
 * living.
 *
 * Both maps come out of ONE read of the library, so the name a villager hears
 * in the roster is the same name they hear attached to a house. The user-only
 * note is worth including in the label when it exists: it is usually the
 * player's own hint about who the character is. A card that is missing from the
 * library is simply absent from both maps, so a deleted resident drops out of
 * the roster instead of appearing as a nameless line.
 */
export async function listResidents(characterIds: string[]): Promise<ResidentDirectory> {
  const labels = new Map<string, string>();
  const names = new Map<string, string>();
  if (characterIds.length === 0) return { labels, names };
  const records = await villagesResources().listCharacters(characterIds);
  for (const record of records) {
    const card = readVillagerCard(record);
    labels.set(card.id, card.comment.length > 0 ? `${card.name} — ${card.comment}` : card.name);
    names.set(card.id, card.name);
  }
  return { labels, names };
}

export function toCatalogEntry(card: VillagerCard, inVillage: boolean): VillageCatalogEntry {
  return {
    id: card.id,
    name: card.name,
    comment: card.comment,
    summary: card.summary,
    tags: card.tags,
    inVillage,
  };
}

/**
 * Expand the macros a card's prose fields may carry. `{{user}}` becomes "the
 * player" because the village has no name for the person visiting it.
 *
 * Applied once, inside `readVillagerCard`, so every card field downstream is
 * already plain text.
 */
function expandCardMacros(text: string, characterName: string): string {
  return text.replace(/\{\{char\}\}/gi, characterName).replace(/\{\{user\}\}/gi, "the player");
}

// ── Personas ─────────────────────────────────────────────────────────────────
// A Persona is the Engine's own answer to "who is the player", which is exactly
// the question the village asks at its founding. Villages reads them and links
// to them; it never creates, edits or selects one, because a Persona belongs to
// the whole Engine and not to this village.

/** "Appearance: …" — one labelled line of Persona prose, or nothing at all. */
function labelledPersonaLine(label: string, value: string): string {
  return value.length > 0 ? `${label}: ${value}` : "";
}

/**
 * One Persona, as the village reads it.
 *
 * The description comes first and unlabelled because it is the Persona's own
 * account of itself; the rest are labelled so a villager is not left guessing
 * which paragraph is which. Empty fields drop out entirely, so a Persona that
 * is only a name costs the prompt one line rather than four labels with nothing
 * after them.
 *
 * Card macros are resolved here for the same reason they are resolved on a
 * card: a Persona's prose is authored in the same editor and may carry
 * `{{char}}` or `{{user}}`, and a raw token reaching a villager's prompt is the
 * player's own writing read back as gibberish.
 *
 * The portrait is read here too, off the same already-decoded row. That is the
 * whole reason the picker can draw a face per Persona without asking the Engine
 * once per card: this read has the row in hand, so the address and the framing
 * cost nothing to carry along with the name.
 */
export function readPersona(record: CapabilityPersonaRecord): VillagePersona {
  const data = readRowObject(record.data);
  // The Conversation display name is what the Engine's own chat shows, so it
  // wins over the name when the player has set one and they differ.
  const name = asTrimmedString(data.convoDisplayName) || asTrimmedString(data.name) || "Unnamed persona";
  const expand = (value: unknown) => expandCardMacros(asString(value), name);
  const description = expand(data.description).trim();
  const appearance = expand(data.appearance).trim();
  const personality = expand(data.personality).trim();
  const backstory = expand(data.backstory).trim();
  const identity = [
    description,
    labelledPersonaLine("Appearance", appearance),
    labelledPersonaLine("Personality", personality),
    labelledPersonaLine("Backstory", backstory),
  ]
    .filter((part) => part.length > 0)
    .join("\n\n");
  // Empty rather than null when the field is missing, so the one "no picture"
  // answer does not depend on which of the two spellings a row happens to use.
  const avatarPath = asTrimmedString(data.avatarPath) || null;
  return {
    id: record.id,
    name,
    // The description is the blurb when there is one; a Persona that only has
    // an appearance still gets a line to be chosen by rather than a blank row.
    summary: condense(description, 180) || condense(identity, 180),
    description,
    appearance,
    personality,
    backstory,
    identity,
    // Stored as text by the Engine, and absent on a row written before the flag
    // existed — absent means "not the selected one", which is the quiet answer.
    isActive: asTrimmedString(data.isActive) === "true",
    avatarPath,
    // Passed through unread: the framing is the Engine's own shape and the tab
    // already knows how to draw it, so a second copy of those rules here would
    // be a second thing to keep in step.
    avatarCrop: data.avatarCrop ?? null,
  };
}

/**
 * Whether the Engine offers Personas to packages at all.
 *
 * `listPersonas` arrived with one Engine version and this package runs on a
 * range, so an older host hands over a library with no such read. That is not a
 * failure: it means there are no Personas to choose from, which is the same
 * village as one whose player has never made any.
 */
function personaReader(): CapabilityResourceHost["listPersonas"] | null {
  const resources = villagesResources();
  return typeof resources.listPersonas === "function" ? resources.listPersonas.bind(resources) : null;
}

/**
 * Every Persona the player has, the Engine's selected one first and the rest by
 * name.
 *
 * The order is the picker's order, so the Persona the Engine already treats as
 * this player's own is the one the player sees first rather than one they have
 * to hunt for among a library of them.
 */
export async function listPlayerPersonas(): Promise<VillagePersona[]> {
  const read = personaReader();
  if (!read) return [];
  const records = await read();
  return records.map(readPersona).sort((left, right) => {
    if (left.isActive !== right.isActive) return left.isActive ? -1 : 1;
    return left.name.localeCompare(right.name, undefined, { sensitivity: "base" });
  });
}

/** One Persona by id, or null when the player has deleted it. */
export async function findPlayerPersona(personaId: string): Promise<VillagePersona | null> {
  const read = personaReader();
  if (!read) return null;
  const records = await read([personaId]);
  const record = records.find((entry) => entry.id === personaId) ?? records[0];
  return record ? readPersona(record) : null;
}
